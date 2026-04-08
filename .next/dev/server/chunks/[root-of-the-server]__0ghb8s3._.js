module.exports = [
"[externals]/next/dist/build/adapter/setup-node-env.external.js [external] (next/dist/build/adapter/setup-node-env.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/build/adapter/setup-node-env.external.js", () => require("next/dist/build/adapter/setup-node-env.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/lib/incremental-cache/tags-manifest.external.js [external] (next/dist/server/lib/incremental-cache/tags-manifest.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/lib/incremental-cache/tags-manifest.external.js", () => require("next/dist/server/lib/incremental-cache/tags-manifest.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/node:async_hooks [external] (node:async_hooks, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[externals]/next/dist/server/lib/incremental-cache/memory-cache.external.js [external] (next/dist/server/lib/incremental-cache/memory-cache.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/lib/incremental-cache/memory-cache.external.js", () => require("next/dist/server/lib/incremental-cache/memory-cache.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/lib/incremental-cache/shared-cache-controls.external.js [external] (next/dist/server/lib/incremental-cache/shared-cache-controls.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/lib/incremental-cache/shared-cache-controls.external.js", () => require("next/dist/server/lib/incremental-cache/shared-cache-controls.external.js"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/src/lib/jwtUtils.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "decodeJwt",
    ()=>decodeJwt,
    "jwtUtils",
    ()=>jwtUtils
]);
function decodeJwt(token) {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
        // Works in both Node (Buffer) and browser (atob)
        const json = typeof Buffer !== 'undefined' ? Buffer.from(padded, 'base64').toString('utf-8') : decodeURIComponent(atob(padded).split('').map((c)=>'%' + c.charCodeAt(0).toString(16).padStart(2, '0')).join(''));
        return JSON.parse(json);
    } catch  {
        return null;
    }
}
const jwtUtils = {
    /** Check token validity: decode + expiry (edge-runtime safe) */ verifyToken (token, _secret) {
        try {
            const payload = decodeJwt(token);
            if (!payload) return {
                success: false,
                data: null
            };
            if (Date.now() >= payload.exp * 1000) return {
                success: false,
                data: null
            };
            return {
                success: true,
                data: payload
            };
        } catch  {
            return {
                success: false,
                data: null
            };
        }
    }
};
}),
"[project]/src/lib/tokenHelpers.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Edge-runtime safe token helpers.
 * No Node.js APIs (Buffer etc) — uses only Web-compatible primitives.
 * Safe to import from Next.js middleware.
 */ /** Decode JWT payload — edge/browser/Node safe */ __turbopack_context__.s([
    "decodeJwtPayload",
    ()=>decodeJwtPayload,
    "isTokenExpiringSoon",
    ()=>isTokenExpiringSoon
]);
function decodeJwtPayload(token) {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
        // atob is available in all edge runtimes (V8, Deno, Workers, Next.js middleware)
        const json = decodeURIComponent(atob(padded).split('').map((c)=>'%' + c.charCodeAt(0).toString(16).padStart(2, '0')).join(''));
        return JSON.parse(json);
    } catch  {
        return null;
    }
}
function isTokenExpiringSoon(token, thresholdSeconds = 120) {
    const payload = decodeJwtPayload(token);
    if (!payload || typeof payload.exp !== 'number') return true;
    const remainingMs = payload.exp * 1000 - Date.now();
    return remainingMs < thresholdSeconds * 1000;
}
}),
"[project]/src/lib/authUtils.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getDefaultDashboardRoute",
    ()=>getDefaultDashboardRoute,
    "getRouteOwner",
    ()=>getRouteOwner,
    "isAuthRoute",
    ()=>isAuthRoute
]);
// ─── Role → default dashboard route ───────────────────────────────────────────
const ROLE_DASHBOARD = {
    ADMIN: '/admin/dashboard',
    MANAGER: '/manager/dashboard',
    STAFF: '/staff/dashboard',
    CHEF: '/chef/dashboard',
    MAINTENANCE: '/maintenance/dashboard',
    CUSTOMER: '/customer/dashboard'
};
function getDefaultDashboardRoute(role) {
    return ROLE_DASHBOARD[role] ?? '/customer/dashboard';
}
// ─── Route ownership (which role owns this path prefix) ───────────────────────
// Returns null  → public route (no auth needed)
// Returns role  → only that role can access
// Returns "COMMON" → any authenticated user
const ROLE_PREFIXES = [
    {
        prefix: '/admin',
        owner: 'ADMIN'
    },
    {
        prefix: '/manager',
        owner: 'MANAGER'
    },
    {
        prefix: '/staff',
        owner: 'STAFF'
    },
    {
        prefix: '/chef',
        owner: 'CHEF'
    },
    {
        prefix: '/maintenance',
        owner: 'MAINTENANCE'
    },
    {
        prefix: '/customer',
        owner: 'CUSTOMER'
    },
    {
        prefix: '/dashboard',
        owner: 'COMMON'
    }
];
// Public routes — no login required
const PUBLIC_PREFIXES = [
    '/',
    '/auth',
    '/login',
    '/register',
    '/forgot-password',
    '/verify-email'
];
const AUTH_ROUTES = [
    '/login',
    '/register',
    '/forgot-password',
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password'
];
function getRouteOwner(pathname) {
    // Exact public roots
    if (pathname === '/') return null;
    // Auth pages
    if (AUTH_ROUTES.some((r)=>pathname === r || pathname.startsWith(r + '/'))) return null;
    // Static-style public pages
    if (PUBLIC_PREFIXES.some((p)=>p !== '/' && (pathname === p || pathname.startsWith(p + '/')))) return null;
    // Role-based prefixes
    for (const { prefix, owner } of ROLE_PREFIXES){
        if (pathname === prefix || pathname.startsWith(prefix + '/')) {
            return owner;
        }
    }
    return null; // anything else is public
}
function isAuthRoute(pathname) {
    return AUTH_ROUTES.some((r)=>pathname === r || pathname.startsWith(r + '/'));
}
}),
"[project]/src/proxy.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "config",
    ()=>config,
    "proxy",
    ()=>proxy
]);
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
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jwtUtils$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/jwtUtils.ts [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$tokenHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/tokenHelpers.ts [middleware] (ecmascript)"); // ← edge-safe, no Buffer/document
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$authUtils$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/authUtils.ts [middleware] (ecmascript)");
;
;
;
;
// ─── Proactive token refresh ──────────────────────────────────────────────────
async function refreshAccessToken(refreshToken) {
    try {
        const res = await fetch(`${("TURBOPACK compile-time value", "https://hotel-backend-refactored.vercel.app/api/v1")}/auth/refresh-token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                refreshToken
            }),
            cache: 'no-store'
        });
        if (!res.ok) return null;
        const json = await res.json();
        const data = json?.data || json;
        if (!data?.accessToken) return null;
        return {
            accessToken: data.accessToken,
            refreshToken: data.refreshToken ?? refreshToken
        };
    } catch  {
        return null;
    }
}
// ─── Set-cookie helper ────────────────────────────────────────────────────────
function applyTokenCookies(response, accessToken, refreshToken) {
    const isProd = ("TURBOPACK compile-time value", "development") === 'production';
    response.cookies.set('accessToken', accessToken, {
        httpOnly: false,
        secure: isProd,
        sameSite: 'lax',
        maxAge: 60 * 15,
        path: '/'
    });
    response.cookies.set('refreshToken', refreshToken, {
        httpOnly: false,
        secure: isProd,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/'
    });
}
async function proxy(request) {
    const { pathname } = request.nextUrl;
    const pathWithQuery = `${pathname}${request.nextUrl.search}`;
    // ── Read tokens from cookies ───────────────────────────────────────────────
    const accessToken = request.cookies.get('accessToken')?.value;
    const refreshToken = request.cookies.get('refreshToken')?.value;
    // ── Decode & verify access token ──────────────────────────────────────────
    const verified = accessToken ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jwtUtils$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["jwtUtils"].verifyToken(accessToken) : {
        success: false,
        data: null
    };
    const isValidToken = verified.success;
    let userRole = verified.data?.role ?? null;
    // ── Route classification ───────────────────────────────────────────────────
    const routeOwner = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$authUtils$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["getRouteOwner"])(pathname);
    const onAuthPage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$authUtils$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["isAuthRoute"])(pathname);
    // ── Proactive refresh: token valid but expiring soon ───────────────────────
    if (isValidToken && accessToken && refreshToken && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$tokenHelpers$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["isTokenExpiringSoon"])(accessToken)) {
        const refreshed = await refreshAccessToken(refreshToken);
        if (refreshed) {
            const response = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["NextResponse"].next();
            applyTokenCookies(response, refreshed.accessToken, refreshed.refreshToken);
            // Update role from freshly decoded token
            const newVerified = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$jwtUtils$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["jwtUtils"].verifyToken(refreshed.accessToken);
            if (newVerified.success && newVerified.data) {
                userRole = newVerified.data.role;
            }
            return response;
        }
    }
    // ── Rule 1: Authenticated → block access to auth/login pages ──────────────
    if (onAuthPage && isValidToken && userRole) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$authUtils$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["getDefaultDashboardRoute"])(userRole), request.url));
    }
    // ── Rule 2: Public route → allow anyone ───────────────────────────────────
    if (routeOwner === null) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["NextResponse"].next();
    }
    // ── Rule 3: Protected route, not logged in → redirect to /login ────────────
    if (!accessToken || !isValidToken) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathWithQuery);
        const response = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["NextResponse"].redirect(loginUrl);
        // Clear any stale / expired cookies
        response.cookies.delete('accessToken');
        response.cookies.delete('refreshToken');
        return response;
    }
    // ── Rule 4: Any authenticated user can access COMMON routes ────────────────
    if (routeOwner === 'COMMON') {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["NextResponse"].next();
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
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$authUtils$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["getDefaultDashboardRoute"])(userRole), request.url));
    }
    // ── All checks passed ──────────────────────────────────────────────────────
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["NextResponse"].next();
}
const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|\\.well-known).*)'
    ]
};
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0ghb8s3._.js.map