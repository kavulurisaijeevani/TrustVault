import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ApiRequestError } from '@/context/AuthContext';
import { Button, Card, Input, Alert } from '@/components/ui';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      const msg = err instanceof ApiRequestError ? err.message : 'Login failed.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <Card title="Sign in to TrustVault" subtitle="Secure document sharing for your organization">
        <form onSubmit={handleSubmit} className="form">
          {error && <Alert variant="error" title="Authentication failed">{error}</Alert>}
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          <Button type="submit" loading={loading} className="btn-block">Sign in</Button>
          <p className="auth-foot">
            No account? <Link to="/register">Create one</Link>
          </p>
        </form>
      </Card>
    </div>
  );
};
