import { NextResponse } from 'next/server';
import { decodeSession, saveSession } from '@/lib/session';
import { getMarks } from '@/lib/cms-client';

export async function GET(request) {
  const session = await decodeSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const semesterCode = searchParams.get('semester');
  const courseCode = searchParams.get('course');

  if (!semesterCode || !courseCode) {
    return NextResponse.json({ success: false, error: 'Both semester and course parameters are required' }, { status: 400 });
  }

  const semester = (session.semesters || []).find(s => s.semesterCode === semesterCode);
  if (!semester) {
    return NextResponse.json(
      { success: false, error: 'Semester not found in session. Refresh semesters.' },
      { status: 400 }
    );
  }

  try {
    const result = await getMarks(session, semester, courseCode);
    console.log('[api/marks] raw classMarks count:', result.classMarks?.length);
    console.log('[api/marks] raw classMarks list:', JSON.stringify(result.classMarks));

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
      data: result
    });
  } catch (error) {
    console.error('[api/marks] Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to retrieve student marks' }, { status: 500 });
  }
}
