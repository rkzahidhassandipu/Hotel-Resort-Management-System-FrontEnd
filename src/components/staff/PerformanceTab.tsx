"use client";
import { useState, useEffect, useCallback } from "react";
import { Loader2, Plus } from "lucide-react";
import { staffService } from "@/service/staff.service";
import { userService } from "@/service/user.service";
import DataTable, { Column } from "@/components/shared/table/DataTable";
import DataTablePagination from "@/components/shared/table/DataTablePagination";
import { PerformanceReview, StaffProfile } from "@/types";
import { RatingDots } from "./taff.components";
import AddReviewModal from "./AddReviewModal";
import { fmtDate } from "./staff.helpers";
export default function PerformanceTab() {
  const [staffList, setStaffList] = useState<StaffProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState("");
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    userService
      .getStaffList({ limit: 100 })
      .then((r) => setStaffList(r.data?.data?.data ?? r.data?.data ?? []))
      .catch(() => {});
  }, []);

  const fetchReviews = useCallback(async () => {
    if (!selectedProfile) return;
    setLoading(true);
    const profile = staffList.find((s) => s.id === selectedProfile);
    const profileId = profile?.staffProfile?.id;
    if (!profileId) { setLoading(false); return; }
    try {
      const r = await staffService.getPerformanceReviews(profileId, { page, limit: 10 });
      const d = r.data?.data;
      setReviews(d?.reviews ?? d ?? []);
      setTotal(d?.meta?.total ?? 0);
    } catch {}
    setLoading(false);
  }, [selectedProfile, staffList, page]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const columns: Column<PerformanceReview>[] = [
    {
      key: "period", header: "Period",
      render: (_, r) => <span className="text-white text-sm font-medium">{r.period}</span>,
    },
    { key: "rating", header: "Overall", render: (_, r) => <RatingDots value={r.rating} /> },
    { key: "punctuality", header: "Punctuality", render: (_, r) => <RatingDots value={r.punctuality} /> },
    { key: "productivity", header: "Productivity", render: (_, r) => <RatingDots value={r.productivity} /> },
    { key: "attitude", header: "Attitude", render: (_, r) => <RatingDots value={r.attitude} /> },
    { key: "teamwork", header: "Teamwork", render: (_, r) => <RatingDots value={r.teamwork} /> },
    {
      key: "reviewedBy", header: "Reviewed By",
      render: (_, r) => (
        <span className="text-white/50 text-xs">
          {r.reviewedBy ? `${r.reviewedBy.firstName} ${r.reviewedBy.lastName}` : "—"}
        </span>
      ),
    },
    {
      key: "reviewedAt", header: "Date",
      render: (_, r) => <span className="text-white/50 text-xs">{fmtDate(r.reviewedAt)}</span>,
    },
  ];

  // Summary calculation
  const avg = (key: keyof PerformanceReview) => {
    const vals = reviews.filter((r) => r[key] !== undefined && r[key] !== null);
    if (!vals.length) return null;
    return (vals.reduce((s, r) => s + (r[key] as number), 0) / vals.length).toFixed(1);
  };

  const overall = avg("rating");
  const score = parseFloat(overall ?? "0");
  const verdict =
    score >= 4.5 ? { label: "Excellent", color: "text-green-400", bg: "bg-green-500/10" } :
    score >= 3.5 ? { label: "Good", color: "text-[#37EFD1]", bg: "bg-[#37EFD1]/10" } :
    score >= 2.5 ? { label: "Average", color: "text-yellow-400", bg: "bg-yellow-500/10" } :
    score >= 1.5 ? { label: "Below Average", color: "text-orange-400", bg: "bg-orange-500/10" } :
                   { label: "Poor", color: "text-red-400", bg: "bg-red-500/10" };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <select
          value={selectedProfile}
          onChange={(e) => { setSelectedProfile(e.target.value); setPage(1); }}
          className="bg-[#1A1B21] border border-white/8 text-white text-sm font-sans px-3 py-2 rounded-lg outline-none"
        >
          <option value="">Select staff member</option>
          {staffList.map((s) => (
            <option key={s.id} value={s.id} disabled={!s.staffProfile?.id}>
              {s.firstName} {s.lastName} ({s.role})
              {!s.staffProfile?.id ? " — no profile" : ""}
            </option>
          ))}
        </select>
        <button
          onClick={() => {
            if (!selectedProfile) return;
            setShowModal(true);
          }}
          disabled={!selectedProfile}
          className="flex items-center gap-2 bg-[#C8102E] hover:bg-[#a00d24] text-white px-4 py-2 rounded-lg text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus className="h-4 w-4" /> Add Review
        </button>
      </div>

      {/* Summary Card */}
      {reviews.length > 0 && (
        <div className="bg-[#1A1B21] border border-white/5 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-display text-sm font-semibold">Performance Summary</h3>
              <p className="text-white/30 text-xs mt-0.5">
                Based on {reviews.length} review{reviews.length > 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-3xl font-display font-bold ${verdict.color}`}>{overall}</span>
              <span className={`text-xs font-sans px-2.5 py-1 rounded-full ${verdict.bg} ${verdict.color}`}>
                {verdict.label}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "Punctuality", value: avg("punctuality") },
              { label: "Productivity", value: avg("productivity") },
              { label: "Attitude", value: avg("attitude") },
              { label: "Teamwork", value: avg("teamwork") },
            ].map(({ label, value }) => {
              const n = parseFloat(value ?? "0");
              const barColor =
                n >= 4 ? "bg-green-400" :
                n >= 3 ? "bg-[#37EFD1]" :
                n >= 2 ? "bg-yellow-400" : "bg-red-400";
              return (
                <div key={label} className="bg-[#0B0C10] border border-white/5 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-white/40 text-xs">{label}</p>
                    <p className={`text-sm font-semibold ${!value ? "text-white/20" : "text-white"}`}>
                      {value ?? "—"}
                    </p>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all ${value ? barColor : "bg-white/5"}`}
                      style={{ width: value ? `${(n / 5) * 100}%` : "0%" }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-[#1A1B21] border border-white/5 rounded-xl p-5">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-white/30" />
          </div>
        ) : reviews.length === 0 ? (
          <p className="text-white/30 text-sm text-center py-8">
            {selectedProfile ? "No reviews found" : "Select a staff member to view reviews"}
          </p>
        ) : (
          <>
            <DataTable data={reviews} columns={columns} />
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

      {/* Modal */}
      {showModal && (
        <AddReviewModal
          staffList={staffList}
          selectedProfile={selectedProfile}
          onSuccess={fetchReviews}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}