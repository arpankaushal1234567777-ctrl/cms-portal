'use client';

import { useState, useEffect } from 'react';

export default function ResultBoard() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Expand states for hierarchical folders
  const [expandedSessions, setExpandedSessions] = useState({});
  const [expandedSubcategories, setExpandedSubcategories] = useState({});

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
    (r.subcategory && r.subcategory.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (r.session && r.session.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Group results into: Session -> Subcategory -> Links
  const tree = filteredResults.reduce((acc, item) => {
    const session = item.session || 'General Announcements';
    const subcat = item.subcategory || 'General';
    
    if (!acc[session]) {
      acc[session] = {};
    }
    if (!acc[session][subcat]) {
      acc[session][subcat] = [];
    }
    acc[session][subcat].push(item);
    return acc;
  }, {});

  const sessionKeys = Object.keys(tree);
  const isSearching = searchQuery.trim().length > 0;

  // Toggle handlers
  const toggleSession = (session) => {
    setExpandedSessions(prev => ({
      ...prev,
      [session]: !prev[session]
    }));
  };

  const toggleSubcategory = (session, subcat) => {
    const key = `${session}_${subcat}`;
    setExpandedSubcategories(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="animate-fade-in">
      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>📢 Official Results Bulletin</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
          Interactive notice board. Click on semesters and departments to explore published PDF result sheets.
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
            placeholder="Search for examinations, sessions, or departments..."
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
      ) : sessionKeys.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-secondary)' }}>
          <svg style={{ width: '40px', height: '40px', color: 'var(--text-muted)', marginBottom: '12px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '6px' }}>No matches found</h3>
          <p style={{ fontSize: '13px', maxWidth: '300px', margin: '0 auto' }}>
            No matching result records found. Try clearing your search filters to browse all categories.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {sessionKeys.map((sessionName, sIdx) => {
            const isSessionOpen = isSearching || !!expandedSessions[sessionName];
            const subcats = Object.keys(tree[sessionName]);

            return (
              <div key={sIdx} className="glass-card animate-fade-in-up" style={{ padding: '0', overflow: 'hidden', border: '1px solid var(--border-primary)' }}>
                {/* Level 1: Session Header */}
                <button
                  onClick={() => toggleSession(sessionName)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 20px',
                    background: 'transparent',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    outline: 'none',
                    transition: 'var(--transition-smooth)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {/* Folder Icon */}
                    <svg style={{ width: '18px', height: '18px', color: 'var(--accent-cyan)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', lineHeight: '1.4' }}>
                      {sessionName}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '10.5px', background: 'var(--border-primary)', padding: '3px 8px', borderRadius: '12px', color: 'var(--text-secondary)', fontWeight: '500' }}>
                      {subcats.length} {subcats.length === 1 ? 'category' : 'categories'}
                    </span>
                    {/* Chevron Icon */}
                    <svg
                      style={{
                        width: '14px',
                        height: '14px',
                        color: 'var(--text-secondary)',
                        transform: isSessionOpen ? 'rotate(180deg)' : 'none',
                        transition: 'transform 0.2s var(--ease-spring)'
                      }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* Level 2: Subcategories (Faculties/Schools) */}
                {isSessionOpen && (
                  <div style={{ padding: '0 20px 20px 20px', borderTop: '1px solid var(--border-secondary)', display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '4px' }}>
                    <div style={{ height: '8px' }} />
                    {subcats.map((subcatName, subIdx) => {
                      const subcatKey = `${sessionName}_${subcatName}`;
                      const isSubcatOpen = isSearching || !!expandedSubcategories[subcatKey];
                      const items = tree[sessionName][subcatName];

                      return (
                        <div key={subIdx} style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingLeft: '8px', borderLeft: '1px solid var(--border-primary)' }}>
                          {/* Subcategory Accordion Header */}
                          <button
                            onClick={() => toggleSubcategory(sessionName, subcatName)}
                            style={{
                              width: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '8px 12px',
                              background: isSubcatOpen ? 'var(--border-secondary)' : 'transparent',
                              border: 'none',
                              borderRadius: 'var(--radius-button)',
                              textAlign: 'left',
                              cursor: 'pointer',
                              outline: 'none',
                              transition: 'var(--transition-smooth)'
                            }}
                            onMouseEnter={(e) => {
                              if (!isSubcatOpen) e.currentTarget.style.background = 'var(--border-glass)';
                            }}
                            onMouseLeave={(e) => {
                              if (!isSubcatOpen) e.currentTarget.style.background = 'transparent';
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <svg style={{ width: '15px', height: '15px', color: 'var(--text-secondary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8m-5 5h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293h3.172a1 1 0 00.707-.293l2.414-2.414a1 1 0 01.707-.293H20" />
                              </svg>
                              <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>
                                {subcatName}
                              </span>
                            </div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '9.5px', color: 'var(--text-muted)' }}>
                                {items.length} {items.length === 1 ? 'sheet' : 'sheets'}
                              </span>
                              <svg
                                style={{
                                  width: '12px',
                                  height: '12px',
                                  color: 'var(--text-muted)',
                                  transform: isSubcatOpen ? 'rotate(180deg)' : 'none',
                                  transition: 'transform 0.2s var(--ease-spring)'
                                }}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth="2.5"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </button>

                          {/* Level 3: PDF Document Links */}
                          {isSubcatOpen && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingLeft: '24px', marginTop: '4px', marginBottom: '8px' }}>
                              {items.map((res, itemIdx) => (
                                <a
                                  key={itemIdx}
                                  href={res.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '10px 14px',
                                    textDecoration: 'none',
                                    borderRadius: 'var(--radius-button)',
                                    border: '1px solid var(--border-secondary)',
                                    background: 'var(--bg-secondary)',
                                    transition: 'var(--transition-smooth)',
                                    cursor: 'pointer'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--text-secondary)';
                                    e.currentTarget.style.transform = 'translateX(2px)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--border-secondary)';
                                    e.currentTarget.style.transform = 'none';
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, paddingRight: '12px' }}>
                                    <svg style={{ width: '14px', height: '14px', color: 'var(--text-muted)', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <span style={{ fontSize: '12.5px', fontWeight: '500', color: 'var(--text-primary)', lineHeight: '1.4' }}>
                                      {res.title}
                                    </span>
                                  </div>
                                  <svg style={{ width: '13px', height: '13px', color: 'var(--text-secondary)', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                  </svg>
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
