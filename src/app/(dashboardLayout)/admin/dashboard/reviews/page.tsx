'use client';
import { useState, useEffect, useCallback } from 'react';
import { Star, Loader2, CheckCircle, XCircle } from 'lucide-react';
import DataTable, { Column } from '@/components/shared/table/DataTable';
import DataTableSearch from '@/components/shared/table/DataTableSearch';
import DataTableFilters from '@/components/shared/table/DataTableFilters';
import DataTablePagination from '@/components/shared/table/DataTablePagination';
import StatusBadgeCell from '@/components/shared/cell/StatusBadgeCell';
import DateCell from '@/components/shared/cell/DateCell';
import StatsCard from '@/components/shared/StatsCard';
import { reviewService } from '@/service/review.service';
import type { Review } from '@/types';
import { parseReviewStats } from '@/lib/statsUtils';

export default function AdminReviewsPage() {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: '' });
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Review[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { page, limit: 10 };
      if (search) params.search = search;
      if (filters.status) params.status = filters.status;
      const [rRes, statsRes] = await Promise.all([reviewService.getAll(params), reviewService.getStats()]);
      const d = rRes.data?.data;
      setData(d?.data || d || []);
      setTotal(d?.total || 0);
      setStats(parseReviewStats(statsRes.data?.data || {}));
    } catch { setData([]); }
    setLoading(false);
  }, [page, search, filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const moderate = async (id: string, status: string) => {
    setActionLoading(id + status);
    try { await reviewService.moderate(id, status); await fetchData(); } catch {}
    setActionLoading(null);
  };

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(s => <Star key={s} className={`h-3 w-3 ${s <= rating ? 'text-[#fb923c] fill-[#fb923c]' : 'text-white/10'}`} />)}
      <span className="text-white/50 text-xs ml-1">{rating.toFixed(1)}</span>
    </div>
  );

  const columns: Column<Review>[] = [
    { key: 'user', header: 'Guest', render: (_, r) => r.user ? <span className="text-white text-sm">{r.isAnonymous ? 'Anonymous' : `${r.user.firstName} ${r.user.lastName}`}</span> : <span className="text-white/40">—</span> },
    { key: 'overallRating', header: 'Rating', render: (_, r) => renderStars(r.overallRating) },
    { key: 'title', header: 'Title', render: (_, r) => <span className="text-white/70 text-sm">{r.title || '—'}</span> },
    { key: 'comment', header: 'Comment', render: (_, r) => <span className="text-white/40 text-xs truncate max-w-48 block">{r.comment || '—'}</span> },
    { key: 'status', header: 'Status', render: (_, r) => <StatusBadgeCell status={r.status} /> },
    { key: 'createdAt', header: 'Date', render: (_, r) => <DateCell date={r.createdAt} /> },
    {
      key: 'id', header: 'Actions', render: (_, r) => (
        <div className="flex gap-1">
          {r.status === 'PENDING' && <>
            <button onClick={() => moderate(r.id, 'APPROVED')} disabled={!!actionLoading} className="p-1.5 rounded text-[#37EFD1] hover:bg-[#37EFD1]/10 transition-colors" title="Approve">{actionLoading === r.id + 'APPROVED' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}</button>
            <button onClick={() => moderate(r.id, 'REJECTED')} disabled={!!actionLoading} className="p-1.5 rounded text-[#C8102E] hover:bg-[#C8102E]/10 transition-colors" title="Reject">{actionLoading === r.id + 'REJECTED' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}</button>
          </>}
        </div>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <div><h1 className="font-display text-2xl text-white font-semibold">Reviews</h1><p className="text-white/35 text-sm font-sans mt-0.5">Manage guest reviews and feedback</p></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Reviews" value={Number(stats.total || 0)} icon={Star} color="#37EFD1" />
        <StatsCard title="Average Rating" value={`${Number(stats.averageRating || 0).toFixed(1)}★`} icon={Star} color="#fb923c" />
        <StatsCard title="Pending" value={Number(stats.pending || 0)} icon={Star} color="#60a5fa" />
        <StatsCard title="Approved" value={Number(stats.approved || 0)} icon={Star} color="#a78bfa" />
      </div>
      <div className="bg-[#1A1B21] border border-white/5 rounded-xl p-5">
        <div className="flex flex-wrap gap-3 mb-4">
          <DataTableSearch value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search reviews..." />
          <DataTableFilters
            filters={[{ key: 'status', label: 'All Statuses', options: [{ label: 'Pending', value: 'PENDING' }, { label: 'Approved', value: 'APPROVED' }, { label: 'Rejected', value: 'REJECTED' }, { label: 'Flagged', value: 'FLAGGED' }] }]}
            values={filters} onChange={(k, v) => { setFilters(f => ({ ...f, [k]: v })); setPage(1); }} onReset={() => { setFilters({ status: '' }); setPage(1); }} />
        </div>
        {loading ? <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-white/30" /></div> : (
          <><DataTable data={data} columns={columns} /><DataTablePagination page={page} totalPages={Math.ceil(total / 10)} onPage={setPage} total={total} limit={10} /></>
        )}
      </div>
    </div>
  );
}
