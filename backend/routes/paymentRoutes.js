const express = require('express');
const router = express.Router();
const {
  getPaymentConfig,
  createCheckoutSession,
  verifySession,
  stripeWebhook,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

// Webhook: raw body is applied before express.json() in server.js
router.post('/webhook', stripeWebhook);

// Public config check (no auth needed — just tells FE if Stripe is on)
router.get('/config', getPaymentConfig);

// Protected endpoints
router.post('/create-checkout-session', protect, createCheckoutSession);
router.post('/verify-session', protect, verifySession);

module.exports = router;
