'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Star, Loader2, CheckCircle, XCircle, Flag,
  MessageSquare, X, RefreshCw, Filter, ChevronDown,
} from 'lucide-react';
import { toast } from 'sonner';
import { reviewService } from '@/service/review.service';
import type { Review } from '@/types';
import StatsCard from '@/components/shared/StatsCard';
import DataTable, { Column } from '@/components/shared/table/DataTable';
import DataTablePagination from '@/components/shared/table/DataTablePagination';
import DataTableSearch from '@/components/shared/table/DataTableSearch';

// ── Types ─────────────────────────────────────────────────
type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'FLAGGED';

const STATUS_CFG: Record<ReviewStatus, { label: string; color: string; bgClass: string }> = {
  PENDING:  { label: 'Pending',  color: 'text-yellow-400', bgClass: 'bg-yellow-400/10' },
  APPROVED: { label: 'Approved', color: 'text-green-400',  bgClass: 'bg-green-400/10' },
  REJECTED: { label: 'Rejected', color: 'text-red-400',    bgClass: 'bg-red-400/10' },
  FLAGGED:  { label: 'Flagged',  color: 'text-orange-400', bgClass: 'bg-orange-400/10' },
};

// ── Helpers ───────────────────────────────────────────────
const inputCls = 'w-full bg-[#0B0C10] border border-white/8 text-white text-sm font-sans px-3 py-2 rounded-lg outline-none focus:border-[#37EFD1]/40 transition-colors placeholder:text-white/20';
const selectCls = `${inputCls} cursor-pointer`;

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} className={`h-3 w-3 ${s <= rating ? 'text-orange-400 fill-orange-400' : 'text-white/10'}`} />
      ))}
      <span className="text-white/50 text-xs ml-1 font-sans">{rating.toFixed(1)}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: ReviewStatus }) {
  const c = STATUS_CFG[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium font-sans ${c.color} ${c.bgClass}`}>
      {c.label}
    </span>
  );
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ── Modals ────────────────────────────────────────────────
function ReviewDetailModal({ review, onClose }: { review: Review; onClose: () => void }) {
  const qc = useQueryClient();
  const [response, setResponse] = useState(review.managerResponse ?? '');
  const [showResponse, setShowResponse] = useState(false);

  const moderateMut = useMutation({
    mutationFn: (status: string) => reviewService.moderate(review.id, status),
    onSuccess: () => {
      toast.success('Review moderated');
      qc.invalidateQueries({ queryKey: ['reviews'] });
      qc.invalidateQueries({ queryKey: ['review-stats'] });
      onClose();
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });

  const respondMut = useMutation({
    mutationFn: () => reviewService.respond(review.id, response),
    onSuccess: () => {
      toast.success('Response added');
      qc.invalidateQueries({ queryKey: ['reviews'] });
      onClose();
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });

  const deleteMut = useMutation({
    mutationFn: () => reviewService.delete(review.id),
    onSuccess: () => {
      toast.success('Review deleted');
      qc.invalidateQueries({ queryKey: ['reviews'] });
      qc.invalidateQueries({ queryKey: ['review-stats'] });
      onClose();
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });

  const ratingRows = [
    { label: 'Overall',     value: review.overallRating },
    { label: 'Cleanliness', value: review.cleanlinessRating },
    { label: 'Service',     value: review.serviceRating },
    { label: 'Food',        value: review.foodRating },
    { label: 'Location',    value: review.locationRating },
    { label: 'Value',       value: review.valueRating },
  ].filter(r => r.value != null);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#1A1B21] border border-white/8 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <StatusBadge status={review.status as ReviewStatus} />
              <StarRating rating={review.overallRating} />
            </div>
            <h2 className="text-white font-display text-lg font-semibold">{review.title || 'Untitled Review'}</h2>
            <p className="text-white/30 text-xs font-sans mt-0.5">
              {review.isAnonymous ? 'Anonymous' : `${(review.user as any)?.firstName ?? ''} ${(review.user as any)?.lastName ?? ''}`}
              {' · '}{fmtDate(review.createdAt)}
            </p>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg border border-white/10 text-white/40 hover:text-white transition-all">
            <X size={14} />
          </button>
        </div>

        {/* Comment */}
        {review.comment && (
          <div className="bg-[#0B0C10] border border-white/5 rounded-lg p-3 mb-4">
            <p className="text-white/70 text-sm font-sans leading-relaxed">{review.comment}</p>
          </div>
        )}

        {/* Ratings breakdown */}
        <div className="space-y-2 mb-4">
          {ratingRows.map(r => (
            <div key={r.label} className="flex items-center justify-between">
              <span className="text-white/40 text-xs font-sans">{r.label}</span>
              <StarRating rating={r.value!} />
            </div>
          ))}
        </div>

        {/* Manager response */}
        {review.managerResponse && (
          <div className="bg-[#37EFD1]/5 border border-[#37EFD1]/15 rounded-lg p-3 mb-4">
            <p className="text-[#37EFD1] text-xs font-sans font-medium mb-1">Manager Response</p>
            <p className="text-white/70 text-sm font-sans">{review.managerResponse}</p>
          </div>
        )}

        {/* Actions */}
        <div className="border-t border-white/8 pt-4 space-y-3">
          {/* Moderate buttons */}
          {review.status === 'PENDING' && (
            <div className="flex gap-2">
              <button
                onClick={() => moderateMut.mutate('APPROVED')}
                disabled={moderateMut.isPending}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 text-sm font-sans transition-all disabled:opacity-60"
              >
                {moderateMut.isPending ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle size={13} />}
                Approve
              </button>
              <button
                onClick={() => moderateMut.mutate('REJECTED')}
                disabled={moderateMut.isPending}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 text-sm font-sans transition-all disabled:opacity-60"
              >
                {moderateMut.isPending ? <Loader2 size={13} className="animate-spin" /> : <XCircle size={13} />}
                Reject
              </button>
              <button
                onClick={() => moderateMut.mutate('FLAGGED')}
                disabled={moderateMut.isPending}
                className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 text-sm font-sans transition-all disabled:opacity-60"
              >
                <Flag size={13} />
              </button>
            </div>
          )}

          {review.status === 'APPROVED' && (
            <>
              {!showResponse ? (
                <button
                  onClick={() => setShowResponse(true)}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-white/10 text-white/50 hover:text-white hover:bg-white/5 text-sm font-sans transition-all"
                >
                  <MessageSquare size={13} />
                  {review.managerResponse ? 'Edit Response' : 'Add Response'}
                </button>
              ) : (
                <div className="space-y-2">
                  <textarea
                    value={response}
                    onChange={e => setResponse(e.target.value)}
                    rows={3}
                    placeholder="Write your response…"
                    className={`${inputCls} resize-none`}
                  />
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setShowResponse(false)} className="px-3 py-1.5 text-xs font-sans text-white/50 border border-white/10 rounded-lg hover:text-white transition-all">Cancel</button>
                    <button
                      onClick={() => respondMut.mutate()}
                      disabled={respondMut.isPending || !response.trim()}
                      className="px-3 py-1.5 text-xs font-sans font-medium bg-[#37EFD1] text-[#0B0C10] rounded-lg hover:bg-[#00FFD5] disabled:opacity-60 flex items-center gap-1.5 transition-all"
                    >
                      {respondMut.isPending && <Loader2 size={11} className="animate-spin" />}
                      Submit Response
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Delete */}
          <button
            onClick={() => { if (confirm('Delete this review?')) deleteMut.mutate(); }}
            disabled={deleteMut.isPending}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 text-sm font-sans transition-all disabled:opacity-60"
          >
            {deleteMut.isPending ? <Loader2 size={13} className="animate-spin" /> : <XCircle size={13} />}
            Delete Review
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────
export default function AdminReviewsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Review | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const params: Record<string, unknown> = { page, limit: 10 };
  if (status) params.status = status;
  if (sortBy) params.sortBy = sortBy;

  const { data: listData, isLoading, refetch } = useQuery({
    queryKey: ['reviews', params],
    queryFn: async () => {
      const r = await reviewService.getAll(params);
      return r.data?.data as { reviews: Review[]; meta: any };
    },
  });

  const { data: statsData } = useQuery({
    queryKey: ['review-stats'],
    queryFn: async () => {
      const r = await reviewService.getStats();
      return r.data?.data;
    },
  });

  const reviews = listData ?? [];
  const meta = listData?.meta;

  console.log(reviews)

  const countByStatus = (s: string) =>
    statsData?.byStatus?.find((b: any) => b.status === s)?._count?.status ?? 0;

  const columns: Column<Review>[] = [
    {
      key: 'user', header: 'Guest',
      render: (_, r) => (
        <span className="text-white text-sm font-sans">
          {r.isAnonymous ? 'Anonymous' : `${(r.user as any)?.firstName ?? ''} ${(r.user as any)?.lastName ?? ''}`}
        </span>
      ),
    },
    {
      key: 'overallRating', header: 'Rating',
      render: (_, r) => <StarRating rating={r.overallRating} />,
    },
    {
      key: 'title', header: 'Title',
      render: (_, r) => <span className="text-white/70 text-sm font-sans">{r.title || '—'}</span>,
    },
    {
      key: 'comment', header: 'Comment',
      render: (_, r) => (
        <span className="text-white/40 text-xs font-sans truncate max-w-[180px] block">
          {r.comment || '—'}
        </span>
      ),
    },
    {
      key: 'status', header: 'Status',
      render: (_, r) => <StatusBadge status={r.status as ReviewStatus} />,
    },
    {
      key: 'createdAt', header: 'Date',
      render: (_, r) => <span className="text-white/40 text-xs font-sans">{fmtDate(r.createdAt)}</span>,
    },
    {
      key: 'id', header: '',
      render: (_, r) => (
        <button
          onClick={() => setSelected(r)}
          className="px-3 py-1.5 rounded-lg border border-white/10 text-white/50 hover:text-white hover:bg-white/5 text-xs font-sans transition-all"
        >
          View
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-white font-semibold">Reviews</h1>
          <p className="text-white/35 text-sm font-sans mt-0.5">Manage guest reviews and feedback</p>
        </div>
        <button
          onClick={() => refetch()}
          className="w-9 h-9 flex items-center justify-center rounded-lg border border-white/10 text-white/40 hover:text-white hover:bg-white/5 transition-all"
        >
          <RefreshCw size={15} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Reviews" value={statsData?.totalApproved ?? 0}                          icon={Star} color="#37EFD1" />
        <StatsCard title="Avg Rating"    value={`${Number(statsData?.averageRatings?.overallRating ?? 0).toFixed(1)}★`} icon={Star} color="#fb923c" />
        <StatsCard title="Pending"       value={countByStatus('PENDING')}                              icon={Star} color="#60a5fa" />
        <StatsCard title="Approved"      value={countByStatus('APPROVED')}                             icon={Star} color="#a78bfa" />
      </div>

      {/* Filters */}
      <div className="bg-[#1A1B21] border border-white/5 rounded-xl p-4">
        <div className="flex items-center gap-2 flex-wrap">
          <DataTableSearch
            value={search}
            onChange={v => { setSearch(v); setPage(1); }}
            placeholder="Search reviews…"
          />
          <button
            onClick={() => setShowFilters(v => !v)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-sans transition-all ${
              showFilters ? 'bg-[#37EFD1]/8 border-[#37EFD1]/30 text-[#37EFD1]' : 'border-white/10 text-white/40 hover:text-white'
            }`}
          >
            <Filter size={13} /> Filters
            <ChevronDown size={12} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-3 mt-4">
            <div className="min-w-[160px]">
              <label className="text-white/40 text-xs font-sans mb-1.5 block">Status</label>
              <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className={selectCls}>
                <option value="">All Statuses</option>
                {(['PENDING', 'APPROVED', 'REJECTED', 'FLAGGED'] as ReviewStatus[]).map(s => (
                  <option key={s} value={s}>{STATUS_CFG[s].label}</option>
                ))}
              </select>
            </div>
            <div className="min-w-[160px]">
              <label className="text-white/40 text-xs font-sans mb-1.5 block">Sort By</label>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} className={selectCls}>
                <option value="createdAt">Newest First</option>
                <option value="overallRating">Highest Rating</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-[#1A1B21] border border-white/5 rounded-xl p-5">
        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-white/30" /></div>
        ) : reviews.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-white/25">
            <Star size={32} className="mb-3 opacity-50" />
            <p className="text-sm font-sans">No reviews found</p>
          </div>
        ) : (
          <>
            <DataTable data={reviews as any} columns={columns} />
            <DataTablePagination
              page={page}
              totalPages={meta?.totalPages ?? 1}
              onPage={setPage}
              total={meta?.total ?? 0}
              limit={10}
            />
          </>
        )}
      </div>

      {selected && <ReviewDetailModal review={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}