'use client';
import { useState, useEffect, useCallback } from 'react';
import { Bell, Loader2, Send, Trash2 } from 'lucide-react';
import DataTable, { Column } from '@/components/shared/table/DataTable';
import DataTableSearch from '@/components/shared/table/DataTableSearch';
import DataTableFilters from '@/components/shared/table/DataTableFilters';
import DataTablePagination from '@/components/shared/table/DataTablePagination';
import DateCell from '@/components/shared/cell/DateCell';
import StatsCard from '@/components/shared/StatsCard';
import { notificationService } from '@/service/notification.service';
import type { Notification } from '@/types';

export default function AdminNotificationsPage() {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ type: '' });
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Notification[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { page, limit: 10 };
      if (filters.type) params.type = filters.type;
      const [nRes, sRes] = await Promise.all([notificationService.getMyNotifications(params), notificationService.getStats()]);
      const d = nRes.data?.data;
      setData(d?.data || d || []);
      setTotal(d?.total || 0);
      const rawNS = sRes.data?.data || {};
      setStats({
        total:     Number(rawNS.total  || 0),
        unread:    Number(rawNS.unread || 0),
        today:     0,
        templates: 0,
      });
    } catch { setData([]); }
    setLoading(false);
  }, [page, filters, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async (id: string) => {
    setActionLoading(id);
    try { await notificationService.delete(id); await fetchData(); } catch {}
    setActionLoading(null);
  };

  const typeColor: Record<string, string> = { BOOKING_CONFIRMATION: '#37EFD1', BOOKING_CANCELLATION: '#C8102E', PAYMENT_RECEIVED: '#60a5fa', MAINTENANCE_UPDATE: '#fb923c', GENERAL_ALERT: '#a78bfa' };

  const columns: Column<Notification>[] = [
    { key: 'type', header: 'Type', render: (_, r) => <span className="text-xs px-2 py-0.5 rounded-full font-sans" style={{ color: typeColor[r.type] || '#94a3b8', background: (typeColor[r.type] || '#94a3b8') + '20' }}>{r.type.replace(/_/g, ' ')}</span> },
    { key: 'title', header: 'Title', render: (_, r) => <span className={`text-sm ${r.isRead ? 'text-white/40' : 'text-white'}`}>{r.title}</span> },
    { key: 'message', header: 'Message', render: (_, r) => <span className="text-white/40 text-xs truncate max-w-48 block">{r.message}</span> },
    { key: 'channel', header: 'Channel', render: (_, r) => <span className="text-white/40 text-xs">{r.channel}</span> },
    { key: 'isRead', header: 'Read', render: (_, r) => <span className={`text-xs px-2 py-0.5 rounded-full ${r.isRead ? 'bg-white/5 text-white/30' : 'bg-[#37EFD1]/10 text-[#37EFD1]'}`}>{r.isRead ? 'Read' : 'Unread'}</span> },
    { key: 'createdAt', header: 'Sent', render: (_, r) => <DateCell date={r.createdAt} /> },
    {
      key: 'id', header: 'Actions', render: (_, r) => (
        <button onClick={() => handleDelete(r.id)} disabled={!!actionLoading} className="p-1.5 rounded text-[#C8102E]/50 hover:text-[#C8102E] hover:bg-[#C8102E]/10 transition-colors">
          {actionLoading === r.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
        </button>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="font-display text-2xl text-white font-semibold">Notifications</h1><p className="text-white/35 text-sm font-sans mt-0.5">Manage system notifications</p></div>
        <button className="flex items-center gap-2 bg-[#C8102E] hover:bg-[#a00d24] text-white text-sm font-sans font-medium px-4 py-2 rounded-lg transition-all"><Send className="h-4 w-4" />Broadcast</button>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Sent" value={stats.total || 0} icon={Bell} color="#37EFD1" />
        <StatsCard title="Unread" value={stats.unread || 0} icon={Bell} color="#fb923c" />
        <StatsCard title="Today" value={stats.today || 0} icon={Bell} color="#60a5fa" />
        <StatsCard title="Templates" value={stats.templates || 0} icon={Bell} color="#a78bfa" />
      </div>
      <div className="bg-[#1A1B21] border border-white/5 rounded-xl p-5">
        <div className="flex flex-wrap gap-3 mb-4">
          <DataTableSearch value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search notifications..." />
          <DataTableFilters
            filters={[{ key: 'type', label: 'All Types', options: [{ label: 'Booking', value: 'BOOKING_CONFIRMATION' }, { label: 'Payment', value: 'PAYMENT_RECEIVED' }, { label: 'Maintenance', value: 'MAINTENANCE_UPDATE' }, { label: 'General', value: 'GENERAL_ALERT' }] }]}
            values={filters} onChange={(k, v) => { setFilters(f => ({ ...f, [k]: v })); setPage(1); }} onReset={() => { setFilters({ type: '' }); setPage(1); }} />
        </div>
        {loading ? <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-white/30" /></div> : (
          <><DataTable data={data} columns={columns} /><DataTablePagination page={page} totalPages={Math.ceil(total / 10)} onPage={setPage} total={total} limit={10} /></>
        )}
      </div>
    </div>
  );
}
