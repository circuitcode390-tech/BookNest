import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LibraryIcon,
  DashboardIcon,
  BookIcon,
  TransactionIcon,
  UsersIcon,
  LogoutIcon,
} from './Icons';
import { formatRole } from '../utils/formatters';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-section">
          <div className="brand-icon-box">
            <LibraryIcon size={20} />
          </div>
          <div className="brand-titles">
            <span className="brand-name">Library System</span>
            <span className="brand-tagline">Enterprise Portal</span>
          </div>
        </div>

        <div className="sidebar-nav-container">
          <div className="nav-section-title">Navigation</div>
          <nav>
            <NavLink to="/" end>
              <DashboardIcon size={18} />
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/books">
              <BookIcon size={18} />
              <span>Book Management</span>
            </NavLink>
            <NavLink to="/transactions">
              <TransactionIcon size={18} />
              <span>Transactions</span>
            </NavLink>
            {user?.role === 'admin' && (
              <NavLink to="/users">
                <UsersIcon size={18} />
                <span>User Management</span>
              </NavLink>
            )}
          </nav>
        </div>

        <div className="sidebar-footer">
          <div className="user-profile-badge">
            <div className="avatar-circle">{getInitials(user?.name)}</div>
            <div className="user-meta">
              <div className="user-name">{user?.name || 'Authorized User'}</div>
              <div className="user-role-text">{formatRole(user?.role)}</div>
            </div>
            <button
              type="button"
              className="btn-logout"
              onClick={handleLogout}
              title="Sign out of system"
            >
              <LogoutIcon size={18} />
            </button>
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <h2 className="topbar-title">Library Management System</h2>
          </div>
          <div className="topbar-right">
            <div className="system-status-indicator">
              <span className="status-dot"></span>
              <span>System Online</span>
            </div>
          </div>
        </header>

        <section className="page-content">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
