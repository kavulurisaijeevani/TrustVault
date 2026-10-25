import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, description, actions }) => (
  <div className="page-header">
    <div>
      <h1 className="page-title">{title}</h1>
      {description && <p className="page-desc">{description}</p>}
    </div>
    {actions && <div className="page-actions">{actions}</div>}
  </div>
);
