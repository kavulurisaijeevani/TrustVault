import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

const titles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/documents': 'Documents',
  '/documents/upload': 'Upload Document',
  '/sharing': 'Sharing & Permissions',
  '/access': 'Access Expiry & Revocation',
  '/audit': 'Audit Logs',
};

export const AppLayout: React.FC = () => {
  const { pathname } = useLocation();
  const title = titles[pathname] ?? 'TrustVault';
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-main">
        <Topbar title={title} />
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
