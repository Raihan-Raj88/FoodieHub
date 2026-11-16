import { useState, useEffect } from 'react';
import { MdAdd, MdEdit, MdDelete, MdClose } from 'react-icons/md';
import { getFoods, createFood, updateFood, deleteFood } from '../../services/foodService';
import { getCategories } from '../../services/categoryService';
import './AdminShared.css';

const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const EMPTY_FORM = { name: '', description: '', price: '', category: '', available: true, image: null };

const AdminFoods = () => {
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [preview, setPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchFoods = async () => {
    try {
      const [foodsRes, catsRes] = await Promise.all([getFoods(), getCategories()]);
      setFoods(foodsRes.data.foods);
      setCategories(catsRes.data.categories);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFoods(); }, []);

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setPreview('');
    setEditId(null);
    setError('');
    setShowModal(true);
  };

  const openEdit = (food) => {
    setForm({
      name: food.name,
      description: food.description,
      price: food.price,
      category: food.category?._id || '',
      available: food.available,
      image: null,
    });
    setPreview(food.image?.startsWith('http') ? food.image : food.image ? `${API_URL}${food.image}` : '');
    setEditId(food._id);
    setError('');
    setShowModal(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, image: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('description', form.description);
      fd.append('price', form.price);
      fd.append('category', form.category);
      fd.append('available', form.available);
      if (form.image) fd.append('image', form.image);

      if (editId) {
        await updateFood(editId, fd);
      } else {
        await createFood(fd);
      }

      setShowModal(false);
      fetchFoods();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save food item');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this food item?')) return;
    try {
      await deleteFood(id);
      setFoods(foods.filter((f) => f._id !== id));
    } catch (err) {
      alert('Failed to delete');
    }
  };

  return (
    <div>
      <div className="admin-page-header-row">
        <div>
          <h1>Food Items</h1>
          <p>Manage your menu items</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <MdAdd /> Add Food
        </button>
      </div>

      {loading ? (
        <div className="loading-container"><div className="spinner" /></div>
      ) : (
        <div className="admin-table-card">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Image</th><th>Name</th><th>Category</th>
                  <th>Price</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {foods.map((food) => {
                  const img = food.image?.startsWith('http') ? food.image : food.image ? `${API_URL}${food.image}` : null;
                  return (
                    <tr key={food._id}>
                      <td>
                        {img ? (
                          <img src={img} alt={food.name} className="table-thumb" />
                        ) : (
                          <div className="table-thumb-placeholder">🍔</div>
                        )}
                      </td>
                      <td><strong>{food.name}</strong><br /><small>{food.description.slice(0, 40)}...</small></td>
                      <td>{food.category?.name}</td>
                      <td><strong>৳{food.price}</strong></td>
                      <td>
                        <span className={`badge ${food.available ? 'badge-success' : 'badge-danger'}`}>
                          {food.available ? 'Available' : 'Unavailable'}
                        </span>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button className="action-btn edit" onClick={() => openEdit(food)} aria-label="Edit"><MdEdit /></button>
                          <button className="action-btn delete" onClick={() => handleDelete(food._id)} aria-label="Delete"><MdDelete /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editId ? 'Edit Food Item' : 'Add Food Item'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)} aria-label="Close"><MdClose /></button>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Food Name *</label>
                <input className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Classic Burger" />
              </div>
              <div className="form-group">
                <label>Description *</label>
                <textarea className="form-control" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required placeholder="Short food description..." />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Price (৳) *</label>
                  <input type="number" className="form-control" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required min="0" placeholder="250" />
                </div>
                <div className="form-group">
                  <label>Category *</label>
                  <select className="form-control" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required>
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Availability</label>
                <select className="form-control" value={form.available} onChange={(e) => setForm({ ...form, available: e.target.value === 'true' })}>
                  <option value="true">Available</option>
                  <option value="false">Unavailable</option>
                </select>
              </div>
              <div className="form-group">
                <label>Food Image</label>
                <input type="file" className="form-control" accept="image/*" onChange={handleFileChange} />
                {preview && <img src={preview} alt="Preview" className="img-preview" />}
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editId ? 'Update Food' : 'Add Food'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFoods;
