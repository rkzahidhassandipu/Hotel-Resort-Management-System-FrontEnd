"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart2,
  Loader2,
  TrendingUp,
  Users,
  BedDouble,
  DollarSign,
  Calendar,
  ChefHat,
  Wrench,
  ClipboardList,
  Star,
  RefreshCw,
  CalendarRange,
  FileQuestion,
  LucideIcon,
  Download,
  Printer,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { reportService } from "@/service/report.service";

// ── Design tokens ─────────────────────────────────────────
const tooltipStyle = {
  backgroundColor: "#1A1B21",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "8px",
  color: "#fff",
  fontSize: "11px",
};

const PALETTE = [
  "#37EFD1",
  "#C8102E",
  "#60a5fa",
  "#fb923c",
  "#a78bfa",
  "#f472b6",
];

const inputCls =
  "bg-transparent text-white text-xs font-sans outline-none [color-scheme:dark] w-[104px]";

type SectionKey =
  | "overview"
  | "revenue"
  | "occupancy"
  | "bookings"
  | "food"
  | "staff"
  | "daily";

type SectionMeta = {
  key: SectionKey;
  label: string;
  icon: LucideIcon;
  accent: string;
  desc: string;
};

const SECTIONS: SectionMeta[] = [
  {
    key: "overview",
    label: "Overview",
    icon: BarChart2,
    accent: "#E5E7EB",
    desc: "Today at a glance",
  },
  {
    key: "revenue",
    label: "Revenue",
    icon: DollarSign,
    accent: "#C8102E",
    desc: "Earnings over time",
  },
  {
    key: "occupancy",
    label: "Occupancy",
    icon: BedDouble,
    accent: "#37EFD1",
    desc: "Room utilisation",
  },
  {
    key: "bookings",
    label: "Bookings",
    icon: Calendar,
    accent: "#60a5fa",
    desc: "Reservation activity",
  },
  {
    key: "food",
    label: "Food",
    icon: ChefHat,
    accent: "#f472b6",
    desc: "Kitchen & dining orders",
  },
  {
    key: "staff",
    label: "Staff",
    icon: Users,
    accent: "#a78bfa",
    desc: "Performance leaderboard",
  },
  {
    key: "daily",
    label: "Daily",
    icon: ClipboardList,
    accent: "#fb923c",
    desc: "Day-by-day log",
  },
];

const fmtRM = (v: unknown) =>
  `RM ${Number(v ?? 0).toLocaleString("en-MY", { maximumFractionDigits: 0 })}`;

/** Client-side CSV export — no extra dependency needed. */
function downloadCSV(
  filename: string,
  headers: string[],
  rows: (string | number)[][],
) {
  const escape = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const csv = [headers, ...rows].map((r) => r.map(escape).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// ── Shared primitives ─────────────────────────────────────
function SectionTitle({
  title,
  accent,
  onExport,
}: {
  title: string;
  accent?: string;
  onExport?: () => void;
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        {accent && (
          <span
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ background: accent }}
          />
        )}
        <h3 className="text-white font-display text-base font-semibold">
          {title}
        </h3>
      </div>
      {onExport && (
        <button
          onClick={onExport}
          className="print:hidden flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-sans text-white/40 hover:text-white hover:bg-white/8 border border-white/5 transition-colors"
        >
          <Download className="h-3 w-3" /> CSV
        </button>
      )}
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 border border-dashed border-white/8 rounded-lg">
      <FileQuestion className="h-5 w-5 text-white/15" />
      <p className="text-white/30 text-sm font-sans">{label}</p>
    </div>
  );
}

function LoadingBlock({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16">
      <Loader2 className="h-5 w-5 animate-spin text-white/25" />
      {label && <p className="text-white/25 text-xs font-sans">{label}</p>}
    </div>
  );
}

/** Base shimmer block — respects reduced-motion via the pulse utility being disabled globally when needed. */
function Skeleton({
  className = "",
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`motion-safe:animate-pulse bg-white/[0.06] rounded-md ${className}`}
      style={style}
    />
  );
}

function MetricSkeletonGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-[#1A1B21] border border-white/5 rounded-xl p-4"
        >
          <Skeleton className="w-8 h-8 rounded-lg mb-3" />
          <Skeleton className="w-16 h-6 mb-2" />
          <Skeleton className="w-24 h-3" />
        </div>
      ))}
    </div>
  );
}

