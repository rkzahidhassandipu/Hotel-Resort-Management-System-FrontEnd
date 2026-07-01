'use client';
import { Wrench, BedDouble } from 'lucide-react';

export type MaintenanceTab = 'MAINTENANCE' | 'HOUSEKEEPING';

interface Props {
  active: MaintenanceTab;
  onChange: (tab: MaintenanceTab) => void;
}

export default function MaintenanceTabs({ active, onChange }: Props) {
  return (
    <div className="flex gap-4 border-b border-white/10">
      <TabBtn
        active={active === 'MAINTENANCE'}
        onClick={() => onChange('MAINTENANCE')}
        icon={<Wrench size={15} />}
        label="Maintenance Tickets"
      />
      <TabBtn
        active={active === 'HOUSEKEEPING'}
        onClick={() => onChange('HOUSEKEEPING')}
        icon={<BedDouble size={15} />}
        label="Housekeeping Logs"
      />
    </div>
  );
}

function TabBtn({
  active, onClick, icon, label,
}: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 pb-3 text-sm font-medium transition-all border-b-2 ${
        active
          ? 'text-[#37EFD1] border-[#37EFD1]'
          : 'text-white/40 border-transparent hover:text-white/70'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}