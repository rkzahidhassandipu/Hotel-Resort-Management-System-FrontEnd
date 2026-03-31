'use client';
import { Search } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';
import UserDropdown from './UserDropdown';
interface Props { title?: string; }
export default function DashboardNavbarContent({ title = 'Dashboard' }: Props) {
  return (
    <div className="flex items-center gap-4 flex-1">
      <div className="hidden md:flex flex-1 max-w-xs relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/20" />
        <input type="text" placeholder="Search anything..." className="w-full bg-[#1A1B21] border border-white/5 text-white/60 text-xs font-sans pl-9 pr-4 py-2 rounded-lg focus:outline-none focus:border-[#37EFD1]/30 transition-colors placeholder:text-white/20" />
      </div>
      <div className="ml-auto flex items-center gap-3">
        <NotificationDropdown />
        <UserDropdown />
      </div>
    </div>
  );
}
