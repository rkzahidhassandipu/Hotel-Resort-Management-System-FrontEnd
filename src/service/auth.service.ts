import httpClient from "@/lib/axios/httpClient";
import type { LoginInput } from "@/zod/auth.validation";

export const authService = {
  login: (data: LoginInput) => httpClient.post("/auth/login", data),
  login2fa: (data: { email: string; token: string }) =>
    httpClient.post("/auth/login/2fa", data),
  register: (data: unknown) => httpClient.post("/auth/register", data),
  logout: (refreshToken?: string) =>
    httpClient.post("/auth/logout", { refreshToken }),
  logoutAll: () => httpClient.post("/auth/logout-all"),
  forgotPassword: (email: string) =>
    httpClient.post("/auth/forgot-password", { email }),
  resetPassword: (token: string, password: string) =>
    httpClient.post("/auth/reset-password", { token, password }),
  verifyEmail: (token: string) =>
    httpClient.post("/auth/verify-email", { token }),
  resendVerifyEmail: (email: string) =>
    httpClient.post("/auth/resend-verify-email", { email }),
  me: () => httpClient.get("/auth/me"),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    httpClient.put("/auth/change-password", data),
  refreshToken: (refreshToken: string) =>
    httpClient.post("/auth/refresh-token", { refreshToken }),
  getSessions: () => httpClient.get("/auth/sessions"),
  revokeSession: (sessionId: string) => httpClient.delete(`/auth/sessions/${sessionId}`),
  enable2fa: (token: string) => httpClient.post('/auth/2fa/enable', { token }),
  setup2fa: () => httpClient.post('/auth/2fa/setup'),
  disable2fa: (token: string) => httpClient.post("/auth/2fa/disable", { token }),
};
