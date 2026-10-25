import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { api, ApiRequestError } from '@/api/client';
import { Button, Card, Input, Alert, Spinner, EmptyState, Table, PageHeader } from '@/components/ui';
import type { Document } from '@/types';

export const DocumentsPage: React.FC = () => {
  const { token } = useAuth();
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.listDocuments(token);
      setDocs((Array.isArray(data) ? data : []) as Document[]);
    } catch (err) {
      const msg = err instanceof ApiRequestError ? err.message : 'Failed to load documents.';
      setError(msg);
      setDocs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const filtered = docs.filter((d) =>
    d.name.toLowerCase().includes(query.toLowerCase()) ||
    (d.description ?? '').toLowerCase().includes(query.toLowerCase())
  );

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'contentType', header: 'Type' },
    {
      key: 'sizeBytes',
      header: 'Size',
      render: (r: Document) => `${(r.sizeBytes / 1024).toFixed(1)} KB`,
    },
    { key: 'ownerName', header: 'Owner', render: (r: Document) => r.ownerName ?? r.ownerId },
    {
      key: 'uploadedAt',
      header: 'Uploaded',
      render: (r: Document) => new Date(r.uploadedAt).toLocaleString(),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Documents"
        description="Documents you can access. Access is enforced by the backend."
        actions={
          <Link to="/documents/upload" className="btn btn-primary">Upload</Link>
        }
      />
      <Card>
        <div className="toolbar">
          <Input
            placeholder="Search documents..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button variant="secondary" onClick={load}>Refresh</Button>
        </div>
        {loading && <Spinner label="Loading documents..." />}
        {error && <Alert variant="warning" title="Backend endpoint unavailable">{error}</Alert>}
        {!loading && !error && filtered.length === 0 && (
          <EmptyState
            title="No documents available"
            description="Upload a document or ask an owner to share one with you."
            action={<Link to="/documents/upload" className="btn btn-primary">Upload</Link>}
          />
        )}
        {!loading && filtered.length > 0 && (
          <Table columns={columns} rows={filtered} rowKey={(r) => r.id} />
        )}
      </Card>
    </div>
  );
};
