'use client';

import { useState } from 'react';

export default function AdmitCard({ defaultRollNumber }) {
  const [regNum, setRegNum] = useState(defaultRollNumber || '');
  const [dob, setDob] = useState('');
  const [error, setError] = useState('');

  const handleDownload = (e) => {
    e.preventDefault();
    if (!regNum || !dob) {
      setError('Both registration number and date of birth are required');
      return;
    }

    setError('');
    
    // Format dob from DD/MM/YYYY to YYYY-MM-DD
    let formattedDob = dob;
    if (dob.includes('/')) {
      const parts = dob.split('/');
      if (parts.length === 3) {
        formattedDob = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    }

    // Since the API streams the PDF directly, we open it in a new tab for download/print
    const downloadUrl = `/api/admit-card?regNum=${encodeURIComponent(regNum)}&dob=${encodeURIComponent(dob)}`;
    window.open(downloadUrl, '_blank');
  };

  return (
    <div className="glass-card animate-fade-in-up stagger-1" style={{ maxWidth: '480px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>Official Exam Admit Card</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '12.5px', marginTop: '2px' }}>
          Enter your candidate details to fetch and print the official examination admit card PDF.
        </p>
      </div>

      <form onSubmit={handleDownload} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '11px', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Roll / Registration Number
          </label>
          <div style={{ position: 'relative' }}>
            <span className="apple-input-icon">
              <svg style={{ width: '15px', height: '15px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </span>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. 2201854"
              value={regNum}
              onChange={(e) => setRegNum(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '11px', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Date of Birth
          </label>
          <div style={{ position: 'relative' }}>
            <span className="apple-input-icon">
              <svg style={{ width: '15px', height: '15px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </span>
            <input
              type="text"
              className="input-field"
              placeholder="Format: DD/MM/YYYY"
              value={dob}
              onChange={(e) => {
                // Auto format dates to DD/MM/YYYY
                let val = e.target.value.replace(/\D/g, '');
                if (val.length > 8) val = val.slice(0, 8);
                let formatted = val;
                if (val.length > 4) {
                  formatted = `${val.slice(0, 2)}/${val.slice(2, 4)}/${val.slice(4)}`;
                } else if (val.length > 2) {
                  formatted = `${val.slice(0, 2)}/${val.slice(2)}`;
                }
                setDob(formatted);
              }}
            />
          </div>
        </div>

        {error && (
          <div className="apple-error-banner animate-fade-in" style={{ margin: 0 }}>
            <span>{error}</span>
          </div>
        )}

        <button type="submit" className="btn-primary" style={{ height: '40px', marginTop: '6px' }}>
          Retrieve & Download PDF
          <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </button>
      </form>
    </div>
  );
}
