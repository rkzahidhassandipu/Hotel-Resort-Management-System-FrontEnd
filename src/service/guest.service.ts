import httpClient from '@/lib/axios/httpClient';

export const guestService = {
  getHotelInfo: () => httpClient.get('/guests/hotel-info'),
  createInquiry: (data: unknown) => httpClient.post('/guests/inquiries', data),
  getStats: () => httpClient.get('/guests/stats'),
  getVisitors: (params?: Record<string, unknown>) => httpClient.get('/guests/visitors', { params }),
  registerVisitor: (data: unknown) => httpClient.post('/guests/visitors', data),
  getVisitorById: (id: string) => httpClient.get(`/guests/visitors/${id}`),
  convertToCustomer: (id: string) => httpClient.post(`/guests/visitors/${id}/convert`),
  getInquiries: (params?: Record<string, unknown>) => httpClient.get('/guests/inquiries', { params }),
  getInquiryById: (id: string) => httpClient.get(`/guests/inquiries/${id}`),
  resolveInquiry: (id: string, notes?: string) => httpClient.patch(`/guests/inquiries/${id}/resolve`, { notes }),
  deleteInquiry: (id: string) => httpClient.delete(`/guests/inquiries/${id}`),
  getHotelInfoAll: () => httpClient.get('/guests/hotel-info/all'),
  updateHotelInfo: (data: unknown) => httpClient.put('/guests/hotel-info', data),
  deleteHotelInfoKey: (key: string) => httpClient.delete(`/guests/hotel-info/${key}`),
};
