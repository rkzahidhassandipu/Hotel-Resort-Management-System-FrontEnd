(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/lib/cookieUtils.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// ─── Client-side cookie helpers ────────────────────────────────────────────────
__turbopack_context__.s([
    "deleteCookie",
    ()=>deleteCookie,
    "getCookie",
    ()=>getCookie,
    "setCookie",
    ()=>setCookie
]);
function getCookie(name) {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : null;
}
function setCookie(name, value, options = {}) {
    if (typeof document === 'undefined') return;
    const days = options.days ?? 7;
    const sameSite = options.sameSite ?? 'Lax';
    const path = options.path ?? '/';
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    const secure = options.secure ?? (typeof location !== 'undefined' && location.protocol === 'https:');
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=${path}; SameSite=${sameSite}${secure ? '; Secure' : ''}`;
}
function deleteCookie(name, path = '/') {
    if (typeof document === 'undefined') return;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}`;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/axios/httpClient.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/axios/lib/axios.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$cookieUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/cookieUtils.ts [app-client] (ecmascript)");
;
;
const httpClient = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].create({
    baseURL: ("TURBOPACK compile-time value", "https://hotel-backend-refactored.vercel.app/api/v1"),
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true
});
// ── Request interceptor: attach accessToken from cookie ────────────────────────
httpClient.interceptors.request.use((config)=>{
    const token = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$cookieUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getCookie"])('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});
// ── Response interceptor: auto-refresh on 401 ─────────────────────────────────
httpClient.interceptors.response.use((res)=>res, async (error)=>{
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
        original._retry = true;
        const refreshToken = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$cookieUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getCookie"])('refreshToken');
        if (refreshToken) {
            try {
                const res = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post(`${("TURBOPACK compile-time value", "https://hotel-backend-refactored.vercel.app/api/v1")}/auth/refresh-token`, {
                    refreshToken
                }, {
                    withCredentials: true
                });
                const { accessToken, refreshToken: newRefresh } = res.data?.data || res.data;
                // Save refreshed tokens back to cookies
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$cookieUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setCookie"])('accessToken', accessToken, {
                    days: 1,
                    sameSite: 'Lax'
                });
                if (newRefresh) {
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$cookieUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setCookie"])('refreshToken', newRefresh, {
                        days: 7,
                        sameSite: 'Lax'
                    });
                }
                original.headers.Authorization = `Bearer ${accessToken}`;
                return httpClient(original);
            } catch  {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$cookieUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deleteCookie"])('accessToken');
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$cookieUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deleteCookie"])('refreshToken');
                if ("TURBOPACK compile-time truthy", 1) window.location.href = '/login';
            }
        } else {
            if ("TURBOPACK compile-time truthy", 1) window.location.href = '/login';
        }
    }
    return Promise.reject(error);
});
const __TURBOPACK__default__export__ = httpClient;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/service/auth.service.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "authService",
    ()=>authService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$axios$2f$httpClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/axios/httpClient.ts [app-client] (ecmascript)");
