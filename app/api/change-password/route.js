import { NextResponse } from 'next/server';
import { decodeSession, saveSession } from '@/lib/session';
import { changePassword } from '@/lib/cms-client';

export async function POST(request) {
  const session = await decodeSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { oldPassword, newPassword } = await request.json();
    if (!oldPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Both old and new passwords are required.' },
        { status: 400 }
      );
    }

    const result = await changePassword(session, oldPassword, newPassword);

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
    console.error('[api/change-password] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error during password update' },
      { status: 500 }
    );
  }
}
