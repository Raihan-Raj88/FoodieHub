const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: ['cod', 'stripe'],
    required: true,
  },
  transactionId: {
    type: String,
    default: '',
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending',
  },
  // Stripe Checkout Session ID (cs_xxx)
  stripeSessionId: {
    type: String,
    default: '',
  },
  // Stripe PaymentIntent ID (pi_xxx) — populated after payment completes
  stripePaymentIntentId: {
    type: String,
    default: '',
  },
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
