import httpClient from '@/lib/axios/httpClient';

export const bookingService = {
  getAll: (params?: Record<string, unknown>) => httpClient.get('/bookings', { params }),
  getById: (id: string) => httpClient.get(`/bookings/${id}`),
  create: (data: unknown) => httpClient.post('/bookings', data),
  confirm: (id: string) => httpClient.patch(`/bookings/${id}/confirm`),
  checkIn: (id: string) => httpClient.patch(`/bookings/${id}/check-in`),
  checkOut: (id: string) => httpClient.patch(`/bookings/${id}/check-out`),
  cancel: (id: string, reason?: string) => httpClient.patch(`/bookings/${id}/cancel`, { reason }),
  getStats: () => httpClient.get('/bookings/stats'),
};
