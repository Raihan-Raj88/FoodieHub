import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MdFoodBank } from 'react-icons/md';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { registerUser } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import './AuthPage.css';

const RegisterPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await registerUser({ name: form.name, email: form.email, phone: form.phone, password: form.password });
      login(res.data.token, res.data.user);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <MdFoodBank />
          FoodieHub
        </div>
        <h1>Create Account</h1>
        <p className="auth-subtitle">Join FoodieHub and start ordering</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="reg-name">Full Name</label>
            <input id="reg-name" name="name" className="form-control" value={form.name} onChange={handleChange} placeholder="Your full name" required />
          </div>
          <div className="form-group">
            <label htmlFor="reg-email">Email Address</label>
            <input id="reg-email" type="email" name="email" className="form-control" value={form.email} onChange={handleChange} placeholder="email@example.com" required autoComplete="email" />
          </div>
          <div className="form-group">
            <label htmlFor="reg-phone">Phone Number</label>
            <input id="reg-phone" name="phone" className="form-control" value={form.phone} onChange={handleChange} placeholder="01XXXXXXXXX" required />
          </div>
          <div className="form-group">
            <label htmlFor="reg-pass">Password</label>
            <div className="password-wrap">
              <input
                id="reg-pass"
                type={showPass ? 'text' : 'password'}
                name="password"
                className="form-control"
                value={form.password}
                onChange={handleChange}
                placeholder="Minimum 6 characters"
                required
                autoComplete="new-password"
              />
              <button type="button" className="toggle-pass" onClick={() => setShowPass((v) => !v)} aria-label="Toggle password">
                {showPass ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="reg-confirm">Confirm Password</label>
            <input
              id="reg-confirm"
              type="password"
              name="confirmPassword"
              className="form-control"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter password"
              required
              autoComplete="new-password"
            />
          </div>

          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
