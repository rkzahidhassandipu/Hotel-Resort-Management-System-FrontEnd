// import httpClient from '@/lib/axios/httpClient';

// export const inventoryService = {
//   getAll: (params?: Record<string, unknown>) => httpClient.get('/inventory', { params }),
//   getById: (id: string) => httpClient.get(`/inventory/${id}`),
//   create: (data: unknown) => httpClient.post('/inventory', data),
//   update: (id: string, data: unknown) => httpClient.put(`/inventory/${id}`, data),
//   getStats: () => httpClient.get('/inventory/stats'),
//   getLowStock: () => httpClient.get('/inventory/low-stock'),
//   getCategories: () => httpClient.get('/inventory/categories'),
//   createCategory: (data: unknown) => httpClient.post('/inventory/categories', data),
//   addTransaction: (id: string, data: unknown) => httpClient.post(`/inventory/${id}/transaction`, data),
//   getTransactions: (id: string) => httpClient.get(`/inventory/${id}/transactions`),
//   getProcurements: (params?: Record<string, unknown>) => httpClient.get('/inventory/procurement', { params }),
//   createProcurement: (data: unknown) => httpClient.post('/inventory/procurement', data),
//   updateProcurementStatus: (id: string, status: string) => httpClient.patch(`/inventory/procurement/${id}/status`, { status }),
// };


import httpClient from '@/lib/axios/httpClient';

export const inventoryService = {
  // Stats & alerts
  getStats: () => httpClient.get('/inventory/stats'),
  getLowStock: () => httpClient.get('/inventory/low-stock'),

  // Categories
  getAllCategories: () => httpClient.get('/inventory/categories'),
  createCategory: (data: unknown) => httpClient.post('/inventory/categories', data),

  // Items
  getAllItems: (params?: Record<string, unknown>) => httpClient.get('/inventory', { params }),
  getItemById: (id: string) => httpClient.get(`/inventory/${id}`),
  createItem: (data: unknown) => httpClient.post('/inventory', data),
  updateItem: (id: string, data: unknown) => httpClient.put(`/inventory/${id}`, data),
  addTransaction: (id: string, data: unknown) => httpClient.post(`/inventory/${id}/transaction`, data),
  getTransactions: (id: string, params?: Record<string, unknown>) =>
    httpClient.get(`/inventory/${id}/transactions`, { params }),

  // Procurement
  getAllProcurement: (params?: Record<string, unknown>) =>
    httpClient.get('/inventory/procurement', { params }),
  createProcurement: (data: unknown) => httpClient.post('/inventory/procurement', data),
  updateProcurementStatus: (id: string, data: unknown) =>
    httpClient.patch(`/inventory/procurement/${id}/status`, data),
};