'use client';
import DashboardMobileSidebar from './DashboardMobileSidebar';
import DashboardNavbarContent from './DashboardNavbarContent';

export default function DashboardNavbar() {
  return (
    <header className="h-14 bg-[#0B0C10] border-b border-white/5 flex items-center gap-4 px-4 flex-shrink-0">
      <DashboardMobileSidebar />
      <div className="flex items-center gap-2 md:hidden">
        <div className="relative">
          <div className="w-7 h-7 rounded-full bg-[#C8102E] flex items-center justify-center">
            <span className="text-white font-display font-bold text-xs">L</span>
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#37EFD1]" />
        </div>
        <span className="text-white text-sm font-display font-semibold tracking-wider">Lexis</span>
      </div>
      <DashboardNavbarContent />
    </header>
  );
}
