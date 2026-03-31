'use client';
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import DashboardSidebarContent from './DashboardSidebarContent';

export default function DashboardSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <aside className={`hidden md:flex flex-col bg-[#0B0C10] border-r border-white/5 transition-all duration-300 flex-shrink-0 relative ${collapsed ? 'w-16' : 'w-64'}`}>
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-1/2 -translate-y-1/2 z-50 w-6 h-6 bg-[#1A1B21] border border-white/10 rounded-full flex items-center justify-center text-white/40 hover:text-white transition-all">
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>
      <DashboardSidebarContent collapsed={collapsed} />
    </aside>
  );
}
