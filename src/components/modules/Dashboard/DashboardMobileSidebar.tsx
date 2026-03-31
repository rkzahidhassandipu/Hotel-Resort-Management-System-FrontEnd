'use client';
import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import DashboardSidebarContent from './DashboardSidebarContent';

export default function DashboardMobileSidebar() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="md:hidden text-white/60 hover:text-white p-1 transition-colors"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/70 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <aside
        className={`fixed left-0 top-0 bottom-0 z-50 w-64 bg-[#0B0C10] border-r border-white/5 flex flex-col md:hidden transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex justify-end p-3 border-b border-white/5">
          <button
            onClick={() => setOpen(false)}
            className="text-white/40 hover:text-white transition-colors"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {/* Pass collapsed=false for mobile — always show labels */}
        <DashboardSidebarContent collapsed={false} />
      </aside>
    </>
  );
}
