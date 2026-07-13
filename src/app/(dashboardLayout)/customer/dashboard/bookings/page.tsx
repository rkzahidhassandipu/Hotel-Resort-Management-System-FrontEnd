"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, Loader2, XCircle, Star } from "lucide-react";
import { toast } from "sonner";
import DataTable, { Column } from "@/components/shared/table/DataTable";
import DataTableSearch from "@/components/shared/table/DataTableSearch";
import DataTableFilters from "@/components/shared/table/DataTableFilters";
import DataTablePagination from "@/components/shared/table/DataTablePagination";
import StatusBadgeCell from "@/components/shared/cell/StatusBadgeCell";
import DateCell from "@/components/shared/cell/DateCell";
import StatsCard from "@/components/shared/StatsCard";
import { bookingService } from "@/service/booking.service";
import { reviewService } from "@/service/review.service";
import ReviewModal, {
  BookingWithReview,
} from "@/components/reviews/Reviewmodal";

// ── Main Page ─────────────────────────────────────────────
export default function CustomerBookingsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ status: "" });
  const [page, setPage] = useState(1);
  const [reviewBooking, setReviewBooking] = useState<BookingWithReview | null>(
    null,
  );

  const { data: result, isLoading } = useQuery({
    queryKey: ["my-bookings", page, search, filters],
    queryFn: async () => {
      const params: Record<string, unknown> = { page, limit: 10 };
      if (search) params.search = search;
      if (filters.status) params.status = filters.status;
      const res = await bookingService.getMyBookings(params);
      const d = res.data?.data;
      return {
        data: (d?.data || d || []) as BookingWithReview[],
        total: d?.total ?? (Array.isArray(d) ? d.length : 0),
      };
    },
  });

  const bookings = result?.data ?? [];
  const total = result?.total ?? 0;

  const cancelMut = useMutation({
    mutationFn: (id: string) => bookingService.cancel(id),
    onSuccess: () => {
      toast.success("Booking cancelled");
      qc.invalidateQueries({ queryKey: ["my-bookings"] });
    },
    onError: () => toast.error("Failed to cancel booking"),
  });

  const columns: Column<BookingWithReview>[] = [
    {
      key: "bookingNumber",
      header: "Booking #",
      render: (_, r) => (
        <span className="text-[#37EFD1] text-xs font-mono">
          {r.bookingNumber}
        </span>
      ),
    },
    {
      key: "room",
      header: "Room",
      render: (_, r) => (
        <span className="text-white/70 text-sm">
          {(r.room as any)?.roomNumber
            ? `Room #${(r.room as any).roomNumber}`
            : "—"}
        </span>
      ),
    },
    {
      key: "checkInDate",
      header: "Check In",
      render: (_, r) => <DateCell date={r.checkInDate} />,
    },
    {
      key: "checkOutDate",
      header: "Check Out",
      render: (_, r) => <DateCell date={r.checkOutDate} />,
    },
    {
      key: "nights",
      header: "Nights",
      render: (_, r) => (
        <span className="text-white/60 text-sm">{r.nights}</span>
      ),
    },
    {
      key: "totalAmount",
      header: "Total",
      render: (_, r) => (
        <span className="text-white font-medium">
          RM {Number(r.totalAmount).toLocaleString()}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (_, r) => <StatusBadgeCell status={r.status} />,
    },
    {
      key: "rating",
      header: "Rating",
      render: (_, r) => {
        const rating = r.reviews?.[0]?.overallRating ?? 0;
        const hasReview = r.hasReview === true;
        console.log('rating',r)
        console.log('hasReview',hasReview)

        if (r.status !== "CHECKED_OUT") {
          return <span className="text-white/20 text-xs">—</span>;
        }

        return (
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setReviewBooking(r)}
                title={hasReview ? "Edit your review" : "Write a review"}
                className="p-1 rounded hover:bg-yellow-400/10"
              >
                <Star
                  className={`h-4 w-4 ${
                    star <= rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-white/20"
                  }`}
                />
              </button>
            ))}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-white font-semibold">
          My Bookings
        </h1>
        <p className="text-white/35 text-sm font-sans mt-0.5">
          View and manage your reservations
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Bookings"
          value={total}
          icon={Calendar}
          color="#37EFD1"
        />
        <StatsCard
          title="Active"
          value={
            bookings.filter((b) =>
              ["CONFIRMED", "CHECKED_IN"].includes(b.status),
            ).length
          }
          icon={Calendar}
          color="#60a5fa"
        />
        <StatsCard
          title="Pending"
          value={bookings.filter((b) => b.status === "PENDING").length}
          icon={Calendar}
          color="#fb923c"
        />
        <StatsCard
          title="Completed"
          value={bookings.filter((b) => b.status === "CHECKED_OUT").length}
          icon={Calendar}
          color="#a78bfa"
        />
      </div>

      <div className="bg-[#1A1B21] border border-white/5 rounded-xl p-5">
        <div className="flex flex-wrap gap-3 mb-4">
          <DataTableSearch
            value={search}
            onChange={(v) => {
              setSearch(v);
              setPage(1);
            }}
            placeholder="Search bookings..."
          />
          <DataTableFilters
            filters={[
              {
                key: "status",
                label: "All Statuses",
                options: [
                  { label: "Pending", value: "PENDING" },
                  { label: "Confirmed", value: "CONFIRMED" },
                  { label: "Checked In", value: "CHECKED_IN" },
                  { label: "Checked Out", value: "CHECKED_OUT" },
                  { label: "Cancelled", value: "CANCELLED" },
                ],
              },
            ]}
            values={filters}
            onChange={(k, v) => {
              setFilters((f) => ({ ...f, [k]: v }));
              setPage(1);
            }}
            onReset={() => {
              setFilters({ status: "" });
              setPage(1);
            }}
          />
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-white/30" />
          </div>
        ) : (
          <>
            <DataTable data={bookings} columns={columns} />
            <DataTablePagination
              page={page}
              totalPages={Math.ceil(total / 10)}
              onPage={setPage}
              total={total}
              limit={10}
            />
          </>
        )}
      </div>

      {reviewBooking && (
        <ReviewModal
          booking={reviewBooking}
          onClose={() => setReviewBooking(null)}
          onSuccess={() => {
            qc.invalidateQueries({ queryKey: ["my-bookings"] });
            setReviewBooking(null);
          }}
        />
      )}
    </div>
  );
}
