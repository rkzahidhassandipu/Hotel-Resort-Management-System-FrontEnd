// src/app/(customer)/notifications/notification.columns.tsx
import { Eye, Loader2, Trash2 } from 'lucide-react';
import { Column } from '@/components/shared/table/DataTable';
import DateCell from '@/components/shared/cell/DateCell';
import type { Notification } from '@/types';

interface Props {
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
  onViewDetails: (notification: Notification) => void;
  actionLoadingId: string | null;
}

export const notificationColumns = ({
  onMarkRead,
  onDelete,
  onViewDetails,
  actionLoadingId,
}: Props): Column<Notification>[] => [
  {
    key: 'title',
    header: 'Notification',
    render: (_, r) => (
      <div
        onClick={() => !r.isRead && onMarkRead(r.id)}
        className="cursor-pointer"
      >
        <p
          className={`text-sm font-sans ${
            r.isRead ? 'text-white/40' : 'text-white font-medium'
          }`}
        >
          {r.title}
        </p>
        <p className="text-white/30 text-xs mt-0.5">{r.message}</p>
      </div>
    ),
  },
  {
    key: 'isRead',
    header: 'Status',
    render: (_, r) => (
      <span
        className={`text-xs px-2 py-0.5 rounded-full ${
          r.isRead
            ? 'bg-white/5 text-white/30'
            : 'bg-[#37EFD1]/10 text-[#37EFD1]'
        }`}
      >
        {r.isRead ? 'Read' : 'Unread'}
      </span>
    ),
  },
  {
    key: 'createdAt',
    header: 'Time',
    render: (_, r) => <DateCell date={r.createdAt} />,
  },
  {
    key: 'id',
    header: '',
    render: (_, r) => (
      <div className="flex items-center gap-1 justify-end">
        <button
          onClick={() => onViewDetails(r)}
          className="p-1.5 rounded text-white/20 hover:text-[#37EFD1] transition-colors"
          title="View details"
        >
          <Eye className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => onDelete(r.id)}
          disabled={actionLoadingId === r.id}
          className="p-1.5 rounded text-white/20 hover:text-[#C8102E] transition-colors"
          title="Delete"
        >
          {actionLoadingId === r.id ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Trash2 className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
    ),
  },
];