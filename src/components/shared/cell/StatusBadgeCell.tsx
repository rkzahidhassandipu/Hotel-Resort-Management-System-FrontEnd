const statusMap: Record<string, { label: string; color: string; bg: string }> = {
  PENDING:              { label: 'Pending',       color: '#fb923c', bg: 'rgba(251,146,60,0.12)' },
  CONFIRMED:            { label: 'Confirmed',     color: '#60a5fa', bg: 'rgba(96,165,250,0.12)' },
  CHECKED_IN:           { label: 'Checked In',    color: '#37EFD1', bg: 'rgba(55,239,209,0.12)' },
  CHECKED_OUT:          { label: 'Checked Out',   color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' },
  CANCELLED:            { label: 'Cancelled',     color: '#C8102E', bg: 'rgba(200,16,46,0.12)' },
  NO_SHOW:              { label: 'No Show',       color: '#C8102E', bg: 'rgba(200,16,46,0.12)' },
  AVAILABLE:            { label: 'Available',     color: '#37EFD1', bg: 'rgba(55,239,209,0.12)' },
  OCCUPIED:             { label: 'Occupied',      color: '#60a5fa', bg: 'rgba(96,165,250,0.12)' },
  CLEANING:             { label: 'Cleaning',      color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
  MAINTENANCE:          { label: 'Maintenance',   color: '#fb923c', bg: 'rgba(251,146,60,0.12)' },
  OUT_OF_ORDER:         { label: 'Out of Order',  color: '#C8102E', bg: 'rgba(200,16,46,0.12)' },
  COMPLETED:            { label: 'Completed',     color: '#37EFD1', bg: 'rgba(55,239,209,0.12)' },
  FAILED:               { label: 'Failed',        color: '#C8102E', bg: 'rgba(200,16,46,0.12)' },
  REFUNDED:             { label: 'Refunded',      color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' },
  PREPARING:            { label: 'Preparing',     color: '#fb923c', bg: 'rgba(251,146,60,0.12)' },
  READY:                { label: 'Ready',         color: '#37EFD1', bg: 'rgba(55,239,209,0.12)' },
  DELIVERED:            { label: 'Delivered',     color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' },
  IN_PROGRESS:          { label: 'In Progress',   color: '#60a5fa', bg: 'rgba(96,165,250,0.12)' },
  ON_HOLD:              { label: 'On Hold',       color: '#fb923c', bg: 'rgba(251,146,60,0.12)' },
  ACTIVE:               { label: 'Active',        color: '#37EFD1', bg: 'rgba(55,239,209,0.12)' },
  INACTIVE:             { label: 'Inactive',      color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' },
  SUSPENDED:            { label: 'Suspended',     color: '#C8102E', bg: 'rgba(200,16,46,0.12)' },
  LOW:                  { label: 'Low',           color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' },
  MEDIUM:               { label: 'Medium',        color: '#60a5fa', bg: 'rgba(96,165,250,0.12)' },
  HIGH:                 { label: 'High',          color: '#fb923c', bg: 'rgba(251,146,60,0.12)' },
  URGENT:               { label: 'Urgent',        color: '#C8102E', bg: 'rgba(200,16,46,0.12)' },
};
interface Props { status: string; }
export default function StatusBadgeCell({ status }: Props) {
  const s = statusMap[status] || { label: status, color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' };
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-sans font-medium"
      style={{ color: s.color, background: s.bg, border: `1px solid ${s.color}30` }}>
      {s.label}
    </span>
  );
}
