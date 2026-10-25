import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api, ApiRequestError } from '@/api/client';
import { Button, Card, Input, Alert, Spinner, Table, PageHeader, EmptyState } from '@/components/ui';
import type { DocumentPermission } from '@/types';

export const AccessPage: React.FC = () => {
  const { token } = useAuth();
  const [documentId, setDocumentId] = useState('');
  const [perms, setPerms] = useState<DocumentPermission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [newExpiry, setNewExpiry] = useState('');

  const loadPerms = async () => {
    if (!documentId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.listPermissions(documentId, token);
      setPerms((Array.isArray(data) ? data : []) as DocumentPermission[]);
    } catch (err) {
      const msg = err instanceof ApiRequestError ? err.message : 'Failed to load permissions.';
      setError(msg);
      setPerms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateExpiry = async (permissionId: string) => {
    try {
      await api.updateExpiry(permissionId, newExpiry ? new Date(newExpiry).toISOString() : null, token);
      setSuccess('Expiry updated.');
      setEditing(null);
      setNewExpiry('');
      await loadPerms();
    } catch (err) {
      const msg = err instanceof ApiRequestError ? err.message : 'Failed to update expiry.';
      setError(msg);
    }
  };

  const handleRevoke = async (permissionId: string) => {
    try {
      await api.revokePermission(permissionId, token);
      setSuccess('Access revoked. Subsequent requests will be denied by the backend.');
      await loadPerms();
    } catch (err) {
      const msg = err instanceof ApiRequestError ? err.message : 'Failed to revoke access.';
      setError(msg);
    }
  };

  const columns = [
    { key: 'userName', header: 'User', render: (r: DocumentPermission) => r.userName ?? r.userEmail ?? r.userId },
    { key: 'level', header: 'Level' },
    {
      key: 'expiresAt',
      header: 'Expires',
      render: (r: DocumentPermission) => (r.expiresAt ? new Date(r.expiresAt).toLocaleString() : 'Never'),
    },
    {
      key: 'status',
      header: 'Status',
      render: (r: DocumentPermission) => (r.isActive && !r.revokedAt ? 'Active' : 'Revoked/Expired'),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (r: DocumentPermission) => (
        <div className="row-actions">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => { setEditing(r.id); setNewExpiry(r.expiresAt ? r.expiresAt.slice(0, 16) : ''); }}
          >
            Edit expiry
          </Button>
          <Button variant="danger" size="sm" onClick={() => handleRevoke(r.id)}>
            Revoke
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Access Expiry & Revocation"
        description="Update expiry windows or revoke access immediately. The backend rechecks permissions on every request."
      />
      <Card>
        <div className="toolbar">
          <Input
            placeholder="Document ID"
            value={documentId}
            onChange={(e) => setDocumentId(e.target.value)}
          />
          <Button variant="secondary" onClick={loadPerms}>Load permissions</Button>
        </div>
        {error && <Alert variant="error">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        {loading && <Spinner label="Loading..." />}
        {!loading && perms.length === 0 && !error && (
          <EmptyState title="No permissions loaded" description="Enter a Document ID and click Load permissions." />
        )}
        {!loading && perms.length > 0 && (
          <Table columns={columns} rows={perms} rowKey={(r) => r.id} />
        )}
      </Card>

      {editing && (
        <Card title="Update expiry" className="mt">
          <div className="form">
            <Input
              label="New expiry (leave empty for never)"
              type="datetime-local"
              value={newExpiry}
              onChange={(e) => setNewExpiry(e.target.value)}
            />
            <div className="row-actions">
              <Button onClick={() => handleUpdateExpiry(editing)}>Save</Button>
              <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
