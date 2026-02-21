import api from './api'

export const issueService = {
  create: (data) => api.post('/issues', data),
  getAll: (params) => api.get('/issues', { params }),
  getMy: () => api.get('/issues/my'),
  getById: (id) => api.get(`/issues/${id}`),
  updateStatus: (id, data) => api.patch(`/issues/${id}/status`, data),
  assign: (id, data) => api.patch(`/issues/${id}/assign`, data),
  delete: (id) => api.delete(`/issues/${id}`),
  uploadImages: (files) => {
    const formData = new FormData()
    files.forEach((f) => formData.append('files', f))
    return api.post('/issues/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}

export const analyticsService = {
  getSummary: () => api.get('/analytics/summary'),
  getByCategory: () => api.get('/analytics/by-category'),
  getByWeek: () => api.get('/analytics/by-week'),
  getResolutionTime: () => api.get('/analytics/resolution-time'),
}

export const notificationService = {
  getAll: () => api.get('/notifications'),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
}
