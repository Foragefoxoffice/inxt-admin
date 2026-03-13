import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
});

// Attach JWT token and language prefix to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cms_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;

  const lang = (localStorage.getItem('cms_lang_code') || 'en').toLowerCase();
  config.url = `/${lang}${config.url}`;

  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('cms_token');
      localStorage.removeItem('cms_user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
