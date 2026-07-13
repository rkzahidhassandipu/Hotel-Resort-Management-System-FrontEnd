"use client";
import { useState, useEffect, useCallback } from "react";
import { CreditCard, Eye, Loader2 } from "lucide-react";
import DataTable, { Column } from "@/components/shared/table/DataTable";
import DataTableSearch from "@/components/shared/table/DataTableSearch";
import DataTableFilters from "@/components/shared/table/DataTableFilters";
import DataTablePagination from "@/components/shared/table/DataTablePagination";
import StatusBadgeCell from "@/components/shared/cell/StatusBadgeCell";
import DateCell from "@/components/shared/cell/DateCell";
import StatsCard from "@/components/shared/StatsCard";
import { paymentService } from "@/service/payment.service";
import type { Payment } from "@/types";
import { parsePaymentStats } from "@/lib/statsUtils";
import PaymentDetailSlideOver from "@/components/payment/PaymentDetailSlideOver";

export default function AdminPaymentsPage() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ status: "", method: "" });
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Payment[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [refundLoading, setRefundLoading] = useState<string | null>(null);
  const [viewId, setViewId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { page, limit: 10 };
      if (search) params.search = search;
      if (filters.status) params.status = filters.status;
      if (filters.method) params.method = filters.method;
      const [payRes, statsRes] = await Promise.all([
        paymentService.getAll(params),
        paymentService.getStats(),
      ]);
      const d = payRes.data?.data;
      setData(d?.data || d || []);
      setTotal(d?.total || 0);
      setStats(parsePaymentStats(statsRes.data?.data || {}));
    } catch {
      setData([]);
    }
    setLoading(false);
  }, [page, search, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefund = async (id: string, amount: number) => {
    const reason = prompt("Enter refund reason:");
    if (!reason) return;
    setRefundLoading(id);
    try {
      await paymentService.refund(id, {
        refundAmount: amount,
        refundReason: reason,
      });
      await fetchData();
    } catch {}
    setRefundLoading(null);
  };

 const columns: Column<Payment>[] = [
  {
    key: "paymentNumber",
    header: "Payment #",
    render: (_, r) => (
      <span className="text-[#37EFD1] text-xs font-mono">{r.paymentNumber}</span>
    ),
  },
  {
    key: "user",
    header: "Guest",
    render: (_, r) =>
      r.user ? (
        <span className="text-white text-sm">
          {r.user.firstName} {r.user.lastName}
        </span>
      ) : (
        <span className="text-white/40">—</span>
      ),
  },
  {
    key: "amount",
    header: "Amount",
    render: (_, r) => (
      <span className="text-white font-medium">
        RM {Number(r.amount).toLocaleString()}
      </span>
    ),
  },
  {
    key: "method",
    header: "Method",
    render: (_, r) => (
      <span className="text-white/60 text-xs">{r.method.replace(/_/g, " ")}</span>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (_, r) => <StatusBadgeCell status={r.status} />,
  },
  {
    key: "actions",
    header: "Actions",
    noRowClick: true,
    render: (_, r) => (
      <div className="flex items-center gap-1">
        <button
          onClick={() => setViewId(r.id)}
          className="p-1.5 rounded text-white/30 hover:text-white hover:bg-white/5 transition-colors"
          title="View"
        >
          <Eye className="h-3.5 w-3.5" />
        </button>
        {r.status === "COMPLETED" && (
          <button
            onClick={() => handleRefund(r.id, Number(r.amount))}
            disabled={!!refundLoading}
            className="text-[9px] px-2 py-0.5 rounded border border-[#fb923c]/30 text-[#fb923c] hover:bg-[#fb923c]/10 transition-all"
          >
            {refundLoading === r.id ? "..." : "Refund"}
          </button>
        )}
      </div>
    ),
  },
];

  return (
    <div className="space-y-6">
      <div className="pt-5">
        <h1 className="font-display text-2xl text-white font-semibold">
          Payments
        </h1>
        <p className="text-white/35 text-sm font-sans mt-0.5">
          Track all financial transactions
        </p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Revenue"
          value={`RM ${Number(stats.totalRevenue || 0).toLocaleString()}`}
          icon={CreditCard}
          color="#37EFD1"
        />
        <StatsCard
          title="Today"
          value={`RM ${Number(stats.todayRevenue || 0).toLocaleString()}`}
          icon={CreditCard}
          color="#60a5fa"
        />
        <StatsCard
          title="Completed"
          value={Number(stats.completed || 0)}
          icon={CreditCard}
          color="#a78bfa"
        />
        <StatsCard
          title="Refunded"
          value={Number(stats.refunded || 0)}
          icon={CreditCard}
          color="#fb923c"
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
            placeholder="Search payments..."
          />
          <DataTableFilters
            filters={[
              {
                key: "status",
                label: "All Statuses",
                options: [
                  { label: "Pending", value: "PENDING" },
                  { label: "Completed", value: "COMPLETED" },
                  { label: "Failed", value: "FAILED" },
                  { label: "Refunded", value: "REFUNDED" },
                ],
              },
              {
                key: "method",
                label: "All Methods",
                options: [
                  { label: "Cash", value: "CASH" },
                  { label: "Credit Card", value: "CREDIT_CARD" },
                  { label: "Bank Transfer", value: "BANK_TRANSFER" },
                  { label: "Online", value: "ONLINE_PAYMENT" },
                ],
              },
            ]}
            values={filters}
            onChange={(k, v) => {
              setFilters((f) => ({ ...f, [k]: v }));
              setPage(1);
            }}
            onReset={() => {
              setFilters({ status: "", method: "" });
              setPage(1);
            }}
          />
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-white/30" />
          </div>
        ) : (
          <>
            <DataTable
              data={data}
              columns={columns}
              onRowClick={(row) => setViewId(row.id as string)}
            />
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
      {/* View Modal */}
      {viewId && (
        <PaymentDetailSlideOver
          paymentId={viewId}
          onClose={() => setViewId(null)}
        />
      )}
    </div>
  );
}
