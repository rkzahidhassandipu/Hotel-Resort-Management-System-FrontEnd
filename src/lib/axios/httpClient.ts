import axios from 'axios';
import { getCookie, setCookie, deleteCookie } from '@/lib/cookieUtils';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// ── Public client (no auth) ────────────────────────────────────
export const publicClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Authenticated client ───────────────────────────────────────
const httpClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Request interceptor — attach token if available
httpClient.interceptors.request.use((config) => {
  const token = getCookie('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — silent token refresh on 401
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
            `${BASE_URL}/auth/refresh-token`,
            { refreshToken },
            { withCredentials: true },
          );

          const { accessToken, refreshToken: newRefresh } =
            res.data?.data || res.data;

          setCookie('accessToken', accessToken, { days: 1 });
          if (newRefresh) {
            setCookie('refreshToken', newRefresh, { days: 7 });
          }

          original.headers = {
            ...original.headers,
            Authorization: `Bearer ${accessToken}`,
          };

          return httpClient(original);
        } catch {
          // Refresh failed — clear tokens silently, no redirect
          deleteCookie('accessToken');
          deleteCookie('refreshToken');
        }
      }
    }

    return Promise.reject(error);
  },
);

export default httpClient;