;
const authService = {
    login: (data)=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$axios$2f$httpClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post('/auth/login', data),
    login2fa: (data)=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$axios$2f$httpClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post('/auth/login/2fa', data),
    register: (data)=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$axios$2f$httpClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post('/auth/register', data),
    logout: (refreshToken)=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$axios$2f$httpClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post('/auth/logout', {
            refreshToken
        }),
    logoutAll: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$axios$2f$httpClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post('/auth/logout-all'),
    forgotPassword: (email)=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$axios$2f$httpClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post('/auth/forgot-password', {
            email
        }),
    resetPassword: (token, password)=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$axios$2f$httpClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post('/auth/reset-password', {
            token,
            password
        }),
    verifyEmail: (token)=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$axios$2f$httpClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post('/auth/verify-email', {
            token
        }),
    resendVerifyEmail: (email)=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$axios$2f$httpClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post('/auth/resend-verify-email', {
            email
        }),
    me: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$axios$2f$httpClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get('/auth/me'),
    changePassword: (data)=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$axios$2f$httpClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].put('/auth/change-password', data),
    refreshToken: (refreshToken)=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$axios$2f$httpClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post('/auth/refresh-token', {
            refreshToken
        }),
    getSessions: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$axios$2f$httpClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get('/auth/sessions'),
    revokeSession: (sessionId)=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$axios$2f$httpClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].delete(`/auth/sessions/${sessionId}`),
    setup2fa: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$axios$2f$httpClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post('/auth/2fa/setup'),
    enable2fa: (token)=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$axios$2f$httpClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post('/auth/2fa/enable', {
            token
        }),
    disable2fa: (token)=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$axios$2f$httpClient$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].post('/auth/2fa/disable', {
            token
        })
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/tokenUtils.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getStoredAccessToken",
    ()=>getStoredAccessToken,
    "getStoredRefreshToken",
    ()=>getStoredRefreshToken,
    "isTokenExpiringSoon",
    ()=>isTokenExpiringSoon,
    "removeTokens",
    ()=>removeTokens,
    "storeTokens",
    ()=>storeTokens
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$buffer$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/compiled/buffer/index.js [app-client] (ecmascript)");
/**
 * Token utilities — stores tokens in cookies (NOT localStorage) so that
 * Next.js middleware can read them and enforce role-based routing.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$cookieUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/cookieUtils.ts [app-client] (ecmascript)");
;
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
function storeTokens(accessToken, refreshToken) {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$cookieUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setCookie"])(ACCESS_TOKEN_KEY, accessToken, {
        days: 1,
        sameSite: 'Lax'
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$cookieUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setCookie"])(REFRESH_TOKEN_KEY, refreshToken, {
        days: 7,
        sameSite: 'Lax'
    });
}
function getStoredAccessToken() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$cookieUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getCookie"])(ACCESS_TOKEN_KEY);
}
function getStoredRefreshToken() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$cookieUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getCookie"])(REFRESH_TOKEN_KEY);
}
function removeTokens() {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$cookieUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deleteCookie"])(ACCESS_TOKEN_KEY);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$cookieUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deleteCookie"])(REFRESH_TOKEN_KEY);
}
async function isTokenExpiringSoon(token, thresholdSeconds = 120) {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return true;
        const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=');
        const json = typeof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$buffer$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Buffer"] !== 'undefined' ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$buffer$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Buffer"].from(padded, 'base64').toString('utf-8') : decodeURIComponent(atob(padded).split('').map((c)=>'%' + c.charCodeAt(0).toString(16).padStart(2, '0')).join(''));
        const payload = JSON.parse(json);
        const remainingMs = payload.exp * 1000 - Date.now();
        return remainingMs < thresholdSeconds * 1000;
    } catch  {
        return true;
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/authUtils.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/modules/Auth/loginForm.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>LoginForm
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/eye.js [app-client] (ecmascript) <export default as Eye>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2d$off$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__EyeOff$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/eye-off.js [app-client] (ecmascript) <export default as EyeOff>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-client] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mail$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Mail$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/mail.js [app-client] (ecmascript) <export default as Mail>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Lock$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/lock.js [app-client] (ecmascript) <export default as Lock>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-right.js [app-client] (ecmascript) <export default as ArrowRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-alert.js [app-client] (ecmascript) <export default as AlertCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$service$2f$auth$2e$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/service/auth.service.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$tokenUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/tokenUtils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$authUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/authUtils.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
;
function LoginForm() {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const searchParams = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"])();
    const [showPw, setShowPw] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [form, setForm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        email: '',
        password: ''
    });
    const handleSubmit = async (e)=>{
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$service$2f$auth$2e$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["authService"].login(form);
            const { accessToken, refreshToken, user } = res.data?.data || res.data;
            // ✅ Save tokens in COOKIES (readable by Next.js middleware)
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$tokenUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["storeTokens"])(accessToken, refreshToken);
            // Redirect: use ?redirect param if present, otherwise go to role dashboard
            const redirectTo = searchParams.get('redirect');
            const roleDashboard = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$authUtils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDefaultDashboardRoute"])(user?.role ?? 'CUSTOMER');
            router.replace(redirectTo || roleDashboard);
        } catch (err) {
            const msg = err?.response?.data?.message || 'Invalid credentials. Please try again.';
            setError(msg);
        } finally{
            setLoading(false);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-[#0B0C10] flex items-center justify-center relative overflow-hidden",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#C8102E]/6 blur-[120px] pointer-events-none"
            }, void 0, false, {
                fileName: "[project]/src/components/modules/Auth/loginForm.tsx",
                lineNumber: 47,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-[#37EFD1]/5 blur-[100px] pointer-events-none"
            }, void 0, false, {
                fileName: "[project]/src/components/modules/Auth/loginForm.tsx",
                lineNumber: 48,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 opacity-3",
                style: {
                    backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.02) 0, rgba(255,255,255,0.02) 1px, transparent 0, transparent 50%)',
                    backgroundSize: '20px 20px'
                }
            }, void 0, false, {
                fileName: "[project]/src/components/modules/Auth/loginForm.tsx",
                lineNumber: 49,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "w-full max-w-md px-4 relative z-10",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-center mb-10",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "inline-flex items-center justify-center mb-4",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "relative",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "w-14 h-14 rounded-full bg-[#C8102E] flex items-center justify-center shadow-2xl shadow-[#C8102E]/40",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-white font-display font-bold text-2xl",
                                                children: "L"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/modules/Auth/loginForm.tsx",
                                                lineNumber: 56,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/modules/Auth/loginForm.tsx",
                                            lineNumber: 55,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#37EFD1]"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/modules/Auth/loginForm.tsx",
                                            lineNumber: 58,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/modules/Auth/loginForm.tsx",
                                    lineNumber: 54,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/modules/Auth/loginForm.tsx",
                                lineNumber: 53,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: "font-display text-3xl text-white font-semibold",
                                children: "LEXIS Hibiscus"
                            }, void 0, false, {
                                fileName: "[project]/src/components/modules/Auth/loginForm.tsx",
                                lineNumber: 61,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-white/35 text-sm font-sans mt-1 tracking-wider",
                                children: "Management Portal"
                            }, void 0, false, {
                                fileName: "[project]/src/components/modules/Auth/loginForm.tsx",
                                lineNumber: 62,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/modules/Auth/loginForm.tsx",
                        lineNumber: 52,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-[#1A1B21] border border-white/8 rounded-2xl overflow-hidden",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "h-px bg-gradient-to-r from-transparent via-[#C8102E]/50 to-transparent"
                            }, void 0, false, {
                                fileName: "[project]/src/components/modules/Auth/loginForm.tsx",
                                lineNumber: 66,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "p-8",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "font-display text-xl text-white font-semibold mb-1",
                                        children: "Sign In"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/modules/Auth/loginForm.tsx",
                                        lineNumber: 68,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-white/35 text-sm font-sans mb-6",
                                        children: "Enter your credentials to access the dashboard"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/modules/Auth/loginForm.tsx",
                                        lineNumber: 69,
                                        columnNumber: 13
                                    }, this),
                                    error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-2 bg-[#C8102E]/10 border border-[#C8102E]/20 rounded-lg px-3 py-2.5 mb-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__["AlertCircle"], {
                                                className: "h-4 w-4 text-[#C8102E] shrink-0"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/modules/Auth/loginForm.tsx",
                                                lineNumber: 73,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-[#C8102E] text-xs font-sans",
                                                children: error
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/modules/Auth/loginForm.tsx",
                                                lineNumber: 74,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/modules/Auth/loginForm.tsx",
                                        lineNumber: 72,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                                        onSubmit: handleSubmit,
                                        className: "space-y-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "text-white/50 text-xs font-sans uppercase tracking-widest mb-1.5 block",
                                                        children: "Email Address"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/modules/Auth/loginForm.tsx",
                                                        lineNumber: 80,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "relative",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mail$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Mail$3e$__["Mail"], {
                                                                className: "absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/modules/Auth/loginForm.tsx",
                                                                lineNumber: 84,
                                                                columnNumber: 19
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                type: "email",
                                                                required: true,
                                                                value: form.email,
                                                                onChange: (e)=>setForm((f)=>({
                                                                            ...f,
                                                                            email: e.target.value
                                                                        })),
                                                                className: "w-full bg-[#0B0C10] border border-white/8 text-white text-sm font-sans pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:border-[#37EFD1]/40 transition-colors placeholder:text-white/20",
                                                                placeholder: "you@lexishibiscus.com"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/modules/Auth/loginForm.tsx",
                                                                lineNumber: 85,
                                                                columnNumber: 19
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/modules/Auth/loginForm.tsx",
                                                        lineNumber: 83,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/modules/Auth/loginForm.tsx",
                                                lineNumber: 79,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center justify-between mb-1.5",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                className: "text-white/50 text-xs font-sans uppercase tracking-widest",
                                                                children: "Password"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/modules/Auth/loginForm.tsx",
                                                                lineNumber: 97,
                                                                columnNumber: 19
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                                href: "/forgot-password",
                                                                className: "text-[#37EFD1]/70 text-xs font-sans hover:text-[#37EFD1] transition-colors",
                                                                children: "Forgot?"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/modules/Auth/loginForm.tsx",
                                                                lineNumber: 98,
                                                                columnNumber: 19
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/modules/Auth/loginForm.tsx",
                                                        lineNumber: 96,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "relative",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Lock$3e$__["Lock"], {
                                                                className: "absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/modules/Auth/loginForm.tsx",
                                                                lineNumber: 103,
                                                                columnNumber: 19
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                type: showPw ? 'text' : 'password',
                                                                required: true,
                                                                value: form.password,
                                                                onChange: (e)=>setForm((f)=>({
                                                                            ...f,
                                                                            password: e.target.value
                                                                        })),
                                                                className: "w-full bg-[#0B0C10] border border-white/8 text-white text-sm font-sans pl-10 pr-10 py-3 rounded-lg focus:outline-none focus:border-[#37EFD1]/40 transition-colors placeholder:text-white/20",
                                                                placeholder: "••••••••"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/modules/Auth/loginForm.tsx",
                                                                lineNumber: 104,
                                                                columnNumber: 19
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                type: "button",
                                                                onClick: ()=>setShowPw(!showPw),
                                                                className: "absolute right-3.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors",
                                                                children: showPw ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2d$off$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__EyeOff$3e$__["EyeOff"], {
                                                                    className: "h-4 w-4"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/modules/Auth/loginForm.tsx",
                                                                    lineNumber: 113,
                                                                    columnNumber: 31
                                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__["Eye"], {
                                                                    className: "h-4 w-4"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/modules/Auth/loginForm.tsx",
                                                                    lineNumber: 113,
                                                                    columnNumber: 64
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/modules/Auth/loginForm.tsx",
                                                                lineNumber: 111,
                                                                columnNumber: 19
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/modules/Auth/loginForm.tsx",
                                                        lineNumber: 102,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/modules/Auth/loginForm.tsx",
                                                lineNumber: 95,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "submit",
                                                disabled: loading,
                                                className: "w-full bg-[#C8102E] hover:bg-[#a00d24] disabled:opacity-60 text-white font-sans font-medium py-3 rounded-lg transition-all hover:shadow-lg hover:shadow-[#C8102E]/25 flex items-center justify-center gap-2 mt-2",
                                                children: loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                                    className: "h-4 w-4 animate-spin"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/modules/Auth/loginForm.tsx",
                                                    lineNumber: 121,
                                                    columnNumber: 21
                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            children: "Sign In"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/modules/Auth/loginForm.tsx",
                                                            lineNumber: 122,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__["ArrowRight"], {
                                                            className: "h-4 w-4"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/modules/Auth/loginForm.tsx",
                                                            lineNumber: 122,
                                                            columnNumber: 43
                                                        }, this)
                                                    ]
                                                }, void 0, true)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/modules/Auth/loginForm.tsx",
                                                lineNumber: 118,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/modules/Auth/loginForm.tsx",
                                        lineNumber: 78,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-center text-white/30 text-xs font-sans mt-6",
                                        children: [
                                            "Don't have an account?",
                                            ' ',
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                href: "/auth/register",
                                                className: "text-[#37EFD1] hover:text-[#37EFD1]/80 transition-colors font-medium",
                                                children: "Register"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/modules/Auth/loginForm.tsx",
                                                lineNumber: 129,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/modules/Auth/loginForm.tsx",
                                        lineNumber: 127,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/modules/Auth/loginForm.tsx",
                                lineNumber: 67,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/modules/Auth/loginForm.tsx",
                        lineNumber: 65,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-center text-white/15 text-xs font-sans mt-6",
                        children: [
                            "© ",
                            new Date().getFullYear(),
                            " Lexis Hibiscus Port Dickson"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/modules/Auth/loginForm.tsx",
                        lineNumber: 136,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/modules/Auth/loginForm.tsx",
                lineNumber: 51,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/modules/Auth/loginForm.tsx",
        lineNumber: 46,
        columnNumber: 5
    }, this);
}
_s(LoginForm, "Gfz9797xYrMM4XsgcnJtUCSGlOs=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"]
    ];
});
_c = LoginForm;
var _c;
__turbopack_context__.k.register(_c, "LoginForm");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_10t5cgr._.js.map