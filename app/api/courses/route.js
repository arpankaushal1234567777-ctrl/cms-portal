import { NextResponse } from 'next/server';
import { decodeSession, saveSession } from '@/lib/session';
import { getCourses } from '@/lib/cms-client';

export async function GET(request) {
  const session = await decodeSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const semesterCode = searchParams.get('semester');
  if (!semesterCode) {
    return NextResponse.json({ success: false, error: 'semester parameter required' }, { status: 400 });
  }

  const semester = (session.semesters || []).find(s => s.semesterCode === semesterCode);
  if (!semester) {
    return NextResponse.json(
      { success: false, error: 'Semester not found in session. Refresh semesters.' },
      { status: 400 }
    );
  }

  const result = await getCourses(session, semester);

  if (session.modified) {
    await saveSession(
      session.targetCookies,
      session.rollNumber,
      session.studentName,
      session.semesters,
      session.courses
    );
  }

  return NextResponse.json({
    success: result.success,
    data: result.courses || []
  });
}
