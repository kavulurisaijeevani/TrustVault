import React from 'react';
import { Link } from 'react-router-dom';
import { EmptyState } from '@/components/ui';

export const NotFoundPage: React.FC = () => (
  <div className="center-page">
    <EmptyState
      title="Page not found"
      description="The page you are looking for does not exist."
      action={<Link to="/dashboard" className="btn btn-primary">Go to dashboard</Link>}
    />
  </div>
);
