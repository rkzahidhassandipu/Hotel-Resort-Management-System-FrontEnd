// ── app/(admin)/guests/page.tsx ───────────────────────────
'use client';
import { useState } from 'react';
import { Users, ClipboardList, Building2, LayoutDashboard } from 'lucide-react';
import OverviewTab   from '@/components/guest/OverviewTab';
import VisitorsTab   from '@/components/guest/VisitorsTab';
import InquiriesTab  from '@/components/guest/InquiriesTab';
import HotelInfoTab  from '@/components/guest/HotelInfoTab';

type Tab = 'overview' | 'visitors' | 'inquiries' | 'hotel-info';

export default function GuestManagementPage() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'overview',   label: 'Overview',   icon: <LayoutDashboard className="h-3.5 w-3.5" /> },
    { key: 'visitors',   label: 'Visitors',   icon: <Users className="h-3.5 w-3.5" /> },
    { key: 'inquiries',  label: 'Inquiries',  icon: <ClipboardList className="h-3.5 w-3.5" /> },
    { key: 'hotel-info', label: 'Hotel Info', icon: <Building2 className="h-3.5 w-3.5" /> },
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
      {activeTab === 'inquiries'  && <InquiriesTab />}
      {activeTab === 'hotel-info' && <HotelInfoTab />}
    </div>
  );
}