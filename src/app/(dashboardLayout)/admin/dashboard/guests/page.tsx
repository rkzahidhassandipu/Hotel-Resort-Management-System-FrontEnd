'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users, ClipboardList, Building2, Plus, Loader2,
  CheckCircle, Trash2, UserPlus, RefreshCw, X, Eye,
  Search, LayoutDashboard, // ← BarChart2 এর বদলে
} from 'lucide-react';
import { toast } from 'sonner';
import { guestService } from '@/service/guest.service';
import StatsCard from '@/components/shared/StatsCard';
import DataTable, { Column } from '@/components/shared/table/DataTable';
import DataTablePagination from '@/components/shared/table/DataTablePagination';

// ── Types ─────────────────────────────────────────────────
interface Visitor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  purpose?: string;
  notes?: string;
  visitedAt: string;
  convertedToCustomer: boolean;
}

interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  roomType?: string;
  budget?: number;
  message?: string;
  isResolved: boolean;
  createdAt: string;
}

interface HotelInfo {
  id: string;
  key: string;
  value: string;
  description?: string;
  isPublic: boolean;
}

// ── Helpers ───────────────────────────────────────────────
const inputCls = 'w-full bg-[#0B0C10] border border-white/8 text-white text-sm font-sans px-3 py-2 rounded-lg outline-none focus:border-[#37EFD1]/40 transition-colors placeholder:text-white/20';
const selectCls = `${inputCls} cursor-pointer`;

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' });

type Tab = 'overview' | 'visitors' | 'inquiries' | 'hotel-info';

// ── Modal ─────────────────────────────────────────────────
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#1A1B21] border border-white/8 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white font-display text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg border border-white/10 text-white/40 hover:text-white transition-all">
            <X size={14} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-white/40 text-xs font-sans mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}

// ── Overview Tab ──────────────────────────────────────────
function OverviewTab() {
  const { data, isLoading } = useQuery({
    queryKey: ['guest-stats'],
    queryFn: async () => {
      const res = await guestService.getStats();
      return res.data?.data;
    },
  });

  if (isLoading) return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-white/30" /></div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Visitors"    value={data?.visitors?.total ?? 0}     icon={Users}         color="#37EFD1" />
        <StatsCard title="Converted"         value={data?.visitors?.converted ?? 0} icon={UserPlus}      color="#60a5fa" />
        <StatsCard title="Total Inquiries"   value={data?.inquiries?.total ?? 0}    icon={ClipboardList} color="#fb923c" />
        <StatsCard title="Unresolved"        value={data?.inquiries?.unresolved ?? 0} icon={ClipboardList} color="#C8102E" />
      </div>

      <div className="bg-[#1A1B21] border border-white/5 rounded-xl p-5">
        <h3 className="text-white font-display text-base font-semibold mb-4">Conversion Rate</h3>
        <div className="flex items-center gap-4">
          <div className="flex-1 bg-white/5 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-[#37EFD1] rounded-full transition-all"
              style={{ width: data?.visitors?.conversionRate ?? '0%' }}
            />
          </div>
          <span className="text-[#37EFD1] text-lg font-display font-semibold">
            {data?.visitors?.conversionRate ?? '0%'}
          </span>
        </div>
        <p className="text-white/30 text-xs font-sans mt-2">
          {data?.visitors?.converted ?? 0} out of {data?.visitors?.total ?? 0} visitors converted to customers
        </p>
      </div>
    </div>
  );
}

