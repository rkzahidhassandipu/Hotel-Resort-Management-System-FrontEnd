"use client";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Star, Loader2, RefreshCw } from "lucide-react";
import { reviewService } from "@/service/review.service";
import type { Review } from "@/types";
import StatsCard from "@/components/shared/StatsCard";
import DataTable, { Column } from "@/components/shared/table/DataTable";
import DataTablePagination from "@/components/shared/table/DataTablePagination";
import StarRating from "@/components/reviews/shared/StarRating";
import { fmtDate, ReviewStatus } from "@/components/reviews/shared/reviewTypes";
import StatusBadge from "@/components/reviews/shared/StatusBadge";
import ReviewFilters from "@/components/reviews/shared/ReviewFilters";
import ReviewDetailModal from "@/components/reviews/ReviewDetailModal";

export default function AdminReviewsPage() {
  const [search, setSearch]         = useState("");
  const [status, setStatus]         = useState("");
  const [sortBy, setSortBy]         = useState("createdAt");
  const [page, setPage]             = useState(1);
  const [selected, setSelected]     = useState<Review | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const params: Record<string, unknown> = { page, limit: 10 };
  if (status) params.status = status;
  if (sortBy)  params.sortBy = sortBy;

  const { data: reviews = [], isLoading, refetch } = useQuery<Review[]>({
    queryKey: ["reviews", params],
    queryFn: async () => {
      const r = await reviewService.getAll(params);
      return r.data?.data ?? [];
    },
  });

  const { data: statsData } = useQuery({
    queryKey: ["review-stats"],
    queryFn: async () => {
      const r = await reviewService.getStats();
      return r.data?.data;
    },
  });

  const countByStatus = (s: string) =>
    statsData?.byStatus?.find((b: any) => b.status === s)?._count?.status ?? 0;

  const columns: Column<Review>[] = [
    {
      key: "user", header: "Guest",
      render: (_, r) => (
        <span className="text-white text-sm font-sans">
          {r.isAnonymous ? "Anonymous" : `${(r.user as any)?.firstName ?? ""} ${(r.user as any)?.lastName ?? ""}`}
        </span>
      ),
    },
    { key: "overallRating", header: "Rating", render: (_, r) => <StarRating rating={r.overallRating} /> },
    { key: "title", header: "Title", render: (_, r) => <span className="text-white/70 text-sm font-sans">{r.title || "—"}</span> },
    {
      key: "comment", header: "Comment",
      render: (_, r) => <span className="text-white/40 text-xs font-sans truncate max-w-[180px] block">{r.comment || "—"}</span>,
    },
    { key: "status", header: "Status", render: (_, r) => <StatusBadge status={r.status as ReviewStatus} /> },
    { key: "createdAt", header: "Date", render: (_, r) => <span className="text-white/40 text-xs font-sans">{fmtDate(r.createdAt)}</span> },
    {
      key: "id", header: "",
      render: (_, r) => (
        <button onClick={() => setSelected(r)}
          className="px-3 py-1.5 rounded-lg border border-white/10 text-white/50 hover:text-white hover:bg-white/5 text-xs font-sans transition-all">
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
        <button onClick={() => refetch()} className="w-9 h-9 flex items-center justify-center rounded-lg border border-white/10 text-white/40 hover:text-white hover:bg-white/5 transition-all">
          <RefreshCw size={15} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Reviews" value={statsData?.totalApproved ?? 0}                                              icon={Star} color="#37EFD1" />
        <StatsCard title="Avg Rating"    value={`${Number(statsData?.averageRatings?.overallRating ?? 0).toFixed(1)}★`}    icon={Star} color="#fb923c" />
        <StatsCard title="Pending"       value={countByStatus("PENDING")}                                                   icon={Star} color="#60a5fa" />
        <StatsCard title="Approved"      value={countByStatus("APPROVED")}                                                  icon={Star} color="#a78bfa" />
      </div>

      {/* Filters */}
      <ReviewFilters
        search={search}       onSearchChange={v => { setSearch(v); setPage(1); }}
        status={status}       onStatusChange={v => { setStatus(v); setPage(1); }}
        sortBy={sortBy}       onSortByChange={setSortBy}
        showFilters={showFilters} onToggleFilters={() => setShowFilters(v => !v)}
      />

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
            <DataTable data={reviews} columns={columns} />
            <DataTablePagination page={page} totalPages={1} onPage={setPage} total={reviews.length} limit={10} />
          </>
        )}
      </div>

      {selected && <ReviewDetailModal review={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}