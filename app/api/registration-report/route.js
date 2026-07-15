import { NextResponse } from 'next/server';
import { decodeSession, saveSession } from '@/lib/session';
import { getRegistrationReport, proxyDownload } from '@/lib/cms-client';

export async function GET(request) {
  const session = await decodeSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const semStartDate = searchParams.get('semStartDate');

  if (!semStartDate) {
    return NextResponse.json(
      { success: false, error: 'semStartDate query parameter is required.' },
      { status: 400 }
    );
  }

  try {
    const result = await getRegistrationReport(session, session.rollNumber, semStartDate);
    
    if (result.success && result.url) {
      const downloadResponse = await proxyDownload(result.url);
      
      const response = new NextResponse(downloadResponse.data, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename=Registration_Report_${session.rollNumber}.pdf`,
        }
      });

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
    }

    return NextResponse.json(
      { success: false, error: result.error || 'Failed to fetch registration report link.' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[api/registration-report] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error during report retrieval' },
      { status: 500 }
    );
  }
}
