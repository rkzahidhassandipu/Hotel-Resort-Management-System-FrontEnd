import httpClient from '@/lib/axios/httpClient';

export const foodService = {
  getOrders: (params?: Record<string, unknown>) => httpClient.get('/food/orders', { params }),
  getOrderById: (id: string) => httpClient.get(`/food/orders/${id}`),
  createOrder: (data: unknown) => httpClient.post('/food/orders', data),
  updateOrderStatus: (id: string, status: string) => httpClient.patch(`/food/orders/${id}/status`, { status }),
  cancelOrder: (id: string) => httpClient.patch(`/food/orders/${id}/cancel`),
  getMenu: () => httpClient.get('/food/menu'),
  getStats: () => httpClient.get('/food/stats'),
  createMenuItem: (data: FormData) =>
    httpClient.post('/food/menu/items', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  updateMenuItem: (id: string, data: FormData) =>
    httpClient.put(`/food/menu/items/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  // ✅ simple field update
  patchMenuItem: (id: string, data: Record<string, unknown>) =>
    httpClient.patch(`/food/menu/items/${id}`, data),
  deleteMenuItem: (id: string) => httpClient.delete(`/food/menu/items/${id}`),
  createMenuCategory: (data: unknown) => httpClient.post('/food/menu/categories', data),
  updateMenuCategory: (id: string, data: unknown) => httpClient.put(`/food/menu/categories/${id}`, data),
};