import httpClient from '@/lib/axios/httpClient';

export const paymentService = {
  getAll: (params?: Record<string, unknown>) => httpClient.get('/payments', { params }),
  getById: (id: string) => httpClient.get(`/payments/${id}`),
  create: (data: unknown) => httpClient.post('/payments', data),
  refund: (id: string, data: unknown) => httpClient.post(`/payments/${id}/refund`, data),
  getStats: () => httpClient.get('/payments/stats'),
};
