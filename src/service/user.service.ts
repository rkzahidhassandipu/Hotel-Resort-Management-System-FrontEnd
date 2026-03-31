import httpClient from '@/lib/axios/httpClient';

export const userService = {
  getAll: (params?: Record<string, unknown>) => httpClient.get('/users', { params }),
  getById: (id: string) => httpClient.get(`/users/${id}`),
  delete: (id: string) => httpClient.delete(`/users/${id}`),
  updateStatus: (id: string, status: string) => httpClient.patch(`/users/${id}/status`, { status }),
  getStats: () => httpClient.get('/users/stats'),
  getPending: () => httpClient.get('/users/pending'),
  approveStaff: (id: string) => httpClient.patch(`/users/${id}/approve`),
  rejectStaff: (id: string) => httpClient.patch(`/users/${id}/reject`),
  createManager: (data: unknown) => httpClient.post('/users/managers', data),
  createStaff: (data: unknown) => httpClient.post('/users/staff', data),
  updateStaff: (id: string, data: unknown) => httpClient.put(`/users/staff/${id}`, data),
  getStaffList: (params?: Record<string, unknown>) => httpClient.get('/users/staff', { params }),
  // Profile
  getMyProfile: () => httpClient.get('/users/me'),
  updateMyProfile: (data: unknown) => httpClient.put('/users/me', data),
  uploadAvatar: (formData: FormData) => httpClient.post('/users/me/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updatePreferences: (data: unknown) => httpClient.put('/users/me/preferences', data),
};
