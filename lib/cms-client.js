import axios from 'axios';

const TARGET_HOST = 'https://cmsmarks.vercel.app';

/**
 * Make a proxy request to cmsmarks.vercel.app, forwarding the session cookies.
 * This ensures the user's IP is never leaked — all requests go through our server.
 */
async function makeProxyRequest(session, config) {
  const url = `${TARGET_HOST}${config.url}`;

  const headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Referer': 'https://cmsmarks.vercel.app/',
    'Origin': 'https://cmsmarks.vercel.app',
    ...(config.headers || {})
  };

  // Forward target cookies from our session store
  if (session?.targetCookies?.length > 0) {
    headers['Cookie'] = session.targetCookies.join('; ');
  }

  // Never forward the client's own IP
  delete headers['x-forwarded-for'];
  delete headers['x-real-ip'];

  try {
    const response = await axios({
      method: config.method || 'GET',
      url,
      headers,
      data: config.data,
      timeout: 15000, // standard timeout
      maxRedirects: 5,
      validateStatus: () => true,
    });

    // Capture Set-Cookie headers from the target
    const setCookies = response.headers['set-cookie'];
    if (setCookies && Array.isArray(setCookies)) {
      if (!session.targetCookies) session.targetCookies = [];
      setCookies.forEach(raw => {
        const kvp = raw.split(';')[0].trim();
        const name = kvp.split('=')[0];
        session.targetCookies = session.targetCookies.filter(c => !c.startsWith(name + '='));
        session.targetCookies.push(kvp);
      });
      session.modified = true;
    }

    return response;
  } catch (error) {
    console.error(`[cms-client] Request to ${config.url} failed:`, error.message);
    throw error;
  }
}

/**
 * Clean error masking for student-friendly UI display.
 * Avoids exposing raw network or host parameters.
 */
function maskError(error) {
  if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
    return { success: false, error: 'University CMS servers timed out. Please try again.' };
  }
  if (error.code === 'ENOTFOUND' || error.message.includes('network')) {
    return { success: false, error: 'University CMS portal is temporarily offline.' };
  }
  return { success: false, error: 'An unexpected connection error occurred. Try again.' };
}

/* ─── Login ─────────────────────────────────────────────────── */
export async function login(session, username, password) {
  try {
    const batchInput = JSON.stringify({ 0: { username, password } });
    const response = await makeProxyRequest(session, {
      method: 'GET',
      url: `/api/deicms.login?batch=1&input=${encodeURIComponent(batchInput)}`,
    });

    const data = response.data;
    if (response.status === 200 && data?.success) {
      session.rollNumber = username;
      session.studentName = data.userName || username;
      return { success: true, userName: data.userName || username };
    }

    return { success: false, message: data?.error || 'Invalid credentials' };
  } catch (e) {
    return maskError(e);
  }
}

/* ─── Student Profile ───────────────────────────────────────── */
export async function getStudentProfile(session) {
  try {
    const response = await makeProxyRequest(session, {
      url: '/api/deicms.getStudentProfile',
    });
    if (response.status === 401) return { success: false, error: 'Session expired' };
    return response.data;
  } catch (e) {
    return maskError(e);
  }
}

/* ─── Semesters ─────────────────────────────────────────────── */
export async function getSemesters(session) {
  try {
    const response = await makeProxyRequest(session, {
      url: '/api/deicms.getRegisteredSemesterCourseList',
    });
    if (response.status === 401) return { success: false, error: 'Session expired' };
    return response.data;
  } catch (e) {
    return maskError(e);
  }
}

/* ─── Courses ───────────────────────────────────────────────── */
export async function getCourses(session, semester) {
  try {
    const batchInput = JSON.stringify({
      0: {
        rollNumber: session.rollNumber,
        semesterCode: semester.semesterCode,
        semesterStartDate: semester.startDate || semester.semesterStartDate,
        semesterEndDate: semester.endDate || semester.semesterEndDate,
        programId: semester.programId,
        branchId: semester.branchId,
        specializationId: semester.specializationId,
        programCourseKey: semester.programCourseKey,
        entityId: semester.entityId,
        universityId: semester.universityId || '0001',
      }
    });

    const response = await makeProxyRequest(session, {
      url: `/api/deicms.getRegisteredCourseList?batch=1&input=${encodeURIComponent(batchInput)}`,
    });
    if (response.status === 401) return { success: false, error: 'Session expired' };
    return response.data;
  } catch (e) {
    return maskError(e);
  }
}

