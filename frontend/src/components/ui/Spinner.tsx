import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', label }) => (
  <div className="spinner-wrap" role="status" aria-live="polite">
    <span className={`spinner spinner-${size}`} aria-hidden="true" />
    {label && <span className="spinner-label">{label}</span>}
  </div>
);
