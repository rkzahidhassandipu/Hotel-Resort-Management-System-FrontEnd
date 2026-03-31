import httpClient from '@/lib/axios/httpClient';

export const notificationService = {
  getMyNotifications: (params?: Record<string, unknown>) => httpClient.get('/notifications/me', { params }),
  getUnreadCount: () => httpClient.get('/notifications/me/unread-count'),
  markAsRead: (id: string) => httpClient.patch(`/notifications/${id}/read`),
  markAllRead: () => httpClient.patch('/notifications/me/read-all'),
  clearRead: () => httpClient.delete('/notifications/me/clear-read'),
  delete: (id: string) => httpClient.delete(`/notifications/${id}`),
  getStats: () => httpClient.get('/notifications/stats'),
  create: (data: unknown) => httpClient.post('/notifications', data),
  broadcast: (data: unknown) => httpClient.post('/notifications/broadcast', data),
  getTemplates: () => httpClient.get('/notifications/templates'),
  createTemplate: (data: unknown) => httpClient.post('/notifications/templates', data),
  updateTemplate: (id: string, data: unknown) => httpClient.put(`/notifications/templates/${id}`, data),
  deleteTemplate: (id: string) => httpClient.delete(`/notifications/templates/${id}`),
};
