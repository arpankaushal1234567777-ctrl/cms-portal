import { NextResponse } from 'next/server';
import { decodeSession, saveSession } from '@/lib/session';

/**
 * Wraps an authenticated API handler:
 *  1. Decodes session from cookies
 *  2. Calls the handler with the session
 *  3. Propagates any modified cookies back to the client
 */
export async function withSession(request, handler) {
  const session = await decodeSession();
  if (!session) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized. Please login first.' },
      { status: 401 }
    );
  }

  try {
    const result = await handler(session, request);
    const response = NextResponse.json(result);

    if (session.modified) {
      await saveSession(
        session.targetCookies,
        session.rollNumber,
        session.studentName,
        session.semesters,
        session.courses
      );
    }

    return response;
  } catch (error) {
    console.error('[withSession] Handler error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
