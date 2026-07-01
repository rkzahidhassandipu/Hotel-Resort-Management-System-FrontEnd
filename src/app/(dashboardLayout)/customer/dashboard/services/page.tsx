'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus, Filter, RefreshCw, ClipboardList, Clock, CheckCircle2,
  XCircle, AlertTriangle, UserCheck, ChevronDown, Search, X, Eye, UserPlus,
} from 'lucide-react';
import { serviceRequestService } from '@/service/service-request.service';

// ─── Types ───────────────────────────────────────────────────────────────────
type SRStatus = 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
type SRPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
type SRType =
  | 'LAUNDRY' | 'ROOM_SERVICE' | 'EXTRA_TOWELS' | 'EXTRA_PILLOW'
  | 'WAKE_UP_CALL' | 'TAXI_BOOKING' | 'TOUR_BOOKING' | 'SPA_BOOKING'
  | 'SPECIAL_ARRANGEMENT' | 'OTHER';

interface ServiceRequest {
  id: string;
  type: SRType;
  status: SRStatus;
  priority: SRPriority;
  description?: string;
  notes?: string;
  cost?: number;
  scheduledAt?: string;
  completedAt?: string;
  createdAt: string;
  customerId: string;
  bookingId?: string;
  assignedToId?: string;
  customer?: { firstName: string; lastName: string; phone: string };
  booking?: { bookingNumber: string; room?: { roomNumber: string } };
}

interface PaginationMeta {
  total: number; page: number; limit: number; totalPages: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const STATUS_CFG: Record<SRStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  PENDING:     { label: 'Pending',     color: '#F59E0B', bg: 'rgba(245,158,11,0.12)',  icon: <Clock size={11} /> },
  ASSIGNED:    { label: 'Assigned',    color: '#3B82F6', bg: 'rgba(59,130,246,0.12)',  icon: <UserCheck size={11} /> },
  IN_PROGRESS: { label: 'In Progress', color: '#37EFD1', bg: 'rgba(55,239,209,0.12)', icon: <RefreshCw size={11} /> },
  COMPLETED:   { label: 'Completed',   color: '#10B981', bg: 'rgba(16,185,129,0.12)', icon: <CheckCircle2 size={11} /> },
  CANCELLED:   { label: 'Cancelled',   color: '#6B7280', bg: 'rgba(107,114,128,0.12)',icon: <XCircle size={11} /> },
};

const PRIORITY_CFG: Record<SRPriority, { color: string }> = {
  LOW:    { color: '#6B7280' },
  MEDIUM: { color: '#3B82F6' },
  HIGH:   { color: '#F59E0B' },
  URGENT: { color: '#C8102E' },
};

const SR_TYPES: SRType[] = [
  'LAUNDRY','ROOM_SERVICE','EXTRA_TOWELS','EXTRA_PILLOW',
  'WAKE_UP_CALL','TAXI_BOOKING','TOUR_BOOKING','SPA_BOOKING','SPECIAL_ARRANGEMENT','OTHER',
];

// ─── Shared styles ────────────────────────────────────────────────────────────
const S = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.72)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, backdropFilter: 'blur(4px)', padding: 20,
  } as React.CSSProperties,
  modal: {
    background: '#1A1B21', borderRadius: 16, padding: 28,
    border: '1px solid rgba(255,255,255,0.08)', width: '100%', maxWidth: 500,
    maxHeight: '90vh', overflowY: 'auto', fontFamily: 'Inter, sans-serif',
  } as React.CSSProperties,
  input: {
    width: '100%', padding: '9px 12px', borderRadius: 8,
    background: '#0B0C10', border: '1px solid rgba(255,255,255,0.1)',
    color: '#E5E7EB', fontSize: 13, outline: 'none', boxSizing: 'border-box' as const,
  } as React.CSSProperties,
  label: {
    display: 'flex', flexDirection: 'column' as const, gap: 5,
    fontSize: 12, fontWeight: 600, color: '#9CA3AF',
  } as React.CSSProperties,
  primary: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '9px 18px', borderRadius: 8, border: 'none',
    background: '#37EFD1', color: '#0B0C10', fontWeight: 700, fontSize: 13, cursor: 'pointer',
  } as React.CSSProperties,
  ghost: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '8px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)',
    background: 'transparent', color: '#9CA3AF', fontWeight: 600, fontSize: 13, cursor: 'pointer',
  } as React.CSSProperties,
  iconBtn: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    padding: 8, borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)',
    background: 'transparent', color: '#9CA3AF', cursor: 'pointer',
  } as React.CSSProperties,
};

