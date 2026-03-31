import httpClient from '@/lib/axios/httpClient';

export const maintenanceService = {
  getAll: (params?: Record<string, unknown>) => httpClient.get('/maintenance', { params }),
  getById: (id: string) => httpClient.get(`/maintenance/${id}`),
  create: (data: unknown) => httpClient.post('/maintenance', data),
  update: (id: string, data: unknown) => httpClient.put(`/maintenance/${id}`, data),
  assign: (id: string, assignedToId: string) => httpClient.patch(`/maintenance/${id}/assign`, { assignedToId }),
  complete: (id: string, data?: unknown) => httpClient.patch(`/maintenance/${id}/complete`, data),
  cancel: (id: string, reason?: string) => httpClient.patch(`/maintenance/${id}/cancel`, { reason }),
  getStats: () => httpClient.get('/maintenance/stats'),
  getHousekeepingLogs: (params?: Record<string, unknown>) => httpClient.get('/maintenance/housekeeping/logs', { params }),
  createHousekeepingLog: (data: unknown) => httpClient.post('/maintenance/housekeeping/logs', data),
  completeHousekeeping: (logId: string) => httpClient.patch(`/maintenance/housekeeping/logs/${logId}/complete`),
};
