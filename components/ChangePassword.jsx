'use client';

import { useState } from 'react';

export default function ChangePassword() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    if (newPassword.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPassword, newPassword })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess('Password updated successfully!');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setError(data.error || 'Failed to update password. Check old password.');
      }
    } catch (err) {
      setError('Connection to proxy server failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card animate-fade-in-up stagger-1" style={{ maxWidth: '480px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>Change Portal Password</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '12.5px', marginTop: '2px' }}>
          Update your student portal login password. This directly modifies the target university system securely.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '11px', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Current Password / DOB
          </label>
          <div style={{ position: 'relative' }}>
            <span className="apple-input-icon">
              <svg style={{ width: '15px', height: '15px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </span>
            <input
              type="password"
              className="input-field"
              placeholder="Enter current password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '11px', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            New Password
          </label>
          <div style={{ position: 'relative' }}>
            <span className="apple-input-icon">
              <svg style={{ width: '15px', height: '15px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m-2 4a2 2 0 012 2m-2-4a2 2 0 11-4 0M8 5a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2H8z" />
              </svg>
            </span>
            <input
              type="password"
              className="input-field"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '11px', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Confirm New Password
          </label>
          <div style={{ position: 'relative' }}>
            <span className="apple-input-icon">
              <svg style={{ width: '15px', height: '15px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </span>
            <input
              type="password"
              className="input-field"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        {error && (
          <div className="apple-error-banner animate-fade-in" style={{ margin: 0 }}>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="toast toast-success animate-fade-in" style={{ position: 'static', width: '100%', borderLeftColor: 'var(--text-primary)' }}>
            <span>{success}</span>
          </div>
        )}

        <button type="submit" className="btn-primary" style={{ height: '40px', marginTop: '6px' }} disabled={loading}>
          {loading ? 'Updating Password...' : 'Change Password'}
          <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </button>
      </form>
    </div>
  );
}
