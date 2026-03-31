'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { authService } from '@/service/auth.service';
import { removeTokens, getStoredRefreshToken } from '@/lib/tokenUtils';
import { useCurrentUser } from '@/hooks/useCurrentUser';

const ROLE_COLORS: Record<string, string> = {
  ADMIN: '#C8102E', MANAGER: '#37EFD1', STAFF: '#60a5fa',
  CUSTOMER: '#a78bfa', MAINTENANCE: '#fb923c', CHEF: '#facc15',
};

const PROFILE_LINKS: Record<string, string> = {
  CUSTOMER: '/customer/dashboard/profile',
  ADMIN:    '/admin/dashboard',
  MANAGER:  '/manager/dashboard',
  STAFF:    '/staff/dashboard',
  CHEF:     '/chef/dashboard',
  MAINTENANCE: '/maintenance/dashboard',
};

export default function UserDropdown() {
  const router     = useRouter();
  const [open, setOpen] = useState(false);
  const { user } = useCurrentUser();

  const name     = user ? `${user.firstName} ${user.lastName}`.trim() || user.email : '…';
  const role     = user?.role ?? 'CUSTOMER';
  const email    = user?.email ?? '';
  const initials = name.split(' ').filter(Boolean).map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() || '?';
  const roleColor = ROLE_COLORS[role] ?? '#94a3b8';

  const handleLogout = async () => {
    setOpen(false);
    try {
      const refreshToken = getStoredRefreshToken();
      await authService.logout(refreshToken ?? undefined);
    } catch {}
    removeTokens();
    router.replace('/login');
  };

  const profileHref = PROFILE_LINKS[role] ?? '/customer/dashboard/profile';

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 group">
        <div className="w-8 h-8 rounded-full bg-[#C8102E]/20 border border-[#C8102E]/30 flex items-center justify-center text-xs font-display font-semibold text-white">
          {initials}
        </div>
        <ChevronDown className={`h-3 w-3 text-white/30 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-10 z-50 w-52 bg-[#1A1B21] border border-white/8 rounded-xl shadow-2xl overflow-hidden">
            {/* User info */}
            <div className="px-4 py-3 border-b border-white/5">
              <p className="text-white text-sm font-sans font-medium">{name}</p>
              <p className="text-white/35 text-[10px] font-sans truncate">{email}</p>
              <span
                className="inline-block mt-1 text-[9px] font-sans px-2 py-0.5 rounded-full"
                style={{ color: roleColor, background: `${roleColor}20` }}
              >
                {role}
              </span>
            </div>

            {/* Menu items */}
            <div className="py-1">
              <Link href={profileHref} onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-white/50 hover:text-white hover:bg-white/3 transition-colors text-sm font-sans">
                <User className="h-4 w-4" />Profile
              </Link>
              <Link href="#" onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-white/50 hover:text-white hover:bg-white/3 transition-colors text-sm font-sans">
                <Settings className="h-4 w-4" />Settings
              </Link>

              <div className="border-t border-white/5 mt-1 pt-1">
                <button onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-2.5 text-[#C8102E]/70 hover:text-[#C8102E] hover:bg-[#C8102E]/5 transition-colors text-sm font-sans w-full">
                  <LogOut className="h-4 w-4" />Sign Out
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
