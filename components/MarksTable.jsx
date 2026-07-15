'use client';

import { useState } from 'react';

export default function MarksTable({
  marksData,
  loading,
  rollNumber,
  courses = [],
  selectedSemester = '',
  studentName = '',
  courseCode = '',
  downloadingAll = false,
  downloadProgress = '',
  onDownloadAll
}) {
  const [downloading, setDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    if (!marksData) return;
    setDownloading(true);
    try {
      const { jsPDF } = await import('jspdf');
      await import('jspdf-autotable');

      const doc = new jsPDF();

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(9, 9, 11);
      doc.text('Dayalbagh Educational Institute', 14, 20);

      doc.setFontSize(12);
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(113, 113, 122);
      doc.text('Continuous Internal Evaluation Report', 14, 26);

      doc.setDrawColor(228, 228, 231);
      doc.setFillColor(250, 250, 250);
      doc.rect(14, 32, 182, 28, 'FD');

      doc.setFontSize(9);
      doc.setTextColor(113, 113, 122);
      doc.setFont('Helvetica', 'bold');
      doc.text('Roll Number:', 20, 39);
      doc.text('Course Grade:', 20, 45);
      doc.text('Class Average / Highest:', 20, 51);

      doc.setFont('Helvetica', 'normal');
      doc.text(rollNumber || 'N/A', 60, 39);
      doc.text(studentGrade, 60, 45);
      doc.text(`${classAverage} / ${classHighest}`, 60, 51);

      const head = ['Evaluation Component', 'Max Marks', 'Your Score'];
      const body = rawComponents.map(c => [
        c.name,
        c.maxMarks.toString(),
        (myRow.marks?.[c.id] || '-').toString()
      ]);

      body.push([
        'Cumulative Course Total',
        targetMax.toString(),
        studentTotal.toString()
      ]);

      doc.autoTable({
        startY: 68,
        head: [head],
        body: body,
        theme: 'striped',
        headStyles: { fillColor: [24, 24, 27], textColor: [250, 250, 250], fontStyle: 'bold' },
        didParseCell: function (data) {
          if (data.row.index === body.length - 1) {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.fillColor = [244, 244, 245];
          }
        }
      });

      doc.save(`Marks_Sheet_${rollNumber}.pdf`);
    } catch (e) {
      console.error('PDF construction failure:', e);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="glass-card animate-fade-in" style={{ marginTop: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="skeleton" style={{ height: '32px', width: '100%' }} />
          {[1, 2, 3].map(n => (
            <div key={n} className="skeleton" style={{ height: '44px', width: '100%' }} />
          ))}
        </div>
      </div>
    );
  }

  if (!marksData || !marksData.success) {
    return (
      <div className="glass-card animate-fade-in-up stagger-3" style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-secondary)', marginTop: '24px' }}>
        <svg style={{ width: '40px', height: '40px', color: 'var(--text-muted)', marginBottom: '12px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
        <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '6px' }}>
          Select Semester & Course
        </h3>
        <p style={{ fontSize: '13px', maxWidth: '300px', margin: '0 auto 20px auto', lineHeight: '1.5' }}>
          Choose a semester and a course code from the selectors above to retrieve your evaluation results.
        </p>
        
        {courses.length > 0 && selectedSemester && (
          <button
            onClick={onDownloadAll}
            disabled={downloadingAll}
            className="btn-secondary"
            style={{ fontSize: '13px', padding: '8px 16px', display: 'inline-flex', alignItems: 'center', gap: '8px', borderColor: 'var(--accent-cyan)', color: 'var(--accent-cyan)', background: 'rgba(34, 211, 238, 0.05)' }}
          >
            {downloadingAll ? (
              <>
                <span className="spinner-border" style={{ width: '12px', height: '12px', border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', marginRight: '4px', animation: 'spin 1s linear infinite' }} />
                {downloadProgress}
              </>
            ) : (
              <>📂 Download Complete Semester PDF</>
            )}
          </button>
        )}
      </div>
    );
  }

  const actualData = marksData?.data ? marksData.data : marksData;
  const rawComponents = actualData?.components || [];
  const rawClassMarks = actualData?.classMarks || [];

  // Identify special course evaluation pattern (includes CT1, CT2, DHA and a form of CA/ATT/AA)
  const ct1Comp = rawComponents.find(c => c.name.toUpperCase().includes('CT1'));
  const ct2Comp = rawComponents.find(c => c.name.toUpperCase().includes('CT2'));
  const dhaComp = rawComponents.find(c => c.name.toUpperCase().includes('DHA'));
  const hasCA = rawComponents.some(c => 
    c.name.toUpperCase().includes('CA') || 
    c.name.toUpperCase().includes('ATT') || 
    c.name.toUpperCase().includes('AA')
  );

  const isSpecialCourse = ct1Comp && ct2Comp && dhaComp && hasCA;
  const targetMax = isSpecialCourse ? 150 : 200;

  // Retrieve student total score and grade directly from university API payload
  const studentTotal = parseFloat(actualData.total || 0);
  const studentGrade = actualData.grade || 'N/A';

  // Use the pre-calculated class statistics returned directly by the university API
  const classHighest = parseFloat(actualData.classStats?.highest || 0);
  const classAverage = parseFloat(actualData.classStats?.average || 0);

  // Fallback to finding row in classMarks (for PDF export details if needed)
  const myRow = rawClassMarks.find(row => row.rollNumber === rollNumber) || {
    rollNumber,
    marks: actualData.marks?.reduce((acc, curr) => ({ ...acc, [curr.componentId]: curr.obtainedMarks }), {}),
    total: studentTotal,
    grade: studentGrade
  };

  const yourPercentage = targetMax > 0 ? (studentTotal / targetMax) * 100 : 0;
  const averagePercentage = targetMax > 0 ? (classAverage / targetMax) * 100 : 0;

  return (
    <div style={{ marginTop: '24px' }} className="animate-fade-in">
      {/* Class Statistics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '16px' }}>
        <div className="glass-card animate-fade-in-up stagger-1" style={{ padding: '16px' }}>
          <span style={{ fontSize: '10.5px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Class Highest</span>
          <div style={{ fontSize: '20px', fontWeight: '600', marginTop: '4px', fontFamily: 'monospace', color: 'var(--text-primary)' }}>
            {classHighest} <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 'normal' }}>/ {targetMax}</span>
          </div>
        </div>
        <div className="glass-card animate-fade-in-up stagger-2" style={{ padding: '16px' }}>
          <span style={{ fontSize: '10.5px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Class Average</span>
          <div style={{ fontSize: '20px', fontWeight: '600', marginTop: '4px', fontFamily: 'monospace', color: 'var(--text-primary)' }}>
            {classAverage} <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 'normal' }}>/ {targetMax}</span>
          </div>
        </div>
        <div className="glass-card animate-fade-in-up stagger-3" style={{ padding: '16px' }}>
          <span style={{ fontSize: '10.5px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Your Grade</span>
          <div style={{ fontSize: '20px', fontWeight: '600', marginTop: '4px', color: 'var(--text-primary)' }}>{studentGrade}</div>
        </div>
        <div className="glass-card animate-fade-in-up stagger-4" style={{ padding: '16px' }}>
          <span style={{ fontSize: '10.5px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Your Score</span>
          <div style={{ fontSize: '20px', fontWeight: '600', marginTop: '4px', fontFamily: 'monospace', color: 'var(--text-primary)' }}>
            {studentTotal} <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 'normal' }}>/ {targetMax}</span>
          </div>
        </div>
      </div>

      {/* Visual Grade Distribution Bar */}
      {targetMax > 0 && (
        <div className="glass-card animate-fade-in-up stagger-5" style={{ padding: '16px 20px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', marginBottom: '8px' }}>
            <span>Grade Distribution Gauge</span>
            <span style={{ color: 'var(--text-primary)' }}>Highest: {classHighest}</span>
          </div>
          
          <div style={{ position: 'relative', height: '8px', background: 'var(--border-primary)', borderRadius: '4px', overflow: 'visible' }}>
            {/* Your Score Progress */}
            <div 
              style={{ 
                position: 'absolute', 
                left: 0, 
                top: 0, 
                height: '100%', 
                width: `${Math.min(yourPercentage, 100)}%`, 
                background: 'var(--text-primary)', 
                borderRadius: '4px',
                transition: 'width 0.6s var(--ease-spring)'
              }} 
            />
            {/* Average Indicator Pin */}
            <div 
              style={{ 
                position: 'absolute', 
                left: `${Math.min(averagePercentage, 100)}%`, 
                top: '-4px', 
                height: '16px', 
                width: '2px', 
                background: 'var(--text-secondary)',
                zIndex: 2 
              }} 
            >
              <span style={{ position: 'absolute', top: '18px', left: '50%', transform: 'translateX(-50%)', fontSize: '9px', whiteSpace: 'nowrap', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                AVG: {classAverage}
              </span>
            </div>
          </div>
          <div style={{ height: '14px' }} />
        </div>
      )}

      {/* Marks List Table */}
      <div className="glass-card animate-fade-in-up stagger-5" style={{ padding: '20px 0 0 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px 16px 20px', borderBottom: '1px solid var(--border-primary)', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>Evaluation Components</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '2px' }}>
              Grades evaluated for Roll Number <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{rollNumber}</span>
            </p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {courses.length > 0 && selectedSemester && (
              <button
                onClick={onDownloadAll}
                disabled={downloading || downloadingAll}
                className="btn-secondary"
                style={{ padding: '8px 12px', fontSize: '12px', borderColor: 'var(--accent-cyan)', color: 'var(--accent-cyan)', background: 'rgba(34, 211, 238, 0.05)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                {downloadingAll ? (
                  <>
                    <span className="spinner-border" style={{ width: '10px', height: '10px', border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 1s linear infinite' }} />
                    {downloadProgress.includes('Fetching') ? 'Fetching...' : 'Generating...'}
                  </>
                ) : (
                  <>📂 Semester PDF</>
                )}
              </button>
            )}
            
            <button
              onClick={handleDownloadPDF}
              disabled={downloading || downloadingAll}
              className="btn-secondary"
              style={{ padding: '8px 12px', fontSize: '12px' }}
            >
              {downloading ? 'Downloading...' : 'Download PDF'}
            </button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="marks-table">
            <thead>
              <tr>
                <th style={{ paddingLeft: '20px' }}>Component Name</th>
                <th>Max Marks</th>
                <th style={{ paddingRight: '20px' }}>Your Score</th>
              </tr>
            </thead>
            <tbody>
              {rawComponents.map((c, idx) => (
                <tr key={idx}>
                  <td style={{ paddingLeft: '20px', fontWeight: '500' }}>{c.name}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{c.maxMarks}</td>
                  <td style={{ paddingRight: '20px', fontWeight: '600', color: 'var(--text-primary)' }}>
                    {myRow.marks?.[c.id] !== undefined ? myRow.marks[c.id] : '-'}
                  </td>
                </tr>
              ))}
              <tr className="total-row">
                <td style={{ paddingLeft: '20px' }}>
                  Total Sum
                  {isSpecialCourse && (
                    <span style={{ fontSize: '10px', display: 'block', color: 'var(--text-secondary)', fontWeight: 'normal', marginTop: '2px' }}>
                      * Higher mark of CT1 and CT2 is selected.
                    </span>
                  )}
                </td>
                <td>{targetMax}</td>
                <td style={{ paddingRight: '20px', color: 'var(--text-primary)' }}>{studentTotal}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
