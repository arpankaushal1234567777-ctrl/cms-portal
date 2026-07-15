'use client';

import { useState } from 'react';

export default function FeeReceipt({ semesters = [] }) {
  const [dob, setDob] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchReceipt = async (e) => {
    e.preventDefault();
    if (!dob || !selectedSemester) {
      setError('Both date of birth and semester selection are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/fee-receipt?dob=${encodeURIComponent(dob)}&semester=${encodeURIComponent(selectedSemester)}`);
      const data = await res.json();

      if (res.ok && data.success && data.url) {
        window.open(data.url, '_blank');
      } else {
        setError(data.error || 'Fee receipt record not found on the SBI ePay server.');
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
        <h2 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>SBI ePay Fee Receipt</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '12.5px', marginTop: '2px' }}>
          Fetch your official university payment fee receipt. The request is proxied securely.
        </p>
      </div>

      <form onSubmit={fetchReceipt} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '11px', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Select Semester Term
          </label>
          <select
            className="select-field"
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            disabled={loading}
          >
            <option value="">Select Semester</option>
            {semesters.map((sem) => (
              <option key={sem.semesterCode} value={sem.semesterCode}>
                Semester {sem.semesterName} ({sem.startDate} - {sem.endDate})
              </option>
            ))}
          </select>
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
              disabled={loading}
            />
          </div>
        </div>

        {error && (
          <div className="apple-error-banner animate-fade-in" style={{ margin: 0 }}>
            <span>{error}</span>
          </div>
        )}

        <button type="submit" className="btn-primary" style={{ height: '40px', marginTop: '6px' }} disabled={loading}>
          {loading ? 'Retrieving Link...' : 'Open Fee Receipt'}
          <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </button>
      </form>
    </div>
  );
}
