import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api, ApiRequestError } from '@/api/client';
import { Button, Card, Input, Alert, Spinner, Table, PageHeader, EmptyState } from '@/components/ui';
import type { DocumentPermission, PermissionLevel } from '@/types';

export const SharingPage: React.FC = () => {
  const { token } = useAuth();
  const [documentId, setDocumentId] = useState('');
  const [userId, setUserId] = useState('');
  const [level, setLevel] = useState<PermissionLevel>('Read');
  const [expiresAt, setExpiresAt] = useState('');
  const [perms, setPerms] = useState<DocumentPermission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      await api.shareDocument(
        {
          documentId,
          userId,
          level,
          expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
        },
        token
      );
      setSuccess('Permission granted.');
      await loadPerms();
    } catch (err) {
      const msg = err instanceof ApiRequestError ? err.message : 'Failed to grant permission.';
      setError(msg);
    }
  };

  const handleRevoke = async (permissionId: string) => {
    try {
      await api.revokePermission(permissionId, token);
      setSuccess('Permission revoked.');
      await loadPerms();
    } catch (err) {
      const msg = err instanceof ApiRequestError ? err.message : 'Failed to revoke permission.';
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
      key: 'isActive',
      header: 'Active',
      render: (r: DocumentPermission) => (r.isActive && !r.revokedAt ? 'Yes' : 'No'),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (r: DocumentPermission) => (
        <Button variant="danger" size="sm" onClick={() => handleRevoke(r.id)}>
          Revoke
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Sharing & Permissions" description="Grant, review, and revoke per-document access." />
      <div className="grid grid-2">
        <Card title="Grant access">
          <form onSubmit={handleShare} className="form">
            {error && <Alert variant="error">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}
            <Input label="Document ID" value={documentId} onChange={(e) => setDocumentId(e.target.value)} required />
            <Input label="User ID (grantee)" value={userId} onChange={(e) => setUserId(e.target.value)} required />
            <div className="field">
              <label className="field-label">Permission level</label>
              <select className="input" value={level} onChange={(e) => setLevel(e.target.value as PermissionLevel)}>
                <option value="Read">Read</option>
                <option value="Edit">Edit</option>
              </select>
            </div>
            <Input
              label="Expires at (optional)"
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              hint="Leave empty for no expiry."
            />
            <Button type="submit">Grant permission</Button>
          </form>
        </Card>
        <Card title="Existing permissions" actions={<Button variant="secondary" size="sm" onClick={loadPerms}>Load</Button>}>
          {loading && <Spinner label="Loading..." />}
          {!loading && perms.length === 0 && (
            <EmptyState title="No permissions loaded" description="Enter a Document ID and click Load." />
          )}
          {!loading && perms.length > 0 && (
            <Table columns={columns} rows={perms} rowKey={(r) => r.id} />
          )}
        </Card>
      </div>
    </div>
  );
};
