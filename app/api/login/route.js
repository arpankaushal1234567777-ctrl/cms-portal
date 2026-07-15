import { NextResponse } from 'next/server';
import { saveSession } from '@/lib/session';
import { login } from '@/lib/cms-client';

// Simple in-memory global rate limiter to prevent brute force attacks
globalThis.__loginAttempts = globalThis.__loginAttempts || new Map();

export async function POST(request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
             request.headers.get('x-real-ip') || 
             '127.0.0.1';

  const now = Date.now();
  const limitRecord = globalThis.__loginAttempts.get(ip);

  if (limitRecord && limitRecord.lockoutUntil && now < limitRecord.lockoutUntil) {
    const minutesLeft = Math.ceil((limitRecord.lockoutUntil - now) / 60000);
    return NextResponse.json(
      { success: false, error: `Too many login attempts. Locked out for ${minutesLeft} minute(s).` },
      { status: 429 }
    );
  }

  try {
    const { username, password } = await request.json();
    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Roll number and password are required' },
        { status: 400 }
      );
    }

    const session = { targetCookies: [], modified: false };
    const result = await login(session, username, password);

    if (result.success) {
      globalThis.__loginAttempts.delete(ip);

      // Save encrypted session cookie using async next/headers API
      await saveSession(session.targetCookies, username, result.userName);

      return NextResponse.json({
        success: true,
        userName: result.userName,
        rollNumber: username,
      });
    }

    let attempts = 1;
    let lockoutUntil = null;

    if (limitRecord) {
      if (now - limitRecord.lastFailureTime > 1800000) {
        attempts = 1;
      } else {
        attempts = limitRecord.attempts + 1;
      }
    }

    if (attempts >= 5) {
      lockoutUntil = now + 15 * 60 * 1000;
    }

    globalThis.__loginAttempts.set(ip, {
      attempts,
      lockoutUntil,
      lastFailureTime: now
    });

    return NextResponse.json(
      { success: false, error: result.message || 'Invalid credentials' },
      { status: 401 }
    );
  } catch (error) {
    console.error('[api/login] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error during authentication' },
      { status: 500 }
    );
  }
}
