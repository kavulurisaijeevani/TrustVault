import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ApiRequestError } from '@/context/AuthContext';
import { Button, Card, Input, Alert } from '@/components/ui';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      await register(email, password, displayName);
      navigate('/dashboard');
    } catch (err) {
      const msg = err instanceof ApiRequestError ? err.message : 'Registration failed.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <Card title="Create your TrustVault account" subtitle="Join your organization's secure workspace">
        <form onSubmit={handleSubmit} className="form">
          {error && <Alert variant="error" title="Registration failed">{error}</Alert>}
          <Input label="Display name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="new-password" />
          <Input label="Confirm password" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required autoComplete="new-password" />
          <Button type="submit" loading={loading} className="btn-block">Create account</Button>
          <p className="auth-foot">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </form>
      </Card>
    </div>
  );
};
