import { useState, useEffect, useCallback } from 'react';
import { MdVisibility, MdClose, MdDelete, MdSearch, MdFilterList } from 'react-icons/md';
import { getAllAdminOrders, updateOrderStatus, deleteAdminOrder } from '../../services/adminService';
import './AdminShared.css';

const ORDER_STATUSES = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];
const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'];

const STATUS_COLORS = {
  pending: 'warning', confirmed: 'info', preparing: 'info',
  out_for_delivery: 'primary', delivered: 'success', cancelled: 'danger',
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPayment, setFilterPayment] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [toast, setToast] = useState('');

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllAdminOrders({
        search: debouncedSearch,
        status: filterStatus,
        paymentStatus: filterPayment,
      });
      setOrders(res.data.orders);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filterStatus, filterPayment]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleStatusUpdate = async (orderId, field, value) => {
    setUpdating(true);
    try {
      const res = await updateOrderStatus(orderId, { [field]: value });
      const updated = res.data.order;
      setOrders((prev) => prev.map((o) => (o._id === orderId ? updated : o)));
      if (selectedOrder?._id === orderId) setSelectedOrder(updated);
    } catch (err) {
      alert('Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError('');
    try {
      const res = await deleteAdminOrder(deleteTarget._id);
      setOrders((prev) => prev.filter((o) => o._id !== deleteTarget._id));
      if (selectedOrder?._id === deleteTarget._id) setSelectedOrder(null);
      showToast(res.data.message);
      setDeleteTarget(null);
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Failed to delete order');
    } finally {
      setDeleting(false);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setFilterStatus('');
    setFilterPayment('');
  };

  const hasFilters = search || filterStatus || filterPayment;

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 2000,
          background: '#1e40af', color: 'white', padding: '12px 20px',
          borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow-md)',
          fontSize: '0.9rem',
        }}>
          ✓ {toast}
        </div>
      )}

      <div className="admin-page-header-row">
        <div>
          <h1>Orders</h1>
          <p>{orders.length} order{orders.length !== 1 ? 's' : ''} found</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="orders-filter-bar">
        <div className="admin-search-box">
          <MdSearch />
          <input
            type="text"
            placeholder="Search by order ID, name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch('')} className="search-clear"><MdClose /></button>
          )}
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <MdFilterList style={{ color: 'var(--text-muted)' }} />
            <select
              className="status-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>{s.replace('_', ' ')}</option>
              ))}
            </select>
          </div>

          <select
            className="status-select"
            value={filterPayment}
            onChange={(e) => setFilterPayment(e.target.value)}
          >
            <option value="">All Payments</option>
            {PAYMENT_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {hasFilters && (
            <button className="btn btn-outline btn-sm" onClick={clearFilters}>
              Clear
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="loading-container"><div className="spinner" /></div>
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📦</div>
          <h3>{hasFilters ? 'No orders match your filters' : 'No orders yet'}</h3>
          {hasFilters && (
            <button className="btn btn-outline btn-sm" onClick={clearFilters}>Clear Filters</button>
          )}
        </div>
      ) : (
        <div className="admin-table-card">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Order Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                        #{order._id.slice(-6).toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <strong>{order.user?.name || 'Deleted User'}</strong>
                      <br />
                      <small style={{ color: 'var(--text-muted)' }}>{order.user?.email}</small>
                    </td>
                    <td style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                      {new Date(order.createdAt).toLocaleDateString('en-BD', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </td>
                    <td><strong>৳{order.totalAmount}</strong></td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <span className={`badge ${order.paymentStatus === 'paid' ? 'badge-success' : order.paymentStatus === 'failed' ? 'badge-danger' : 'badge-warning'}`}>
                          {order.paymentStatus}
                        </span>
                        <small style={{ color: 'var(--text-muted)', fontSize: '0.76rem' }}>
                          {order.paymentMethod === 'cod' ? 'COD' : 'Stripe'}
                        </small>
                      </div>
                    </td>
                    <td>
                      <select
                        className="status-select"
                        value={order.orderStatus}
                        onChange={(e) => handleStatusUpdate(order._id, 'orderStatus', e.target.value)}
                        disabled={updating}
                      >
                        {ORDER_STATUSES.map((s) => (
                          <option key={s} value={s}>{s.replace('_', ' ')}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="action-btn edit"
                          onClick={() => setSelectedOrder(order)}
                          aria-label="View order"
                          title="View Details"
                        >
                          <MdVisibility />
                        </button>
                        <button
                          className="action-btn delete"
                          onClick={() => { setDeleteTarget(order); setDeleteError(''); }}
                          aria-label="Delete order"
                          title={order.paymentStatus === 'paid' ? 'Archive order' : 'Delete order'}
                        >
                          <MdDelete />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Order #{selectedOrder._id.slice(-8).toUpperCase()}</h2>
              <button className="modal-close" onClick={() => setSelectedOrder(null)}><MdClose /></button>
            </div>

            <div style={{ marginBottom: 8 }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Placed on {new Date(selectedOrder.createdAt).toLocaleString('en-BD')}
              </span>
            </div>

            <div className="order-detail-grid">
              <div>
                <h4>Customer Info</h4>
                <p><strong>{selectedOrder.user?.name || 'Deleted User'}</strong></p>
                <p>{selectedOrder.user?.email}</p>
                <p>{selectedOrder.user?.phone}</p>
              </div>
              <div>
                <h4>Delivery Address</h4>
                <p>{selectedOrder.deliveryAddress?.name}</p>
                <p>{selectedOrder.deliveryAddress?.phone}</p>
                <p>{selectedOrder.deliveryAddress?.address}</p>
                {selectedOrder.deliveryAddress?.instructions && (
                  <p><em>Note: {selectedOrder.deliveryAddress.instructions}</em></p>
                )}
              </div>
            </div>

            <h4 style={{ margin: '20px 0 10px', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Order Items
            </h4>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr><th>Item</th><th>Price</th><th>Qty</th><th>Total</th></tr>
                </thead>
                <tbody>
                  {selectedOrder.items.map((item, i) => (
                    <tr key={i}>
                      <td>{item.name}</td>
                      <td>৳{item.price}</td>
                      <td>{item.quantity}</td>
                      <td><strong>৳{item.price * item.quantity}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="order-summary-mini">
              <span>Subtotal: ৳{selectedOrder.subtotal}</span>
              <span>Delivery: ৳{selectedOrder.deliveryCharge}</span>
              <strong>Total: ৳{selectedOrder.totalAmount}</strong>
            </div>

            <div className="order-status-update">
              <div className="form-group">
                <label>Order Status</label>
                <select
                  className="form-control"
                  value={selectedOrder.orderStatus}
                  onChange={(e) => handleStatusUpdate(selectedOrder._id, 'orderStatus', e.target.value)}
                  disabled={updating}
                >
                  {ORDER_STATUSES.map((s) => (
                    <option key={s} value={s}>{s.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Payment Status</label>
                <select
                  className="form-control"
                  value={selectedOrder.paymentStatus}
                  onChange={(e) => handleStatusUpdate(selectedOrder._id, 'paymentStatus', e.target.value)}
                  disabled={updating}
                >
                  {PAYMENT_STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="btn btn-outline"
                style={{ color: '#dc2626', borderColor: '#dc2626' }}
                onClick={() => { setDeleteTarget(selectedOrder); setSelectedOrder(null); setDeleteError(''); }}
              >
                <MdDelete /> {selectedOrder.paymentStatus === 'paid' ? 'Archive' : 'Delete'}
              </button>
              <button className="btn btn-primary" onClick={() => setSelectedOrder(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete/Archive Confirm Dialog */}
      {deleteTarget && (
        <div className="modal-overlay" onClick={() => !deleting && setDeleteTarget(null)}>
          <div className="modal" style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{deleteTarget.paymentStatus === 'paid' ? 'Archive Order' : 'Delete Order'}</h2>
              <button className="modal-close" onClick={() => !deleting && setDeleteTarget(null)}><MdClose /></button>
            </div>

            <div style={{ marginBottom: 20 }}>
              <p style={{ marginBottom: 12 }}>
                {deleteTarget.paymentStatus === 'paid'
                  ? <>This is a <strong>paid order</strong>. It will be archived (hidden from lists) rather than permanently deleted to preserve financial records.</>
                  : <>Are you sure you want to permanently delete order <strong>#{deleteTarget._id.slice(-6).toUpperCase()}</strong>?</>
                }
              </p>
              <div className="alert" style={{
                background: deleteTarget.paymentStatus === 'paid' ? '#fef3c7' : '#fee2e2',
                color: deleteTarget.paymentStatus === 'paid' ? '#92400e' : '#991b1b',
                borderLeft: `4px solid ${deleteTarget.paymentStatus === 'paid' ? '#f59e0b' : '#ef4444'}`,
                fontSize: '0.85rem',
              }}>
                {deleteTarget.paymentStatus === 'paid'
                  ? 'Archived orders are not deleted from the database — they are only hidden from this admin view.'
                  : 'This action cannot be undone.'
                }
              </div>
            </div>

            {deleteError && <div className="alert alert-error">{deleteError}</div>}

            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                style={{ background: '#dc2626', borderColor: '#dc2626' }}
                onClick={handleDeleteConfirm}
                disabled={deleting}
              >
                {deleting ? 'Processing...' : deleteTarget.paymentStatus === 'paid' ? 'Archive' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
