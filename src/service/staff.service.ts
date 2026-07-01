import httpClient from '@/lib/axios/httpClient';

export const staffService = {
  getStats: () => httpClient.get('/staff/stats'),
  getOnDuty: () => httpClient.get('/staff/on-duty'),
  createShift: (data: unknown) => httpClient.post('/staff/shifts', data),
  getShifts: (profileId: string) => httpClient.get(`/staff/shifts/${profileId}`),
  markAttendance: (shiftId: string, data: unknown) => httpClient.patch(`/staff/shifts/${shiftId}/attendance`, data),
  getMyTasks: () => httpClient.get('/staff/tasks/me'),
  getAllTasks: (params?: Record<string, unknown>) => httpClient.get('/staff/tasks', { params }),
  createTask: (data: unknown) => httpClient.post('/staff/tasks', data),
  updateTaskStatus: (id: string, status: string) => httpClient.patch(`/staff/tasks/${id}/status`, { status }),
  addPerformanceReview: (profileId: string, data: {
  period: string;
  rating: number;
  punctuality?: number;
  productivity?: number;
  attitude?: number;
  teamwork?: number;
  comments?: string;
  goals?: string;
}) =>
  httpClient.post(`/staff/profiles/${profileId}/reviews`, data),

getPerformanceReviews: (profileId: string, params?: Record<string, unknown>) =>
  httpClient.get(`/staff/profiles/${profileId}/reviews`, { params }),
};
