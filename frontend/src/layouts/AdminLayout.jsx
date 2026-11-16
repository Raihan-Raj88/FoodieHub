import { useState } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import {
  MdDashboard, MdFastfood, MdCategory, MdShoppingBag,
  MdPeople, MdLogout, MdMenu, MdClose
} from 'react-icons/md';
import { MdFoodBank } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';
import './AdminLayout.css';

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: <MdDashboard />, end: true },
  { to: '/admin/foods', label: 'Foods', icon: <MdFastfood /> },
  { to: '/admin/categories', label: 'Categories', icon: <MdCategory /> },
  { to: '/admin/orders', label: 'Orders', icon: <MdShoppingBag /> },
  { to: '/admin/customers', label: 'Customers', icon: <MdPeople /> },
];

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <MdFoodBank />
          <span>FoodieHub</span>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{user?.name?.[0]}</div>
            <div>
              <p>{user?.name}</p>
              <small>Administrator</small>
            </div>
          </div>
          <button className="sidebar-logout" onClick={handleLogout} aria-label="Logout">
            <MdLogout />
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="admin-main">
        <header className="admin-topbar">
          <button className="topbar-menu-btn" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
            <MdMenu />
          </button>
          <h1 className="topbar-title">Admin Panel</h1>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
