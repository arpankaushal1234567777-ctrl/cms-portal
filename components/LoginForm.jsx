'use client';

import { useState } from 'react';

export default function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        window.location.href = '/dashboard';
      } else {
        setError(data.error || 'Incorrect Roll Number or Password.');
      }
    } catch (err) {
      setError('Connection failed. Verify server status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-card-container animate-fade-in-up stagger-1">
      {/* Premium minimal header */}
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <div className="apple-logo-glow">
          <svg style={{ width: '32px', height: '32px', color: 'var(--text-primary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 14l9-5-9-5-9 5 9 5z" />
            <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0v6" />
          </svg>
        </div>
        <h1 style={{ fontSize: '20px', fontWeight: '600', letterSpacing: '-0.025em', color: 'var(--text-primary)', marginBottom: '6px' }}>
          Sign in to DEI CMS
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '400' }}>
          Access your student record securely
        </p>
      </div>

      {error && (
        <div className="apple-error-banner animate-fade-in">
          <svg style={{ width: '16px', height: '16px', color: 'var(--status-rose)', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleLogin}>
        {/* Apple Style Grouped Input Fields */}
        <div className="apple-input-group">
          <div style={{ position: 'relative' }}>
            <span className="apple-input-icon">
              <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </span>
            <input
              type="text"
              className="apple-input-field"
              placeholder="Roll Number"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              autoComplete="username"
            />
          </div>
          <div className="apple-input-divider" />
          <div style={{ position: 'relative' }}>
            <span className="apple-input-icon">
              <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </span>
            <input
              type="password"
              className="apple-input-field"
              placeholder="Password / DOB"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoComplete="current-password"
            />
          </div>
        </div>

        <button type="submit" className="apple-signin-btn" disabled={loading}>
          {loading ? (
            <svg className="animate-spin" style={{ width: '16px', height: '16px', color: 'currentColor' }} fill="none" viewBox="0 0 24 24">
              <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <svg style={{ width: '18px', height: '18px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          )}
        </button>
      </form>

      <div style={{ marginTop: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
        <svg style={{ width: '14px', height: '14px', color: 'var(--text-primary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        <span style={{ fontSize: '11px', fontWeight: '400', letterSpacing: '0.02em' }}>
          Proxy connection hidden and secure.
        </span>
      </div>
    </div>
  );
}
