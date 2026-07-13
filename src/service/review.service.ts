import httpClient from '@/lib/axios/httpClient';

export const reviewService = {
  getAll: (params?: Record<string, unknown>) => httpClient.get('/reviews', { params }),
  getById: (id: string) => httpClient.get(`/reviews/${id}`),
  getMyReviews: () => httpClient.get('/reviews/me/list'),
  getStats: () => httpClient.get('/reviews/stats/summary'),
  create: (data: unknown) => httpClient.post('/reviews', data),
  update: (id: string, data: unknown) => httpClient.patch(`/reviews/${id}`, data),
  delete: (id: string) => httpClient.delete(`/reviews/${id}`),
  moderate: (id: string, status: string) => httpClient.patch(`/reviews/${id}/moderate`, { status }),
  respond: (id: string, response: string) => httpClient.patch(`/reviews/${id}/respond`, { managerResponse: response }),
};
