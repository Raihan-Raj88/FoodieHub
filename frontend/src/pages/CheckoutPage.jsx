import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaMoneyBillWave, FaCreditCard, FaCheckCircle, FaLock } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder } from '../services/orderService';
import api from '../services/api';
import './CheckoutPage.css';

const CheckoutPage = () => {
  const { cartItems, subtotal, deliveryCharge, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    address: '',
    instructions: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [stripeEnabled, setStripeEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check if Stripe is configured on the backend
  useEffect(() => {
    api.get('/payments/config')
      .then((res) => setStripeEnabled(res.data.stripeEnabled))
      .catch(() => setStripeEnabled(false));
  }, []);

  if (!user) {
    navigate('/login');
    return null;
  }

  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.address.trim()) {
      setError('Delivery address is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const orderData = {
        items: cartItems.map((item) => ({ food: item._id, quantity: item.quantity })),
        deliveryAddress: {
          name: form.name,
          phone: form.phone,
          email: form.email,
          address: form.address,
          instructions: form.instructions,
        },
        paymentMethod,
      };

      const orderRes = await createOrder(orderData);

      if (!orderRes.data.success) {
        setError('Failed to create order. Please try again.');
        return;
      }

      const order = orderRes.data.order;

      if (paymentMethod === 'cod') {
        clearCart();
        navigate('/orders', { state: { newOrder: true } });
        return;
      }

      // Online payment: create Stripe Checkout Session
      const sessionRes = await api.post('/payments/create-checkout-session', {
        orderId: order._id,
      });

      if (sessionRes.data.success && sessionRes.data.url) {
        clearCart();
        // Redirect to Stripe Hosted Checkout
        window.location.href = sessionRes.data.url;
      } else {
        setError('Could not initiate payment. Please try again.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-page">
      <div className="container">
        <h1 className="checkout-title">Checkout</h1>

        <div className="checkout-layout">
          {/* Form */}
          <form onSubmit={handleSubmit} className="checkout-form">
            <div className="form-section">
              <h2>Delivery Information</h2>
              <div className="grid-2">
                <div className="form-group">
                  <label htmlFor="co-name">Full Name</label>
                  <input
                    id="co-name" name="name" className="form-control"
                    value={form.name} onChange={handleChange} required
                    placeholder="Your full name"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="co-phone">Phone Number</label>
                  <input
                    id="co-phone" name="phone" className="form-control"
                    value={form.phone} onChange={handleChange} required
                    placeholder="01XXXXXXXXX"
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="co-email">Email Address</label>
                <input
                  id="co-email" type="email" name="email" className="form-control"
                  value={form.email} onChange={handleChange} required
                  placeholder="email@example.com"
                />
              </div>
              <div className="form-group">
                <label htmlFor="co-address">Delivery Address *</label>
                <textarea
                  id="co-address" name="address" className="form-control" rows={3}
                  value={form.address} onChange={handleChange} required
                  placeholder="House number, street, area, city..."
                />
              </div>
              <div className="form-group">
                <label htmlFor="co-instructions">Special Instructions (optional)</label>
                <textarea
                  id="co-instructions" name="instructions" className="form-control" rows={2}
                  value={form.instructions} onChange={handleChange}
                  placeholder="Any special requests for delivery..."
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="form-section">
              <h2>Payment Method</h2>
              <div className="payment-options">
                <label className={`payment-option ${paymentMethod === 'cod' ? 'active' : ''}`}>
                  <input
                    type="radio" name="payment" value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                  />
                  <FaMoneyBillWave />
                  <div>
                    <strong>Cash on Delivery</strong>
                    <p>Pay when your order arrives</p>
                  </div>
                </label>

                <label className={`payment-option ${paymentMethod === 'online' ? 'active' : ''} ${!stripeEnabled ? 'disabled' : ''}`}>
                  <input
                    type="radio" name="payment" value="online"
                    checked={paymentMethod === 'online'}
                    onChange={() => stripeEnabled && setPaymentMethod('online')}
                    disabled={!stripeEnabled}
                  />
                  <FaCreditCard />
                  <div>
                    <strong>Online Payment</strong>
                    <p>{stripeEnabled ? 'Pay securely with Stripe' : 'Not available — Stripe not configured'}</p>
                  </div>
                </label>
              </div>

              {paymentMethod === 'online' && stripeEnabled && (
                <div className="stripe-info">
                  <FaLock />
                  <span>You will be redirected to Stripe's secure checkout. Your card details are never stored on our servers.</span>
                </div>
              )}
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <button
              type="submit"
              className="btn btn-primary btn-lg place-order-btn"
              disabled={loading}
            >
              {loading
                ? (paymentMethod === 'online' ? 'Redirecting to payment...' : 'Placing Order...')
                : paymentMethod === 'online'
                ? <><FaLock /> Pay with Stripe</>
                : <><FaCheckCircle /> Place Order</>
              }
            </button>
          </form>

          {/* Order Summary */}
          <div className="checkout-summary">
            <h2>Order Summary</h2>
            <div className="checkout-items">
              {cartItems.map((item) => (
                <div key={item._id} className="co-item">
                  <span className="co-item-name">{item.name} × {item.quantity}</span>
                  <span>৳{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
            <div className="co-totals">
              <div className="co-row"><span>Subtotal</span><span>৳{subtotal}</span></div>
              <div className="co-row"><span>Delivery</span><span>৳{deliveryCharge}</span></div>
              <div className="co-row co-total"><span>Total</span><span>৳{total}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
