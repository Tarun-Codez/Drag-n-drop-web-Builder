import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

export async function signup(payload) {
  const { data } = await api.post('/auth/signup', payload);
  return data;
}

export async function login(payload) {
  const { data } = await api.post('/auth/login', payload);
  return data;
}

export async function saveProject(payload) {
  const { data } = await api.post('/projects/save', payload);
  return data;
}

export async function fetchProjects() {
  const { data } = await api.get('/projects');
  return data;
}

export async function publishProject(projectId, payload = {}) {
  const { data } = await api.post(`/projects/${projectId}/publish`, payload);
  return data;
}

export default api;
