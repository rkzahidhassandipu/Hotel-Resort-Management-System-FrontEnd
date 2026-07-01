import { Clock, UserCheck, RefreshCw, CheckCircle2, XCircle } from "lucide-react";

export type SRStatus = "PENDING" | "ASSIGNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export const STATUS_CFG: Record<SRStatus, { label: string; color: string; bgClass: string; icon: React.ReactNode }> = {
  PENDING:     { label: "Pending",     color: "text-yellow-400", bgClass: "bg-yellow-400/10", icon: <Clock size={11} /> },
  ASSIGNED:    { label: "Assigned",    color: "text-blue-400",   bgClass: "bg-blue-400/10",   icon: <UserCheck size={11} /> },
  IN_PROGRESS: { label: "In Progress", color: "text-[#37EFD1]",  bgClass: "bg-[#37EFD1]/10", icon: <RefreshCw size={11} /> },
  COMPLETED:   { label: "Completed",   color: "text-green-400",  bgClass: "bg-green-400/10",  icon: <CheckCircle2 size={11} /> },
  CANCELLED:   { label: "Cancelled",   color: "text-white/40",   bgClass: "bg-white/5",       icon: <XCircle size={11} /> },
};

export default function StatusBadge({ status }: { status: SRStatus }) {
  const c = STATUS_CFG[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium font-sans ${c.color} ${c.bgClass}`}>
      {c.icon} {c.label}
    </span>
  );
}