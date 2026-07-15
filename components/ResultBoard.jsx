'use client';

import { useState, useEffect } from 'react';

export default function ResultBoard() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await fetch('/api/official-results');
        const data = await res.json();
        if (data.success) {
          setResults(data.results || []);
        } else {
          setError(data.error || 'Failed to load official results feed.');
        }
      } catch (err) {
        console.error('Error fetching official results:', err);
        setError('Connection to results feed failed.');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  const filteredResults = results.filter(r =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.category && r.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Group results by category
  const groupedResults = filteredResults.reduce((groups, item) => {
    const cat = item.category || 'General Announcements';
    if (!groups[cat]) {
      groups[cat] = [];
    }
    groups[cat].push(item);
    return groups;
  }, {});

  const categories = Object.keys(groupedResults);

  return (
    <div className="animate-fade-in">
      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>📢 Official Results Bulletin</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
          Real-time feed of examination results categorized by faculties, schools, and semesters.
        </p>

        {/* Search Bar */}
        <div style={{ position: 'relative', marginTop: '16px' }}>
          <svg
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: 'var(--text-muted)' }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            className="input-field"
            placeholder="Search by course code, faculty name, or semester..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '38px', height: '40px', fontSize: '13.5px' }}
          />
        </div>
      </div>

      {loading ? (
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '24px' }}>
          <div className="skeleton" style={{ height: '24px', width: '30%' }} />
          {[1, 2, 3].map(n => (
            <div key={n} className="skeleton" style={{ height: '60px', width: '100%' }} />
          ))}
        </div>
      ) : error ? (
        <div className="toast toast-error animate-fade-in" style={{ position: 'static', margin: '0 auto' }}>
          <span>{error}</span>
        </div>
      ) : categories.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-secondary)' }}>
          <svg style={{ width: '40px', height: '40px', color: 'var(--text-muted)', marginBottom: '12px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '6px' }}>No matches found</h3>
          <p style={{ fontSize: '13px', maxWidth: '300px', margin: '0 auto' }}>
            No result links or categories matched your search term. Try checking spelling or search a broader term.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {categories.map((category, catIdx) => (
            <div key={catIdx} className="animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Category Section Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 4px', marginBottom: '4px' }}>
                <span style={{ display: 'inline-block', width: '6px', height: '6px', backgroundColor: 'var(--accent-cyan)', borderRadius: '50%' }} />
                <h3 style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {category}
                </h3>
              </div>

              {/* Category Result Sheets */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {groupedResults[category].map((res, idx) => (
                  <a
                    key={idx}
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass-card"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 18px',
                      textDecoration: 'none',
                      transition: 'var(--transition-smooth)',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--text-primary)';
                      e.currentTarget.style.transform = 'translateX(2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-primary)';
                      e.currentTarget.style.transform = 'none';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, paddingRight: '16px' }}>
                      {/* Document icon */}
                      <svg style={{ width: '15px', height: '15px', color: 'var(--text-secondary)', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)', lineHeight: '1.4' }}>
                        {res.title}
                      </span>
                    </div>
                    {/* Download icon */}
                    <svg style={{ width: '15px', height: '15px', color: 'var(--text-secondary)', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
