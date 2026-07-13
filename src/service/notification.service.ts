import httpClient from "@/lib/axios/httpClient";


export interface GetNotificationsParams {
  page?: number;
  limit?: number;
  isRead?: boolean;
  type?: string;
  channel?: 'EMAIL' | 'SMS' | 'PUSH' | 'IN_APP';
}

export const notificationService = {
  // GET /notifications/me
  getMyNotifications: (params?: GetNotificationsParams) =>
    httpClient.get('/notifications/me', { params }),

  // GET /notifications/me/unread-count
  getUnreadCount: () =>
    httpClient.get('/notifications/me/unread-count'),

  // PATCH /notifications/me/read-all
  markAllRead: () =>
    httpClient.patch('/notifications/me/read-all'),

  // DELETE /notifications/me/clear-read
  clearRead: () =>
    httpClient.delete('/notifications/me/clear-read'),

  // PATCH /notifications/:id/read
  markAsRead: (id: string) =>
    httpClient.patch(`/notifications/${id}/read`),

  // DELETE /notifications/:id
  delete: (id: string) =>
    httpClient.delete(`/notifications/${id}`),

  // ── Admin ──────────────────────────────────────────
  // GET /notifications/stats
  getStats: () =>
    httpClient.get('/notifications/stats'),

  // POST /notifications
  create: (data: {
    userId: string;
    type: string;
    channel: 'EMAIL' | 'SMS' | 'PUSH' | 'IN_APP';
    title: string;
    message: string;
    data?: Record<string, unknown>;
  }) => httpClient.post('/notifications', data),

  // POST /notifications/broadcast
  broadcast: (data: {
    roles?: string[];
    userIds?: string[];
    type: string;
    channel: 'EMAIL' | 'SMS' | 'PUSH' | 'IN_APP';
    title: string;
    message: string;
    data?: Record<string, unknown>;
  }) => httpClient.post('/notifications/broadcast', data),

  // ── Templates ──────────────────────────────────────
  getTemplates: () => httpClient.get('/notifications/templates'),

  createTemplate: (data: {
    name: string;
    type: string;
    channel: 'EMAIL' | 'SMS' | 'PUSH' | 'IN_APP';
    subject?: string;
    bodyTemplate: string;
    isActive?: boolean;
  }) => httpClient.post('/notifications/templates', data),

  updateTemplate: (id: string, data: Record<string, unknown>) =>
    httpClient.put(`/notifications/templates/${id}`, data),

  deleteTemplate: (id: string) =>
    httpClient.delete(`/notifications/templates/${id}`),
};