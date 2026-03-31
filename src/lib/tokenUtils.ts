/**
 * Token utilities — stores tokens in cookies (NOT localStorage) so that
 * Next.js middleware can read them and enforce role-based routing.
 */
import { setCookie, deleteCookie, getCookie } from './cookieUtils';

const ACCESS_TOKEN_KEY  = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

// Access token expires in 15 min → set cookie for 1 day (middleware enforces actual JWT expiry)
// Refresh token expires in 7 days
export function storeTokens(accessToken: string, refreshToken: string): void {
  setCookie(ACCESS_TOKEN_KEY,  accessToken,  { days: 1,   sameSite: 'Lax' });
  setCookie(REFRESH_TOKEN_KEY, refreshToken, { days: 7,   sameSite: 'Lax' });
}

export function getStoredAccessToken(): string | null {
  return getCookie(ACCESS_TOKEN_KEY);
}

export function getStoredRefreshToken(): string | null {
  return getCookie(REFRESH_TOKEN_KEY);
}

export function removeTokens(): void {
  deleteCookie(ACCESS_TOKEN_KEY);
  deleteCookie(REFRESH_TOKEN_KEY);
}

/** Check if access token is expiring within `thresholdSeconds` seconds */
export async function isTokenExpiringSoon(
  token: string,
  thresholdSeconds = 120
): Promise<boolean> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const json =
      typeof Buffer !== 'undefined'
        ? Buffer.from(padded, 'base64').toString('utf-8')
        : decodeURIComponent(
            atob(padded)
              .split('')
              .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
              .join('')
          );
    const payload = JSON.parse(json) as { exp: number };
    const remainingMs = payload.exp * 1000 - Date.now();
    return remainingMs < thresholdSeconds * 1000;
  } catch {
    return true;
  }
}
