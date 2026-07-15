import { NextResponse } from 'next/server';
import { decodeSession, saveSession } from '@/lib/session';
import { getStudentProfile } from '@/lib/cms-client';

export async function GET(request) {
  const session = await decodeSession();
  if (!session) {
    console.log('[api/profile] No session found in cookie.');
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await getStudentProfile(session);

    if (result.success && result.data?.data?.student) {
      const student = result.data.data.student;
      const formatted = {
        success: true,
        data: {
          name: student.studentname || 'Student',
          rollNumber: student.roll_number || session.rollNumber,
          program: student.program_name || 'N/A',
          branch: student.entity_name || 'N/A',
          status: 'Active'
        }
      };

      if (session.modified) {
        await saveSession(
          session.targetCookies,
          session.rollNumber,
          session.studentName,
          session.semesters,
          session.courses
        );
      }
      
      return NextResponse.json(formatted);
    }

    console.log('[api/profile] Profile checks failed. success:', result.success, 'student:', !!result.data?.data?.student);
    return NextResponse.json({ success: false, error: 'Failed to retrieve profile' }, { status: 400 });
  } catch (err) {
    console.error('[api/profile] Exception:', err.message);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