function ChartSkeleton({
  height = 200,
  title = true,
}: {
  height?: number;
  title?: boolean;
}) {
  return (
    <div className="bg-[#1A1B21] border border-white/5 rounded-xl p-5">
      {title && <Skeleton className="w-32 h-4 mb-4" />}
      <Skeleton className="w-full rounded-lg" style={{ height }} />
    </div>
  );
}

function TableSkeleton({
  rows = 5,
  cols = 5,
}: {
  rows?: number;
  cols?: number;
}) {
  return (
    <div className="bg-[#1A1B21] border border-white/5 rounded-xl p-5 space-y-3">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

/** Unified KPI tile — accent-coded per report category. */
function Metric({
  label,
  value,
  sub,
  icon: Icon,
  accent,
  trend,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: LucideIcon;
  accent: string;
  trend?: number;
}) {
  return (
    <div className="group relative bg-[#1A1B21] border border-white/5 rounded-xl p-4 overflow-hidden transition-all duration-300 hover:border-white/10 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/30">
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: accent, opacity: 0.55 }}
      />
      <div className="flex items-start justify-between">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: `${accent}1A` }}
        >
          <Icon className="h-4 w-4" style={{ color: accent }} />
        </div>
        {trend !== undefined && (
          <span
            className="text-[10px] font-sans font-medium px-1.5 py-0.5 rounded-full tabular-nums"
            style={{
              color: trend >= 0 ? "#37EFD1" : "#C8102E",
              background:
                trend >= 0 ? "rgba(55,239,209,0.1)" : "rgba(200,16,46,0.1)",
            }}
          >
            {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-display text-white font-semibold mt-3 tabular-nums leading-none">
        {value}
      </p>
      <p className="text-white/40 text-xs font-sans mt-1.5">{label}</p>
      {sub && (
        <p className="text-white/25 text-[11px] font-sans mt-0.5">{sub}</p>
      )}
    </div>
  );
}

function StatBlock({
  value,
  label,
  color,
}: {
  value: string | number;
  label: string;
  color?: string;
}) {
  return (
    <div className="bg-white/[0.03] rounded-lg p-4 text-center">
      <p
        className="text-2xl font-display font-semibold tabular-nums"
        style={{ color: color ?? "#fff" }}
      >
        {value}
      </p>
      <p className="text-white/35 text-xs font-sans mt-1">{label}</p>
    </div>
  );
}

/** Global date range control — lives once in the sticky bar, drives every date-scoped section. */
function DateRangeFilter({
  from,
  to,
  onFromChange,
  onToChange,
}: {
  from: string;
  to: string;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
}) {
  const applyPreset = (days: number) => {
    onToChange(new Date().toISOString().split("T")[0]);
    onFromChange(
      new Date(Date.now() - days * 86400000).toISOString().split("T")[0],
    );
  };
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-2 bg-[#1A1B21] border border-white/8 rounded-lg px-3 py-2">
        <CalendarRange className="h-3.5 w-3.5 text-white/30 flex-shrink-0" />
        <input
          type="date"
          value={from}
          onChange={(e) => onFromChange(e.target.value)}
          className={inputCls}
        />
        <span className="text-white/20 text-xs">→</span>
        <input
          type="date"
          value={to}
          onChange={(e) => onToChange(e.target.value)}
          className={inputCls}
        />
      </div>
      <div className="flex gap-1">
        {[7, 14, 30, 90].map((d) => (
          <button
            key={d}
            onClick={() => applyPreset(d)}
            className="px-2.5 py-1.5 rounded-md text-[11px] font-sans text-white/40 hover:text-white hover:bg-white/8 border border-white/5 transition-colors"
          >
            {d}D
          </button>
        ))}
      </div>
    </div>
  );
}

/** Wraps every report section with a consistent heading + scroll-reveal + anchor. */
function ReportSection({
  meta,
  children,
  registerRef,
  revealed,
}: {
  meta: SectionMeta;
  children: React.ReactNode;
  registerRef: (el: HTMLDivElement | null) => void;
  revealed: boolean;
}) {
  const Icon = meta.icon;
  return (
    <section
      id={meta.key}
      ref={registerRef}
      className={`scroll-mt-10 border-t border-white/[0.06] pt-8 first:border-t-0 first:pt-0 transition-all duration-700 ease-out ${
        revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
      }`}
    >
      <div className="flex items-center gap-3 mb-5">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{
            background: `${meta.accent}1A`,
            border: `1px solid ${meta.accent}33`,
          }}
        >
          <Icon className="h-4 w-4" style={{ color: meta.accent }} />
        </div>
        <div>
          <h2 className="font-display text-lg text-white font-semibold leading-tight">
            {meta.label}
          </h2>
          <p className="text-white/35 text-xs font-sans">{meta.desc}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

// ── Overview Section (always "today / this month", not date-filtered) ──
function OverviewSection({ accent }: { accent: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["report-dashboard"],
    queryFn: async () => {
      const res = await reportService.getDashboard();
      return res.data?.data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <MetricSkeletonGrid count={4} />
        <MetricSkeletonGrid count={4} />
        <ChartSkeleton height={120} />
      </div>
    );
  }

  const rooms = data?.rooms ?? {};
  const revenue = data?.revenue ?? {};
  const customers = data?.customers ?? {};
  const bookings = data?.bookings ?? {};
  const alerts = data?.alerts ?? {};

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Metric
          label="Occupancy Rate"
          value={rooms.occupancyRate ?? "0%"}
          icon={BedDouble}
          accent="#37EFD1"
        />
        <Metric
          label="Today's Revenue"
          value={fmtRM(revenue.today)}
          icon={DollarSign}
          accent="#C8102E"
        />
        <Metric
          label="Monthly Revenue"
          value={fmtRM(revenue.thisMonth)}
          icon={TrendingUp}
          accent="#60a5fa"
        />
        <Metric
          label="Total Customers"
          value={customers.total ?? 0}
          icon={Users}
          accent="#a78bfa"
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Metric
          label="Today Check-ins"
          value={bookings.todayCheckIns ?? 0}
          icon={Calendar}
          accent="#37EFD1"
        />
        <Metric
          label="Today Check-outs"
          value={bookings.todayCheckOuts ?? 0}
          icon={Calendar}
          accent="#60a5fa"
        />
        <Metric
          label="Open Maintenance"
          value={alerts.pendingMaintenance ?? 0}
          icon={Wrench}
          accent="#fb923c"
        />
        <Metric
          label="Food Orders"
          value={alerts.pendingFoodOrders ?? 0}
          icon={ChefHat}
          accent="#f472b6"
        />
      </div>

      <div className="bg-[#1A1B21] border border-white/5 rounded-xl p-5">
        <SectionTitle title="Room Snapshot" accent={accent} />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatBlock value={rooms.total ?? 0} label="Total Rooms" />
          <StatBlock
            value={rooms.occupied ?? 0}
            label="Occupied"
            color="#C8102E"
          />
          <StatBlock
            value={rooms.available ?? 0}
            label="Available"
            color="#37EFD1"
          />
          <StatBlock
            value={customers.newThisMonth ?? 0}
            label="New This Month"
            color="#a78bfa"
          />
        </div>
      </div>
    </div>
  );
}

// ── Revenue Section (uses the global date range) ────────────
function RevenueSection({
  accent,
  from,
  to,
}: {
  accent: string;
  from: string;
  to: string;
}) {
  const [groupBy, setGroupBy] = useState<"day" | "week" | "month">("day");

  const { data, isLoading } = useQuery({
    queryKey: ["report-revenue", from, to, groupBy],
    queryFn: async () => {
      const res = await reportService.getRevenue({
        fromDate: new Date(from).toISOString(),
        toDate: new Date(to).toISOString(),
        groupBy,
      });
      return res.data?.data;
    },
  });

  const timeline = data?.timeline ?? [];
  const byMethod = data?.byPaymentMethod ?? {};
  const byRoom = data?.byRoomType ?? {};
  const total = data?.total ?? 0;

  const methodData = Object.entries(byMethod).map(([name, value]) => ({
    name,
    value: Number(value),
  }));
  const roomData = Object.entries(byRoom).map(([name, value]) => ({
    name,
    value: Number(value),
  }));

  const exportTimeline = () =>
    downloadCSV(
      `revenue-timeline-${from}-to-${to}.csv`,
      ["Date", "Amount (RM)"],
      timeline.map((r: any) => [r.date, r.amount]),
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <div className="flex bg-white/5 rounded-lg p-0.5">
          {(["day", "week", "month"] as const).map((g) => (
            <button
              key={g}
              onClick={() => setGroupBy(g)}
              className={`px-3 py-1.5 rounded-md text-xs font-sans capitalize transition-colors ${
                groupBy === g
                  ? "bg-[#C8102E] text-white"
                  : "text-white/40 hover:text-white"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      <div className="relative bg-[#1A1B21] border border-white/5 rounded-xl p-5 overflow-hidden text-center">
        <div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{ background: accent, opacity: 0.55 }}
        />
        <p className="text-white/40 text-xs font-sans">Total Revenue</p>
        <p
          className="text-3xl font-display font-semibold mt-1 tabular-nums"
          style={{ color: accent }}
        >
          {fmtRM(total)}
        </p>
      </div>

      {isLoading ? (
        <>
          <ChartSkeleton height={220} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartSkeleton height={200} />
            <ChartSkeleton height={200} />
          </div>
        </>
      ) : (
        <>
          {timeline.length > 0 ? (
            <div className="bg-[#1A1B21] border border-white/5 rounded-xl p-5">
              <SectionTitle
                title="Revenue Timeline"
                accent={accent}
                onExport={exportTimeline}
              />
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={timeline}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={accent} stopOpacity={0.28} />
                      <stop offset="95%" stopColor={accent} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.05)"
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: "rgba(255,255,255,0.25)" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "rgba(255,255,255,0.25)" }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(v) => [fmtRM(v), "Revenue"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke={accent}
                    strokeWidth={2}
                    fill="url(#revGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState label="No revenue data for this period" />
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {methodData.length > 0 && (
              <div className="bg-[#1A1B21] border border-white/5 rounded-xl p-5">
                <SectionTitle
                  title="By Payment Method"
                  accent={accent}
                  onExport={() =>
                    downloadCSV(
                      `revenue-by-method-${from}-to-${to}.csv`,
                      ["Method", "Amount (RM)"],
                      methodData.map((m) => [m.name, m.value]),
                    )
                  }
                />
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={methodData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      labelLine={false}
                    >
                      {methodData.map((_, i) => (
                        <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(v) => [fmtRM(v), ""]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
            {roomData.length > 0 && (
              <div className="bg-[#1A1B21] border border-white/5 rounded-xl p-5">
                <SectionTitle
                  title="By Room Type"
                  accent={accent}
                  onExport={() =>
                    downloadCSV(
                      `revenue-by-room-type-${from}-to-${to}.csv`,
                      ["Room Type", "Amount (RM)"],
                      roomData.map((r) => [r.name, r.value]),
                    )
                  }
                />
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={roomData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.05)"
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10, fill: "rgba(255,255,255,0.25)" }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "rgba(255,255,255,0.25)" }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(v) => [fmtRM(v), "Revenue"]}
                    />
                    <Bar
                      dataKey="value"
                      fill="#37EFD1"
                      opacity={0.85}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ── Occupancy Section ────────────────────────────────────────
function OccupancySection({
  accent,
  from,
  to,
}: {
  accent: string;
  from: string;
  to: string;
}) {
  const [roomType, setRoomType] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["report-occupancy", from, to, roomType],
    queryFn: async () => {
      const params: Record<string, unknown> = {
        fromDate: new Date(from).toISOString(),
        toDate: new Date(to).toISOString(),
      };
      if (roomType) params.roomType = roomType;
      const res = await reportService.getOccupancy(params);
      return res.data?.data;
    },
  });

  const byRoomType = Object.entries(data?.byRoomType ?? {}).map(
    ([name, value]) => ({ name, value: Number(value) }),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <select
          value={roomType}
          onChange={(e) => setRoomType(e.target.value)}
          className="bg-[#1A1B21] border border-white/8 text-white text-xs font-sans px-3 py-2.5 rounded-lg outline-none focus:border-[#37EFD1]/40 transition-colors cursor-pointer"
        >
          <option value="">All Room Types</option>
          {[
            "SINGLE",
            "DOUBLE",
            "TWIN",
            "SUITE",
            "DELUXE",
            "PENTHOUSE",
            "FAMILY",
            "VILLA",
          ].map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <>
          <MetricSkeletonGrid count={4} />
          <ChartSkeleton height={200} />
        </>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Metric
              label="Occupancy Rate"
              value={data?.occupancyRate ?? "0%"}
              icon={BedDouble}
              accent={accent}
            />
            <Metric
              label="Total Rooms"
              value={data?.totalRooms ?? 0}
              icon={BarChart2}
              accent="#60a5fa"
            />
            <Metric
              label="Occupied Nights"
              value={data?.occupiedNights ?? 0}
              icon={Calendar}
              accent="#a78bfa"
            />
            <Metric
              label="Period Days"
              value={data?.totalDays ?? 0}
              icon={CalendarRange}
              accent="#fb923c"
            />
          </div>

          {byRoomType.length > 0 ? (
            <div className="bg-[#1A1B21] border border-white/5 rounded-xl p-5">
              <SectionTitle
                title="Occupied Nights by Room Type"
                accent={accent}
                onExport={() =>
                  downloadCSV(
                    `occupancy-${from}-to-${to}.csv`,
                    ["Room Type", "Occupied Nights"],
                    byRoomType.map((r) => [r.name, r.value]),
                  )
                }
              />
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={byRoomType}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.05)"
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: "rgba(255,255,255,0.25)" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "rgba(255,255,255,0.25)" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(v) => [`${v} nights`, "Occupied"]}
                  />
                  <Bar
                    dataKey="value"
                    fill={accent}
                    opacity={0.85}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState label="No occupancy data for this period" />
          )}
        </>
      )}
    </div>
  );
}

// ── Bookings Section ─────────────────────────────────────────
function BookingsSection({
  accent,
  from,
  to,
}: {
  accent: string;
  from: string;
  to: string;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ["report-bookings", from, to],
    queryFn: async () => {
      const res = await reportService.getBookings({
        fromDate: new Date(from).toISOString(),
        toDate: new Date(to).toISOString(),
      });
      return res.data?.data;
    },
  });

  const byStatus = (data?.byStatus ?? []).map((s: any) => ({
    name: s.status,
    value: s._count.status,
  }));
  const bySource = (data?.bySource ?? []).map((s: any) => ({
    name: s.source ?? "DIRECT",
    value: s._count.source,
  }));

  return (
    <div className="space-y-6">
      {isLoading ? (
        <>
          <MetricSkeletonGrid count={4} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartSkeleton height={200} />
            <ChartSkeleton height={200} />
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Metric
              label="Total Bookings"
              value={data?.totals?.count ?? 0}
              icon={Calendar}
              accent={accent}
            />
            <Metric
              label="Total Revenue"
              value={fmtRM(data?.totals?.revenue)}
              icon={DollarSign}
              accent="#37EFD1"
            />
            <Metric
              label="Avg Value"
              value={fmtRM(Number(data?.totals?.avgValue ?? 0).toFixed(0))}
              icon={TrendingUp}
              accent="#a78bfa"
            />
            <Metric
              label="Cancellations"
              value={data?.cancellationCount ?? 0}
              icon={Wrench}
              accent="#C8102E"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {byStatus.length > 0 && (
              <div className="bg-[#1A1B21] border border-white/5 rounded-xl p-5">
                <SectionTitle
                  title="By Status"
                  accent={accent}
                  onExport={() =>
                    downloadCSV(
                      `bookings-by-status-${from}-to-${to}.csv`,
                      ["Status", "Count"],
                      byStatus.map((s: any) => [s.name, s.value]),
                    )
                  }
                />
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={byStatus}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                    >
                      {byStatus.map((_: any, i: number) => (
                        <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend
                      wrapperStyle={{
                        fontSize: "11px",
                        color: "rgba(255,255,255,0.5)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
            {bySource.length > 0 && (
              <div className="bg-[#1A1B21] border border-white/5 rounded-xl p-5">
                <SectionTitle
                  title="By Source"
                  accent={accent}
                  onExport={() =>
                    downloadCSV(
                      `bookings-by-source-${from}-to-${to}.csv`,
                      ["Source", "Count"],
                      bySource.map((s: any) => [s.name, s.value]),
                    )
                  }
                />
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={bySource}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.05)"
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10, fill: "rgba(255,255,255,0.25)" }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "rgba(255,255,255,0.25)" }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar
                      dataKey="value"
                      fill={accent}
                      opacity={0.85}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ── Food Section ──────────────────────────────────────────────
function FoodSection({
  accent,
  from,
  to,
}: {
  accent: string;
  from: string;
  to: string;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ["report-food", from, to],
    queryFn: async () => {
      const res = await reportService.getFood({
        fromDate: new Date(from).toISOString(),
        toDate: new Date(to).toISOString(),
      });
      return res.data?.data;
    },
  });

  const byType = (data?.byOrderType ?? []).map((t: any) => ({
    name: t.type,
    count: t._count.type,
    revenue: Number(t._sum.totalAmount ?? 0),
  }));

  return (
    <div className="space-y-6">
      {isLoading ? (
        <>
          <MetricSkeletonGrid count={4} />
          <ChartSkeleton height={200} />
        </>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Metric
              label="Total Orders"
              value={data?.totalOrders ?? 0}
              icon={ChefHat}
              accent={accent}
            />
            <Metric
              label="Total Revenue"
              value={fmtRM(data?.totalRevenue)}
              icon={DollarSign}
              accent="#37EFD1"
            />
            <Metric
              label="Avg Order Value"
              value={fmtRM(Number(data?.avgOrderValue ?? 0).toFixed(0))}
              icon={TrendingUp}
              accent="#60a5fa"
            />
            <Metric
              label="Top Items"
              value={data?.topMenuItemIds?.length ?? 0}
              icon={Star}
              accent="#a78bfa"
            />
          </div>

          {byType.length > 0 ? (
            <div className="bg-[#1A1B21] border border-white/5 rounded-xl p-5">
              <SectionTitle
                title="Orders by Type"
                accent={accent}
                onExport={() =>
                  downloadCSV(
                    `food-by-type-${from}-to-${to}.csv`,
                    ["Type", "Orders", "Revenue (RM)"],
                    byType.map((t: any) => [t.name, t.count, t.revenue]),
                  )
                }
              />
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={byType}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.05)"
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: "rgba(255,255,255,0.25)" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "rgba(255,255,255,0.25)" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar
                    dataKey="count"
                    fill={accent}
                    opacity={0.85}
                    radius={[4, 4, 0, 0]}
                    name="Orders"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState label="No food order data for this period" />
          )}
        </>
      )}
    </div>
  );
}

// ── Staff Section ────────────────────────────────────────────
function StaffSection({
  accent,
  from,
  to,
}: {
  accent: string;
  from: string;
  to: string;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ["report-staff", from, to],
    queryFn: async () => {
      const res = await reportService.getStaffPerformance({
        fromDate: new Date(from).toISOString(),
        toDate: new Date(to).toISOString(),
      });
      return res.data?.data;
    },
  });

  const topPerformers = data?.topPerformers ?? [];

  const exportStaff = () =>
    downloadCSV(
      `staff-performance-${from}-to-${to}.csv`,
      ["Rank", "Name", "Period", "Rating"],
      topPerformers.map((p: any, i: number) => [
        i + 1,
        `${p.staffProfile?.user?.firstName ?? ""} ${p.staffProfile?.user?.lastName ?? ""}`.trim(),
        p.period,
        Number(p.rating).toFixed(1),
      ]),
    );

  if (isLoading) return <TableSkeleton rows={5} cols={3} />;

  return (
    <div className="space-y-6">
      {topPerformers.length === 0 ? (
        <EmptyState label="No performance data for this period" />
      ) : (
        <div className="bg-[#1A1B21] border border-white/5 rounded-xl p-5">
          <SectionTitle
            title="Top Performers"
            accent={accent}
            onExport={exportStaff}
          />
          <div className="space-y-2">
            {topPerformers.map((p: any, i: number) => (
              <div
                key={p.id}
                className="flex items-center justify-between bg-white/[0.03] border border-white/5 rounded-lg p-3 transition-colors hover:bg-white/[0.05]"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-sans font-semibold flex-shrink-0"
                    style={{
                      background:
                        i === 0 ? `${accent}26` : "rgba(255,255,255,0.05)",
                      color: i === 0 ? accent : "rgba(255,255,255,0.4)",
                    }}
                  >
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-white text-sm font-sans">
                      {p.staffProfile?.user?.firstName}{" "}
                      {p.staffProfile?.user?.lastName}
                    </p>
                    <p className="text-white/40 text-xs font-sans">
                      {p.period}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                  <span className="text-white text-sm font-sans tabular-nums">
                    {Number(p.rating).toFixed(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Daily Reports Section ────────────────────────────────────
function DailySection({
  accent,
  from,
  to,
}: {
  accent: string;
  from: string;
  to: string;
}) {
  const {
    data: reports = [],
    isLoading,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["report-daily", from, to],
    queryFn: async () => {
      const res = await reportService.getDaily({
        fromDate: new Date(from).toISOString(),
        toDate: new Date(to).toISOString(),
      });
      return res.data?.data ?? [];
    },
  });

  const chartData = [...reports].reverse().map((r: any) => ({
    date: new Date(r.date).toLocaleDateString("en-MY", {
      day: "numeric",
      month: "short",
    }),
    revenue: Number(r.totalRevenue),
    checkIns: r.checkIns,
    checkOuts: r.checkOuts,
  }));

  const exportDaily = () =>
    downloadCSV(
      `daily-reports-${from}-to-${to}.csv`,
      ["Date", "Check-ins", "Check-outs", "Revenue (RM)", "Occupancy"],
      reports.map((r: any) => [
        new Date(r.date).toLocaleDateString("en-MY", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        r.checkIns,
        r.checkOuts,
        Number(r.totalRevenue),
        r.occupancyRate ? `${Number(r.occupancyRate).toFixed(1)}%` : "—",
      ]),
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <button
          onClick={() => refetch()}
          className="print:hidden flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 text-white/50 hover:text-white hover:bg-white/5 text-sm font-sans transition-all"
        >
          <RefreshCw size={13} className={isFetching ? "animate-spin" : ""} />{" "}
          Refresh
        </button>
      </div>

      {isLoading ? (
        <>
          <ChartSkeleton height={200} />
          <TableSkeleton rows={6} cols={5} />
        </>
      ) : reports.length === 0 ? (
        <EmptyState label="No daily reports for this period" />
      ) : (
        <>
          {chartData.length > 0 && (
            <div className="bg-[#1A1B21] border border-white/5 rounded-xl p-5">
              <SectionTitle title="Daily Revenue" accent={accent} />
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="dailyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={accent} stopOpacity={0.28} />
                      <stop offset="95%" stopColor={accent} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.05)"
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: "rgba(255,255,255,0.25)" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "rgba(255,255,255,0.25)" }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(v) => [fmtRM(v), "Revenue"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke={accent}
                    strokeWidth={2}
                    fill="url(#dailyGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="bg-[#1A1B21] border border-white/5 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 pt-4">
              <p className="text-white/40 text-xs font-sans uppercase tracking-wider">
                Daily Log
              </p>
              <button
                onClick={exportDaily}
                className="print:hidden flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-sans text-white/40 hover:text-white hover:bg-white/8 border border-white/5 transition-colors"
              >
                <Download className="h-3 w-3" /> CSV
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-sans">
                <thead>
                  <tr className="border-b border-white/8">
                    {[
                      "Date",
                      "Check-ins",
                      "Check-outs",
                      "Revenue",
                      "Occupancy",
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left text-xs text-white/40 uppercase tracking-wider px-4 py-3 whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r: any) => (
                    <tr
                      key={r.id}
                      className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-4 py-3 text-white/70 whitespace-nowrap">
                        {new Date(r.date).toLocaleDateString("en-MY", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3 text-white tabular-nums">
                        {r.checkIns}
                      </td>
                      <td className="px-4 py-3 text-white tabular-nums">
                        {r.checkOuts}
                      </td>
                      <td
                        className="px-4 py-3 font-medium tabular-nums"
                        style={{ color: accent }}
                      >
                        {fmtRM(r.totalRevenue)}
                      </td>
                      <td className="px-4 py-3 text-white/70 tabular-nums">
                        {r.occupancyRate
                          ? `${Number(r.occupancyRate).toFixed(1)}%`
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────
export default function AdminReportsPage() {
  const [activeSection, setActiveSection] = useState<SectionKey>("overview");
  const [revealed, setRevealed] = useState<Set<SectionKey>>(
    new Set(["overview"]),
  );
  const [progress, setProgress] = useState(0);

  // One global date range drives every date-scoped section (Revenue, Occupancy, Bookings, Food, Staff, Daily).
  const [from, setFrom] = useState(
    () => new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0],
  );
  const [to, setTo] = useState(() => new Date().toISOString().split("T")[0]);

  const sectionRefs = useRef<Record<SectionKey, HTMLDivElement | null>>(
    {} as any,
  );

  // Track which section is in view to highlight the nav rail + reveal it once.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          const topMost = visible.sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top,
          )[0];
          const key = topMost.target.id as SectionKey;
          setActiveSection(key);
        }
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const key = e.target.id as SectionKey;
            setRevealed((prev) =>
              prev.has(key) ? prev : new Set(prev).add(key),
            );
          }
        });
      },
      { rootMargin: "-150px 0px -60% 0px", threshold: 0 },
    );
    Object.values(sectionRefs.current).forEach(
      (el) => el && observer.observe(el),
    );
    return () => observer.disconnect();
  }, []);

  // Thin scroll-progress indicator in the sticky bar.
  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      setProgress(
        docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0,
      );
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (key: SectionKey) => {
    sectionRefs.current[key]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handlePrint = useCallback(() => window.print(), []);

  return (
    <div className="space-y-8">
      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @media print {
          .print\\:hidden {
            display: none !important;
          }
          section {
            break-inside: avoid;
            page-break-inside: avoid;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>

      <div className="flex items-start justify-between flex-wrap pt-5 gap-3">
        <div>
          <h1 className="font-display text-2xl text-white font-semibold">
            Reports
          </h1>
          <p className="text-white/35 text-sm font-sans mt-0.5">
            Hotel performance analytics and insights
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="print:hidden flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 text-white/50 hover:text-white hover:bg-white/5 text-sm font-sans transition-all"
        >
          <Printer size={14} /> Print / Save PDF
        </button>
      </div>

      {/* Sticky control bar: scroll progress → section rail → global date range
    The layout has a fixed/sticky topbar of h-14 (56px) above this content,
    so this bar sticks at top-14 to sit flush right below the topbar
    instead of top-0 (which would slide under/behind it). */}
      <div className="print:hidden sticky top-0 z-20 px-1 bg-[#111116]/90 backdrop-blur-sm border-b border-white/[0.06]">
        <div className="h-[2px] bg-white/5">
          <div
            className="h-full transition-[width] duration-150 ease-out"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg, #37EFD1, #C8102E)",
            }}
          />
        </div>

        <div className="py-2 flex gap-1.5 overflow-x-auto no-scrollbar">
          {SECTIONS.map((s) => {
            const Icon = s.icon;
            const isActive = s.key === activeSection;
            return (
              <button
                key={s.key}
                onClick={() => scrollTo(s.key)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-sans whitespace-nowrap transition-all duration-200 border"
                style={{
                  color: isActive ? "#fff" : "rgba(255,255,255,0.4)",
                  background: isActive ? `${s.accent}1F` : "transparent",
                  borderColor: isActive
                    ? `${s.accent}55`
                    : "rgba(255,255,255,0.06)",
                }}
              >
                <Icon
                  className="h-3 w-3 flex-shrink-0"
                  style={{ color: isActive ? s.accent : undefined }}
                />
                {s.label}
              </button>
            );
          })}
        </div>

        <div className="pb-3 flex items-center gap-2">
          <span className="text-white/30 text-[11px] font-sans">
            Date range for Revenue → Daily:
          </span>
          <DateRangeFilter
            from={from}
            to={to}
            onFromChange={setFrom}
            onToChange={setTo}
          />
        </div>
      </div>

      {/* All reports, stacked in one scroll */}
      <div className="space-y-10">
        <ReportSection
          meta={SECTIONS[0]}
          registerRef={(el) => (sectionRefs.current.overview = el)}
          revealed={revealed.has("overview")}
        >
          <OverviewSection accent={SECTIONS[0].accent} />
        </ReportSection>

        <ReportSection
          meta={SECTIONS[1]}
          registerRef={(el) => (sectionRefs.current.revenue = el)}
          revealed={revealed.has("revenue")}
        >
          <RevenueSection accent={SECTIONS[1].accent} from={from} to={to} />
        </ReportSection>

        <ReportSection
          meta={SECTIONS[2]}
          registerRef={(el) => (sectionRefs.current.occupancy = el)}
          revealed={revealed.has("occupancy")}
        >
          <OccupancySection accent={SECTIONS[2].accent} from={from} to={to} />
        </ReportSection>

        <ReportSection
          meta={SECTIONS[3]}
          registerRef={(el) => (sectionRefs.current.bookings = el)}
          revealed={revealed.has("bookings")}
        >
          <BookingsSection accent={SECTIONS[3].accent} from={from} to={to} />
        </ReportSection>

        <ReportSection
          meta={SECTIONS[4]}
          registerRef={(el) => (sectionRefs.current.food = el)}
          revealed={revealed.has("food")}
        >
          <FoodSection accent={SECTIONS[4].accent} from={from} to={to} />
        </ReportSection>

        <ReportSection
          meta={SECTIONS[5]}
          registerRef={(el) => (sectionRefs.current.staff = el)}
          revealed={revealed.has("staff")}
        >
          <StaffSection accent={SECTIONS[5].accent} from={from} to={to} />
        </ReportSection>

        <ReportSection
          meta={SECTIONS[6]}
          registerRef={(el) => (sectionRefs.current.daily = el)}
          revealed={revealed.has("daily")}
        >
          <DailySection accent={SECTIONS[6].accent} from={from} to={to} />
        </ReportSection>
      </div>
    </div>
  );
}
