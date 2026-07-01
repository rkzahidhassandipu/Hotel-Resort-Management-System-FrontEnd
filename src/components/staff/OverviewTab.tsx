"use client";
import { useState, useEffect } from "react";
import { Users, Loader2, CheckSquare, ClipboardList, AlertTriangle, User } from "lucide-react";
import { staffService } from "@/service/staff.service";
import StatsCard from "@/components/shared/StatsCard";
import { fmtTime, SHIFT_TYPE_COLOR } from "./staff.helpers";
import { Badge } from "./taff.components";

interface StaffStats {
  totalStaff: number;
  onDutyToday: number;
  overdueCount: number;
  tasksByStatus: { status: string; _count: { status: number } }[];
}

export default function OverviewTab() {
  const [stats, setStats] = useState<StaffStats | null>(null);
  const [onDuty, setOnDuty] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([staffService.getStats(), staffService.getOnDuty()])
      .then(([s, d]) => {
        setStats(s.data?.data ?? s.data);
        setOnDuty(d.data?.data ?? d.data ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-white/30" /></div>;

  const taskCount = (status: string) =>
    stats?.tasksByStatus.find((t) => t.status === status)?._count?.status ?? 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Staff" value={stats?.totalStaff ?? 0} icon={Users} color="#37EFD1" />
        <StatsCard title="On Duty Today" value={stats?.onDutyToday ?? 0} icon={CheckSquare} color="#60a5fa" />
        <StatsCard title="Active Tasks" value={taskCount("IN_PROGRESS")} icon={ClipboardList} color="#fb923c" />
        <StatsCard title="Overdue Tasks" value={stats?.overdueCount ?? 0} icon={AlertTriangle} color="#C8102E" />
      </div>

      <div className="bg-[#1A1B21] border border-white/5 rounded-xl p-5">
        <h2 className="text-white font-display text-base font-semibold mb-4">Task Breakdown</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {["ASSIGNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"].map((s) => (
            <div key={s} className="bg-[#0B0C10] border border-white/5 rounded-lg p-4 text-center">
              <p className="text-2xl font-display text-white font-semibold">{taskCount(s)}</p>
              <p className="text-[11px] text-white/40 mt-1 font-sans">{s.replace("_", " ")}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#1A1B21] border border-white/5 rounded-xl p-5">
        <h2 className="text-white font-display text-base font-semibold mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          Currently On Duty
        </h2>
        {onDuty.length === 0 ? (
          <p className="text-white/30 text-sm font-sans py-4 text-center">No staff on duty today</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {onDuty.map((s: any) => (
              <div key={s.id} className="flex items-center gap-3 bg-[#0B0C10] border border-white/5 rounded-lg p-3">
                <div className="w-8 h-8 rounded-full bg-[#37EFD1]/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-[#37EFD1]" />
                </div>
                <div>
                  <p className="text-white text-sm font-sans">{s.staffProfile?.user?.firstName} {s.staffProfile?.user?.lastName}</p>
                  <p className="text-white/40 text-xs">{s.staffProfile?.user?.role} · {fmtTime(s.startTime)} – {fmtTime(s.endTime)}</p>
                </div>
                <Badge label={s.type} colorClass={SHIFT_TYPE_COLOR[s.type] ?? "bg-white/5 text-white/40"} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}