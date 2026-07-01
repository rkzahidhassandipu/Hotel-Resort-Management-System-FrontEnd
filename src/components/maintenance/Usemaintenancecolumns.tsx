'use client';
import { Eye, Pencil } from 'lucide-react';
import { Column } from '@/components/shared/table/DataTable';
import StatusBadgeCell from '@/components/shared/cell/StatusBadgeCell';

const priorityDot: Record<string, string> = {
  LOW: '#4ade80', MEDIUM: '#facc15', HIGH: '#fb923c', URGENT: '#f87171', CRITICAL: '#ef4444',
};

interface Params {
  onView: (ticket: any) => void;
  onEdit: (ticket: any) => void;
}

// Returns the column config for the maintenance tickets table.
// Kept as a plain function (not a hook) since it has no internal state —
// callers just need fresh closures over onView/onEdit on each render.
export function useMaintenanceColumns({ onView, onEdit }: Params): Column<any>[] {
  return [
    {
      key: 'ticketNumber',
      header: 'Ticket #',
      render: (_, r) => <span className="text-[#37EFD1] font-mono text-xs">{r.ticketNumber}</span>,
    },
    {
      key: 'title',
      header: 'Issue',
      render: (_, r) => (
        <div>
          <p className="text-white text-sm leading-tight">{r.title}</p>
          <p className="text-white/40 text-xs mt-0.5">{r.type}</p>
        </div>
      ),
    },
    {
      key: 'room',
      header: 'Location',
      render: (_, r) => (
        <span className="text-white/60 text-xs">
          {r.room ? `Room ${r.room.roomNumber}` : r.location || '—'}
        </span>
      ),
    },
    {
      key: 'priority',
      header: 'Priority',
      render: (_, r) => (
        <div className="flex items-center gap-1.5">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: priorityDot[r.priority] || '#6b7280' }}
          />
          <span className="text-white/70 text-xs">{r.priority}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (_, r) => <StatusBadgeCell status={r.status} />,
    },
    {
      key: 'assignedTo',
      header: 'Assigned',
      render: (_, r) => (
        <span className="text-white/50 text-xs">
          {r.assignedTo ? `${r.assignedTo.firstName} ${r.assignedTo.lastName}` : '—'}
        </span>
      ),
    },
    {
      key: 'id',
      header: 'Actions',
      render: (_, r) => (
        <div className="flex items-center gap-2">
          {/* View — opens read-only modal with full ticket detail */}
          <button
            onClick={() => onView(r)}
            className="p-1.5 rounded-lg bg-white/5 text-white/40 hover:text-[#37EFD1] hover:bg-[#37EFD1]/10 transition-all"
            title="View details"
          >
            <Eye size={13} />
          </button>
          {/* Edit — opens right-side slide panel: update / assign / complete / cancel */}
          <button
            onClick={() => onEdit(r)}
            className="p-1.5 rounded-lg bg-white/5 text-white/40 hover:text-blue-400 hover:bg-blue-400/10 transition-all"
            title="Edit / Actions"
          >
            <Pencil size={13} />
          </button>
        </div>
      ),
    },
  ];
}