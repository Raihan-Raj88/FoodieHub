const Order = require('../models/Order');
const Payment = require('../models/Payment');

const isStripeConfigured = () =>
  process.env.STRIPE_SECRET_KEY &&
  !process.env.STRIPE_SECRET_KEY.startsWith('sk_test_your');

const getStripe = () => {
  if (!isStripeConfigured()) {
    throw new Error('Stripe is not configured. Add STRIPE_SECRET_KEY to backend .env.');
  }
  return require('stripe')(process.env.STRIPE_SECRET_KEY);
};

// GET /api/payments/config  — tells frontend whether Stripe is live
const getPaymentConfig = async (req, res) => {
  res.json({ success: true, stripeEnabled: isStripeConfigured() });
};

// POST /api/payments/create-checkout-session
// Creates a Stripe Hosted Checkout session for an existing order
const createCheckoutSession = async (req, res) => {
  try {
    const stripe = getStripe();
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ success: false, message: 'orderId is required' });
    }

    const order = await Order.findById(orderId).populate('items.food', 'name image');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Only the owner can pay for their order
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Guard: do not create a second session if already paid
    if (order.paymentStatus === 'paid') {
      return res.status(400).json({ success: false, message: 'This order is already paid' });
    }

    // Guard: prevent duplicate pending Payment records
    const existingPayment = await Payment.findOne({
      order: orderId,
      paymentStatus: 'pending',
      stripeSessionId: { $exists: true, $ne: '' },
    });
    if (existingPayment) {
      // Return the existing session URL so the customer can complete it
      const existingSession = await stripe.checkout.sessions.retrieve(existingPayment.stripeSessionId);
      if (existingSession.status === 'open') {
        return res.json({ success: true, url: existingSession.url });
      }
      // Session expired — mark it failed and fall through to create a new one
      await Payment.findByIdAndUpdate(existingPayment._id, { paymentStatus: 'failed' });
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    // Build line_items from order items (Stripe requires amount in smallest currency unit)
    const lineItems = order.items.map((item) => ({
      price_data: {
        currency: 'usd', // Stripe does not support BDT; we use USD display, amount stays BDT numeric
        product_data: {
          name: item.name,
          description: `Quantity: ${item.quantity}`,
        },
        // Stripe amount is in cents. We treat BDT as cents to keep the number correct.
        // Real production would use a supported currency or a currency conversion.
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    // Add delivery charge as a separate line item
    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: { name: 'Delivery Charge' },
        unit_amount: Math.round(order.deliveryCharge * 100),
      },
      quantity: 1,
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: lineItems,
      metadata: {
        orderId: orderId.toString(),
        userId: req.user._id.toString(),
      },
      success_url: `${frontendUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
      cancel_url: `${frontendUrl}/payment/cancel?order_id=${orderId}`,
    });

    // Record the pending payment
    await Payment.create({
      order: orderId,
      amount: order.totalAmount,
      paymentMethod: 'stripe',
      stripeSessionId: session.id,
      paymentStatus: 'pending',
    });

    res.json({ success: true, url: session.url });
  } catch (error) {
    console.error('createCheckoutSession error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/payments/verify-session
// Called from the success page — verifies the session and marks order as paid
const verifySession = async (req, res) => {
  try {
    const stripe = getStripe();
    const { sessionId, orderId } = req.body;

    if (!sessionId || !orderId) {
      return res.status(400).json({ success: false, message: 'sessionId and orderId are required' });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return res.status(400).json({ success: false, message: 'Payment not completed' });
    }

    // Idempotency: skip DB writes if already processed
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.paymentStatus === 'paid') {
      // Already handled (probably by webhook) — just return success
      return res.json({ success: true, message: 'Payment already verified', order });
    }

    // Verify ownership
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Order.findByIdAndUpdate(orderId, {
      paymentStatus: 'paid',
      orderStatus: 'confirmed',
    });

    await Payment.findOneAndUpdate(
      { stripeSessionId: sessionId },
      {
        paymentStatus: 'paid',
        transactionId: session.payment_intent,
        stripePaymentIntentId: session.payment_intent || '',
      }
    );

    const updatedOrder = await Order.findById(orderId);
    res.json({ success: true, message: 'Payment verified successfully', order: updatedOrder });
  } catch (error) {
    console.error('verifySession error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/payments/webhook  (raw body — handled in server.js)
const stripeWebhook = async (req, res) => {
  if (!isStripeConfigured()) {
    return res.status(200).json({ received: true });
  }

  const stripe = getStripe();
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      if (session.payment_status === 'paid') {
        const orderId = session.metadata?.orderId;
        if (!orderId) return res.json({ received: true });

        const order = await Order.findById(orderId);
        if (order && order.paymentStatus !== 'paid') {
          await Order.findByIdAndUpdate(orderId, {
            paymentStatus: 'paid',
            orderStatus: 'confirmed',
          });

          await Payment.findOneAndUpdate(
            { stripeSessionId: session.id },
            {
              paymentStatus: 'paid',
              transactionId: session.payment_intent,
              stripePaymentIntentId: session.payment_intent || '',
            }
          );
        }
      }
    }

    if (event.type === 'checkout.session.expired') {
      const session = event.data.object;
      const orderId = session.metadata?.orderId;
      if (orderId) {
        const order = await Order.findById(orderId);
        if (order && order.paymentStatus === 'pending' && order.paymentMethod === 'online') {
          await Order.findByIdAndUpdate(orderId, { paymentStatus: 'failed' });
          await Payment.findOneAndUpdate(
            { stripeSessionId: session.id },
            { paymentStatus: 'failed' }
          );
        }
      }
    }
  } catch (error) {
    console.error('Webhook handler error:', error.message);
  }

  res.json({ received: true });
};

module.exports = {
  getPaymentConfig,
  createCheckoutSession,
  verifySession,
  stripeWebhook,
};
