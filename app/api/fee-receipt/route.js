import { NextResponse } from 'next/server';
import { decodeSession, saveSession } from '@/lib/session';
import { downloadFeeReceipt } from '@/lib/cms-client';

export async function GET(request) {
  const session = await decodeSession();
  if (!session) {
    return NextResponse.json(
      { success: false, message: 'Not authenticated' },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const dob = searchParams.get('dob') || '';
  const semesterCode = searchParams.get('semester') || '';

  if (!dob || !semesterCode) {
    return NextResponse.json(
      { success: false, message: 'Both dob and semesterCode parameters are required' },
      { status: 400 }
    );
  }

  const semester = session.semesters?.find(s => s.semesterCode === semesterCode);
  if (!semester) {
    return NextResponse.json(
      { success: false, message: 'Semester session expired. Refresh semesters list.' },
      { status: 400 }
    );
  }

  try {
    const result = await downloadFeeReceipt(session, dob, semester);

    if (session.modified) {
      await saveSession(
        session.targetCookies,
        session.rollNumber,
        session.studentName,
        session.semesters,
        session.courses
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Fee receipt retrieval failure:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
