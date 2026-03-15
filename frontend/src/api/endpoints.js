import api from './client';

// Auth
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
  updateMe: (data) => api.put('/auth/me', data),
  changePassword: (data) => api.put('/auth/password', data)
};

// Languages
export const languagesAPI = {
  getAll: (params) => api.get('/languages', { params }),
  getOne: (id) => api.get(`/languages/${id}`),
  create: (data) => api.post('/languages', data),
  update: (id, data) => api.put(`/languages/${id}`, data),
  delete: (id) => api.delete(`/languages/${id}`)
};

// Blogs
export const blogsAPI = {
  getAll: (params) => api.get('/blogs', { params }),
  getOne: (id) => api.get(`/blogs/${id}`),
  create: (data) => api.post('/blogs', data),
  update: (id, data) => api.put(`/blogs/${id}`, data),
  delete: (id) => api.delete(`/blogs/${id}`)
};

// White Papers
export const whitePapersAPI = {
  getAll: (params) => api.get('/white-papers', { params }),
  getOne: (id) => api.get(`/white-papers/${id}`),
  create: (data) => api.post('/white-papers', data),
  update: (id, data) => api.put(`/white-papers/${id}`, data),
  delete: (id) => api.delete(`/white-papers/${id}`)
};

// Webinars
export const webinarsAPI = {
  getAll: (params) => api.get('/webinars', { params }),
  getOne: (id) => api.get(`/webinars/${id}`),
  create: (data) => api.post('/webinars', data),
  update: (id, data) => api.put(`/webinars/${id}`, data),
  delete: (id) => api.delete(`/webinars/${id}`)
};

// News
export const newsAPI = {
  getAll: (params) => api.get('/news', { params }),
  getOne: (id) => api.get(`/news/${id}`),
  create: (data) => api.post('/news', data),
  update: (id, data) => api.put(`/news/${id}`, data),
  delete: (id) => api.delete(`/news/${id}`)
};

// Careers
export const careersAPI = {
  getAll: (params) => api.get('/careers', { params }),
  getOne: (id) => api.get(`/careers/${id}`),
  create: (data) => api.post('/careers', data),
  update: (id, data) => api.put(`/careers/${id}`, data),
  delete: (id) => api.delete(`/careers/${id}`)
};

// Newsletter
export const newsletterAPI = {
  getAll: (params) => api.get('/newsletter', { params }),
  updateStatus: (id, data) => api.patch(`/newsletter/${id}/status`, data),
  delete: (id) => api.delete(`/newsletter/${id}`),
  exportCSV: (params) => api.get('/newsletter/export', { params, responseType: 'blob' })
};

// Newsletter Issues
export const newsletterIssuesAPI = {
  getAll: (params) => api.get('/newsletter-issues', { params }),
  getOne: (id) => api.get(`/newsletter-issues/${id}`),
  create: (formData) => api.post('/newsletter-issues', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, formData) => api.put(`/newsletter-issues/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/newsletter-issues/${id}`)
};

// Media
export const mediaAPI = {
  getAll: (params) => api.get('/media', { params }),
  upload: (formData) => api.post('/media/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id) => api.delete(`/media/${id}`)
};

// Dashboard
export const dashboardAPI = {
  getStats: (params) => api.get('/dashboard/stats', { params })
};

// Chat Content (manual knowledge base entries)
export const chatContentAPI = {
  getAll: (params) => api.get('/chat-content', { params }),
  getOne: (id) => api.get(`/chat-content/${id}`),
  create: (data) => api.post('/chat-content', data),
  update: (id, data) => api.put(`/chat-content/${id}`, data),
  delete: (id) => api.delete(`/chat-content/${id}`)
};

// Chat / AI
export const chatAPI = {
  send: (data) => api.post('/chat', data),
  health: () => api.get('/chat/health'),
  stats: () => api.get('/chat/stats'),
  reindex: () => api.post('/chat/reindex'),
  reindexModel: (model) => api.post(`/chat/reindex/${model}`),
  getSettings: () => api.get('/chat/settings'),
  updateSettings: (data) => api.put('/chat/settings', data)
};
