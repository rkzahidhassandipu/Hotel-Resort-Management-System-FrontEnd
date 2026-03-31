'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, BedDouble, Calendar, CreditCard, ChefHat, Wrench,
  Users, Package, Star, Bell, BarChart3, Settings, LogOut, Shield,
  ClipboardList, ShoppingBag, Building2, Zap, Home,
} from 'lucide-react';
import { authService } from '@/service/auth.service';
import { removeTokens } from '@/lib/tokenUtils';
import { getStoredRefreshToken } from '@/lib/tokenUtils';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import type { Role } from '@/types';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
  roles: Role[];
  group?: string;
}

const NAV_ITEMS: NavItem[] = [
  // ── Overview ────────────────────────────────────────────
  { label: 'Dashboard',    href: '/admin/dashboard',                      icon: LayoutDashboard, roles: ['ADMIN'],                              group: 'Overview'    },
  { label: 'Dashboard',    href: '/manager/dashboard',                    icon: LayoutDashboard, roles: ['MANAGER'],                            group: 'Overview'    },
  { label: 'My Tasks',     href: '/staff/dashboard',                      icon: ClipboardList,   roles: ['STAFF'],                              group: 'Overview'    },
  { label: 'Dashboard',    href: '/customer/dashboard',                   icon: Home,            roles: ['CUSTOMER'],                           group: 'Overview'    },
  { label: 'Work Orders',  href: '/maintenance/dashboard',                icon: Wrench,          roles: ['MAINTENANCE'],                        group: 'Overview'    },
  { label: 'Kitchen',      href: '/chef/dashboard',                       icon: ChefHat,         roles: ['CHEF'],                               group: 'Overview'    },
  // ── Operations ──────────────────────────────────────────
  { label: 'Rooms',        href: '/admin/dashboard/rooms',                icon: BedDouble,       roles: ['ADMIN', 'MANAGER'],                   group: 'Operations'  },
  { label: 'Bookings',     href: '/admin/dashboard/bookings',             icon: Calendar,        roles: ['ADMIN', 'MANAGER'],                   group: 'Operations'  },
  { label: 'Payments',     href: '/admin/dashboard/payments',             icon: CreditCard,      roles: ['ADMIN', 'MANAGER'],                   group: 'Operations'  },
  { label: 'Services',     href: '/admin/dashboard/services',             icon: Zap,             roles: ['ADMIN', 'MANAGER'],                   group: 'Operations'  },
  // ── People ───────────────────────────────────────────────
  { label: 'Staff',        href: '/admin/dashboard/staff',                icon: Users,           roles: ['ADMIN', 'MANAGER'],                   group: 'People'      },
  { label: 'Users',        href: '/admin/dashboard/users',                icon: Shield,          roles: ['ADMIN'],                              group: 'People'      },
  // ── Food ─────────────────────────────────────────────────
  { label: 'Food & Orders',href: '/admin/dashboard/food',                 icon: ChefHat,         roles: ['ADMIN', 'MANAGER'],                   group: 'Food'        },
  { label: 'Orders',       href: '/chef/dashboard/orders',                icon: ShoppingBag,     roles: ['CHEF'],                               group: 'Food'        },
  { label: 'Menu',         href: '/chef/dashboard/menu',                  icon: ChefHat,         roles: ['CHEF'],                               group: 'Food'        },
  // ── Facilities ───────────────────────────────────────────
  { label: 'Maintenance',  href: '/admin/dashboard/maintenance',          icon: Wrench,          roles: ['ADMIN', 'MANAGER'],                   group: 'Facilities'  },
  { label: 'Inventory',    href: '/admin/dashboard/inventory',            icon: Package,         roles: ['ADMIN', 'MANAGER'],                   group: 'Facilities'  },
  // ── Work (Staff / Maintenance) ───────────────────────────
  { label: 'Tasks',        href: '/staff/dashboard/tasks',                icon: ClipboardList,   roles: ['STAFF'],                              group: 'Work'        },
  { label: 'Housekeeping', href: '/maintenance/dashboard/housekeeping',   icon: Building2,       roles: ['MAINTENANCE', 'STAFF'],               group: 'Work'        },
  { label: 'Requests',     href: '/maintenance/dashboard/requests',       icon: ClipboardList,   roles: ['MAINTENANCE'],                        group: 'Work'        },
  // ── Guest ────────────────────────────────────────────────
  { label: 'My Bookings',  href: '/customer/dashboard/bookings',          icon: Calendar,        roles: ['CUSTOMER'],                           group: 'Guest'       },
  { label: 'Room Service', href: '/customer/dashboard/food',              icon: ChefHat,         roles: ['CUSTOMER'],                           group: 'Guest'       },
  { label: 'Services',     href: '/customer/dashboard/services',          icon: Zap,             roles: ['CUSTOMER'],                           group: 'Guest'       },
  { label: 'My Reviews',   href: '/customer/dashboard/reviews',           icon: Star,            roles: ['CUSTOMER'],                           group: 'Guest'       },
  { label: 'Profile',      href: '/customer/dashboard/profile',           icon: Users,           roles: ['CUSTOMER'],                           group: 'Guest'       },
  // ── Insights ─────────────────────────────────────────────
  { label: 'Reviews',      href: '/admin/dashboard/reviews',              icon: Star,            roles: ['ADMIN', 'MANAGER'],                   group: 'Insights'    },
  { label: 'Reports',      href: '/admin/dashboard/reports',              icon: BarChart3,       roles: ['ADMIN', 'MANAGER'],                   group: 'Insights'    },
  // ── Notifications ────────────────────────────────────────
  { label: 'Notifications',href: '/admin/dashboard/notifications',        icon: Bell,            roles: ['ADMIN', 'MANAGER'],                   group: 'Notifications'},
  { label: 'Notifications',href: '/customer/dashboard/notifications',     icon: Bell,            roles: ['CUSTOMER'],                           group: 'Notifications'},
  { label: 'Notifications',href: '/staff/dashboard/notifications',        icon: Bell,            roles: ['STAFF', 'MAINTENANCE', 'CHEF'],       group: 'Notifications'},
  // ── System ───────────────────────────────────────────────
  { label: 'System',       href: '/admin/dashboard/system',               icon: Settings,        roles: ['ADMIN'],                              group: 'System'      },
];

