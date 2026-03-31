import axios from 'axios';
import { getCookie, setCookie, deleteCookie } from '@/lib/cookieUtils';

const httpClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// ── Request interceptor: attach accessToken from cookie ────────────────────────
httpClient.interceptors.request.use((config) => {
  const token = getCookie('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Response interceptor: auto-refresh on 401 ─────────────────────────────────
httpClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      const refreshToken = getCookie('refreshToken');
      if (refreshToken) {
        try {
          const res = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`,
            { refreshToken },
            { withCredentials: true }
          );
          const { accessToken, refreshToken: newRefresh } = res.data?.data || res.data;

          // Save refreshed tokens back to cookies
          setCookie('accessToken',  accessToken,  { days: 1,  sameSite: 'Lax' });
          if (newRefresh) {
            setCookie('refreshToken', newRefresh, { days: 7, sameSite: 'Lax' });
          }

          original.headers.Authorization = `Bearer ${accessToken}`;
          return httpClient(original);
        } catch {
          deleteCookie('accessToken');
          deleteCookie('refreshToken');
          if (typeof window !== 'undefined') window.location.href = '/login';
        }
      } else {
        if (typeof window !== 'undefined') window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default httpClient;
