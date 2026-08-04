import type { Review } from "@/types";

export type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED" | "FLAGGED";

export const STATUS_CFG: Record<ReviewStatus, { label: string; color: string; bgClass: string }> = {
  PENDING:  { label: "Pending",  color: "text-yellow-400", bgClass: "bg-yellow-400/10" },
  APPROVED: { label: "Approved", color: "text-green-400",  bgClass: "bg-green-400/10" },
  REJECTED: { label: "Rejected", color: "text-red-400",    bgClass: "bg-red-400/10" },
  FLAGGED:  { label: "Flagged",  color: "text-orange-400", bgClass: "bg-orange-400/10" },
};

export const inputCls = "w-full bg-[#0B0C10] border border-white/8 text-white text-sm font-sans px-3 py-2 rounded-lg outline-none focus:border-[#37EFD1]/40 transition-colors placeholder:text-white/20";
export const selectCls = `${inputCls} cursor-pointer`;

export const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" });