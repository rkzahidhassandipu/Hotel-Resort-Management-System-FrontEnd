/**
 * Next.js Middleware — Role-based route protection
 *
 * Runs on the Edge runtime on every matched request.
 * Reads accessToken / refreshToken from cookies (NOT localStorage — middleware
 * cannot access the browser's localStorage).
 *
 * Rules enforced:
 *  1. Logged-in users → cannot visit auth pages (redirect to their dashboard)
 *  2. Unauthenticated users → cannot visit protected routes (redirect to /login)
 *  3. Role-mismatch → /admin/* for non-ADMIN, etc. → redirect to own dashboard
 *  4. Proactive token refresh when token is within 2 min of expiry
 */

import { NextRequest, NextResponse } from 'next/server';
import type { Role } from '@/types';
import { jwtUtils }             from '@/lib/jwtUtils';
import { isTokenExpiringSoon }  from '@/lib/tokenHelpers';   // ← edge-safe, no Buffer/document
import {
  getDefaultDashboardRoute,
  getRouteOwner,
  isAuthRoute,
} from '@/lib/authUtils';

// ─── Proactive token refresh ──────────────────────────────────────────────────
async function refreshAccessToken(
  refreshToken: string
): Promise<{ accessToken: string; refreshToken: string } | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`,
      {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ refreshToken }),
        cache:   'no-store',
      }
    );
    if (!res.ok) return null;
    const json = await res.json();
    const data = json?.data || json;
    if (!data?.accessToken) return null;
    return {
      accessToken:  data.accessToken,
      refreshToken: data.refreshToken ?? refreshToken,
    };
  } catch {
    return null;
  }
}

// ─── Set-cookie helper ────────────────────────────────────────────────────────
function applyTokenCookies(
  response: NextResponse,
  accessToken: string,
  refreshToken: string
): void {
  const isProd = process.env.NODE_ENV === 'production';
  response.cookies.set('accessToken', accessToken, {
    httpOnly: false,   // needs to be readable by client JS for Authorization header
    secure:   isProd,
    sameSite: 'lax',
    maxAge:   60 * 15,           // 15 min (matches JWT exp)
    path:     '/',
  });
  response.cookies.set('refreshToken', refreshToken, {
    httpOnly: false,
    secure:   isProd,
    sameSite: 'lax',
    maxAge:   60 * 60 * 24 * 7, // 7 days
    path:     '/',
  });
}

// ─── Main middleware ──────────────────────────────────────────────────────────
export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  const pathWithQuery = `${pathname}${request.nextUrl.search}`;

  // ── Read tokens from cookies ───────────────────────────────────────────────
  const accessToken  = request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;

  // ── Decode & verify access token ──────────────────────────────────────────
  const verified     = accessToken ? jwtUtils.verifyToken(accessToken) : { success: false, data: null };
  const isValidToken = verified.success;
  let   userRole     = verified.data?.role as Role | null ?? null;

  // ── Route classification ───────────────────────────────────────────────────
  const routeOwner = getRouteOwner(pathname);
  const onAuthPage = isAuthRoute(pathname);

  // ── Proactive refresh: token valid but expiring soon ───────────────────────
  if (isValidToken && accessToken && refreshToken && isTokenExpiringSoon(accessToken)) {
    const refreshed = await refreshAccessToken(refreshToken);
    if (refreshed) {
      const response = NextResponse.next();
      applyTokenCookies(response, refreshed.accessToken, refreshed.refreshToken);
      // Update role from freshly decoded token
      const newVerified = jwtUtils.verifyToken(refreshed.accessToken);
      if (newVerified.success && newVerified.data) {
        userRole = newVerified.data.role as Role;
      }
      return response;
    }
  }

  // ── Rule 1: Authenticated → block access to auth/login pages ──────────────
  if (onAuthPage && isValidToken && userRole) {
    return NextResponse.redirect(
      new URL(getDefaultDashboardRoute(userRole), request.url)
    );
  }

  // ── Rule 2: Public route → allow anyone ───────────────────────────────────
  if (routeOwner === null) {
    return NextResponse.next();
  }

  // ── Rule 3: Protected route, not logged in → redirect to /login ────────────
  if (!accessToken || !isValidToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathWithQuery);
    const response = NextResponse.redirect(loginUrl);
    // Clear any stale / expired cookies
    response.cookies.delete('accessToken');
    response.cookies.delete('refreshToken');
    return response;
  }

  // ── Rule 4: Any authenticated user can access COMMON routes ────────────────
  if (routeOwner === 'COMMON') {
    return NextResponse.next();
  }

  // ── Rule 5: Role-based route — user must match the required role ───────────
  //   /admin/*       → ADMIN only
  //   /manager/*     → MANAGER only
  //   /staff/*       → STAFF only
  //   /chef/*        → CHEF only
  //   /maintenance/* → MAINTENANCE only
  //   /customer/*    → CUSTOMER only
  if (userRole !== routeOwner) {
    // Redirect them silently to their own dashboard instead of 403
    return NextResponse.redirect(
      new URL(getDefaultDashboardRoute(userRole as Role), request.url)
    );
  }

  // ── All checks passed ──────────────────────────────────────────────────────
  return NextResponse.next();
}

// ─── Matcher: run middleware on all routes except static/api ─────────────────
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|\\.well-known).*)',
  ],
};
