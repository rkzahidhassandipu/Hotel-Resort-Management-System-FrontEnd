'use client';
import { useState, useEffect, useCallback } from 'react';
import { Activity, Loader2, CheckCircle } from 'lucide-react';
import DataTable, { Column } from '@/components/shared/table/DataTable';
import DataTableFilters from '@/components/shared/table/DataTableFilters';
import DataTablePagination from '@/components/shared/table/DataTablePagination';
import DateCell from '@/components/shared/cell/DateCell';
import StatsCard from '@/components/shared/StatsCard';
import { systemService } from '@/service/system.service';
import type { SystemLog } from '@/types';

export default function AdminSystemPage() {
  const [tab, setTab] = useState<'logs' | 'errors' | 'audit'>('logs');
  const [filters, setFilters] = useState({ level: '' });
  const [page, setPage] = useState(1);
  const [data, setData] = useState<SystemLog[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { page, limit: 10 };
      if (filters.level) params.level = filters.level;
      const [dataRes, statsRes] = await Promise.all([
        tab === 'logs' ? systemService.getLogs(params) : tab === 'errors' ? systemService.getErrors(params) : systemService.getAuditTrail(params),
        systemService.getStats(),
      ]);
      const d = dataRes.data?.data;
      setData(d?.data || d || []);
      setTotal(d?.total || 0);
      setStats(statsRes.data?.data || {});
    } catch { setData([]); }
    setLoading(false);
  }, [page, filters, tab]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const resolveError = async (id: string) => {
    setActionLoading(id);
    try { await systemService.resolveError(id); await fetchData(); } catch {}
    setActionLoading(null);
  };

  const levelColor: Record<string, string> = { INFO: '#37EFD1', WARNING: '#fb923c', ERROR: '#C8102E', CRITICAL: '#C8102E', DEBUG: '#60a5fa' };

const logColumns: Column<SystemLog>[] = [
  { key: 'level', header: 'Level', render: (_, r) => (
      <span
        className="text-xs px-2 py-0.5 rounded font-mono"
        style={{
          color: levelColor[r.level] || '#94a3b8',
          background: (levelColor[r.level] || '#94a3b8') + '20'
        }}
      >
        {r.level}
      </span>
    )
  },
  { key: 'action', header: 'Action', render: (_, r) => <span className="text-white/60 text-xs">{r.action}</span> },
  { key: 'resource', header: 'Resource', render: (_, r) => <span className="text-white/60 text-xs">{r.resource}</span> },
  { key: 'description', header: 'Description', render: (_, r) => <span className="text-white/50 text-xs truncate max-w-64 block">{r.description}</span> },
  { key: 'user', header: 'User', render: (_, r) => r.user ? <span className="text-white/50 text-xs">{r.user.firstName}</span> : <span className="text-white/20 text-xs">System</span> },
  { key: 'createdAt', header: 'Time', render: (_, r) => <DateCell date={r.createdAt} /> },
  ...(tab === 'errors' ? [
    { 
      key: 'id', // just a string
      header: 'Actions',
      render: (_: unknown, r: SystemLog) => (
        <button
          onClick={() => resolveError(r.id)}
          disabled={!!actionLoading}
          className="text-[9px] px-2 py-0.5 rounded border border-[#37EFD1]/30 text-[#37EFD1] hover:bg-[#37EFD1]/10 transition-all"
        >
          <CheckCircle className="h-3 w-3 inline mr-1" />
          {actionLoading === r.id ? '...' : 'Resolve'}
        </button>
      )
    }
  ] : []),
];

  const tabs = [{ key: 'logs', label: 'System Logs' }, { key: 'errors', label: 'Error Logs' }, { key: 'audit', label: 'Audit Trail' }] as const;

  return (
    <div className="space-y-6">
      <div><h1 className="font-display text-2xl text-white font-semibold">System</h1><p className="text-white/35 text-sm font-sans mt-0.5">Monitor system health, logs, and activity</p></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Logs" value={stats.totalLogs || 0} icon={Activity} color="#37EFD1" />
        <StatsCard title="Errors" value={stats.errors || 0} icon={Activity} color="#C8102E" />
        <StatsCard title="Warnings" value={stats.warnings || 0} icon={Activity} color="#fb923c" />
        <StatsCard title="Active Users" value={stats.activeUsers || 0} icon={Activity} color="#60a5fa" />
      </div>
      <div className="bg-[#1A1B21] border border-white/5 rounded-xl p-5">
        <div className="flex items-center gap-1 mb-5 border-b border-white/5 pb-4">
          {tabs.map(t => (
            <button key={t.key} onClick={() => { setTab(t.key); setPage(1); }} className={`px-4 py-1.5 rounded-lg text-sm font-sans transition-all ${tab === t.key ? 'bg-[#C8102E] text-white' : 'text-white/40 hover:text-white hover:bg-white/5'}`}>{t.label}</button>
          ))}
          <div className="ml-auto">
            <DataTableFilters
              filters={[{ key: 'level', label: 'All Levels', options: [{ label: 'Info', value: 'INFO' }, { label: 'Warning', value: 'WARNING' }, { label: 'Error', value: 'ERROR' }, { label: 'Critical', value: 'CRITICAL' }] }]}
              values={filters} onChange={(k, v) => { setFilters(f => ({ ...f, [k]: v })); setPage(1); }} onReset={() => { setFilters({ level: '' }); setPage(1); }} />
          </div>
        </div>
        {loading ? <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-white/30" /></div> : (
          <><DataTable data={data} columns={logColumns} /><DataTablePagination page={page} totalPages={Math.ceil(total / 10)} onPage={setPage} total={total} limit={10} /></>
        )}
      </div>
    </div>
  );
}
