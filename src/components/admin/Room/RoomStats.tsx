import { BedDouble } from "lucide-react";
import StatsCard from "@/components/shared/StatsCard";

interface RoomStatsProps {
  total: number;
  byStatus: Record<string, number>;
}

export function RoomStats({ total, byStatus }: RoomStatsProps) {
  const statsConfig = [
    { label: "Total Rooms", value: total, color: "#60a5fa" },
    { label: "Available", value: byStatus.AVAILABLE ?? 0, color: "#37EFD1" },
    { label: "Occupied", value: byStatus.OCCUPIED ?? 0, color: "#C8102E" },
    { label: "Cleaning", value: byStatus.CLEANING ?? 0, color: "#a78bfa" },
    { label: "Maintenance", value: byStatus.MAINTENANCE ?? 0, color: "#fb923c" },
    { label: "Out of Order", value: byStatus.OUT_OF_ORDER ?? 0, color: "#6b7280" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {statsConfig.map((s) => (
        <StatsCard key={s.label} title={s.label} value={s.value} icon={BedDouble} color={s.color} />
      ))}
    </div>
  );
}