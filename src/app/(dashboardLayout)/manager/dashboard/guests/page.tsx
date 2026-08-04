'use client';
import { useState } from 'react';
import { Users, ClipboardList, Building2, LayoutDashboard, Loader2 } from 'lucide-react';
import OverviewTab  from '@/components/guest/OverviewTab';
import VisitorsTab  from '@/components/guest/VisitorsTab';
import InquiriesTab from '@/components/guest/InquiriesTab';
import HotelInfoTab from '@/components/guest/HotelInfoTab';
import { useCurrentUser } from '@/hooks/useCurrentUser';

type Tab = 'overview' | 'visitors' | 'inquiries' | 'hotel-info';

export default function GuestManagementPage() {
  const { user, loading } = useCurrentUser();
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const isAdmin   = user?.role === 'ADMIN';
  const isManager = user?.role === 'MANAGER';
  const isStaff   = user?.role === 'STAFF';

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="h-5 w-5 animate-spin text-white/30" />
    </div>
  );

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'overview',   label: 'Overview',   icon: <LayoutDashboard className="h-3.5 w-3.5" /> },
    { key: 'visitors',   label: 'Visitors',   icon: <Users className="h-3.5 w-3.5" /> },
    // ✅ ADMIN + STAFF দেখবে — MANAGER দেখবে না
    ...(isAdmin || isStaff
      ? [{ key: 'inquiries' as Tab, label: 'Inquiries', icon: <ClipboardList className="h-3.5 w-3.5" /> }]
      : []
    ),
    ...(isAdmin || isManager
    ? [{ key: 'hotel-info' as Tab, label: 'Hotel Info', icon: <Building2 className="h-3.5 w-3.5" /> }]
    : []
  ),
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-white font-semibold">Guest Management</h1>
        <p className="text-white/35 text-sm font-sans mt-0.5">Visitors, inquiries, and hotel information</p>
      </div>

      <div className="flex gap-1 bg-white/5 p-1 rounded-lg w-fit">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-sans transition-all ${
              activeTab === t.key ? 'bg-[#C8102E] text-white' : 'text-white/40 hover:text-white'
            }`}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview'   && <OverviewTab />}
      {activeTab === 'visitors'   && <VisitorsTab />}
      {activeTab === 'inquiries'  && (isAdmin || isStaff) && <InquiriesTab />}
      {activeTab === 'hotel-info' && (isAdmin || isManager) && <HotelInfoTab />}
    </div>
  );
}