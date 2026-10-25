import React from 'react';

interface CardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ title, subtitle, children, actions, className }) => (
  <section className={`card ${className ?? ''}`.trim()}>
    {(title || subtitle || actions) && (
      <header className="card-header">
        <div>
          {title && <h3 className="card-title">{title}</h3>}
          {subtitle && <p className="card-subtitle">{subtitle}</p>}
        </div>
        {actions && <div className="card-actions">{actions}</div>}
      </header>
    )}
    <div className="card-body">{children}</div>
  </section>
);
