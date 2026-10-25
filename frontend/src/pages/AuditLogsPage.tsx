import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api, ApiRequestError } from '@/api/client';
import { Button, Card, Alert, Spinner, Table, PageHeader, EmptyState } from '@/components/ui';
import type { AuditLog } from '@/types';

export const AuditLogsPage: React.FC = () => {
  const { token } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const load = async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.listAuditLogs(token, { page: p, pageSize });
      setLogs(Array.isArray(data?.items) ? (data.items as AuditLog[]) : []);
    } catch (err) {
      const msg = err instanceof ApiRequestError ? err.message : 'Failed to load audit logs.';
      setError(msg);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, token]);

  const columns = [
    { key: 'timestamp', header: 'Time', render: (r: AuditLog) => new Date(r.timestamp).toLocaleString() },
    { key: 'actorEmail', header: 'Actor', render: (r: AuditLog) => r.actorEmail ?? r.actorId },
    { key: 'action', header: 'Action' },
    { key: 'targetDocumentName', header: 'Target', render: (r: AuditLog) => r.targetDocumentName ?? r.targetDocumentId ?? '—' },
    {
      key: 'outcome',
      header: 'Outcome',
      render: (r: AuditLog) => (
        <span className={`badge badge-${r.outcome === 'Success' ? 'ok' : r.outcome === 'Denied' ? 'warn' : 'err'}`}>
          {r.outcome}
        </span>
      ),
    },
    { key: 'ipAddress', header: 'IP', render: (r: AuditLog) => r.ipAddress ?? '—' },
  ];

  return (
    <div>
      <PageHeader
        title="Audit Logs"
        description="Immutable record of security-relevant actions. Read-only."
        actions={<Button variant="secondary" size="sm" onClick={() => load(page)}>Refresh</Button>}
      />
      <Card>
        {loading && <Spinner label="Loading audit logs..." />}
        {error && <Alert variant="warning" title="Backend endpoint unavailable">{error}</Alert>}
        {!loading && logs.length === 0 && !error && (
          <EmptyState title="No audit events" description="Events will appear here once the backend records them." />
        )}
        {!loading && logs.length > 0 && (
          <Table columns={columns} rows={logs} rowKey={(r) => r.id} />
        )}
        <div className="pagination">
          <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            Previous
          </Button>
          <span>Page {page}</span>
          <Button variant="ghost" size="sm" onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      </Card>
    </div>
  );
};
