import React from 'react';

type Variant = 'info' | 'success' | 'warning' | 'error';

interface AlertProps {
  variant?: Variant;
  title?: string;
  children: React.ReactNode;
}

export const Alert: React.FC<AlertProps> = ({ variant = 'info', title, children }) => (
  <div className={`alert alert-${variant}`} role="alert">
    {title && <strong className="alert-title">{title}</strong>}
    <div className="alert-body">{children}</div>
  </div>
);
