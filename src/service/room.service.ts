import httpClient from '@/lib/axios/httpClient';

export const roomService = {
  getAll: (params?: Record<string, unknown>) => httpClient.get('/rooms', { params }),
  getById: (id: string) => httpClient.get(`/rooms/${id}`),
  create: (data: unknown) => httpClient.post('/rooms', data),
  update: (id: string, data: unknown) => httpClient.put(`/rooms/${id}`, data),
  delete: (id: string) => httpClient.delete(`/rooms/${id}`),
  getAvailable: (params?: Record<string, unknown>) => httpClient.get('/rooms/available', { params }),
  getCategories: () => httpClient.get('/rooms/categories'),
  getAmenities: () => httpClient.get('/rooms/amenities'),
  getStats: () => httpClient.get('/rooms/stats'),
  uploadImages: (id: string, formData: FormData) => httpClient.post(`/rooms/${id}/images`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteImage: (id: string, imageId: string) => httpClient.delete(`/rooms/${id}/images/${imageId}`),
  setPrimaryImage: (id: string, imageId: string) => httpClient.patch(`/rooms/${id}/images/${imageId}/primary`),
  updateAmenities: (id: string, amenityIds: string[]) => httpClient.put(`/rooms/${id}/amenities`, { amenityIds }),
  addPricingRule: (id: string, data: unknown) => httpClient.post(`/rooms/${id}/pricing-rules`, data),
  deletePricingRule: (id: string, ruleId: string) => httpClient.delete(`/rooms/${id}/pricing-rules/${ruleId}`),
  createCategory: (data: unknown) => httpClient.post('/rooms/categories/new', data),
  updateCategory: (id: string, data: unknown) => httpClient.put(`/rooms/categories/${id}`, data),
  createAmenity: (data: unknown) => httpClient.post('/rooms/amenities/new', data),
  deleteAmenity: (id: string) => httpClient.delete(`/rooms/amenities/${id}`),
  deleteCategory: (id: string) => httpClient.delete(`/rooms/categories/${id}`),
};
