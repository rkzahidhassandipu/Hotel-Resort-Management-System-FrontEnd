// ── app/(admin)/system/page.tsx ───────────────────────────
'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Activity, AlertTriangle, Shield } from 'lucide-react';
import StatsCard      from '@/components/shared/StatsCard';
import LogsTab        from '@/components/system/LogsTab';
import PermissionsTab from '@/components/system/PermissionsTab';
import { systemService } from '@/service/system.service';

type MainTab = 'logs' | 'permissions';

export default function AdminSystemPage() {
  const [mainTab, setMainTab] = useState<MainTab>('logs');

  const { data: health } = useQuery({
    queryKey: ['system-health'],
    queryFn: async () => {
      const res = await systemService.healthCheck();
      return res.data?.data ?? res.data;
    },
    refetchInterval: 60_000,
  });

  const { data: statsData } = useQuery({
    queryKey: ['system-stats'],
    queryFn: async () => {
      const res = await systemService.getStats();
      return res.data?.data ?? res.data;
    },
    refetchInterval: 30_000,
  });

  const errorCount = statsData?.errorsByLevel?.find((e: any) => e.level === 'ERROR')?._count?.level   ?? 0;
  const warnCount  = statsData?.errorsByLevel?.find((e: any) => e.level === 'WARNING')?._count?.level ?? 0;

  const mainTabs: { key: MainTab; label: string }[] = [
    { key: 'logs',        label: 'Logs & Audit' },
    { key: 'permissions', label: 'Permissions'  },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-white font-semibold">System</h1>
          <p className="text-white/35 text-sm font-sans mt-0.5">Monitor health, logs, and permissions</p>
        </div>
        {health && (
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-sans ${
            health.status === 'healthy'
              ? 'border-[#37EFD1]/30 bg-[#37EFD1]/10 text-[#37EFD1]'
              : 'border-[#C8102E]/30 bg-[#C8102E]/10 text-[#C8102E]'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${health.status === 'healthy' ? 'bg-[#37EFD1]' : 'bg-[#C8102E]'}`} />
            {health.status === 'healthy' ? 'System Healthy' : 'System Degraded'}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Logs (24h)"      value={statsData?.activity?.last24h ?? 0} icon={Activity}      color="#37EFD1" />
        <StatsCard title="Errors"          value={errorCount}                         icon={AlertTriangle} color="#C8102E" />
        <StatsCard title="Warnings"        value={warnCount}                          icon={AlertTriangle} color="#fb923c" />
        <StatsCard title="Active Sessions" value={health?.users?.activeSessions ?? 0} icon={Shield}        color="#60a5fa" />
      </div>

      {/* Main tabs */}
      <div className="flex gap-0 border-b border-white/5">
        {mainTabs.map(t => (
          <button key={t.key} onClick={() => setMainTab(t.key)}
            className={`px-5 py-2.5 text-sm font-sans transition-all border-b-2 -mb-px ${
              mainTab === t.key ? 'border-[#C8102E] text-white' : 'border-transparent text-white/40 hover:text-white'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {mainTab === 'logs'        && <LogsTab />}
      {mainTab === 'permissions' && <PermissionsTab />}
    </div>
  );
}