// ─── Micro-components ─────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: SRStatus }) {
  const c = STATUS_CFG[status];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
      color: c.color, background: c.bg,
    }}>{c.icon} {c.label}</span>
  );
}

function PriorityDot({ priority }: { priority: SRPriority }) {
  const { color } = PRIORITY_CFG[priority];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color, fontWeight: 600 }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: color, display: 'inline-block' }} />
      {priority}
    </span>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
  return (
    <div style={{
      background: '#1A1B21', borderRadius: 12, padding: '18px 22px',
      border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 14,
    }}>
      <div style={{
        width: 42, height: 42, borderRadius: 10, display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: `${color}1a`, color,
      }}>{icon}</div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#F1F3F5' }}>{value}</div>
        <div style={{ fontSize: 12, color: '#6B7280', marginTop: 1 }}>{label}</div>
      </div>
    </div>
  );
}

// ─── Create Modal ─────────────────────────────────────────────────────────────
function CreateModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    type: 'ROOM_SERVICE' as SRType, priority: 'MEDIUM' as SRPriority,
    description: '', bookingId: '', scheduledAt: '',
  });

  const mut = useMutation({
    mutationFn: () => serviceRequestService.create({
      type: form.type, priority: form.priority, description: form.description || undefined,
      bookingId: form.bookingId || undefined,
      scheduledAt: form.scheduledAt ? new Date(form.scheduledAt).toISOString() : undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['service-requests'] });
      qc.invalidateQueries({ queryKey: ['sr-stats'] });
      onClose();
    },
  });

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modal} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#F1F3F5' }}>New Service Request</h2>
          <button onClick={onClose} style={S.iconBtn}><X size={16} /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <label style={S.label}>
              Type
              <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value as SRType }))} style={S.input}>
                {SR_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
              </select>
            </label>
            <label style={S.label}>
              Priority
              <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value as SRPriority }))} style={S.input}>
                {(['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as SRPriority[]).map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </label>
          </div>

          <label style={S.label}>
            Description
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              rows={3} placeholder="Describe the request…" style={{ ...S.input, resize: 'vertical' }} />
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <label style={S.label}>
              Booking ID <span style={{ color: '#4B5563', fontWeight: 400 }}>(optional)</span>
              <input value={form.bookingId} onChange={e => setForm(p => ({ ...p, bookingId: e.target.value }))}
                style={S.input} placeholder="booking id…" />
            </label>
            <label style={S.label}>
              Scheduled At <span style={{ color: '#4B5563', fontWeight: 400 }}>(optional)</span>
              <input type="datetime-local" value={form.scheduledAt} onChange={e => setForm(p => ({ ...p, scheduledAt: e.target.value }))} style={S.input} />
            </label>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 22, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={S.ghost}>Cancel</button>
          <button onClick={() => mut.mutate()} disabled={mut.isPending} style={S.primary}>
            {mut.isPending ? 'Creating…' : 'Create Request'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────
function DetailModal({ sr, onClose }: { sr: ServiceRequest; onClose: () => void }) {
  const qc = useQueryClient();
  const [tab, setTab] = useState<'details' | 'update'>('details');
  const [newStatus, setNewStatus] = useState<SRStatus>(sr.status);
  const [notes, setNotes] = useState('');
  const [cost, setCost] = useState('');
  const [assignId, setAssignId] = useState('');

  const { data: detail } = useQuery({
    queryKey: ['sr-detail', sr.id],
    queryFn: async () => {
      const res = await serviceRequestService.getById(sr.id);
      return res.data?.data as ServiceRequest;
    },
    initialData: sr,
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['service-requests'] });
    qc.invalidateQueries({ queryKey: ['sr-detail', sr.id] });
    qc.invalidateQueries({ queryKey: ['sr-stats'] });
  };

  const statusMut = useMutation({
    mutationFn: () => serviceRequestService.updateStatus(sr.id, newStatus),
    onSuccess: invalidate,
  });

  const assignMut = useMutation({
    mutationFn: () => serviceRequestService.assign(sr.id, assignId),
    onSuccess: () => { invalidate(); setAssignId(''); },
  });

  const cancelMut = useMutation({
    mutationFn: () => serviceRequestService.cancel(sr.id),
    onSuccess: () => { invalidate(); onClose(); },
  });

  const d = detail ?? sr;
  const canCancel = !['COMPLETED', 'CANCELLED'].includes(d.status);

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={{ ...S.modal, maxWidth: 540 }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <StatusBadge status={d.status} />
              <PriorityDot priority={d.priority} />
            </div>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#F1F3F5' }}>
              {d.type.replace(/_/g, ' ')}
            </h2>
            <div style={{ fontSize: 11, color: '#4B5563', marginTop: 3 }}>
              {new Date(d.createdAt).toLocaleString()}
            </div>
          </div>
          <button onClick={onClose} style={S.iconBtn}><X size={16} /></button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: 20 }}>
          {(['details', 'update'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              background: 'none', border: 'none', textTransform: 'capitalize',
              color: tab === t ? '#37EFD1' : '#6B7280',
              borderBottom: tab === t ? '2px solid #37EFD1' : '2px solid transparent',
              marginBottom: -1,
            }}>{t}</button>
          ))}
        </div>

        {tab === 'details' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
            {d.customer && <InfoRow label="Guest" value={`${d.customer.firstName} ${d.customer.lastName} · ${d.customer.phone}`} />}
            {d.booking && <InfoRow label="Booking" value={`${d.booking.bookingNumber}${d.booking.room ? ` — Room ${d.booking.room.roomNumber}` : ''}`} />}
            {d.description && <InfoRow label="Description" value={d.description} />}
            {d.notes && <InfoRow label="Notes" value={d.notes} />}
            {d.cost != null && <InfoRow label="Cost" value={`$${d.cost.toFixed(2)}`} />}
            {d.scheduledAt && <InfoRow label="Scheduled" value={new Date(d.scheduledAt).toLocaleString()} />}
            {d.completedAt && <InfoRow label="Completed" value={new Date(d.completedAt).toLocaleString()} />}

            {canCancel && (
              <button
                onClick={() => cancelMut.mutate()}
                disabled={cancelMut.isPending}
                style={{ ...S.ghost, marginTop: 10, color: '#C8102E', borderColor: 'rgba(200,16,46,0.3)' }}
              >
                {cancelMut.isPending ? 'Cancelling…' : 'Cancel Request'}
              </button>
            )}
          </div>
        )}

        {tab === 'update' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <label style={S.label}>
              Status
              <select value={newStatus} onChange={e => setNewStatus(e.target.value as SRStatus)} style={S.input}>
                {(Object.keys(STATUS_CFG) as SRStatus[]).filter(s => s !== 'CANCELLED').map(s => (
                  <option key={s} value={s}>{STATUS_CFG[s].label}</option>
                ))}
              </select>
            </label>
            <button onClick={() => statusMut.mutate()} disabled={statusMut.isPending} style={S.primary}>
              {statusMut.isPending ? 'Saving…' : 'Update Status'}
            </button>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16, marginTop: 4 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 8 }}>Assign Staff</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  value={assignId}
                  onChange={e => setAssignId(e.target.value)}
                  placeholder="Staff User ID…"
                  style={{ ...S.input, flex: 1 }}
                />
                <button onClick={() => assignMut.mutate()} disabled={assignMut.isPending || !assignId} style={S.primary}>
                  {assignMut.isPending ? '…' : <UserPlus size={15} />}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', gap: 12 }}>
      <div style={{ fontSize: 12, color: '#6B7280', minWidth: 88, paddingTop: 1 }}>{label}</div>
      <div style={{ fontSize: 13, color: '#D1D5DB' }}>{value}</div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ServiceRequestsPage() {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [selected, setSelected] = useState<ServiceRequest | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ status: '', type: '', priority: '', page: '1', limit: '10' });

  const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => Boolean(v)));

  const { data: listData, isLoading, refetch } = useQuery({
    queryKey: ['service-requests', params],
    queryFn: async () => {
      const res = await serviceRequestService.getAll(params);
      return res.data?.data as { requests: ServiceRequest[]; meta: PaginationMeta };
    },
  });

  const { data: statsData } = useQuery({
    queryKey: ['sr-stats'],
    queryFn: async () => {
      const res = await serviceRequestService.getStats();
      return res.data?.data as {
        byStatus: { status: SRStatus; _count: { status: number } }[];
        pendingCount: number;
      };
    },
  });

  const requests = listData?.requests ?? [];
  const meta = listData?.meta;
  const pending = statsData?.pendingCount ?? 0;
  const inProgress = statsData?.byStatus.find(s => s.status === 'IN_PROGRESS')?._count.status ?? 0;
  const completed = statsData?.byStatus.find(s => s.status === 'COMPLETED')?._count.status ?? 0;
  const urgent = requests.filter(r => r.priority === 'URGENT' && !['COMPLETED', 'CANCELLED'].includes(r.status)).length;

  return (
    <div style={{ minHeight: '100vh', background: '#0B0C10', padding: '28px 32px', fontFamily: 'Inter, sans-serif' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#F1F3F5', display: 'flex', alignItems: 'center', gap: 10 }}>
            <ClipboardList size={22} color="#37EFD1" /> Service Requests
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6B7280' }}>Manage guest service requests and assignments</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => refetch()} style={S.iconBtn} title="Refresh"><RefreshCw size={16} /></button>
          <button onClick={() => setShowCreate(true)} style={S.primary}><Plus size={15} /> New Request</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        <StatCard label="Pending"      value={pending}    icon={<Clock size={18} />}         color="#F59E0B" />
        <StatCard label="In Progress"  value={inProgress} icon={<RefreshCw size={18} />}     color="#37EFD1" />
        <StatCard label="Completed"    value={completed}  icon={<CheckCircle2 size={18} />}  color="#10B981" />
        <StatCard label="Urgent Active" value={urgent}    icon={<AlertTriangle size={18} />} color="#C8102E" />
      </div>

      {/* Toolbar */}
      <div style={{
        background: '#1A1B21', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)',
        padding: '14px 18px', marginBottom: 16,
      }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            onClick={() => setShowFilters(p => !p)}
            style={{
              ...S.ghost,
              background: showFilters ? 'rgba(55,239,209,0.08)' : undefined,
              borderColor: showFilters ? '#37EFD1' : undefined,
              color: showFilters ? '#37EFD1' : undefined,
            }}
          >
            <Filter size={14} /> Filters
            <ChevronDown size={13} style={{ transform: showFilters ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
          </button>
          {(filters.status || filters.type || filters.priority) && (
            <button
              onClick={() => setFilters({ status: '', type: '', priority: '', page: '1', limit: '10' })}
              style={{ ...S.ghost, color: '#C8102E', borderColor: 'rgba(200,16,46,0.3)', padding: '8px 10px' }}
            >
              <X size={13} /> Clear
            </button>
          )}
        </div>

        {showFilters && (
          <div style={{ display: 'flex', gap: 12, marginTop: 14, flexWrap: 'wrap' }}>
            {[
              { key: 'status', label: 'Status', opts: ['', ...Object.keys(STATUS_CFG)] },
              { key: 'type',   label: 'Type',   opts: ['', ...SR_TYPES] },
              { key: 'priority', label: 'Priority', opts: ['', 'LOW', 'MEDIUM', 'HIGH', 'URGENT'] },
            ].map(({ key, label, opts }) => (
              <label key={key} style={{ ...S.label, minWidth: 150 }}>
                {label}
                <select
                  value={(filters as Record<string, string>)[key]}
                  onChange={e => setFilters(p => ({ ...p, [key]: e.target.value, page: '1' }))}
                  style={S.input}
                >
                  {opts.map(o => <option key={o} value={o}>{o ? o.replace(/_/g, ' ') : `All ${label}s`}</option>)}
                </select>
              </label>
            ))}
            <label style={{ ...S.label, minWidth: 150 }}>
              From Date
              <input type="date" onChange={e => setFilters(p => ({ ...p, fromDate: e.target.value, page: '1' }))} style={S.input} />
            </label>
            <label style={{ ...S.label, minWidth: 150 }}>
              To Date
              <input type="date" onChange={e => setFilters(p => ({ ...p, toDate: e.target.value, page: '1' }))} style={S.input} />
            </label>
          </div>
        )}
      </div>

      {/* Table */}
      <div style={{ background: '#1A1B21', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Type', 'Guest', 'Room', 'Priority', 'Status', 'Created', ''].map((h, i) => (
                  <th key={i} style={{
                    padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600,
                    color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} style={{ padding: 52, textAlign: 'center', color: '#4B5563' }}>Loading…</td></tr>
              ) : requests.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: 52, textAlign: 'center', color: '#4B5563' }}>
                  <ClipboardList size={30} style={{ display: 'block', margin: '0 auto 8px', opacity: 0.25 }} />
                  No service requests found
                </td></tr>
              ) : requests.map((sr, i) => (
                <tr
                  key={sr.id}
                  style={{
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    background: i % 2 !== 0 ? 'rgba(255,255,255,0.015)' : 'transparent',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(55,239,209,0.04)')}
                  onMouseLeave={e => (e.currentTarget.style.background = i % 2 !== 0 ? 'rgba(255,255,255,0.015)' : 'transparent')}
                >
                  <td style={{ padding: '13px 16px', color: '#E5E7EB', fontWeight: 500 }}>{sr.type.replace(/_/g, ' ')}</td>
                  <td style={{ padding: '13px 16px', color: '#9CA3AF' }}>
                    {sr.customer ? `${sr.customer.firstName} ${sr.customer.lastName}` : '—'}
                  </td>
                  <td style={{ padding: '13px 16px', color: '#9CA3AF' }}>{sr.booking?.room?.roomNumber ?? '—'}</td>
                  <td style={{ padding: '13px 16px' }}><PriorityDot priority={sr.priority} /></td>
                  <td style={{ padding: '13px 16px' }}><StatusBadge status={sr.status} /></td>
                  <td style={{ padding: '13px 16px', color: '#6B7280', whiteSpace: 'nowrap' }}>
                    {new Date(sr.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '13px 16px' }}>
                    <button
                      onClick={() => setSelected(sr)}
                      style={{ ...S.iconBtn, padding: '6px 12px', fontSize: 12, gap: 5 }}
                    >
                      <Eye size={13} /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 18px', borderTop: '1px solid rgba(255,255,255,0.06)',
          }}>
            <span style={{ fontSize: 12, color: '#6B7280' }}>
              {((meta.page - 1) * meta.limit) + 1}–{Math.min(meta.page * meta.limit, meta.total)} of {meta.total}
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setFilters(prev => ({ ...prev, page: String(p) }))}
                  style={{
                    width: 30, height: 30, borderRadius: 6, border: '1px solid',
                    borderColor: meta.page === p ? '#37EFD1' : 'rgba(255,255,255,0.1)',
                    background: meta.page === p ? 'rgba(55,239,209,0.12)' : 'transparent',
                    color: meta.page === p ? '#37EFD1' : '#9CA3AF',
                    fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  }}
                >{p}</button>
              ))}
            </div>
          </div>
        )}
      </div>

      {showCreate && <CreateModal onClose={() => setShowCreate(false)} />}
      {selected && <DetailModal sr={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}