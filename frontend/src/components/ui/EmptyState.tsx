import React from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, description, action }) => (
  <div className="empty-state">
    <div className="empty-icon" aria-hidden="true">∅</div>
    <h4>{title}</h4>
    {description && <p>{description}</p>}
    {action && <div className="empty-action">{action}</div>}
  </div>
);
