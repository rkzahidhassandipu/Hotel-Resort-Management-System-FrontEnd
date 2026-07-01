'use client';
import { X, MapPin, User, Clock, Tag } from 'lucide-react';
import StatusBadgeCell from '@/components/shared/cell/StatusBadgeCell';

interface MaintenancePart {
  id: string;
  partName: string;
  quantity: number;
  unitCost: number | string;
  totalCost: number | string;
}

interface MaintenanceTicket {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  type: string;
  priority: string;
  status: string;
  location?: string;
  notes?: string;
  actualHours?: number | string;
  cost?: number | string;
  createdAt: string;
  scheduledAt?: string;
  startedAt?: string;
  completedAt?: string;
  room?: { roomNumber: string; floor: number; type?: string };
  reportedBy?: { firstName: string; lastName: string; role: string };
  assignedTo?: { firstName: string; lastName: string; role?: string };
  parts?: MaintenancePart[];
}

interface Props {
  ticket: MaintenanceTicket;
  onClose: () => void;
}

const priorityColors: Record<string, string> = {
  LOW: 'text-green-400 bg-green-400/10',
  MEDIUM: 'text-yellow-400 bg-yellow-400/10',
  HIGH: 'text-orange-400 bg-orange-400/10',
  URGENT: 'text-red-400 bg-red-400/10',
  CRITICAL: 'text-red-500 bg-red-500/20',
};

const fmt = (d?: string) =>
  d ? new Date(d).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : '—';

// Prisma Decimal fields are often serialized as strings over JSON — coerce
// safely before formatting so we never call .toFixed() on a non-number.
const money = (v?: number | string) => {
  if (v === undefined || v === null) return null;
  const n = typeof v === 'string' ? parseFloat(v) : v;
  return Number.isNaN(n) ? null : `$${n.toFixed(2)}`;
};

export default function MaintenanceTicketModal({ ticket, onClose }: Props) {
  const costDisplay = money(ticket.cost);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#13141A] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-white/10">
          <div>
            <span className="text-[#37EFD1] font-mono text-xs">{ticket.ticketNumber}</span>
            <h2 className="text-white font-semibold text-lg mt-1">{ticket.title}</h2>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <StatusBadgeCell status={ticket.status} />
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColors[ticket.priority] || 'text-white/50 bg-white/5'}`}>
                {ticket.priority}
              </span>
              <span className="text-xs text-white/40 bg-white/5 px-2 py-0.5 rounded-full">{ticket.type}</span>
            </div>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors mt-1">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Description */}
          <div>
            <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Description</p>
            <p className="text-white/80 text-sm leading-relaxed">{ticket.description}</p>
          </div>

          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-4">
            <InfoItem icon={MapPin} label="Location" value={ticket.room ? `Room ${ticket.room.roomNumber} · Floor ${ticket.room.floor}` : ticket.location || '—'} />
            <InfoItem icon={User} label="Reported By" value={ticket.reportedBy ? `${ticket.reportedBy.firstName} ${ticket.reportedBy.lastName}` : '—'} />
            <InfoItem icon={User} label="Assigned To" value={ticket.assignedTo ? `${ticket.assignedTo.firstName} ${ticket.assignedTo.lastName}` : 'Unassigned'} />
            <InfoItem icon={Clock} label="Created" value={fmt(ticket.createdAt)} />
            {ticket.scheduledAt && <InfoItem icon={Clock} label="Scheduled" value={fmt(ticket.scheduledAt)} />}
            {ticket.startedAt && <InfoItem icon={Clock} label="Started" value={fmt(ticket.startedAt)} />}
            {ticket.completedAt && <InfoItem icon={Clock} label="Completed" value={fmt(ticket.completedAt)} />}
            {ticket.actualHours != null && <InfoItem icon={Clock} label="Hours Spent" value={`${ticket.actualHours}h`} />}
            {costDisplay && <InfoItem icon={Tag} label="Cost" value={costDisplay} />}
          </div>

          {/* Notes */}
          {ticket.notes && (
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Notes</p>
              <p className="text-white/70 text-sm">{ticket.notes}</p>
            </div>
          )}

          {/* Parts */}
          {ticket.parts && ticket.parts.length > 0 && (
            <div>
              <p className="text-xs text-white/40 uppercase tracking-wider mb-3">Parts Used</p>
              <div className="space-y-2">
                {ticket.parts.map((p) => (
                  <div key={p.id} className="flex items-center justify-between bg-white/5 rounded-lg px-4 py-2.5">
                    <span className="text-white/80 text-sm">{p.partName}</span>
                    <div className="flex items-center gap-4 text-xs text-white/50">
                      <span>Qty: {p.quantity}</span>
                      <span>Unit: {money(p.unitCost) ?? '—'}</span>
                      <span className="text-[#37EFD1] font-medium">Total: {money(p.totalCost) ?? '—'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon size={14} className="text-white/30 mt-0.5 shrink-0" />
      <div>
        <p className="text-xs text-white/40">{label}</p>
        <p className="text-white/80 text-sm">{value}</p>
      </div>
    </div>
  );
}