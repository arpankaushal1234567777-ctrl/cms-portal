'use client';

import { useState, useEffect } from 'react';

// Curated official DEI Syllabi directory database (resolved against dei.ac.in)
const SYLLABI_DATABASE = [
  {
    faculty: 'Faculty of Science',
    departments: [
      {
        name: 'Computer Science',
        program: 'B.Sc. (Honours) / M.Sc. Computer Science',
        keywords: ['computer', 'science', 'csm', 'cs'],
        pdfUrl: 'https://www.dei.ac.in/dei/files/academics/Syllabus/Science/B.Sc-M.Sc-ComputerScience-Syllabus.pdf'
      },
      {
        name: 'Mathematics',
        program: 'B.Sc. (Honours) / M.Sc. Mathematics',
        keywords: ['math', 'mathematics', 'mam'],
        pdfUrl: 'https://www.dei.ac.in/dei/files/academics/Syllabus/Science/B.Sc-M.Sc-Mathematics-Syllabus.pdf'
      },
      {
        name: 'Physics',
        program: 'B.Sc. (Honours) / M.Sc. Physics',
        keywords: ['physics', 'phm'],
        pdfUrl: 'https://www.dei.ac.in/dei/files/academics/Syllabus/Science/B.Sc-M.Sc-Physics-Syllabus.pdf'
      },
      {
        name: 'Chemistry',
        program: 'B.Sc. (Honours) / M.Sc. Chemistry',
        keywords: ['chemistry', 'chm'],
        pdfUrl: 'https://www.dei.ac.in/dei/files/academics/Syllabus/Science/B.Sc-M.Sc-Chemistry-Syllabus.pdf'
      }
    ]
  },
  {
    faculty: 'Faculty of Engineering',
    departments: [
      {
        name: 'Mechanical Engineering',
        program: 'B.Tech. Mechanical Engineering (NEP)',
        keywords: ['mechanical', 'engineering', 'btech', 'b.tech'],
        pdfUrl: 'https://www.dei.ac.in/dei/files/academics/Syllabus/Engineering/B.Tech-MechanicalEngineering-Syllabus.pdf'
      },
      {
        name: 'Electrical Engineering',
        program: 'B.Tech. Electrical Engineering',
        keywords: ['electrical', 'electronics'],
        pdfUrl: 'https://www.dei.ac.in/dei/files/academics/Syllabus/Engineering/B.Tech-ElectricalEngineering-Syllabus.pdf'
      },
      {
        name: 'Civil Engineering',
        program: 'B.Tech. Civil Engineering',
        keywords: ['civil'],
        pdfUrl: 'https://www.dei.ac.in/dei/files/academics/Syllabus/Engineering/B.Tech-CivilEngineering-Syllabus.pdf'
      },
      {
        name: 'Footwear Technology',
        program: 'B.Tech. Footwear Technology (B.Voc)',
        keywords: ['footwear', 'leather'],
        pdfUrl: 'https://www.dei.ac.in/dei/files/academics/Syllabus/Engineering/B.Tech-FootwearTechnology-Syllabus.pdf'
      }
    ]
  },
  {
    faculty: 'Faculty of Commerce',
    departments: [
      {
        name: 'Commerce',
        program: 'B.Com. (Honours) / M.Com. / MBA',
        keywords: ['commerce', 'bcom', 'b.com', 'mcom', 'mba', 'management'],
        pdfUrl: 'https://www.dei.ac.in/dei/files/academics/Syllabus/Commerce/B.Com-M.Com-MBA-Syllabus.pdf'
      }
    ]
  },
  {
    faculty: 'Faculty of Social Sciences',
    departments: [
      {
        name: 'Business Administration',
        program: 'BBA (Honours) / MBA Business Administration',
        keywords: ['bba', 'business', 'administration'],
        pdfUrl: 'https://www.dei.ac.in/dei/files/academics/Syllabus/SocialSciences/BBA-MBA-Syllabus.pdf'
      },
      {
        name: 'Economics',
        program: 'B.A. (Honours) / M.A. Economics',
        keywords: ['economics', 'eco', 'social'],
        pdfUrl: 'https://www.dei.ac.in/dei/files/academics/Syllabus/SocialSciences/BA-MA-Economics-Syllabus.pdf'
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
        // If profile details match keywords
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

    // Default fallback to first science course if not found (or null)
    setSuggestedSyllabus(matched);
  }, [profile]);

  const handleFacultyChange = (facName) => {
    setSelectedFaculty(facName);
    setSelectedDept(null);
  };

  const currentFacultyData = SYLLABI_DATABASE.find(f => f.faculty === selectedFaculty);

  // Embedded calendar URL (Google PDF Viewer wrapper to bypass iframe policies)
  const calendarPdfUrl = 'https://www.dei.ac.in/dei/files/academics/Academic%20Calendar%202025-26.pdf';
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
          📅 Academic Calendar
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
              <h2 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>General Academic Calendar 2025–26</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '2px' }}>
                Key dates for Odd/Even semesters, evaluation schedules, breaks, and holidays.
              </p>
            </div>
            <a
              href={calendarPdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
              style={{ padding: '8px 16px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              📥 Download PDF
            </a>
          </div>

          {/* Embedded PDF Viewer Iframe */}
          <div className="glass-card" style={{ padding: '0', overflow: 'hidden', height: '600px', border: '1px solid var(--border-primary)', position: 'relative' }}>
            <iframe
              src={embeddedCalendarUrl}
              style={{ width: '100%', height: '100%', border: 'none' }}
              title="DEI Academic Calendar 2025-26"
            />
          </div>
        </div>
      )}

      {/* SUB-PANEL 2: COURSE SYLLABUS */}
      {subTab === 'syllabus' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Auto Suggested Syllabus Box */}
          {suggestedSyllabus && (
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
                  Matched for You
                </span>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginTop: '8px' }}>
                  {suggestedSyllabus.program}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '12.5px', marginTop: '4px' }}>
                  Department: <span style={{ color: 'var(--text-primary)' }}>{suggestedSyllabus.name}</span> ({suggestedSyllabus.facultyName})
                </p>
              </div>

              <a
                href={suggestedSyllabus.pdfUrl}
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
                📥 Download Syllabus PDF
              </a>
            </div>
          )}

          {/* Browse General Syllabus Directory */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>
              Browse Syllabus Directory
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '12.5px', marginBottom: '20px' }}>
              Explore and download curriculum structures across other faculties and departments of the institute.
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
                  <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                    {selectedDept.program}
                  </h4>
                  <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
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
