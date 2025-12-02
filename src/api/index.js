const BASE = 'http://localhost:5000/api';

function authHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

export async function getCourses() {
  const res = await fetch(`${BASE}/courses`, { headers: authHeaders() });
  return res.json();
}

export async function createCourse(payload) {
  const res = await fetch(`${BASE}/courses`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(payload) });
  return res.json();
}

export async function getQuizzes(courseId) {
  const url = courseId ? `${BASE}/quiz?courseId=${courseId}` : `${BASE}/quiz`;
  const res = await fetch(url, { headers: authHeaders() });
  return res.json();
}

export async function createQuiz(payload) {
  const res = await fetch(`${BASE}/quiz`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(payload) });
  return res.json();
}

export async function getQuiz(id) {
  const res = await fetch(`${BASE}/quiz/${id}`, { headers: authHeaders() });
  return res.json();
}

export async function submitQuiz(id, answers) {
  const res = await fetch(`${BASE}/quiz/${id}/submit`, { method: 'POST', headers: authHeaders(), body: JSON.stringify({ answers }) });
  return res.json();
}

export async function getEvents() {
  const res = await fetch(`${BASE}/events`, { headers: authHeaders() });
  return res.json();
}

export async function createEvent(payload) {
  const res = await fetch(`${BASE}/events`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(payload) });
  return res.json();
}

export async function getProfile() {
  const res = await fetch(`${BASE}/auth/profile`, { headers: authHeaders() });
  return res.json();
}

// ===== Progress / Profile analytics =====

export async function getProgressOverview() {
  const res = await fetch(`${BASE}/progress/overview`, { headers: authHeaders() });
  if (!res.ok) {
    throw new Error('Failed to load progress overview');
  }
  return res.json();
}

export async function getRecentActivity() {
  const res = await fetch(`${BASE}/progress/activity`, { headers: authHeaders() });
  if (!res.ok) {
    throw new Error('Failed to load recent activity');
  }
  return res.json();
}

export async function downloadCertificate(courseId) {
  const res = await fetch(`${BASE}/progress/certificates/${courseId}/download`, {
    method: 'GET',
    headers: authHeaders(),
  });

  if (!res.ok) {
    throw new Error('Certificate is not available yet');
  }

  return res.blob();
}

export async function aiQuery(courseId, query) {
  const res = await fetch(`${BASE}/ai/query`, { method: 'POST', headers: authHeaders(), body: JSON.stringify({ courseId, query }) });
  return res.json();
}

export default {
  getCourses,
  createCourse,
  getQuizzes,
  createQuiz,
  getQuiz,
  submitQuiz,
  getEvents,
  createEvent,
  getProfile,
  getProgressOverview,
  getRecentActivity,
  downloadCertificate,
  aiQuery
};
