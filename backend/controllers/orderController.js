const Order = require('../models/Order');
const Food = require('../models/Food');

const DELIVERY_CHARGE = 50;

// POST /api/orders  - Customer places order
const createOrder = async (req, res) => {
  try {
    const { items, deliveryAddress, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Order items are required' });
    }

    if (!deliveryAddress || !deliveryAddress.name || !deliveryAddress.address) {
      return res.status(400).json({ success: false, message: 'Delivery address is required' });
    }

    // Verify food items and calculate subtotal
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const food = await Food.findById(item.food);
      if (!food) {
        return res.status(404).json({ success: false, message: `Food item not found: ${item.food}` });
      }
      if (!food.available) {
        return res.status(400).json({ success: false, message: `${food.name} is currently unavailable` });
      }

      orderItems.push({
        food: food._id,
        name: food.name,
        price: food.price,
        quantity: item.quantity,
        image: food.image,
      });

      subtotal += food.price * item.quantity;
    }

    const totalAmount = subtotal + DELIVERY_CHARGE;

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      deliveryAddress,
      subtotal,
      deliveryCharge: DELIVERY_CHARGE,
      totalAmount,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
      orderStatus: 'pending',
    });

    res.status(201).json({ success: true, message: 'Order placed successfully', order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/orders/my-orders  - Customer's own orders
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id, deleted: { $ne: true } })
      .populate('items.food', 'name image')
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/orders/:id  - Get single order (customer can only see their own)
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.food', 'name image');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Customers can only view their own orders
    if (req.user.role !== 'admin' && order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/orders  - Admin: get all orders (excludes soft-deleted)
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({ deleted: { $ne: true } })
      .populate('user', 'name email phone')
      .populate('items.food', 'name image')
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/orders/:id/status  - Admin: update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus, paymentStatus } = req.body;

    const updateData = {};
    if (orderStatus) updateData.orderStatus = orderStatus;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;

    const order = await Order.findByIdAndUpdate(req.params.id, updateData, { new: true })
      .populate('user', 'name email')
      .populate('items.food', 'name');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, message: 'Order updated', order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createOrder, getMyOrders, getOrderById, getAllOrders, updateOrderStatus };
