import { NextResponse } from 'next/server';
import { decodeSession, saveSession } from '@/lib/session';
import { getAdmitCard, proxyDownload } from '@/lib/cms-client';

export async function GET(request) {
  const session = await decodeSession();
  if (!session) {
    return new NextResponse('Not authenticated', { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const regNum = searchParams.get('regNum') || '';
  const dob = searchParams.get('dob') || '';

  if (!regNum) {
    return new NextResponse('Registration number is required', { status: 400 });
  }

  try {
    const result = await getAdmitCard(session, regNum, dob);

    if (result.success && result.url) {
      const downloadResponse = await proxyDownload(result.url);
      
      const response = new NextResponse(downloadResponse.data, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename=Admit_Card_${regNum}.pdf`
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

    const errorMsg = result.error || 'Failed to retrieve admit card link';
    return new NextResponse(errorMsg, { status: 400 });
  } catch (error) {
    console.error('Admit card proxy download failed:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
