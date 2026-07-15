'use client';

export default function ProfileCard({ profile, loading }) {
  if (loading) {
    return (
      <div className="glass-card animate-fade-in" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
          <div className="skeleton" style={{ width: '48px', height: '48px', borderRadius: '8px' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
            <div className="skeleton" style={{ height: '18px', width: '30%' }} />
            <div className="skeleton" style={{ height: '12px', width: '15%' }} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' }}>
          {[1, 2, 3, 4].map(n => (
            <div key={n} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div className="skeleton" style={{ height: '12px', width: '25%' }} />
              <div className="skeleton" style={{ height: '14px', width: '50%' }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    return name[0].toUpperCase();
  };

  return (
    <div className="glass-card animate-fade-in-up stagger-1" style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '10px',
          background: 'var(--text-primary)',
          color: 'var(--bg-secondary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px',
          fontWeight: '600',
        }}>
          {getInitials(profile.name)}
        </div>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '600', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            {profile.name}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '12.5px', fontWeight: '400' }}>
            Dayalbagh Educational Institute Student
          </p>
        </div>
      </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '20px' }}>
        <div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '11px', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.05em', marginBottom: '4px' }}>
            Roll Number
          </div>
          <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' }}>
            {profile.rollNumber}
          </div>
        </div>

        <div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '11px', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.05em', marginBottom: '4px' }}>
            Program Enrolled
          </div>
          <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' }}>
            {profile.program}
          </div>
        </div>

        <div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '11px', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.05em', marginBottom: '4px' }}>
            Branch / Specialization
          </div>
          <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' }}>
            {profile.branch}
          </div>
        </div>

        <div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '11px', textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.05em', marginBottom: '4px' }}>
            Academic Status
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '500', color: 'var(--status-active)', background: 'var(--status-active-bg)', padding: '4px 10px', borderRadius: '12px', marginTop: '2px' }}>
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--status-active)' }} />
            Active
          </div>
        </div>
      </div>
    </div>
  );
}
