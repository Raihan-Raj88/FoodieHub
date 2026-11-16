const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getCustomers,
  getCustomerById,
  deleteCustomer,
  getAllOrders,
  deleteOrder,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

// All admin routes require authentication + admin role
router.use(protect, adminOnly);

router.get('/stats', getDashboardStats);

router.get('/customers', getCustomers);
router.get('/customers/:id', getCustomerById);
router.delete('/customers/:id', deleteCustomer);

router.get('/orders', getAllOrders);
router.delete('/orders/:id', deleteOrder);

module.exports = router;
