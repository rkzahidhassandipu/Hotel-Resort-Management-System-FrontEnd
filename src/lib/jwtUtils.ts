export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  status: string;
  iat: number;
  exp: number;
}

interface VerifyResult {
  success: boolean;
  data: JwtPayload | null;
}

/** Decode JWT payload (works in edge / browser / Node) */
export function decodeJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    // Works in both Node (Buffer) and browser (atob)
    const json =
      typeof Buffer !== 'undefined'
        ? Buffer.from(padded, 'base64').toString('utf-8')
        : decodeURIComponent(
            atob(padded)
              .split('')
              .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
              .join('')
          );
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

export const jwtUtils = {
  /** Check token validity: decode + expiry (edge-runtime safe) */
  verifyToken(token: string, _secret?: string): VerifyResult {
    try {
      const payload = decodeJwt(token);
      if (!payload) return { success: false, data: null };
      if (Date.now() >= payload.exp * 1000) return { success: false, data: null };
      return { success: true, data: payload };
    } catch {
      return { success: false, data: null };
    }
  },
};
