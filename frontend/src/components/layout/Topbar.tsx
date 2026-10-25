import React from 'react';
import { useAuth } from '@/context/AuthContext';

interface TopbarProps {
  title: string;
}

export const Topbar: React.FC<TopbarProps> = ({ title }) => {
  const { user } = useAuth();
  return (
    <header className="topbar">
      <h2 className="topbar-title">{title}</h2>
      <div className="topbar-right">
        <span className="topbar-user">{user?.email}</span>
      </div>
    </header>
  );
};