// ── Visitors Tab ──────────────────────────────────────────
function VisitorsTab() {
  const qc = useQueryClient();
  const [page, setPage]         = useState(1);
  const [search, setSearch]     = useState('');
  const [converted, setConverted] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [selected, setSelected] = useState<Visitor | null>(null);
  const [form, setForm]         = useState({ firstName: '', lastName: '', email: '', phone: '', purpose: '', notes: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['visitors', page, search, converted],
    queryFn: async () => {
      const params: Record<string, unknown> = { page, limit: 10 };
      if (search) params.search = search;
      if (converted) params.convertedToCustomer = converted;
      const res = await guestService.getVisitors(params);
      return res.data?.data as { visitors: Visitor[]; meta: any };
    },
  });

  const createMut = useMutation({
    mutationFn: () => guestService.registerVisitor(form),
    onSuccess: () => {
      toast.success('Visitor registered');
      qc.invalidateQueries({ queryKey: ['visitors'] });
      qc.invalidateQueries({ queryKey: ['guest-stats'] });
      setShowCreate(false);
      setForm({ firstName: '', lastName: '', email: '', phone: '', purpose: '', notes: '' });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });

  const convertMut = useMutation({
    mutationFn: (id: string) => guestService.convertToCustomer(id),
    onSuccess: (res) => {
      toast.success(res.data?.data?.message ?? 'Converted');
      qc.invalidateQueries({ queryKey: ['visitors'] });
      qc.invalidateQueries({ queryKey: ['guest-stats'] });
      setSelected(null);
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });

  const visitors = data?.visitors ?? [];
  const meta = data?.meta;

  const columns: Column<Visitor>[] = [
    {
      key: 'firstName', header: 'Name',
      render: (_, r) => (
        <div>
          <p className="text-white text-sm font-sans">{r.firstName} {r.lastName}</p>
          <p className="text-white/40 text-xs font-sans">{r.email}</p>
        </div>
      ),
    },
    { key: 'phone', header: 'Phone', render: (_, r) => <span className="text-white/60 text-sm font-sans">{r.phone ?? '—'}</span> },
    { key: 'purpose', header: 'Purpose', render: (_, r) => <span className="text-white/60 text-sm font-sans truncate max-w-[120px] block">{r.purpose ?? '—'}</span> },
    { key: 'visitedAt', header: 'Visited', render: (_, r) => <span className="text-white/40 text-xs font-sans">{fmtDate(r.visitedAt)}</span> },
    {
      key: 'convertedToCustomer', header: 'Status',
      render: (_, r) => r.convertedToCustomer
        ? <span className="text-xs px-2 py-0.5 rounded-full bg-green-400/10 text-green-400 font-sans">Converted</span>
        : <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-white/40 font-sans">Visitor</span>,
    },
    {
      key: 'id', header: '',
      render: (_, r) => (
        <div className="flex gap-1.5">
          <button onClick={() => setSelected(r)} className="p-1.5 rounded-lg border border-white/10 text-white/40 hover:text-white transition-all"><Eye size={13} /></button>
          {!r.convertedToCustomer && (
            <button
              onClick={() => convertMut.mutate(r.id)}
              disabled={convertMut.isPending}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#37EFD1]/10 text-[#37EFD1] hover:bg-[#37EFD1]/20 text-xs font-sans transition-all disabled:opacity-60"
            >
              {convertMut.isPending ? <Loader2 size={11} className="animate-spin" /> : <UserPlus size={11} />}
              Convert
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search visitors…" className={`${inputCls} pl-9 w-48`} />
          </div>
          <select value={converted} onChange={e => { setConverted(e.target.value); setPage(1); }} className={`${selectCls} w-40`}>
            <option value="">All Visitors</option>
            <option value="true">Converted</option>
            <option value="false">Not Converted</option>
          </select>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 bg-[#C8102E] hover:bg-[#a00d24] text-white px-4 py-2 rounded-lg text-sm font-sans transition-all">
          <Plus size={14} /> Register Visitor
        </button>
      </div>

      <div className="bg-[#1A1B21] border border-white/5 rounded-xl p-5">
        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-white/30" /></div>
        ) : (
          <>
            <DataTable data={visitors} columns={columns} />
            <DataTablePagination page={page} totalPages={meta?.totalPages ?? 1} onPage={setPage} total={meta?.total ?? 0} limit={10} />
          </>
        )}
      </div>

      {showCreate && (
        <Modal title="Register Visitor" onClose={() => setShowCreate(false)}>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label="First Name *"><input value={form.firstName} onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))} className={inputCls} placeholder="John" /></Field>
              <Field label="Last Name *"><input value={form.lastName} onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))} className={inputCls} placeholder="Doe" /></Field>
            </div>
            <Field label="Email *"><input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className={inputCls} placeholder="john@example.com" /></Field>
            <Field label="Phone"><input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className={inputCls} placeholder="+60 12 345 6789" /></Field>
            <Field label="Purpose"><input value={form.purpose} onChange={e => setForm(p => ({ ...p, purpose: e.target.value }))} className={inputCls} placeholder="Visit purpose" /></Field>
            <Field label="Notes"><textarea rows={2} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} className={`${inputCls} resize-none`} placeholder="Optional notes" /></Field>
          </div>
          <div className="flex gap-2 mt-5 justify-end">
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm font-sans text-white/50 hover:text-white border border-white/10 rounded-lg transition-all">Cancel</button>
            <button onClick={() => createMut.mutate()} disabled={createMut.isPending}
              className="px-4 py-2 text-sm font-sans font-medium bg-[#C8102E] text-white rounded-lg hover:bg-[#a00d24] disabled:opacity-60 flex items-center gap-2 transition-all">
              {createMut.isPending && <Loader2 size={14} className="animate-spin" />}
              Register
            </button>
          </div>
        </Modal>
      )}

      {selected && (
        <Modal title="Visitor Details" onClose={() => setSelected(null)}>
          <div className="space-y-3">
            {[
              { label: 'Name', value: `${selected.firstName} ${selected.lastName}` },
              { label: 'Email', value: selected.email },
              { label: 'Phone', value: selected.phone ?? '—' },
              { label: 'Purpose', value: selected.purpose ?? '—' },
              { label: 'Notes', value: selected.notes ?? '—' },
              { label: 'Visited', value: fmtDate(selected.visitedAt) },
              { label: 'Status', value: selected.convertedToCustomer ? 'Converted to Customer' : 'Visitor' },
            ].map(r => (
              <div key={r.label} className="flex gap-3">
                <span className="text-white/30 text-xs font-sans min-w-[80px] pt-0.5">{r.label}</span>
                <span className="text-white/80 text-sm font-sans">{r.value}</span>
              </div>
            ))}
            {!selected.convertedToCustomer && (
              <button
                onClick={() => convertMut.mutate(selected.id)}
                disabled={convertMut.isPending}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#37EFD1]/10 text-[#37EFD1] hover:bg-[#37EFD1]/20 text-sm font-sans transition-all mt-3 disabled:opacity-60"
              >
                {convertMut.isPending ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
                Convert to Customer
              </button>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Inquiries Tab ─────────────────────────────────────────
function InquiriesTab() {
  const qc = useQueryClient();
  const [page, setPage]       = useState(1);
  const [isResolved, setIsResolved] = useState('');
  const [selected, setSelected] = useState<Inquiry | null>(null);
  const [notes, setNotes]     = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['inquiries', page, isResolved],
    queryFn: async () => {
      const params: Record<string, unknown> = { page, limit: 10 };
      if (isResolved) params.isResolved = isResolved;
      const res = await guestService.getInquiries(params);
      return res.data?.data as { inquiries: Inquiry[]; meta: any };
    },
  });

  const resolveMut = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      guestService.resolveInquiry(id, notes),
    onSuccess: () => {
      toast.success('Inquiry resolved');
      qc.invalidateQueries({ queryKey: ['inquiries'] });
      qc.invalidateQueries({ queryKey: ['guest-stats'] });
      setSelected(null);
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => guestService.deleteInquiry(id),
    onSuccess: () => {
      toast.success('Inquiry deleted');
      qc.invalidateQueries({ queryKey: ['inquiries'] });
      qc.invalidateQueries({ queryKey: ['guest-stats'] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });

  const inquiries = data?.inquiries ?? [];
  const meta = data?.meta;

  const columns: Column<Inquiry>[] = [
    {
      key: 'name', header: 'Guest',
      render: (_, r) => (
        <div>
          <p className="text-white text-sm font-sans">{r.name}</p>
          <p className="text-white/40 text-xs font-sans">{r.email}</p>
        </div>
      ),
    },
    { key: 'roomType', header: 'Room', render: (_, r) => <span className="text-white/60 text-sm font-sans">{r.roomType ?? 'Any'}</span> },
    {
      key: 'checkIn', header: 'Dates',
      render: (_, r) => (
        <span className="text-white/60 text-xs font-sans">{fmtDate(r.checkIn)} → {fmtDate(r.checkOut)}</span>
      ),
    },
    { key: 'createdAt', header: 'Received', render: (_, r) => <span className="text-white/40 text-xs font-sans">{fmtDate(r.createdAt)}</span> },
    {
      key: 'isResolved', header: 'Status',
      render: (_, r) => r.isResolved
        ? <span className="text-xs px-2 py-0.5 rounded-full bg-green-400/10 text-green-400 font-sans">Resolved</span>
        : <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-400/10 text-yellow-400 font-sans">Open</span>,
    },
    {
      key: 'id', header: '',
      render: (_, r) => (
        <div className="flex gap-1.5">
          <button onClick={() => setSelected(r)} className="p-1.5 rounded-lg border border-white/10 text-white/40 hover:text-white transition-all"><Eye size={13} /></button>
          <button
            onClick={() => { if (confirm('Delete this inquiry?')) deleteMut.mutate(r.id); }}
            disabled={deleteMut.isPending}
            className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-40"
          >
            {deleteMut.isPending ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <select value={isResolved} onChange={e => { setIsResolved(e.target.value); setPage(1); }} className={`${selectCls} w-40`}>
          <option value="">All Inquiries</option>
          <option value="false">Open</option>
          <option value="true">Resolved</option>
        </select>
      </div>

      <div className="bg-[#1A1B21] border border-white/5 rounded-xl p-5">
        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-white/30" /></div>
        ) : (
          <>
            <DataTable data={inquiries} columns={columns} />
            <DataTablePagination page={page} totalPages={meta?.totalPages ?? 1} onPage={setPage} total={meta?.total ?? 0} limit={10} />
          </>
        )}
      </div>

      {selected && (
        <Modal title="Inquiry Details" onClose={() => setSelected(null)}>
          <div className="space-y-3">
            {[
              { label: 'Name', value: selected.name },
              { label: 'Email', value: selected.email },
              { label: 'Phone', value: selected.phone ?? '—' },
              { label: 'Check-in', value: fmtDate(selected.checkIn) },
              { label: 'Check-out', value: fmtDate(selected.checkOut) },
              { label: 'Guests', value: `${selected.adults} adults, ${selected.children} children` },
              { label: 'Room Type', value: selected.roomType ?? 'Any' },
              { label: 'Budget', value: selected.budget ? `RM ${selected.budget}` : '—' },
              { label: 'Message', value: selected.message ?? '—' },
            ].map(r => (
              <div key={r.label} className="flex gap-3">
                <span className="text-white/30 text-xs font-sans min-w-[80px] pt-0.5">{r.label}</span>
                <span className="text-white/80 text-sm font-sans">{r.value}</span>
              </div>
            ))}

            {!selected.isResolved && (
              <div className="border-t border-white/8 pt-3 space-y-2">
                <Field label="Resolution Notes">
                  <textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)} className={`${inputCls} resize-none`} placeholder="Optional notes" />
                </Field>
                <button
                  onClick={() => resolveMut.mutate({ id: selected.id, notes: notes || undefined })}
                  disabled={resolveMut.isPending}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 text-sm font-sans transition-all disabled:opacity-60"
                >
                  {resolveMut.isPending ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                  Mark as Resolved
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Hotel Info Tab ────────────────────────────────────────
function HotelInfoTab() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ key: '', value: '', description: '', isPublic: true });

  const { data: infoList = [], isLoading } = useQuery({
    queryKey: ['hotel-info-all'],
    queryFn: async () => {
      const res = await guestService.getHotelInfoAll();
      return (res.data?.data ?? []) as HotelInfo[];
    },
  });

  const upsertMut = useMutation({
    mutationFn: () => guestService.updateHotelInfo(form),
    onSuccess: () => {
      toast.success('Hotel info saved');
      qc.invalidateQueries({ queryKey: ['hotel-info-all'] });
      setShowForm(false);
      setForm({ key: '', value: '', description: '', isPublic: true });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });

  const deleteMut = useMutation({
    mutationFn: (key: string) => guestService.deleteHotelInfoKey(key),
    onSuccess: () => {
      toast.success('Deleted');
      qc.invalidateQueries({ queryKey: ['hotel-info-all'] });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });

  const handleEdit = (info: HotelInfo) => {
    setForm({ key: info.key, value: info.value, description: info.description ?? '', isPublic: info.isPublic });
    setShowForm(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-[#C8102E] hover:bg-[#a00d24] text-white px-4 py-2 rounded-lg text-sm font-sans transition-all">
          <Plus size={14} /> Add Info
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-white/30" /></div>
      ) : infoList.length === 0 ? (
        <div className="bg-[#1A1B21] border border-white/5 rounded-xl p-12 text-center">
          <Building2 className="h-8 w-8 text-white/20 mx-auto mb-3" />
          <p className="text-white/30 text-sm font-sans">No hotel info configured</p>
        </div>
      ) : (
        <div className="space-y-2">
          {infoList.map(info => (
            <div key={info.id} className="flex items-center justify-between bg-[#1A1B21] border border-white/5 rounded-xl p-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-white text-sm font-sans font-medium">{info.key}</p>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-sans ${info.isPublic ? 'bg-green-400/10 text-green-400' : 'bg-white/5 text-white/30'}`}>
                    {info.isPublic ? 'Public' : 'Private'}
                  </span>
                </div>
                <p className="text-white/50 text-sm font-sans truncate">{info.value}</p>
                {info.description && <p className="text-white/30 text-xs font-sans mt-0.5">{info.description}</p>}
              </div>
              <div className="flex gap-1.5 ml-4 shrink-0">
                <button onClick={() => handleEdit(info)} className="p-1.5 rounded-lg border border-white/10 text-white/40 hover:text-white transition-all text-xs font-sans px-2.5">Edit</button>
                <button
                  onClick={() => { if (confirm(`Delete "${info.key}"?`)) deleteMut.mutate(info.key); }}
                  disabled={deleteMut.isPending}
                  className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-40"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <Modal title={form.key ? `Edit: ${form.key}` : 'Add Hotel Info'} onClose={() => setShowForm(false)}>
          <div className="space-y-3">
            <Field label="Key *"><input value={form.key} onChange={e => setForm(p => ({ ...p, key: e.target.value }))} className={inputCls} placeholder="hotel_name" /></Field>
            <Field label="Value *"><textarea rows={3} value={form.value} onChange={e => setForm(p => ({ ...p, value: e.target.value }))} className={`${inputCls} resize-none`} placeholder="Value" /></Field>
            <Field label="Description"><input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className={inputCls} placeholder="Optional description" /></Field>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" checked={form.isPublic} onChange={e => setForm(p => ({ ...p, isPublic: e.target.checked }))} className="accent-[#37EFD1]" />
              <span className="text-white/50 text-sm font-sans">Public (visible to guests)</span>
            </label>
          </div>
          <div className="flex gap-2 mt-5 justify-end">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-sans text-white/50 hover:text-white border border-white/10 rounded-lg transition-all">Cancel</button>
            <button onClick={() => upsertMut.mutate()} disabled={upsertMut.isPending}
              className="px-4 py-2 text-sm font-sans font-medium bg-[#C8102E] text-white rounded-lg hover:bg-[#a00d24] disabled:opacity-60 flex items-center gap-2 transition-all">
              {upsertMut.isPending && <Loader2 size={14} className="animate-spin" />}
              Save
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────
export default function GuestManagementPage() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'overview', label: 'Overview', icon: <LayoutDashboard className="h-3.5 w-3.5" /> },
    { key: 'visitors',   label: 'Visitors',    icon: <Users className="h-3.5 w-3.5" /> },
    { key: 'inquiries',  label: 'Inquiries',   icon: <ClipboardList className="h-3.5 w-3.5" /> },
    { key: 'hotel-info', label: 'Hotel Info',  icon: <Building2 className="h-3.5 w-3.5" /> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-white font-semibold">Guest Management</h1>
        <p className="text-white/35 text-sm font-sans mt-0.5">Visitors, inquiries, and hotel information</p>
      </div>

      <div className="flex gap-1 bg-white/5 p-1 rounded-lg w-fit">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-sans transition-all ${
              activeTab === t.key ? 'bg-[#C8102E] text-white' : 'text-white/40 hover:text-white'
            }`}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview'   && <OverviewTab />}
      {activeTab === 'visitors'   && <VisitorsTab />}
      {activeTab === 'inquiries'  && <InquiriesTab />}
      {activeTab === 'hotel-info' && <HotelInfoTab />}
    </div>
  );
}