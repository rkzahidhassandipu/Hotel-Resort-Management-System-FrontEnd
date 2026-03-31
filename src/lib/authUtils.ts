import type { Role } from '@/types';

// ─── Role → default dashboard route ───────────────────────────────────────────
const ROLE_DASHBOARD: Record<Role, string> = {
  ADMIN:       '/admin/dashboard',
  MANAGER:     '/manager/dashboard',
  STAFF:       '/staff/dashboard',
  CHEF:        '/chef/dashboard',
  MAINTENANCE: '/maintenance/dashboard',
  CUSTOMER:    '/customer/dashboard',
};

export function getDefaultDashboardRoute(role: Role): string {
  return ROLE_DASHBOARD[role] ?? '/customer/dashboard';
}

// ─── Route ownership (which role owns this path prefix) ───────────────────────
// Returns null  → public route (no auth needed)
// Returns role  → only that role can access
// Returns "COMMON" → any authenticated user

const ROLE_PREFIXES: Array<{ prefix: string; owner: Role | 'COMMON' }> = [
  { prefix: '/admin',       owner: 'ADMIN'       },
  { prefix: '/manager',     owner: 'MANAGER'     },
  { prefix: '/staff',       owner: 'STAFF'       },
  { prefix: '/chef',        owner: 'CHEF'        },
  { prefix: '/maintenance', owner: 'MAINTENANCE' },
  { prefix: '/customer',    owner: 'CUSTOMER'    },
  { prefix: '/dashboard',   owner: 'COMMON'      },
];

// Public routes — no login required
const PUBLIC_PREFIXES = ['/', '/auth', '/login', '/register', '/forgot-password', '/verify-email'];
const AUTH_ROUTES     = ['/login', '/register', '/forgot-password', '/auth/login', '/auth/register', '/auth/forgot-password'];

export type RouteOwner = Role | 'COMMON' | null;

export function getRouteOwner(pathname: string): RouteOwner {
  // Exact public roots
  if (pathname === '/') return null;

  // Auth pages
  if (AUTH_ROUTES.some((r) => pathname === r || pathname.startsWith(r + '/'))) return null;

  // Static-style public pages
  if (
    PUBLIC_PREFIXES.some(
      (p) => p !== '/' && (pathname === p || pathname.startsWith(p + '/'))
    )
  )
    return null;

  // Role-based prefixes
  for (const { prefix, owner } of ROLE_PREFIXES) {
    if (pathname === prefix || pathname.startsWith(prefix + '/')) {
      return owner;
    }
  }

  return null; // anything else is public
}

export function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some((r) => pathname === r || pathname.startsWith(r + '/'));
}
