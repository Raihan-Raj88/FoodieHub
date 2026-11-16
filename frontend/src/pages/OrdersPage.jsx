import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { FaBox, FaCheckCircle } from 'react-icons/fa';
import { getMyOrders } from '../services/orderService';
import { useAuth } from '../context/AuthContext';
import './OrdersPage.css';

const STATUS_COLORS = {
  pending: 'warning',
  confirmed: 'info',
  preparing: 'info',
  out_for_delivery: 'primary',
  delivered: 'success',
  cancelled: 'danger',
};

const STATUS_LABELS = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const OrdersPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const newOrder = location.state?.newOrder;

  useEffect(() => {
    if (!user) return;
    const fetchOrders = async () => {
      try {
        const res = await getMyOrders();
        setOrders(res.data.orders);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  if (!user) return (
    <div className="empty-state" style={{ minHeight: '60vh' }}>
      <div className="empty-state-icon">🔒</div>
      <h3>Please login to view orders</h3>
      <Link to="/login" className="btn btn-primary">Login</Link>
    </div>
  );

  if (loading) return (
    <div className="loading-container" style={{ minHeight: '60vh' }}>
      <div className="spinner" /><p>Loading orders...</p>
    </div>
  );

  return (
    <div className="orders-page">
      <div className="container">
        <div className="orders-header">
          <h1><FaBox /> My Orders</h1>
          <p>Track and manage your food orders</p>
        </div>

        {newOrder && (
          <div className="alert alert-success" style={{ marginBottom: 24 }}>
            <FaCheckCircle /> Order placed successfully! We'll start preparing it soon.
          </div>
        )}

        {orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <h3>No orders yet</h3>
            <p>Your order history will appear here</p>
            <Link to="/menu" className="btn btn-primary">Order Now</Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order._id} className="order-card">
                <div className="order-card-header" onClick={() => setExpanded(expanded === order._id ? null : order._id)}>
                  <div className="order-info">
                    <span className="order-id">#{order._id.slice(-8).toUpperCase()}</span>
                    <span className="order-date">{new Date(order.createdAt).toLocaleDateString('en-BD', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <div className="order-meta">
                    <span className={`badge badge-${STATUS_COLORS[order.orderStatus]}`}>
                      {STATUS_LABELS[order.orderStatus]}
                    </span>
                    <span className="order-total">৳{order.totalAmount}</span>
                    <span className="order-expand">{expanded === order._id ? '▲' : '▼'}</span>
                  </div>
                </div>

                {expanded === order._id && (
                  <div className="order-details">
                    <div className="order-items-list">
                      {order.items.map((item, i) => (
                        <div key={i} className="order-item-row">
                          <span>{item.name} × {item.quantity}</span>
                          <span>৳{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>
                    <div className="order-summary-rows">
                      <div className="os-row"><span>Subtotal</span><span>৳{order.subtotal}</span></div>
                      <div className="os-row"><span>Delivery</span><span>৳{order.deliveryCharge}</span></div>
                      <div className="os-row os-total"><span>Total</span><span>৳{order.totalAmount}</span></div>
                    </div>
                    <div className="order-meta-info">
                      <p><strong>Payment:</strong> {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online'}</p>
                      <p><strong>Payment Status:</strong> <span className={`badge badge-${order.paymentStatus === 'paid' ? 'success' : 'warning'}`}>{order.paymentStatus}</span></p>
                      <p><strong>Delivery Address:</strong> {order.deliveryAddress?.address}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
