import httpClient, { publicClient } from "@/lib/axios/httpClient";

export const roomService = {
  // ── Public routes (no auth required) ──────────────────────────
  getAll:       (params?: Record<string, unknown>) => publicClient.get('/rooms', { params }),
  getById:      (id: string)                       => httpClient.get(`/rooms/${id}`),
  getAvailable: (params?: Record<string, unknown>) => publicClient.get('/rooms/available', { params }),
  getCategories:()                                 => publicClient.get('/rooms/categories'),
  getAmenities: ()                                 => publicClient.get('/rooms/amenities'),

  // ── Protected routes (auth required) ──────────────────────────
  getStats: () => httpClient.get('/rooms/stats'),
  create:         (data: unknown)                            => httpClient.post('/rooms', data),
  update:         (id: string, data: unknown)                => httpClient.put(`/rooms/${id}`, data),
  delete:         (id: string)                               => httpClient.delete(`/rooms/${id}`),
  uploadImages:   (id: string, formData: FormData)           => httpClient.post(`/rooms/${id}/images`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteImage:    (id: string, imageId: string)              => httpClient.delete(`/rooms/${id}/images/${imageId}`),
  setPrimaryImage:(id: string, imageId: string)              => httpClient.patch(`/rooms/${id}/images/${imageId}/primary`),
  updateAmenities:(id: string, amenityIds: string[])         => httpClient.put(`/rooms/${id}/amenities`, { amenityIds }),
  getPricingRules: (id: string) => httpClient.get(`/rooms/${id}/pricing-rules`),
  addPricingRule: (id: string, data: unknown)                => httpClient.post(`/rooms/${id}/pricing-rules`, data),
  deletePricingRule:(id: string, ruleId: string)             => httpClient.delete(`/rooms/${id}/pricing-rules/${ruleId}`),
  createCategory: (data: unknown)                            => httpClient.post('/rooms/categories/new', data),
  updateCategory: (id: string, data: unknown)                => httpClient.put(`/rooms/categories/${id}`, data),
  createAmenity:  (data: unknown)                            => httpClient.post('/rooms/amenities/new', data),
  deleteCategory: (id: string)                               => httpClient.delete(`/rooms/categories/${id}`),
  updateAmenity:   (id: string, data: unknown)        => httpClient.put(`/rooms/amenities/${id}`, data),
  deleteAmenity:   (id: string)                       => httpClient.delete(`/rooms/amenities/${id}`),
};