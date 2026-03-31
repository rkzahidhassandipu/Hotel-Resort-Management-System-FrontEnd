// ─── Client-side cookie helpers ────────────────────────────────────────────────

export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function setCookie(
  name: string,
  value: string,
  options: {
    days?: number;
    httpOnly?: boolean; // only works server-side; kept for docs
    secure?: boolean;
    sameSite?: 'Strict' | 'Lax' | 'None';
    path?: string;
  } = {}
): void {
  if (typeof document === 'undefined') return;
  const days     = options.days     ?? 7;
  const sameSite = options.sameSite ?? 'Lax';
  const path     = options.path     ?? '/';
  const expires  = new Date(Date.now() + days * 864e5).toUTCString();
  const secure   = options.secure ?? (typeof location !== 'undefined' && location.protocol === 'https:');
  document.cookie =
    `${name}=${encodeURIComponent(value)}; expires=${expires}; path=${path}; SameSite=${sameSite}${secure ? '; Secure' : ''}`;
}

export function deleteCookie(name: string, path = '/'): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}`;
}
