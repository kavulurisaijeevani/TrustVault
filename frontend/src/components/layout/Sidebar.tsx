import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface NavItem {
  to: string;
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/documents', label: 'Documents', icon: '📄' },
  { to: '/documents/upload', label: 'Upload', icon: '⬆️' },
  { to: '/sharing', label: 'Sharing & Permissions', icon: '🔗' },
  { to: '/access', label: 'Access Expiry & Revocation', icon: '⏱️' },
  { to: '/audit', label: 'Audit Logs', icon: '🧾' },
];

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="brand-mark">TV</span>
        <span className="brand-name">TrustVault</span>
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`.trim()}
          >
            <span className="nav-icon" aria-hidden="true">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        {user && (
          <div className="sidebar-user">
            <div className="avatar">{(user.displayName || user.email).charAt(0).toUpperCase()}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user.displayName || user.email}</div>
              <div className="sidebar-user-role">{user.role}</div>
            </div>
          </div>
        )}
        <button className="btn btn-ghost btn-block" onClick={logout}>Sign out</button>
      </div>
    </aside>
  );
};
