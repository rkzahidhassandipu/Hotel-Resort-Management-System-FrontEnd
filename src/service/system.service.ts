import httpClient from '@/lib/axios/httpClient';

export const systemService = {
  healthCheck: () => httpClient.get('/system/health'),
  getLogs: (params?: Record<string, unknown>) => httpClient.get('/system/logs', { params }),
  getLogById: (id: string) => httpClient.get(`/system/logs/${id}`),
  clearOldLogs: () => httpClient.delete('/system/logs/clear'),
  getErrors: (params?: Record<string, unknown>) => httpClient.get('/system/errors', { params }),
  getErrorById: (id: string) => httpClient.get(`/system/errors/${id}`),
  resolveError: (id: string) => httpClient.patch(`/system/errors/${id}/resolve`),
  getAuditTrail: (params?: Record<string, unknown>) => httpClient.get('/system/audit', { params }),
  getStats: () => httpClient.get('/system/stats'),
  getPermissions: () => httpClient.get('/system/permissions'),
  createPermission: (data: unknown) => httpClient.post('/system/permissions', data),
  getRolePermissions: (role: string) => httpClient.get(`/system/permissions/roles/${role}`),
  assignPermissionToRole: (role: string, data: unknown) => httpClient.post(`/system/permissions/roles/${role}`, data),
  getUserPermissions: (userId: string) => httpClient.get(`/system/permissions/users/${userId}`),
  grantPermissionToUser: (userId: string, data: unknown) => httpClient.post(`/system/permissions/users/${userId}`, data),
  revokePermission: (userId: string, permissionId: string) => httpClient.delete(`/system/permissions/users/${userId}/${permissionId}`),
};
