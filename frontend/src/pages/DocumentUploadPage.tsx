import React, { useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api, ApiRequestError } from '@/api/client';
import { Button, Card, Alert, PageHeader } from '@/components/ui';

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB client-side hint (server is authoritative)
const ALLOWED = ['application/pdf', 'text/plain', 'image/png', 'image/jpeg'];

export const DocumentUploadPage: React.FC = () => {
  const { token } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setClientError(null);
    setResult(null);
    setError(null);
    const f = e.target.files?.[0] ?? null;
    if (!f) { setFile(null); return; }
    if (f.size > MAX_BYTES) {
      setClientError('File exceeds 10 MB limit.');
      setFile(null);
      return;
    }
    if (!ALLOWED.includes(f.type)) {
      setClientError('File type not allowed. Allowed: PDF, TXT, PNG, JPG.');
      setFile(null);
      return;
    }
    setFile(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await api.uploadDocument(file, token);
      setResult(`Uploaded successfully: ${JSON.stringify(res)}`);
      setFile(null);
      if (inputRef.current) inputRef.current.value = '';
    } catch (err) {
      const msg = err instanceof ApiRequestError ? err.message : 'Upload failed.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title="Upload Document" description="Uploads are validated and stored privately by the backend." />
      <Card>
        <form onSubmit={handleSubmit} className="form">
          {clientError && <Alert variant="warning" title="Validation">{clientError}</Alert>}
          {error && <Alert variant="error" title="Upload failed">{error}</Alert>}
          {result && <Alert variant="success" title="Upload complete">{result}</Alert>}
          <div className="field">
            <label className="field-label">File</label>
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.txt,.png,.jpg,.jpeg"
              onChange={onFileChange}
              className="input"
            />
            <p className="field-hint">Max 10 MB. Allowed: PDF, TXT, PNG, JPG. Server enforces final validation.</p>
          </div>
          {file && (
            <div className="file-preview">
              <strong>{file.name}</strong> — {(file.size / 1024).toFixed(1)} KB — {file.type}
            </div>
          )}
          <Button type="submit" loading={loading} disabled={!file}>Upload</Button>
        </form>
      </Card>
    </div>
  );
};
