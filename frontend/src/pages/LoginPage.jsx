import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { MdFoodBank } from 'react-icons/md';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { loginUser } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import './AuthPage.css';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await loginUser(form);
      login(res.data.token, res.data.user);
      navigate(res.data.user.role === 'admin' ? '/admin' : from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
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
        <h1>Welcome Back!</h1>
        <p className="auth-subtitle">Login to your account to continue</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="login-email">Email Address</label>
            <input
              id="login-email"
              type="email"
              name="email"
              className="form-control"
              value={form.email}
              onChange={handleChange}
              placeholder="email@example.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-pass">Password</label>
            <div className="password-wrap">
              <input
                id="login-pass"
                type={showPass ? 'text' : 'password'}
                name="password"
                className="form-control"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter password"
                required
                autoComplete="current-password"
              />
              <button type="button" className="toggle-pass" onClick={() => setShowPass((v) => !v)} aria-label="Toggle password">
                {showPass ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Sign up</Link>
        </p>


      </div>
    </div>
  );
};

export default LoginPage;
