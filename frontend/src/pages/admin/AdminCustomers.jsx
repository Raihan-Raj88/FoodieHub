import { useState, useEffect, useCallback } from 'react';
import { MdPeople, MdSearch, MdClose, MdDelete, MdVisibility } from 'react-icons/md';
import { FaShoppingBag } from 'react-icons/fa';
import { getCustomers, getCustomerById, deleteCustomer } from '../../services/adminService';
import './AdminShared.css';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Detail modal
  const [detailCustomer, setDetailCustomer] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const [toast, setToast] = useState('');

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getCustomers(debouncedSearch);
      setCustomers(res.data.customers);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const handleViewDetail = async (customerId) => {
    setDetailLoading(true);
    setDetailCustomer({ loading: true });
    try {
      const res = await getCustomerById(customerId);
      setDetailCustomer({ ...res.data.customer, orderStats: res.data.orderStats });
    } catch (err) {
      setDetailCustomer(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError('');
    try {
      await deleteCustomer(deleteTarget._id);
      setCustomers((prev) => prev.filter((c) => c._id !== deleteTarget._id));
      showToast(`Customer "${deleteTarget.name}" deleted successfully`);
      setDeleteTarget(null);
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Failed to delete customer');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 2000,
          background: '#065f46', color: 'white', padding: '12px 20px',
          borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow-md)',
          fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 8,
        }}>
          ✓ {toast}
        </div>
      )}

      <div className="admin-page-header-row">
        <div>
          <h1>Customers</h1>
          <p>{customers.length} registered customer{customers.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="admin-search-box">
          <MdSearch />
          <input
            type="text"
            placeholder="Search by name, email or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch('')} className="search-clear" aria-label="Clear">
              <MdClose />
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="loading-container"><div className="spinner" /></div>
      ) : customers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><MdPeople style={{ fontSize: '4rem', opacity: 0.3 }} /></div>
          <h3>{search ? 'No customers match your search' : 'No customers yet'}</h3>
          {search && <button className="btn btn-outline btn-sm" onClick={() => setSearch('')}>Clear Search</button>}
        </div>
      ) : (
        <div className="admin-table-card">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Customer</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer, index) => (
                  <tr key={customer._id}>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{index + 1}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="customer-avatar">
                          {customer.name[0].toUpperCase()}
                        </div>
                        <strong>{customer.name}</strong>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.88rem' }}>{customer.email}</td>
                    <td style={{ fontSize: '0.88rem' }}>{customer.phone}</td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {new Date(customer.createdAt).toLocaleDateString('en-BD', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="action-btn edit"
                          onClick={() => handleViewDetail(customer._id)}
                          aria-label={`View ${customer.name}`}
                          title="View Details"
                        >
                          <MdVisibility />
                        </button>
                        <button
                          className="action-btn delete"
                          onClick={() => { setDeleteTarget(customer); setDeleteError(''); }}
                          aria-label={`Delete ${customer.name}`}
                          title="Delete Customer"
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

      {/* Customer Detail Modal */}
      {detailCustomer && (
        <div className="modal-overlay" onClick={() => setDetailCustomer(null)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Customer Details</h2>
              <button className="modal-close" onClick={() => setDetailCustomer(null)}>
                <MdClose />
              </button>
            </div>

            {detailCustomer.loading || detailLoading ? (
              <div className="loading-container" style={{ padding: 40 }}>
                <div className="spinner" />
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                  <div className="customer-avatar" style={{ width: 56, height: 56, fontSize: '1.4rem' }}>
                    {detailCustomer.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{detailCustomer.name}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                      Joined {new Date(detailCustomer.createdAt).toLocaleDateString('en-BD', {
                        day: 'numeric', month: 'long', year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                <div className="order-detail-grid" style={{ marginBottom: 20 }}>
                  <div>
                    <h4>Contact Information</h4>
                    <p><strong>Email:</strong> {detailCustomer.email}</p>
                    <p><strong>Phone:</strong> {detailCustomer.phone}</p>
                  </div>
                  <div>
                    <h4>Order Summary</h4>
                    <div style={{ display: 'flex', gap: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FaShoppingBag style={{ color: 'var(--primary)' }} />
                        <div>
                          <strong>{detailCustomer.orderStats?.totalOrders || 0}</strong>
                          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>Orders</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ color: '#10b981', fontWeight: 700, fontSize: '1rem' }}>৳</span>
                        <div>
                          <strong>৳{detailCustomer.orderStats?.totalSpent || 0}</strong>
                          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>Spent</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {detailCustomer.orderStats?.recentOrders?.length > 0 && (
                  <>
                    <h4 style={{ marginBottom: 10, fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Recent Orders
                    </h4>
                    <div className="admin-table-wrap">
                      <table className="admin-table">
                        <thead>
                          <tr><th>Order ID</th><th>Total</th><th>Payment</th><th>Status</th><th>Date</th></tr>
                        </thead>
                        <tbody>
                          {detailCustomer.orderStats.recentOrders.map((o) => (
                            <tr key={o._id}>
                              <td>#{o._id.slice(-6).toUpperCase()}</td>
                              <td>৳{o.totalAmount}</td>
                              <td>
                                <span className={`badge ${o.paymentStatus === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                                  {o.paymentStatus}
                                </span>
                              </td>
                              <td>
                                <span className="badge badge-info" style={{ textTransform: 'capitalize' }}>
                                  {o.orderStatus.replace('_', ' ')}
                                </span>
                              </td>
                              <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                                {new Date(o.createdAt).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}

                <div className="modal-actions">
                  <button
                    className="btn btn-outline"
                    style={{ color: '#dc2626', borderColor: '#dc2626' }}
                    onClick={() => { setDeleteTarget(detailCustomer); setDetailCustomer(null); setDeleteError(''); }}
                  >
                    Delete Customer
                  </button>
                  <button className="btn btn-primary" onClick={() => setDetailCustomer(null)}>Close</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteTarget && (
        <div className="modal-overlay" onClick={() => !deleting && setDeleteTarget(null)}>
          <div className="modal" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete Customer</h2>
              <button className="modal-close" onClick={() => !deleting && setDeleteTarget(null)}>
                <MdClose />
              </button>
            </div>

            <div style={{ marginBottom: 20 }}>
              <p style={{ marginBottom: 12 }}>
                Are you sure you want to delete <strong>{deleteTarget.name}</strong>?
              </p>
              <div className="alert" style={{ background: '#fef3c7', color: '#92400e', borderLeft: '4px solid #f59e0b', fontSize: '0.85rem' }}>
                Their order history will be anonymized to preserve financial records. This cannot be undone.
              </div>
            </div>

            {deleteError && <div className="alert alert-error">{deleteError}</div>}

            <div className="modal-actions">
              <button
                className="btn btn-outline"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                style={{ background: '#dc2626', borderColor: '#dc2626' }}
                onClick={handleDeleteConfirm}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCustomers;
