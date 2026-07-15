// Secure Stateless Session Manager using Next.js 15 cookies() API.
// Encrypts target university session cookies inside the browser cookie using AES-256-GCM.
import crypto from 'crypto';
import { cookies } from 'next/headers';

const SECRET_KEY = process.env.SESSION_SECRET 
  ? crypto.createHash('sha256').update(process.env.SESSION_SECRET).digest()
  : crypto.createHash('sha256').update('dei_cms_portal_default_secret_key_32_bytes_long').digest();

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;

function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag().toString('hex');
  
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

function decrypt(encryptedText) {
  try {
    const parts = encryptedText.split(':');
    if (parts.length !== 3) return null;
    
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const ciphertext = parts[2];
    
    const decipher = crypto.createDecipheriv(ALGORITHM, SECRET_KEY, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (err) {
    console.error('[session] Decryption failed:', err.message);
    return null;
  }
}

/**
 * Reads, decodes and decrypts the session cookie.
 */
export async function decodeSession() {
  try {
    const cookieStore = await cookies();
    const cookie = cookieStore.get('cms_session_data');
    if (!cookie || !cookie.value) return null;
    
    const encrypted = Buffer.from(cookie.value, 'base64').toString('utf8');
    const decrypted = decrypt(encrypted);
    if (!decrypted) return null;
    
    const sessionData = JSON.parse(decrypted);
    sessionData.modified = false;
    return sessionData;
  } catch (e) {
    console.error('[session] Failed to decode session:', e.message);
    return null;
  }
}

/**
 * Encrypts and writes session data to the HTTP cookie.
 */
export async function saveSession(targetCookies, rollNumber, studentName, semesters = [], courses = {}) {
  try {
    const sessionData = {
      targetCookies: targetCookies || [],
      rollNumber: rollNumber || '',
      studentName: studentName || '',
      semesters: semesters || [],
      courses: courses || {}
    };
    
    const serialized = JSON.stringify(sessionData);
    const encrypted = encrypt(serialized);
    const encoded = Buffer.from(encrypted).toString('base64');
    
    const cookieStore = await cookies();
    cookieStore.set({
      name: 'cms_session_data',
      value: encoded,
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 1800,
      secure: process.env.NODE_ENV === 'production'
    });
  } catch (e) {
    console.error('[session] Failed to save session:', e.message);
  }
}

/**
 * Destroys the session cookie.
 */
export async function destroySession() {
  try {
    const cookieStore = await cookies();
    cookieStore.set({
      name: 'cms_session_data',
      value: '',
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 0,
      expires: new Date(0)
    });
  } catch (e) {
    console.error('[session] Failed to destroy session:', e.message);
  }
}
