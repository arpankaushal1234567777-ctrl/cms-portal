'use client';

export default function SemesterSelector({
  semesters = [],
  courses = [],
  selectedSemester = '',
  selectedCourse = '',
  onSemesterChange,
  onCourseChange,
  loadingCourses = false
}) {
  return (
    <div className="glass-card animate-fade-in-up stagger-2" style={{ marginBottom: '24px', padding: '24px' }}>
      <div style={{ display: 'flex', flexDirection: 'row', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '11px', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Choose Semester
          </label>
          <select
            className="select-field"
            value={selectedSemester}
            onChange={(e) => onSemesterChange(e.target.value)}
          >
            <option value="">Select Semester</option>
            {semesters.map((sem) => (
              <option key={sem.semesterCode} value={sem.semesterCode}>
                Semester {sem.semesterName}
              </option>
            ))}
          </select>
        </div>

        <div style={{ flex: 1, minWidth: '200px' }}>
          <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '11px', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Choose Course Code
          </label>
          <select
            className="select-field"
            value={selectedCourse}
            onChange={(e) => onCourseChange(e.target.value)}
            disabled={!selectedSemester || loadingCourses}
          >
            <option value="">
              {loadingCourses ? 'Loading course list...' : 'Select Course'}
            </option>
            {courses.map((course) => (
              <option key={course.courseCode} value={course.courseCode}>
                {course.courseName && course.courseName !== course.courseCode
                  ? `${course.courseCode} - ${course.courseName}`
                  : course.courseCode}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
