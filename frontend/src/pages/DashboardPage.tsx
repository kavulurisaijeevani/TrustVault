import React, { useEffect, useState } from 'react';
import { api, ApiRequestError } from '@/api/client';
import { Card, Alert, Spinner, PageHeader } from '@/components/ui';

interface HealthState {
  loading: boolean;
  app?: { application: string; status: string };
  db?: { status: string; database: string };
  error?: string;
}

export const DashboardPage: React.FC = () => {
  const [health, setHealth] = useState<HealthState>({ loading: true });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const app = await api.health();
        const db = await api.dbCheck();
        if (!cancelled) setHealth({ loading: false, app, db });
      } catch (err) {
        if (!cancelled) {
          const msg = err instanceof ApiRequestError ? err.message : 'Health check failed.';
          setHealth({ loading: false, error: msg });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview of your TrustVault workspace and backend connectivity."
      />

      <div className="grid grid-2">
        <Card title="Backend Status" subtitle="Live checks against the ASP.NET Core API">
          {health.loading && <Spinner label="Checking backend..." />}
          {health.error && <Alert variant="error" title="Backend unavailable">{health.error}</Alert>}
          {health.app && (
            <ul className="status-list">
              <li><span>Application</span><strong>{health.app.application}</strong></li>
              <li><span>Status</span><strong>{health.app.status}</strong></li>
              <li><span>Database</span><strong>{health.db?.status ?? '—'}</strong></li>
              <li><span>DB engine</span><strong>{health.db?.database ?? '—'}</strong></li>
            </ul>
          )}
        </Card>

        <Card title="Feature Status" subtitle="Honest status of backend capabilities">
          <ul className="status-list">
            <li><span>Authentication</span><strong className="badge badge-warn">Not implemented</strong></li>
            <li><span>Document storage</span><strong className="badge badge-warn">Not implemented</strong></li>
            <li><span>Permissions / sharing</span><strong className="badge badge-warn">Not implemented</strong></li>
            <li><span>Audit logging</span><strong className="badge badge-warn">Not implemented</strong></li>
          </ul>
          <p className="muted">
            The frontend is ready and calls the planned endpoints. Implement the matching backend controllers to enable these features.
          </p>
        </Card>
      </div>

      <Card title="Quick actions" className="mt">
        <div className="quick-actions">
          <a className="btn btn-secondary" href="/documents/upload">Upload a document</a>
          <a className="btn btn-secondary" href="/documents">Browse documents</a>
          <a className="btn btn-secondary" href="/audit">View audit logs</a>
        </div>
      </Card>
    </div>
  );
};
