'use client';
import { CheckCircle2, PlayCircle } from 'lucide-react';
import { Column } from '@/components/shared/table/DataTable';
import StatusBadgeCell from '@/components/shared/cell/StatusBadgeCell';

interface Params {
  startingId: string | null;
  completingId: string | null;
  onStart: (logId: string) => void;
  onComplete: (logId: string) => void;
}

// Status-aware action column:
//   PENDING     -> "Start" button  (calls onStart, log moves to IN_PROGRESS)
//   IN_PROGRESS -> "Mark Done"     (calls onComplete, log moves to COMPLETED)
//   COMPLETED   -> static "Done" label, no action
export function useHousekeepingColumns({
  startingId, completingId, onStart, onComplete,
}: Params): Column<any>[] {
  return [
    {
      key: 'room',
      header: 'Room',
      render: (_, r) => (
        <div>
          <p className="text-white text-sm">Room {r.room?.roomNumber}</p>
          <p className="text-white/40 text-xs">Floor {r.room?.floor}</p>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (_, r) => <span className="text-white/60 text-xs">{r.type?.replace('_', ' ')}</span>,
    },
    {
      key: 'staff',
      header: 'Staff',
      render: (_, r) => (
        <span className="text-white/60 text-xs">
          {r.staff ? `${r.staff.firstName} ${r.staff.lastName}` : '—'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (_, r) => <StatusBadgeCell status={r.status} />,
    },
    {
      key: 'date',
      header: 'Date',
      render: (_, r) => (
        <span className="text-white/40 text-xs">
          {r.date ? new Date(r.date).toLocaleDateString() : '—'}
        </span>
      ),
    },
    {
      key: 'id',
      header: 'Actions',
      render: (_, r) => {
        if (r.status === 'PENDING') {
          const isStarting = startingId === r.id;
          return (
            <button
              onClick={() => onStart(r.id)}
              disabled={isStarting}
              className="flex items-center gap-1.5 text-xs text-[#60a5fa] hover:underline disabled:opacity-50"
            >
              <PlayCircle size={13} />
              {isStarting ? 'Starting...' : 'Start'}
            </button>
          );
        }

        if (r.status === 'IN_PROGRESS') {
          const isCompleting = completingId === r.id;
          return (
            <button
              onClick={() => onComplete(r.id)}
              disabled={isCompleting}
              className="flex items-center gap-1.5 text-xs text-[#37EFD1] hover:underline disabled:opacity-50"
            >
              <CheckCircle2 size={13} />
              {isCompleting ? 'Updating...' : 'Mark Done'}
            </button>
          );
        }

        // COMPLETED (or any other terminal/unknown status) — no action
        return <span className="text-white/20 text-xs">Done</span>;
      },
    },
  ];
}