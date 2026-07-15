'use client';

import { useState, useEffect } from 'react';
import ProfileCard from './ProfileCard';
import SemesterSelector from './SemesterSelector';
import MarksTable from './MarksTable';
import AdmitCard from './AdmitCard';
import FeeReceipt from './FeeReceipt';
import ChangePassword from './ChangePassword';

export default function Dashboard({ initialProfile }) {
  const [activeTab, setActiveTab] = useState('marks');
  
  // Profile & Semester data state
  const [profile] = useState(initialProfile);
  const [semesters, setSemesters] = useState([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [initialError, setInitialError] = useState('');

  // Dropdowns selection & Course listing state
  const [selectedSemester, setSelectedSemester] = useState('');
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  
  const [selectedCourse, setSelectedCourse] = useState('');
  const [marks, setMarks] = useState([]);
  const [loadingMarks, setLoadingMarks] = useState(false);

  // Client-Side caches
  const [coursesCache, setCoursesCache] = useState({});
  const [marksCache, setMarksCache] = useState({});

  // Registration Report downloading state
  const [downloadingReport, setDownloadingReport] = useState(false);

  // Initial mount: load semester lists
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const semestersRes = await fetch('/api/semesters');

        if (!semestersRes.ok) {
          throw new Error('Verification session expired');
        }

        const semestersData = await semestersRes.json();
        if (semestersData.success) setSemesters(semestersData.data);
      } catch (err) {
        setInitialError('Your portal session has expired. Redirecting...');
        setTimeout(() => {
          window.location.href = '/';
        }, 3000);
      } finally {
        setLoadingInitial(false);
      }
    };

    loadInitialData();
  }, []);

  // Fetch course list when semester selection changes (uses caching)
  const handleSemesterChange = async (semCode) => {
    setSelectedSemester(semCode);
    setSelectedCourse('');
    setMarks([]);
    setCourses([]);

    if (!semCode) return;

    // Check cache first
    if (coursesCache[semCode]) {
      setCourses(coursesCache[semCode]);
      return;
    }

    setLoadingCourses(true);
    try {
      const res = await fetch(`/api/courses?semester=${semCode}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setCourses(data.data);
        // Save to cache
        setCoursesCache(prev => ({ ...prev, [semCode]: data.data }));
      }
    } catch (e) {
      console.error('Failed to load courses:', e);
    } finally {
      setLoadingCourses(false);
    }
  };

  // Fetch marks when course selection changes (uses caching)
  const handleCourseChange = async (courseCode) => {
    setSelectedCourse(courseCode);
    setMarks([]);

    if (!courseCode) return;

    const cacheKey = `${selectedSemester}_${courseCode}`;

    // Check cache first
    if (marksCache[cacheKey]) {
      setMarks(marksCache[cacheKey]);
      return;
    }

    setLoadingMarks(true);
    try {
      const res = await fetch(`/api/marks?semester=${selectedSemester}&course=${courseCode}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setMarks(data.data);
        // Save to cache
        setMarksCache(prev => ({ ...prev, [cacheKey]: data.data }));
      }
    } catch (e) {
      console.error('Failed to load marks:', e);
    } finally {
      setLoadingMarks(false);
    }
  };

  // Download official Registration Report PDF
  const handleDownloadRegistrationReport = async () => {
    if (!selectedSemester) return;
    const sem = semesters.find(s => s.semesterCode === selectedSemester);
    if (!sem) return;

    setDownloadingReport(true);
    try {
      const semStartDate = sem.startDate || sem.semesterStartDate;
      const downloadUrl = `/api/registration-report?semStartDate=${encodeURIComponent(semStartDate)}`;
      
      // Trigger browser download by opening in a hidden iframe or simple tab
      window.open(downloadUrl, '_blank');
    } catch (err) {
      console.error('Failed to download registration report:', err);
    } finally {
      setDownloadingReport(false);
    }
  };

  if (initialError) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div className="toast toast-error animate-fade-in" style={{ position: 'static' }}>
          <span>{initialError}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      <div className="dashboard-grid">
        {/* Left Column: Side Navigation & Student Profile */}
        <aside className="dashboard-sidebar animate-fade-in-up stagger-1">
          <ProfileCard profile={profile} loading={false} />

          {/* Navigation Links */}
          <div className="sidebar-nav">
            <button
              className={`sidebar-link ${activeTab === 'marks' ? 'active' : ''}`}
              onClick={() => setActiveTab('marks')}
            >
              <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Marks Sheet
            </button>
            <button
              className={`sidebar-link ${activeTab === 'admit-card' ? 'active' : ''}`}
              onClick={() => setActiveTab('admit-card')}
            >
              <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
              Admit Card
            </button>
            <button
              className={`sidebar-link ${activeTab === 'fee-receipt' ? 'active' : ''}`}
              onClick={() => setActiveTab('fee-receipt')}
            >
              <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Fee Receipt
            </button>
            <button
              className={`sidebar-link ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </button>
          </div>

          {/* Registration PDF download button in Marks Sheet context */}
          {activeTab === 'marks' && selectedSemester && (
            <button
              onClick={handleDownloadRegistrationReport}
              disabled={downloadingReport}
              className="btn-secondary animate-fade-in"
              style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px', fontSize: '12.5px', height: '36px', padding: '0 12px', marginTop: '12px' }}
            >
              📄 {downloadingReport ? 'Downloading...' : 'Registration Card'}
            </button>
          )}
        </aside>

        {/* Right Column: Main Content Panels */}
        <main className="dashboard-main animate-fade-in-up stagger-2">
          {activeTab === 'marks' && (
            <div>
              <SemesterSelector
                semesters={semesters}
                courses={courses}
                selectedSemester={selectedSemester}
                selectedCourse={selectedCourse}
                onSemesterChange={handleSemesterChange}
                onCourseChange={handleCourseChange}
                loadingCourses={loadingCourses}
              />
              <MarksTable
                marksData={marks}
                loading={loadingMarks}
                studentName={profile?.name}
                rollNumber={profile?.rollNumber}
                courseCode={selectedCourse}
                courses={courses}
                selectedSemester={selectedSemester}
              />
            </div>
          )}

          {activeTab === 'admit-card' && (
            <AdmitCard defaultRollNumber={profile?.rollNumber} />
          )}

          {activeTab === 'fee-receipt' && (
            <FeeReceipt semesters={semesters} />
          )}

          {activeTab === 'settings' && (
            <ChangePassword />
          )}
        </main>
      </div>
    </div>
  );
}
