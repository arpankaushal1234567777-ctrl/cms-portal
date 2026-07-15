'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Dashboard from '@/components/Dashboard';

export default function DashboardPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [studentName, setStudentName] = useState('');
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/profile');
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setStudentName(data.data.name);
            setProfile(data.data);
            setAuthenticated(true);
          } else {
            window.location.href = '/';
          }
        } else {
          window.location.href = '/';
        }
      } catch (err) {
        window.location.href = '/';
      } finally {
        setChecking(false);
      }
    };

    checkAuth();
  }, []);

  if (checking) {
    return (
      <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', color: 'var(--text-primary)' }}>
        {/* Sticky loading bar at top */}
        <div style={{ height: '72px', borderBottom: '1px solid rgba(148,163,184,0.08)', display: 'flex', alignItems: 'center', padding: '0 24px' }}>
          <div className="skeleton" style={{ height: '24px', width: '120px' }} />
        </div>
        
        {/* Central skeletal cards */}
        <div className="container" style={{ padding: '32px 24px' }}>
          <div className="skeleton animate-fade-in" style={{ height: '40px', width: '300px', marginBottom: '24px', borderRadius: '8px' }} />
          <div className="glass-card" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
              <div className="skeleton" style={{ width: '56px', height: '56px', borderRadius: '50%' }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div className="skeleton" style={{ height: '20px', width: '30%' }} />
                <div className="skeleton" style={{ height: '14px', width: '15%' }} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              {[1, 2, 3, 4].map(n => (
                <div key={n} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div className="skeleton" style={{ height: '12px', width: '40%' }} />
                  <div className="skeleton" style={{ height: '16px', width: '70%' }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!authenticated) return null;

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <Navbar studentName={studentName} />
      <Dashboard initialProfile={profile} />
    </div>
  );
}
