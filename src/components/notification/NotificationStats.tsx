// src/app/(admin)/notifications/components/NotificationStats.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { Loader2, Bell, MailCheck, Layers } from 'lucide-react';
import { notificationService } from '@/service/notification.service';

interface StatsData {
  total: number;
  unread: number;
  byType: { type: string; _count: { type: number } }[];
  byChannel: { channel: string; _count: { channel: number } }[];
}

export default function NotificationStats() {
  const { data, isLoading } = useQuery({
    queryKey: ['notification-stats'],
    queryFn: () => notificationService.getStats(),
    select: (res) => res.data?.data as StatsData,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-white/30" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#1A1B21] border border-white/5 rounded-xl p-5 flex items-center gap-4">
          <div className="p-2.5 rounded-lg bg-[#37EFD1]/10">
            <Bell className="h-5 w-5 text-[#37EFD1]" />
          </div>
          <div>
            <p className="text-white/35 text-xs font-sans">Total Sent</p>
            <p className="text-white text-xl font-display font-semibold">{data.total}</p>
          </div>
        </div>
        <div className="bg-[#1A1B21] border border-white/5 rounded-xl p-5 flex items-center gap-4">
          <div className="p-2.5 rounded-lg bg-[#C8102E]/10">
            <MailCheck className="h-5 w-5 text-[#C8102E]" />
          </div>
          <div>
            <p className="text-white/35 text-xs font-sans">Unread</p>
            <p className="text-white text-xl font-display font-semibold">{data.unread}</p>
          </div>
        </div>
        <div className="bg-[#1A1B21] border border-white/5 rounded-xl p-5 flex items-center gap-4">
          <div className="p-2.5 rounded-lg bg-white/5">
            <Layers className="h-5 w-5 text-white/50" />
          </div>
          <div>
            <p className="text-white/35 text-xs font-sans">Channels Used</p>
            <p className="text-white text-xl font-display font-semibold">
              {data.byChannel.length}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#1A1B21] border border-white/5 rounded-xl p-5">
          <p className="text-white/40 text-xs font-sans mb-3">By Type</p>
          <div className="space-y-2">
            {data.byType.map((t) => (
              <div key={t.type} className="flex items-center justify-between">
                <span className="text-white/60 text-sm font-sans">
                  {t.type.replaceAll('_', ' ')}
                </span>
                <span className="text-[#37EFD1] text-sm font-sans font-medium">
                  {t._count.type}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-[#1A1B21] border border-white/5 rounded-xl p-5">
          <p className="text-white/40 text-xs font-sans mb-3">By Channel</p>
          <div className="space-y-2">
            {data.byChannel.map((c) => (
              <div key={c.channel} className="flex items-center justify-between">
                <span className="text-white/60 text-sm font-sans">{c.channel}</span>
                <span className="text-[#37EFD1] text-sm font-sans font-medium">
                  {c._count.channel}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}