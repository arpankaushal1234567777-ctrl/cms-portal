'use client';

import { useState, useEffect } from 'react';

// Curated verified active DEI Syllabi directory
const SYLLABI_DATABASE = [
  {
    faculty: 'Faculty of Engineering',
    departments: [
      {
        name: 'B.Tech Part-Time',
        program: 'B.Tech Part-Time Syllabus (Continuous Evaluation)',
        keywords: ['btech', 'b.tech', 'part-time', 'engineering'],
        pdfUrl: 'https://www.dei.ac.in/files/NAAC/Criterion1/Syllabus%20for%20all%20Programs(2017-18)/b.tec%20part%20time.pdf'
      },
      {
        name: 'B.Tech Part-Time Full',
        program: 'B.Tech Part-Time (Complete Course Structure)',
        keywords: ['btech', 'b.tech', 'part-time', 'mechanical', 'electrical'],
        pdfUrl: 'https://www.dei.ac.in/files/NAAC/Criterion1/Syllabus%20for%20all%20Programs(2017-18)/b.tec%20part%20time%20FULL.pdf'
      }
    ]
  }
];

export default function Academics({ profile }) {
  const [subTab, setSubTab] = useState('calendar'); // 'calendar' or 'syllabus'
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [selectedDept, setSelectedDept] = useState(null);
  
  // Auto-suggested syllabus state
  const [suggestedSyllabus, setSuggestedSyllabus] = useState(null);

  // Auto detect student syllabus based on their profile data (program, department)
  useEffect(() => {
    if (!profile) return;
    
    const progText = (profile.program || '').toLowerCase();
    const deptText = (profile.department || '').toLowerCase();

    let matched = null;
    
    // Scan all faculties/departments in our database
    for (const fac of SYLLABI_DATABASE) {
      for (const dept of fac.departments) {
        const isMatch = dept.keywords.some(kw => 
          progText.includes(kw) || deptText.includes(kw)
        );
        if (isMatch) {
          matched = { ...dept, facultyName: fac.faculty };
          break;
        }
      }
      if (matched) break;
    }

    setSuggestedSyllabus(matched);
  }, [profile]);

  const handleFacultyChange = (facName) => {
    setSelectedFaculty(facName);
    setSelectedDept(null);
  };

  const currentFacultyData = SYLLABI_DATABASE.find(f => f.faculty === selectedFaculty);

  // Verified active academic exam scheme/calendar PDF url
  const calendarPdfUrl = 'https://www.dei.ac.in/files/notices/2025/End%20Sem%20Scheme%20(Common%20Courses)%20Dec%2025.pdf';
  const embeddedCalendarUrl = `https://docs.google.com/gview?url=${encodeURIComponent(calendarPdfUrl)}&embedded=true`;

  return (
    <div className="animate-fade-in">
      {/* Sub Tabs Toggle */}
      <div className="glass-card" style={{ padding: '8px', marginBottom: '24px', display: 'flex', gap: '8px' }}>
        <button
          className={`sidebar-link ${subTab === 'calendar' ? 'active' : ''}`}
          onClick={() => setSubTab('calendar')}
          style={{ flex: 1, justifyContent: 'center', padding: '10px 0' }}
        >
          📅 Academic Schedule
        </button>
        <button
          className={`sidebar-link ${subTab === 'syllabus' ? 'active' : ''}`}
          onClick={() => setSubTab('syllabus')}
          style={{ flex: 1, justifyContent: 'center', padding: '10px 0' }}
        >
          📚 Course Syllabus
        </button>
      </div>

      {/* SUB-PANEL 1: ACADEMIC CALENDAR */}
      {subTab === 'calendar' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>End-Semester Examination Scheme</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '2px' }}>
                Official continuous evaluation timeline and final examination dates.
              </p>
            </div>
            <a
              href={calendarPdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
              style={{ padding: '8px 16px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              📥 Download Scheme PDF
            </a>
          </div>

          {/* Embedded PDF Viewer Iframe */}
          <div className="glass-card" style={{ padding: '0', overflow: 'hidden', height: '600px', border: '1px solid var(--border-primary)', position: 'relative' }}>
            <iframe
              src={embeddedCalendarUrl}
              style={{ width: '100%', height: '100%', border: 'none' }}
              title="DEI Academic Schedule"
            />
          </div>
        </div>
      )}

      {/* SUB-PANEL 2: COURSE SYLLABUS */}
      {subTab === 'syllabus' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* DEI Course Central (LMS) Suggestion Box */}
          <div
            className="glass-card animate-fade-in-up"
            style={{
              padding: '24px',
              border: '1px solid var(--accent-cyan)',
              background: 'rgba(34, 211, 238, 0.02)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px'
            }}
          >
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: '10px', background: 'var(--accent-cyan)', color: '#09090b', padding: '3px 8px', borderRadius: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Official LMS Directory
              </span>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginTop: '8px' }}>
                DEI Course Central (LMS) Portal
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '12.5px', marginTop: '4px', lineHeight: '1.4' }}>
                Access course-specific syllabi, lecture modules, and resource materials uploaded by your professors.
              </p>
            </div>

            <a
              href="http://deilms.dei.ac.in/deilms/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary animate-pulse-glow"
              style={{
                borderColor: 'var(--accent-cyan)',
                color: 'var(--accent-cyan)',
                background: 'rgba(34, 211, 238, 0.05)',
                padding: '10px 20px',
                fontSize: '13px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: '600'
              }}
            >
              🌐 Open DEI LMS
            </a>
          </div>

          {/* Auto Suggested Syllabus Box */}
          {suggestedSyllabus && (
            <div
              className="glass-card animate-fade-in-up"
              style={{
                padding: '20px 24px',
                border: '1px solid var(--border-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px'
              }}
            >
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '14.5px', fontWeight: '600', color: 'var(--text-primary)' }}>
                  {suggestedSyllabus.program}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '2px' }}>
                  Faculty: <span style={{ color: 'var(--text-primary)' }}>{suggestedSyllabus.facultyName}</span>
                </p>
              </div>

              <a
                href={suggestedSyllabus.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
                style={{
                  padding: '8px 16px',
                  fontSize: '12.5px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                📥 Download PDF
              </a>
            </div>
          )}

          {/* Browse General Syllabus Directory */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>
              Archive Syllabi Library
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '12.5px', marginBottom: '20px' }}>
              Browse other published curriculum structures index papers available in our verified files directory.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              {/* Select Faculty */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>
                  Faculty Name
                </label>
                <select
                  className="select-field"
                  value={selectedFaculty}
                  onChange={(e) => handleFacultyChange(e.target.value)}
                  style={{ width: '100%', height: '40px' }}
                >
                  <option value="">Select Faculty</option>
                  {SYLLABI_DATABASE.map(f => (
                    <option key={f.faculty} value={f.faculty}>{f.faculty}</option>
                  ))}
                </select>
              </div>

              {/* Select Department */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>
                  Department / Program
                </label>
                <select
                  className="select-field"
                  disabled={!selectedFaculty}
                  onChange={(e) => setSelectedDept(
                    currentFacultyData?.departments.find(d => d.name === e.target.value) || null
                  )}
                  style={{ width: '100%', height: '40px' }}
                >
                  <option value="">Select Program</option>
                  {currentFacultyData?.departments.map(d => (
                    <option key={d.name} value={d.name}>{d.program}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Selected Department Details */}
            {selectedDept && (
              <div
                className="animate-fade-in-up"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  background: 'var(--border-secondary)',
                  borderRadius: 'var(--radius-card)',
                  border: '1px solid var(--border-primary)'
                }}
              >
                <div>
                  <h4 style={{ fontSize: '13.5px', fontWeight: '600', color: 'var(--text-primary)' }}>
                    {selectedDept.program}
                  </h4>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    {selectedFaculty}
                  </span>
                </div>
                <a
                  href={selectedDept.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                  style={{ padding: '8px 16px', fontSize: '12.5px' }}
                >
                  📥 Get PDF
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
