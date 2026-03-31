/**
 * Edge-runtime safe token helpers.
 * No Node.js APIs (Buffer etc) — uses only Web-compatible primitives.
 * Safe to import from Next.js middleware.
 */

/** Decode JWT payload — edge/browser/Node safe */
export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    // atob is available in all edge runtimes (V8, Deno, Workers, Next.js middleware)
    const json = decodeURIComponent(
      atob(padded)
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('')
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/** Returns true when token is within `thresholdSeconds` of expiring (or already expired) */
export function isTokenExpiringSoon(token: string, thresholdSeconds = 120): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.exp !== 'number') return true;
  const remainingMs = payload.exp * 1000 - Date.now();
  return remainingMs < thresholdSeconds * 1000;
}
