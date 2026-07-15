'use client';

import { useState } from 'react';

export default function Navbar({ studentName }) {
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/logout', { method: 'POST' });
      window.location.href = '/';
    } catch (e) {
      console.error('Logout error:', e);
      window.location.href = '/';
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <nav className="navbar">
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg style={{ width: '22px', height: '22px', color: 'var(--text-primary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 14l9-5-9-5-9 5 9 5z" />
            <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0v6" />
          </svg>
          <span style={{ fontSize: '15px', fontWeight: '600', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            DEI CMS
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {studentName && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1px' }}>
              <span style={{ fontSize: '12.5px', fontWeight: '500', color: 'var(--text-primary)' }}>
                {studentName}
              </span>
              <span style={{ fontSize: '9px', color: 'var(--text-secondary)', fontWeight: '600', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                Verified Student
              </span>
            </div>
          )}

          <button onClick={handleLogout} className="btn-ghost" disabled={loggingOut} style={{ fontSize: '12.5px', padding: '6px 12px' }}>
            {loggingOut ? 'Signing out...' : 'Sign Out'}
            <svg style={{ width: '15px', height: '15px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
}
