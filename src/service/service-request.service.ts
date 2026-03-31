import httpClient from '@/lib/axios/httpClient';

export const serviceRequestService = {
  getAll: (params?: Record<string, unknown>) => httpClient.get('/services', { params }),
  getById: (id: string) => httpClient.get(`/services/${id}`),
  create: (data: unknown) => httpClient.post('/services', data),
  assign: (id: string, assignedToId: string) => httpClient.patch(`/services/${id}/assign`, { assignedToId }),
  updateStatus: (id: string, status: string) => httpClient.patch(`/services/${id}/status`, { status }),
  cancel: (id: string) => httpClient.patch(`/services/${id}/cancel`),
  getStats: () => httpClient.get('/services/stats'),
};