const ROLE_CONFIG: Record<Role, { label: string; color: string; bg: string }> = {
  ADMIN:       { label: 'Administrator', color: '#C8102E', bg: 'rgba(200,16,46,0.12)'   },
  MANAGER:     { label: 'Manager',       color: '#37EFD1', bg: 'rgba(55,239,209,0.12)'  },
  STAFF:       { label: 'Staff',         color: '#60a5fa', bg: 'rgba(96,165,250,0.12)'  },
  CUSTOMER:    { label: 'Guest',         color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
  MAINTENANCE: { label: 'Maintenance',   color: '#fb923c', bg: 'rgba(251,146,60,0.12)'  },
  CHEF:        { label: 'Chef',          color: '#facc15', bg: 'rgba(250,204,21,0.12)'  },
};

export default function DashboardSidebarContent({ collapsed = false }: { collapsed?: boolean }) {
  const pathname   = usePathname();
  const router     = useRouter();
  const { user }   = useCurrentUser();

  // ── Get role from current user (populated from cookie JWT) ──────────────────
  const role: Role   = user?.role ?? 'CUSTOMER';
  const rc           = ROLE_CONFIG[role];
  const userName     = user ? `${user.firstName} ${user.lastName}`.trim() || user.email : '…';
  const initials     = userName.split(' ').filter(Boolean).map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() || '?';

  // Filter nav items to only those allowed for this role, deduplicate hrefs
  const navItems = NAV_ITEMS
    .filter(item => item.roles.includes(role))
    .filter((item, idx, arr) => arr.findIndex(x => x.href === item.href) === idx);

  // Group nav items
  const grouped = navItems.reduce<Record<string, NavItem[]>>((acc, item) => {
    const g = item.group ?? 'Other';
    if (!acc[g]) acc[g] = [];
    acc[g].push(item);
    return acc;
  }, {});

  const handleLogout = async () => {
    try {
      const refreshToken = getStoredRefreshToken();
      await authService.logout(refreshToken ?? undefined);
    } catch {}
    removeTokens();
    router.push('/login');
  };

  return (
    <div className="flex flex-col h-full">
      {/* ── Logo ──────────────────────────────────────────────────────────── */}
      <div className={`flex items-center gap-3 border-b border-white/5 ${collapsed ? 'justify-center px-2 py-5' : 'px-4 py-5'}`}>
        <div className="relative flex-shrink-0">
          <div className="w-9 h-9 rounded-full bg-[#C8102E] flex items-center justify-center shadow-lg shadow-[#C8102E]/30">
            <span className="text-white font-display font-bold text-base">L</span>
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#37EFD1]" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="font-display text-sm text-white font-semibold tracking-widest uppercase leading-none">Lexis</p>
            <p className="text-[#37EFD1] text-[7px] tracking-[0.35em] uppercase font-sans leading-none mt-0.5">Hibiscus Resort</p>
          </div>
        )}
      </div>

      {/* ── User badge ────────────────────────────────────────────────────── */}
      <div className={`border-b border-white/5 ${collapsed ? 'flex justify-center py-3' : 'px-3 py-3'}`}>
        {collapsed ? (
          <div className="w-8 h-8 rounded-full bg-[#C8102E]/20 border border-[#C8102E]/30 flex items-center justify-center text-xs font-display font-semibold text-white">
            {initials}
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#C8102E]/20 border border-[#C8102E]/30 flex items-center justify-center text-sm font-display font-semibold text-white">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white text-sm font-medium truncate">{userName}</p>
              <span className="text-[9px] font-sans px-1.5 py-0.5 rounded-full" style={{ color: rc.color, background: rc.bg }}>
                {rc.label}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── Navigation ────────────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto py-2 px-2 scrollbar-thin">
        {Object.entries(grouped).map(([group, items]) => (
          <div key={group}>
            {!collapsed && (
              <p className="text-white/15 text-[8px] font-sans uppercase tracking-[0.2em] px-3 pt-3 pb-1">{group}</p>
            )}
            {items.map(item => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              const Icon = item.icon;

              if (collapsed) return (
                <Link key={item.href} href={item.href} title={item.label}
                  className={`flex items-center justify-center w-10 h-10 rounded-lg mb-1 transition-all ${
                    isActive ? 'bg-[#C8102E]/15 text-[#37EFD1]' : 'text-white/30 hover:text-white hover:bg-white/5'
                  }`}>
                  <Icon className="h-4 w-4" />
                </Link>
              );

              return (
                <Link key={item.href} href={item.href}
                  className={`relative flex items-center gap-3 px-3 py-2 rounded-lg mb-0.5 text-sm font-sans transition-all ${
                    isActive ? 'bg-[#C8102E]/12 text-[#37EFD1] font-medium' : 'text-white/40 hover:text-white hover:bg-white/5'
                  }`}>
                  {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#C8102E] rounded-full" />}
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* ── Logout ────────────────────────────────────────────────────────── */}
      <div className={`border-t border-white/5 p-2 ${collapsed ? 'flex justify-center' : ''}`}>
        <button onClick={handleLogout}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-white/30 hover:text-[#C8102E] hover:bg-[#C8102E]/8 transition-all text-sm font-sans ${collapsed ? 'justify-center w-10 h-10' : 'w-full'}`}>
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {!collapsed && 'Sign out'}
        </button>
      </div>
    </div>
  );
}
