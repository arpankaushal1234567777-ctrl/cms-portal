'use client';

import { useState, useEffect, useRef } from 'react';
import ProfileCard from './ProfileCard';
import SemesterSelector from './SemesterSelector';
import MarksTable from './MarksTable';
import AdmitCard from './AdmitCard';
import FeeReceipt from './FeeReceipt';
import ChangePassword from './ChangePassword';
import ResultBoard from './ResultBoard';

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

  // Background Semester Report downloading states
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState('');
  const cancelDownloadRef = useRef(false);

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

  // Download complete unified semester PDF in the background
  const handleDownloadAllPDF = async () => {
    if (!courses || courses.length === 0) return;
    setDownloadingAll(true);
    try {
      const { jsPDF } = await import('jspdf');
      await import('jspdf-autotable');

      const doc = new jsPDF();
      const allCoursesData = [];

      for (let i = 0; i < courses.length; i++) {
        // Check for cancellation before fetching
        if (cancelDownloadRef.current) {
          setDownloadingAll(false);
          setDownloadProgress('');
          return;
        }

        const c = courses[i];
        setDownloadProgress(`Fetching ${c.courseCode}... (${i + 1}/${courses.length})`);
        
        try {
          const res = await fetch(`/api/marks?semester=${selectedSemester}&course=${c.courseCode}`);
          
          // Check for cancellation after fetch returns
          if (cancelDownloadRef.current) {
            setDownloadingAll(false);
            setDownloadProgress('');
            return;
          }

          const resData = await res.json();
          if (resData.success) {
            const actual = resData.data ? resData.data : resData;
            
            // Check if special evaluation course
            const rawComps = actual.components || [];
            const hasCt1 = rawComps.find(x => x.name.toUpperCase().includes('CT1'));
            const hasCt2 = rawComps.find(x => x.name.toUpperCase().includes('CT2'));
            const hasDha = rawComps.find(x => x.name.toUpperCase().includes('DHA'));
            const hasCaComp = rawComps.some(x => 
              x.name.toUpperCase().includes('CA') || 
              x.name.toUpperCase().includes('ATT') || 
              x.name.toUpperCase().includes('AA')
            );
            const isSpecial = hasCt1 && hasCt2 && hasDha && hasCaComp;
            const targetMax = isSpecial ? 150 : 200;
            
            allCoursesData.push({
              courseCode: c.courseCode,
              courseName: c.courseName || c.courseCode,
              components: rawComps,
              obtainedMarks: actual.marks || [],
              studentTotal: parseFloat(actual.total || 0),
              studentGrade: actual.grade || 'N/A',
              classHighest: parseFloat(actual.classStats?.highest || 0),
              classAverage: parseFloat(actual.classStats?.average || 0),
              targetMax,
              isSpecial
            });
          }
        } catch (e) {
          console.error(`Failed to fetch details for ${c.courseCode}:`, e);
        }
      }

      setDownloadProgress('Generating PDF document...');

      // 2. Build Summary Cover Page
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(24, 24, 27);
      doc.text('Dayalbagh Educational Institute', 14, 20);

      doc.setFontSize(12);
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(113, 113, 122);
      doc.text('Continuous Internal Evaluation Summary Report', 14, 26);

      doc.setDrawColor(228, 228, 231);
      doc.setFillColor(250, 250, 250);
      doc.rect(14, 32, 182, 32, 'FD');

      doc.setFontSize(9);
      doc.setTextColor(113, 113, 122);
      doc.setFont('Helvetica', 'bold');
      doc.text('Roll Number:', 20, 39);
      doc.text('Student Name:', 20, 45);
      doc.text('Semester Name:', 20, 51);
      doc.text('Generated Date:', 20, 57);

      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(24, 24, 27);
      doc.text(profile?.rollNumber || 'N/A', 60, 39);
      doc.text(profile?.name || 'N/A', 60, 45);
      doc.text(selectedSemester ? `Semester ${selectedSemester.replace('SM', '')}` : 'N/A', 60, 51);
      doc.text(new Date().toLocaleDateString(), 60, 57);

      doc.setFontSize(11);
      doc.setFont('Helvetica', 'bold');
      doc.text('Course Evaluation Summary', 14, 73);

      const summaryHead = ['Course Code', 'Course Title', 'Marks Obtained', 'Max Marks', 'Grade'];
      const summaryBody = allCoursesData.map(c => [
        c.courseCode,
        c.courseName,
        c.studentTotal.toString(),
        c.targetMax.toString(),
        c.studentGrade
      ]);

      doc.autoTable({
        startY: 77,
        head: [summaryHead],
        body: summaryBody,
        theme: 'striped',
        headStyles: { fillColor: [24, 24, 27], textColor: [250, 250, 250], fontStyle: 'bold' }
      });

      // 3. Add Detailed Pages for each Course
      allCoursesData.forEach(c => {
        doc.addPage();

        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(24, 24, 27);
        doc.text(`Course Detailed Breakdown: ${c.courseCode}`, 14, 20);

        doc.setFontSize(10);
        doc.setFont('Helvetica', 'normal');
        doc.setTextColor(113, 113, 122);
        doc.text(c.courseName, 14, 26);

        doc.setDrawColor(228, 228, 231);
        doc.setFillColor(250, 250, 250);
        doc.rect(14, 32, 182, 24, 'FD');

        doc.setFontSize(8.5);
        doc.setFont('Helvetica', 'bold');
        doc.text('Your Total Score:', 20, 38);
        doc.text('Your Grade:', 20, 44);
        doc.text('Class Average / Highest:', 20, 50);

        doc.setFont('Helvetica', 'normal');
        doc.setTextColor(24, 24, 27);
        doc.text(`${c.studentTotal} / ${c.targetMax}`, 65, 38);
        doc.text(c.studentGrade, 65, 44);
        doc.text(`${c.classAverage} / ${c.classHighest}`, 65, 50);

        const detailHead = ['Evaluation Component', 'Max Marks', 'Obtained Score'];
        const detailBody = c.components.map(comp => {
          const matchingObtained = c.obtainedMarks.find(m => m.componentId === comp.id);
          return [
            comp.name,
            comp.maxMarks.toString(),
            matchingObtained ? matchingObtained.obtainedMarks.toString() : '-'
          ];
        });

        detailBody.push([
          c.isSpecial ? 'Cumulative Course Total (*Higher of CT1/CT2 selected)' : 'Cumulative Course Total',
          c.targetMax.toString(),
          c.studentTotal.toString()
        ]);

        doc.autoTable({
          startY: 62,
          head: [detailHead],
          body: detailBody,
          theme: 'striped',
          headStyles: { fillColor: [63, 63, 70], textColor: [250, 250, 250], fontStyle: 'bold' },
          didParseCell: function (data) {
            if (data.row.index === detailBody.length - 1) {
              data.cell.styles.fontStyle = 'bold';
              data.cell.styles.fillColor = [244, 244, 245];
            }
          }
        });
      });

      doc.save(`Semester_Report_${profile?.rollNumber || 'C CIE'}.pdf`);
    } catch (e) {
      console.error('Failed to generate semester PDF report:', e);
    } finally {
      setDownloadingAll(false);
      setDownloadProgress('');
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
              className={`sidebar-link ${activeTab === 'results' ? 'active' : ''}`}
              onClick={() => setActiveTab('results')}
            >
              <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
              </svg>
              Official Results
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

          {/* Background Semester PDF download progress card */}
          {downloadingAll && (
            <div className="glass-card animate-fade-in" style={{ padding: '12px', marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px', border: '1px solid var(--border-primary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px', color: 'var(--text-primary)', fontWeight: '500' }}>
                  <span className="spinner-border" style={{ color: 'var(--text-primary)' }} />
                  <span>Downloading Report</span>
                </div>
                <button
                  onClick={() => {
                    cancelDownloadRef.current = true;
                    setDownloadingAll(false);
                    setDownloadProgress('');
                  }}
                  style={{ background: 'transparent', border: 'none', color: 'var(--status-alert)', fontSize: '10.5px', cursor: 'pointer', padding: '2px 4px', fontWeight: '500' }}
                >
                  Cancel
                </button>
              </div>
              <span style={{ fontSize: '9.5px', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{downloadProgress}</span>
            </div>
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
                downloadingAll={downloadingAll}
                downloadProgress={downloadProgress}
                onDownloadAll={handleDownloadAllPDF}
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

          {activeTab === 'results' && (
            <ResultBoard />
          )}
        </main>
      </div>
    </div>
  );
}
