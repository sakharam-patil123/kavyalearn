import axiosClient from './axiosClient';

const api = {
  // direct axios client for low-level calls
  client: axiosClient,

  // convenience wrappers used across the app
  getCourses: () => axiosClient.get('/api/courses').then(res => res.data),
  getQuizzes: (courseId) => axiosClient.get(`/api/quiz?courseId=${courseId}`).then(res => res.data),
  createQuiz: (payload) => axiosClient.post('/api/quiz', payload).then(res => res.data),
  submitQuiz: (quizId, answers) => axiosClient.post(`/api/quiz/${quizId}/submit`, { answers }).then(res => res.data),

  // expose common axios methods
  get: (url, config) => axiosClient.get(url, config),
  post: (url, data, config) => axiosClient.post(url, data, config),
  put: (url, data, config) => axiosClient.put(url, data, config),
  delete: (url, config) => axiosClient.delete(url, config),
};

export default api;
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

export async function aiQuery(courseId, query) {
  const res = await fetch(`${BASE}/ai/query`, { method: 'POST', headers: authHeaders(), body: JSON.stringify({ courseId, query }) });
  return res.json();
}
