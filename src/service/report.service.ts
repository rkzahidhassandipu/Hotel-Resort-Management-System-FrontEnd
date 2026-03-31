import httpClient from '@/lib/axios/httpClient';

export const reportService = {
  getDashboard: () => httpClient.get('/reports/dashboard'),
  getRevenue: (params?: Record<string, unknown>) => httpClient.get('/reports/revenue', { params }),
  getOccupancy: (params?: Record<string, unknown>) => httpClient.get('/reports/occupancy', { params }),
  getBookings: (params?: Record<string, unknown>) => httpClient.get('/reports/bookings', { params }),
  getStaffPerformance: (params?: Record<string, unknown>) => httpClient.get('/reports/staff-performance', { params }),
  getFood: (params?: Record<string, unknown>) => httpClient.get('/reports/food', { params }),
  getDaily: (params?: Record<string, unknown>) => httpClient.get('/reports/daily', { params }),
  generateDaily: () => httpClient.post('/reports/daily/generate'),
  getMonthly: (params?: Record<string, unknown>) => httpClient.get('/reports/monthly', { params }),
};
