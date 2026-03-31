'use client';
import { useState, useEffect, useCallback } from 'react';
import { Star, Loader2 } from 'lucide-react';
import DataTable, { Column } from '@/components/shared/table/DataTable';
import DataTablePagination from '@/components/shared/table/DataTablePagination';
import StatusBadgeCell from '@/components/shared/cell/StatusBadgeCell';
import DateCell from '@/components/shared/cell/DateCell';
import { reviewService } from '@/service/review.service';
import type { Review } from '@/types';

export default function CustomerReviewsPage() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Review[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await reviewService.getMyReviews();
      const d = res.data?.data;
      setData(Array.isArray(d) ? d : d?.data || []);
      setTotal(d?.total || (Array.isArray(d) ? d.length : 0));
    } catch { setData([]); }
    setLoading(false);
  }, [page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(s => <Star key={s} className={`h-3 w-3 ${s <= rating ? 'text-[#fb923c] fill-[#fb923c]' : 'text-white/10'}`} />)}
    </div>
  );

  const columns: Column<Review>[] = [
    { key: 'overallRating', header: 'Rating', render: (_, r) => renderStars(r.overallRating) },
    { key: 'title', header: 'Title', render: (_, r) => <span className="text-white/70 text-sm">{r.title || '—'}</span> },
    { key: 'comment', header: 'Comment', render: (_, r) => <span className="text-white/40 text-xs truncate max-w-48 block">{r.comment || '—'}</span> },
    { key: 'status', header: 'Status', render: (_, r) => <StatusBadgeCell status={r.status} /> },
    { key: 'createdAt', header: 'Date', render: (_, r) => <DateCell date={r.createdAt} /> },
  ];

  return (
    <div className="space-y-6">
      <div><h1 className="font-display text-2xl text-white font-semibold">My Reviews</h1><p className="text-white/35 text-sm font-sans mt-0.5">Your feedback and ratings</p></div>
      <div className="bg-[#1A1B21] border border-white/5 rounded-xl p-5">
        {loading ? <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-white/30" /></div> : data.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-3"><Star className="h-8 w-8 text-white/10" /><p className="text-white/25 text-sm font-sans">No reviews yet</p></div>
        ) : (
          <><DataTable data={data} columns={columns} /><DataTablePagination page={page} totalPages={Math.ceil(total / 10)} onPage={setPage} total={total} limit={10} /></>
        )}
      </div>
    </div>
  );
}
