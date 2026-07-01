import { Clock, RefreshCw, CheckCircle2, AlertTriangle } from "lucide-react";
import StatsCard from "@/components/shared/StatsCard";
import { ServiceRequest } from "@/types";

interface Props {
  pendingCount: number;
  inProgressCount: number;
  completedCount: number;
  requests?: ServiceRequest[];
}

export default function ServiceRequestsStats({ pendingCount, inProgressCount, completedCount, requests = [] }: Props) {
  const urgent = requests.filter(
    r => r.priority === "URGENT" && !["COMPLETED", "CANCELLED"].includes(r.status)
  ).length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCard title="Pending"     value={pendingCount}    icon={Clock}         color="#F59E0B" />
      <StatsCard title="In Progress" value={inProgressCount} icon={RefreshCw}     color="#37EFD1" />
      <StatsCard title="Completed"   value={completedCount}  icon={CheckCircle2}  color="#10B981" />
      <StatsCard title="Urgent"      value={urgent}          icon={AlertTriangle} color="#C8102E" />
    </div>
  );
}