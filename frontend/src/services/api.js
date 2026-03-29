import axios from 'axios';

// Base URL — switches automatically between dev and production
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

// ===== REQUEST INTERCEPTOR =====
// Automatically attach token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ===== RESPONSE INTERCEPTOR =====
// Handle expired tokens globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ===== AUTH API =====
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
  getMe:    ()     => api.get('/auth/me'),
  updatePreferences: (data) => api.put('/auth/preferences', data)
};

// ===== TASKS API =====
export const tasksAPI = {
  getAll:   (params) => api.get('/tasks', { params }),
  create:   (data)   => api.post('/tasks', data),
  update:   (id, data) => api.put(`/tasks/${id}`, data),
  delete:   (id)     => api.delete(`/tasks/${id}`),
  toggle:   (id)     => api.put(`/tasks/${id}/toggle`),
  pin:      (id)     => api.put(`/tasks/${id}/pin`)
};

// ===== AI API =====
export const aiAPI = {
  analyze:          (data) => api.post('/ai/analyze', data),
  moodSuggestions:  (mood) => api.post('/ai/mood', { mood }),
  generateBreakdown:(id)   => api.post(`/ai/breakdown/${id}`)
};

export default api;