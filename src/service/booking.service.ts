import httpClient from "@/lib/axios/httpClient";

export const bookingService = {
  getAll: (params?: Record<string, unknown>) =>
    httpClient.get("/bookings", { params }),
  getById: (id: string) => httpClient.get(`/bookings/${id}`),
  getMyBookings: (params?: Record<string, unknown>) =>
    httpClient.get("/bookings/my", { params }),
  create: (data: unknown) => httpClient.post("/bookings", data),
  confirm: (bookingId: string) =>
    httpClient.patch(`/bookings/${bookingId}/confirm`),
  checkIn: (bookingId: string) => httpClient.patch(`/bookings/${bookingId}/check-in`),
  checkOut: (bookingId: string) => httpClient.patch(`/bookings/${bookingId}/check-out`),
  cancel: (bookingId: string, reason?: string) =>
    httpClient.patch(`/bookings/${bookingId}/cancel`, { reason }),
  getStats: () => httpClient.get("/bookings/stats"),
};