/* ─── Student Marks ─────────────────────────────────────────── */
export async function getMarks(session, semester, courseCode) {
  try {
    const batchInput = JSON.stringify({
      0: {
        rollNumber: session.rollNumber,
        semesterStartDate: semester.startDate || semester.semesterStartDate,
        semesterEndDate: semester.endDate || semester.semesterEndDate,
        semesterCode: semester.semesterCode,
        programId: semester.programId,
        branchId: semester.branchId,
        specializationId: semester.specializationId,
        programCourseKey: semester.programCourseKey,
        entityId: semester.entityId,
        universityId: semester.universityId,
        courseCode: courseCode,
      }
    });

    const response = await makeProxyRequest(session, {
      url: `/api/deicms.getStudentMarks?batch=1&input=${encodeURIComponent(batchInput)}`,
    });
    if (response.status === 401) return { success: false, error: 'Session expired' };
    return response.data;
  } catch (e) {
    return maskError(e);
  }
}

/* ─── Change Password ───────────────────────────────────────── */
export async function changePassword(session, oldPassword, newPassword) {
  try {
    const batchInput = JSON.stringify({
      0: {
        rollNumber: session.rollNumber,
        oldPassword,
        newPassword
      }
    });

    const response = await makeProxyRequest(session, {
      url: `/api/deicms.changePassword?batch=1&input=${encodeURIComponent(batchInput)}`,
    });
    if (response.status === 401) return { success: false, error: 'Session expired' };
    return response.data; // { success, message/error }
  } catch (e) {
    return maskError(e);
  }
}

/* ─── Registration Report ───────────────────────────────────── */
export async function getRegistrationReport(session, regNum, semStartDate) {
  try {
    const batchInput = JSON.stringify({
      0: { registrationNumber: regNum, semStartDate }
    });

    const response = await makeProxyRequest(session, {
      url: `/api/deicms.getRegistrationReport?batch=1&input=${encodeURIComponent(batchInput)}`,
    });
    if (response.status === 401) return { success: false, error: 'Session expired' };
    return response.data; // { success, url }
  } catch (e) {
    return maskError(e);
  }
}

/* ─── Admit Card ────────────────────────────────────────────── */
export async function getAdmitCard(session, regNum, dob) {
  try {
    let formattedDob = dob;
    if (dob.includes('/')) {
      const parts = dob.split('/');
      if (parts.length === 3) formattedDob = `${parts[2]}-${parts[1]}-${parts[0]}`;
    }

    const batchInput = JSON.stringify({
      0: { registrationNumber: regNum, dob: formattedDob }
    });

    const response = await makeProxyRequest(session, {
      url: `/api/deicms.getAdmitCard?batch=1&input=${encodeURIComponent(batchInput)}`,
    });
    if (response.status === 401) return { success: false, error: 'Session expired' };
    return response.data;
  } catch (e) {
    return maskError(e);
  }
}

/* ─── Fee Receipt ───────────────────────────────────────────── */
export async function downloadFeeReceipt(session, dob, semester) {
  try {
    let formattedDob = dob;
    if (dob.includes('/')) {
      const parts = dob.split('/');
      if (parts.length === 3) formattedDob = `${parts[1]}/${parts[0]}/${parts[2]}`;
    }

    const batchInput = JSON.stringify({
      0: {
        dob: formattedDob,
        startDate: semester.startDate || semester.semesterStartDate,
        endDate: semester.endDate || semester.semesterEndDate,
      }
    });

    const response = await makeProxyRequest(session, {
      url: `/api/deicms.downloadFeeReceipt?batch=1&input=${encodeURIComponent(batchInput)}`,
    });
    if (response.status === 401) return { success: false, error: 'Session expired' };
    return response.data;
  } catch (e) {
    return maskError(e);
  }
}

/* ─── Proxy Download (for PDFs) ─────────────────────────────── */
export async function proxyDownload(url) {
  try {
    const fullUrl = `${TARGET_HOST}/api/deicms.proxyDownload?url=${encodeURIComponent(url)}`;
    const response = await axios({
      method: 'GET',
      url: fullUrl,
      responseType: 'arraybuffer',
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Referer': 'https://cmsmarks.vercel.app/',
      },
    });
    return response;
  } catch (e) {
    console.error('[cms-client] PDF proxy download failed:', e.message);
    throw e;
  }
}
