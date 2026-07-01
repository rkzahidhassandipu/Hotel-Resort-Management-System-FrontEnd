export type SRPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

const PRIORITY_CFG: Record<SRPriority, { color: string; dot: string }> = {
  LOW:    { color: "text-white/40",   dot: "bg-white/40" },
  MEDIUM: { color: "text-blue-400",   dot: "bg-blue-400" },
  HIGH:   { color: "text-orange-400", dot: "bg-orange-400" },
  URGENT: { color: "text-red-400",    dot: "bg-red-400" },
};

export default function PriorityBadge({ priority }: { priority: SRPriority }) {
  const { color, dot } = PRIORITY_CFG[priority];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-sans font-medium ${color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {priority}
    </span>
  );
}