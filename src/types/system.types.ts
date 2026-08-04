// ── types.ts ─────────────────────────────────────────────
// @/types/system.types.ts
export interface LogEntry {
  id: string;
  level: string;
  action?: string;
  resource?: string;
  description?: string;
  message?: string;
  isResolved?: boolean;
  tableName?: string;
  recordId?: string;
  createdAt: string;
  user?: { firstName: string; lastName: string; email: string };
  [key: string]: unknown;
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description?: string;
  _count?: { userPermissions: number; rolePermissions: number };
}

export const LEVEL_COLOR: Record<string, string> = {
  INFO: '#37EFD1', WARNING: '#fb923c',
  ERROR: '#C8102E', CRITICAL: '#ef4444', DEBUG: '#60a5fa',
};

export const inputCls = 'w-full bg-[#0B0C10] border border-white/8 text-white text-sm font-sans px-3 py-2.5 rounded-lg focus:border-[#37EFD1]/40 transition-colors placeholder:text-white/20 outline-none';