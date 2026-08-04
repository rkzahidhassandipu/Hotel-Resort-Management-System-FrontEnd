import { ReviewStatus, STATUS_CFG } from "./reviewTypes";

export default function StatusBadge({ status }: { status: ReviewStatus }) {
  const c = STATUS_CFG[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium font-sans ${c.color} ${c.bgClass}`}>
      {c.label}
    </span>
  );
}