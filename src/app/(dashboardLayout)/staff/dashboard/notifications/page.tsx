'use client';
import { useState, useEffect, useCallback } from 'react';
import { Bell, Loader2, CheckCheck } from 'lucide-react';
import DataTable, { Column } from '@/components/shared/table/DataTable';
import DataTablePagination from '@/components/shared/table/DataTablePagination';
import DateCell from '@/components/shared/cell/DateCell';
import { notificationService } from '@/service/notification.service';
import type { Notification } from '@/types';

export default function StaffNotificationsPage() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Notification[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await notificationService.getMyNotifications({ page, limit: 10 });
      const d = res.data?.data;
      setData(d?.data || d || []);
      setTotal(d?.total || 0);
    } catch { setData([]); }
    setLoading(false);
  }, [page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const markAllRead = async () => {
    try { await notificationService.markAllRead(); await fetchData(); } catch {}
  };

  const columns: Column<Notification>[] = [
    { key: 'title', header: 'Notification', render: (_, r) => (
      <div>
        <p className={`text-sm ${r.isRead ? 'text-white/40' : 'text-white font-medium'}`}>{r.title}</p>
        <p className="text-white/30 text-xs mt-0.5">{r.message}</p>
      </div>
    )},
    { key: 'isRead', header: 'Status', render: (_, r) => <span className={`text-xs px-2 py-0.5 rounded-full ${r.isRead ? 'bg-white/5 text-white/30' : 'bg-[#37EFD1]/10 text-[#37EFD1]'}`}>{r.isRead ? 'Read' : 'Unread'}</span> },
    { key: 'createdAt', header: 'Time', render: (_, r) => <DateCell date={r.createdAt} /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="font-display text-2xl text-white font-semibold">Notifications</h1><p className="text-white/35 text-sm font-sans mt-0.5">Your notifications and alerts</p></div>
        <button onClick={markAllRead} className="flex items-center gap-2 text-[#37EFD1] text-sm font-sans hover:text-[#37EFD1]/70"><CheckCheck className="h-4 w-4" />Mark all read</button>
      </div>
      <div className="bg-[#1A1B21] border border-white/5 rounded-xl p-5">
        {loading ? <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-white/30" /></div> : data.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-3"><Bell className="h-8 w-8 text-white/10" /><p className="text-white/25 text-sm">No notifications</p></div>
        ) : (
          <><DataTable data={data} columns={columns} /><DataTablePagination page={page} totalPages={Math.ceil(total / 10)} onPage={setPage} total={total} limit={10} /></>
        )}
      </div>
    </div>
  );
}
