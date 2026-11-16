import { useState, useEffect } from 'react';
import { MdFastfood, MdShoppingBag, MdPeople, MdAttachMoney } from 'react-icons/md';
import { getDashboardStats } from '../../services/adminService';
import './AdminDashboard.css';

const STATUS_COLORS = {
  pending: 'warning', confirmed: 'info', preparing: 'info',
  out_for_delivery: 'primary', delivered: 'success', cancelled: 'danger',
};

const StatCard = ({ icon, label, value, color }) => (
  <div className={`stat-card stat-${color}`}>
    <div className="stat-card-icon">{icon}</div>
    <div className="stat-card-info">
      <h3>{value}</h3>
      <p>{label}</p>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getDashboardStats();
        setStats(res.data.stats);
        setRecentOrders(res.data.recentOrders);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return (
    <div className="loading-container">
      <div className="spinner" /><p>Loading dashboard...</p>
    </div>
  );

  return (
    <div className="admin-dashboard">
      <div className="admin-page-header">
        <h1>Dashboard</h1>
        <p>Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <StatCard icon={<MdFastfood />} label="Total Foods" value={stats?.totalFoods || 0} color="orange" />
        <StatCard icon={<MdShoppingBag />} label="Total Orders" value={stats?.totalOrders || 0} color="blue" />
        <StatCard icon={<MdPeople />} label="Customers" value={stats?.totalCustomers || 0} color="green" />
        <StatCard icon={<MdAttachMoney />} label="Total Revenue" value={`৳${stats?.totalRevenue || 0}`} color="purple" />
      </div>

      {/* Recent Orders */}
      <div className="recent-orders-section">
        <h2>Recent Orders</h2>
        {recentOrders.length === 0 ? (
          <p className="no-data">No orders yet</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order._id}>
                    <td>#{order._id.slice(-6).toUpperCase()}</td>
                    <td>{order.user?.name || 'N/A'}</td>
                    <td><strong>৳{order.totalAmount}</strong></td>
                    <td>{order.paymentMethod === 'cod' ? 'COD' : 'Online'}</td>
                    <td>
                      <span className={`badge badge-${STATUS_COLORS[order.orderStatus]}`}>
                        {order.orderStatus.replace('_', ' ')}
                      </span>
                    </td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
