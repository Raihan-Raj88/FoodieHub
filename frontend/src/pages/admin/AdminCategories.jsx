import { useState, useEffect } from 'react';
import { MdAdd, MdEdit, MdDelete, MdClose } from 'react-icons/md';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../services/categoryService';
import './AdminShared.css';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', image: null });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchCategories = async () => {
    try {
      const res = await getCategories();
      setCategories(res.data.categories);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const openAdd = () => {
    setForm({ name: '', description: '', image: null });
    setEditId(null);
    setError('');
    setShowModal(true);
  };

  const openEdit = (cat) => {
    setForm({ name: cat.name, description: cat.description || '', image: null });
    setEditId(cat._id);
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('description', form.description);
      if (form.image) fd.append('image', form.image);

      if (editId) {
        await updateCategory(editId, fd);
      } else {
        await createCategory(fd);
      }
      setShowModal(false);
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return;
    try {
      await deleteCategory(id);
      setCategories(categories.filter((c) => c._id !== id));
    } catch {
      alert('Failed to delete');
    }
  };

  return (
    <div>
      <div className="admin-page-header-row">
        <div>
          <h1>Categories</h1>
          <p>Manage food categories</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <MdAdd /> Add Category
        </button>
      </div>

      {loading ? (
        <div className="loading-container"><div className="spinner" /></div>
      ) : (
        <div className="admin-table-card">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr><th>Name</th><th>Description</th><th>Created</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat._id}>
                    <td><strong>{cat.name}</strong></td>
                    <td>{cat.description || '—'}</td>
                    <td>{new Date(cat.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="table-actions">
                        <button className="action-btn edit" onClick={() => openEdit(cat)}><MdEdit /></button>
                        <button className="action-btn delete" onClick={() => handleDelete(cat._id)}><MdDelete /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editId ? 'Edit Category' : 'Add Category'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}><MdClose /></button>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Category Name *</label>
                <input className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Burger" />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="form-control" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief description..." />
              </div>
              <div className="form-group">
                <label>Image</label>
                <input type="file" className="form-control" accept="image/*" onChange={(e) => setForm({ ...form, image: e.target.files[0] })} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : editId ? 'Update' : 'Add Category'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
