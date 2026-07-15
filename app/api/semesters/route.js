import { NextResponse } from 'next/server';
import { decodeSession, saveSession } from '@/lib/session';
import { getSemesters } from '@/lib/cms-client';

export async function GET(request) {
  const session = await decodeSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const result = await getSemesters(session);

  if (result.success && result.semesters) {
    session.semesters = result.semesters;
    session.modified = true;
  }

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
    data: result.semesters || []
  });
}
