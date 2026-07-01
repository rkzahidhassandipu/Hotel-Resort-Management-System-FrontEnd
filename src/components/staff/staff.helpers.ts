export interface StaffProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  staffProfile?: { id: string; department: string; designation: string };
}

export const PRIORITY_COLOR: Record<string, string> = {
  LOW: "bg-white/5 text-white/40",
  MEDIUM: "bg-blue-500/15 text-blue-400",
  HIGH: "bg-orange-500/15 text-orange-400",
  URGENT: "bg-red-500/15 text-red-400",
};

export const STATUS_COLOR: Record<string, string> = {
  ASSIGNED: "bg-white/5 text-white/50",
  IN_PROGRESS: "bg-blue-500/15 text-blue-400",
  COMPLETED: "bg-green-500/15 text-green-400",
  CANCELLED: "bg-red-500/15 text-red-400",
  OVERDUE: "bg-orange-500/15 text-orange-400",
};

export const SHIFT_TYPE_COLOR: Record<string, string> = {
  MORNING: "bg-yellow-500/15 text-yellow-400",
  AFTERNOON: "bg-orange-500/15 text-orange-400",
  EVENING: "bg-purple-500/15 text-purple-400",
  NIGHT: "bg-blue-500/15 text-blue-400",
  FLEXIBLE: "bg-green-500/15 text-green-400",
};

export function fmtDate(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" });
}

export function fmtTime(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleTimeString("en-MY", { hour: "2-digit", minute: "2-digit" });
}