'use client';

export default function PortalsHub() {
  const portals = [
    {
      title: 'DEI Samarth Portal',
      description: 'The official Ministry of Education student ERP. Use this for semester course registration, filling out final examination forms, downloading admit cards, and retrieving your official end-term Grade Cards.',
      actionText: 'Launch Samarth Portal',
      url: 'https://dei.samarth.edu.in/index.php/site/login',
      badge: 'ERP & Registration',
      color: 'var(--accent-cyan)'
    },
    {
      title: 'DEI Course Central (LMS)',
      description: 'The institute’s Learning Management System. Log in to download course syllabus structures, lecture notes, slide modules, and assignment submissions uploaded directly by your professors.',
      actionText: 'Open LMS System',
      url: 'http://deilms.dei.ac.in/deilms/',
      badge: 'Syllabus & Lectures',
      color: 'var(--accent-emerald)'
    },
    {
      title: 'DigiLocker / NAD',
      description: 'The National Academic Depository (NAD) platform. Access digitally verified copies of your DEI degree certificates, diplomas, and official academic transcripts directly onto your government locker.',
      actionText: 'Open DigiLocker',
      url: 'https://www.digilocker.gov.in/',
      badge: 'Degrees & Transcripts',
      color: 'var(--accent-violet)'
    },
    {
      title: 'DEI E-Pay Fee Portal',
      description: 'The official fee payment gateway. Use this system to deposit your semester fees, check dues, and download online transaction receipts for proof of academic fee deposition.',
      actionText: 'Open Fee Gateway',
      url: 'https://admission.dei.ac.in/epay80',
      badge: 'Fee Deposition',
      color: 'var(--accent-amber)'
    }
  ];

  return (
    <div className="animate-fade-in">
      {/* Information Header Banner */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px', borderLeft: '3px solid var(--accent-cyan)' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>🔗 Official Academic Portals Hub</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '6px', lineHeight: '1.4' }}>
          Quick access launchpad to the official DEI student systems. Enter your credentials directly on their respective secure servers.
        </p>

        {/* Credentials Guidance Note */}
        <div style={{ marginTop: '16px', padding: '12px 16px', background: 'var(--border-secondary)', borderRadius: '6px', border: '1px solid var(--border-primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '12px' }}>💡</span>
            <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)' }}>Important Note on Login Credentials</span>
          </div>
          <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
            Your **Samarth Portal** username is your official **Enrollment Number** (not your Roll Number) and uses a separate password you created during Samarth registration. For daily internal marks, continue using your **Roll Number** on this CMS portal dashboard.
          </p>
        </div>
      </div>

      {/* Grid List of Portals */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {portals.map((p, idx) => (
          <div
            key={idx}
            className="glass-card animate-fade-in-up"
            style={{
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'var(--transition-smooth)',
              border: '1px solid var(--border-primary)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = p.color;
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-primary)';
              e.currentTarget.style.transform = 'none';
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span
                  style={{
                    fontSize: '9.5px',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    padding: '3px 8px',
                    borderRadius: '12px',
                    color: '#09090b',
                    background: p.color
                  }}
                >
                  {p.badge}
                </span>
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>
                {p.title}
              </h3>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '20px' }}>
                {p.description}
              </p>
            </div>

            <a
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 0',
                fontSize: '13px',
                fontWeight: '500'
              }}
            >
              <span>{p.actionText}</span>
              <svg style={{ width: '14px', height: '14px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
