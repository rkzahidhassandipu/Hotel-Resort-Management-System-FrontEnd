// ── components/guest/OverviewTab.tsx ─────────────────────
'use client';
import { useQuery } from '@tanstack/react-query';
import { Users, ClipboardList, Loader2 } from 'lucide-react';
import { UserPlus } from 'lucide-react';
import StatsCard from '@/components/shared/StatsCard';
import { guestService } from '@/service/guest.service';

export default function OverviewTab() {
  const { data, isLoading } = useQuery({
    queryKey: ['guest-stats'],
    queryFn: async () => {
      const res = await guestService.getStats();
      return res.data?.data;
    },
  });

  if (isLoading) return (
    <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-white/30" /></div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Visitors"  value={data?.visitors?.total      ?? 0} icon={Users}         color="#37EFD1" />
        <StatsCard title="Converted"       value={data?.visitors?.converted  ?? 0} icon={UserPlus}      color="#60a5fa" />
        <StatsCard title="Total Inquiries" value={data?.inquiries?.total     ?? 0} icon={ClipboardList} color="#fb923c" />
        <StatsCard title="Unresolved"      value={data?.inquiries?.unresolved ?? 0} icon={ClipboardList} color="#C8102E" />
      </div>

      <div className="bg-[#1A1B21] border border-white/5 rounded-xl p-5">
        <h3 className="text-white font-display text-base font-semibold mb-4">Conversion Rate</h3>
        <div className="flex items-center gap-4">
          <div className="flex-1 bg-white/5 rounded-full h-3 overflow-hidden">
            <div className="h-full bg-[#37EFD1] rounded-full transition-all" style={{ width: data?.visitors?.conversionRate ?? '0%' }} />
          </div>
          <span className="text-[#37EFD1] text-lg font-display font-semibold">{data?.visitors?.conversionRate ?? '0%'}</span>
        </div>
        <p className="text-white/30 text-xs font-sans mt-2">
          {data?.visitors?.converted ?? 0} out of {data?.visitors?.total ?? 0} visitors converted to customers
        </p>
      </div>
    </div>
  );
}