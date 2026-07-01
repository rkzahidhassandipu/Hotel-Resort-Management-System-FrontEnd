'use client';
import { Wrench } from 'lucide-react';
import StatsCard from '@/components/shared/StatsCard';

interface MaintenanceStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  overduePending: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  byType: Record<string, number>;
}

interface Props {
  stats: MaintenanceStats;
}

export default function MaintenanceStatsRow({ stats }: Props) {
  console.log(stats)
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCard title="Total Tickets" value={stats.total} icon={Wrench} color="#37EFD1" />
  <StatsCard title="Pending" value={stats.pending} icon={Wrench} color="#fb923c" />
  <StatsCard title="In Progress" value={stats.inProgress} icon={Wrench} color="#60a5fa" />
  <StatsCard title="Completed" value={stats.completed} icon={Wrench} color="#a78bfa" />

    </div>
  );
}