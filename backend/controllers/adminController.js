const User = require('../models/User');
const Food = require('../models/Food');
const Order = require('../models/Order');

// GET /api/admin/stats
const getDashboardStats = async (req, res) => {
  try {
    const [totalFoods, totalOrders, totalCustomers, revenueResult, recentOrders] = await Promise.all([
      Food.countDocuments(),
      Order.countDocuments({ deleted: { $ne: true } }),
      User.countDocuments({ role: 'customer' }),
      Order.aggregate([
        { $match: { paymentStatus: 'paid', deleted: { $ne: true } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Order.find({ deleted: { $ne: true } })
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    res.json({
      success: true,
      stats: { totalFoods, totalOrders, totalCustomers, totalRevenue },
      recentOrders,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/admin/customers?search=
const getCustomers = async (req, res) => {
  try {
    const { search } = req.query;
    const query = { role: 'customer' };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const customers = await User.find(query).sort({ createdAt: -1 }).select('-password');
    res.json({ success: true, customers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/admin/customers/:id
const getCustomerById = async (req, res) => {
  try {
    const customer = await User.findById(req.params.id).select('-password');
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    // Get order stats for this customer
    const orders = await Order.find({ user: req.params.id, deleted: { $ne: true } })
      .sort({ createdAt: -1 });

    const totalSpent = orders
      .filter((o) => o.paymentStatus === 'paid')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    res.json({
      success: true,
      customer,
      orderStats: {
        totalOrders: orders.length,
        totalSpent,
        recentOrders: orders.slice(0, 5),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/admin/customers/:id
const deleteCustomer = async (req, res) => {
  try {
    const targetId = req.params.id;

    // Prevent self-deletion
    if (targetId === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own account' });
    }

    const target = await User.findById(targetId);
    if (!target) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Only allow deleting customers (not other admins)
    if (target.role === 'admin') {
      return res.status(403).json({ success: false, message: 'Admin accounts cannot be deleted through this endpoint' });
    }

    // Anonymize orders instead of deleting — preserves financial history
    await Order.updateMany(
      { user: targetId },
      {
        $set: {
          'deliveryAddress.name': 'Deleted User',
          'deliveryAddress.email': 'deleted@deleted.com',
          'deliveryAddress.phone': '00000000000',
        },
      }
    );

    await User.findByIdAndDelete(targetId);

    res.json({ success: true, message: 'Customer deleted and order history anonymized' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/admin/orders?search=&status=&paymentStatus=
const getAllOrders = async (req, res) => {
  try {
    const { search, status, paymentStatus } = req.query;
    const query = { deleted: { $ne: true } };

    if (status) query.orderStatus = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    let orders = await Order.find(query)
      .populate('user', 'name email phone')
      .populate('items.food', 'name image')
      .sort({ createdAt: -1 });

    // Search by customer name/email or order ID suffix
    if (search) {
      const s = search.toLowerCase();
      orders = orders.filter(
        (o) =>
          o._id.toString().slice(-6).toLowerCase().includes(s) ||
          o.user?.name?.toLowerCase().includes(s) ||
          o.user?.email?.toLowerCase().includes(s)
      );
    }

    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/admin/orders/:id  — soft delete (archived)
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Paid orders are soft-deleted (archived) to preserve financial records
    if (order.paymentStatus === 'paid') {
      await Order.findByIdAndUpdate(req.params.id, { deleted: true });
      return res.json({ success: true, message: 'Paid order archived (financial record preserved)' });
    }

    // Unpaid/failed orders can be hard-deleted
    await Order.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Order deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getCustomers,
  getCustomerById,
  deleteCustomer,
  getAllOrders,
  deleteOrder,
};
