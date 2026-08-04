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

  const role = (user?.role ?? '').toString().trim().toUpperCase();

  const isAdmin   = role === 'ADMIN';
  const isManager = role === 'MANAGER';
  const isStaff   = role === 'STAFF';

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="h-5 w-5 animate-spin text-white/30" />
    </div>
  );

  const canSeeOverview  = !isStaff;               // STAFF দেখবে না
  const canSeeInquiries = isAdmin || isStaff;
  const canSeeHotelInfo = !isStaff && (isAdmin || isManager);

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    ...(canSeeOverview
      ? [{ key: 'overview' as Tab, label: 'Overview', icon: <LayoutDashboard className="h-3.5 w-3.5" /> }]
      : []),
    { key: 'visitors', label: 'Visitors', icon: <Users className="h-3.5 w-3.5" /> },
    ...(canSeeInquiries
      ? [{ key: 'inquiries' as Tab, label: 'Inquiries', icon: <ClipboardList className="h-3.5 w-3.5" /> }]
      : []),
    ...(canSeeHotelInfo
      ? [{ key: 'hotel-info' as Tab, label: 'Hotel Info', icon: <Building2 className="h-3.5 w-3.5" /> }]
      : []),
  ];

  // ✅ default tab role অনুযায়ী ঠিক করা — STAFF এর জন্য 'visitors' দিয়ে শুরু হবে
  const defaultTab: Tab = canSeeOverview ? 'overview' : 'visitors';

  const activeTabAllowed =
    (activeTab === 'overview' && canSeeOverview) ||
    activeTab === 'visitors' ||
    (activeTab === 'inquiries' && canSeeInquiries) ||
    (activeTab === 'hotel-info' && canSeeHotelInfo);

  const safeActiveTab: Tab = activeTabAllowed ? activeTab : defaultTab;

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
              safeActiveTab === t.key ? 'bg-[#C8102E] text-white' : 'text-white/40 hover:text-white'
            }`}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {safeActiveTab === 'overview'   && canSeeOverview && <OverviewTab />}
      {safeActiveTab === 'visitors'   && <VisitorsTab />}
      {safeActiveTab === 'inquiries'  && canSeeInquiries && <InquiriesTab />}
      {safeActiveTab === 'hotel-info' && canSeeHotelInfo && <HotelInfoTab />}
    </div>
  );
}