'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { inventoryService } from '@/service/inventory.service';
import DataTable, { Column } from '@/components/shared/table/DataTable';
import DataTablePagination from '@/components/shared/table/DataTablePagination';
import { Modal, Field, ModalFooter } from './ModalHelpers';
import { ProcurementOrder, ProcurementStatus, PROCUREMENT_STATUS_CFG, InventoryItem, inputCls, selectCls, fmtDate  } from '@/types/inventoryTypes';



function ProcurementBadge({ status }: { status: ProcurementStatus }) {
  const c = PROCUREMENT_STATUS_CFG[status];
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium font-sans ${c.color} ${c.bgClass}`}>{c.label}</span>;
}

export default function ProcurementTab() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [selected, setSelected] = useState<ProcurementOrder | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['procurement-orders', page, filterStatus],
    queryFn: async () => {
      const params: Record<string, unknown> = { page, limit: 10 };
      if (filterStatus) params.status = filterStatus;
      const r = await inventoryService.getAllProcurement(params);
      return r.data?.data as { orders: ProcurementOrder[]; meta: any };
    },
  });

  const orders = data?.orders ?? [];
  const meta = data?.meta;

  const columns: Column<ProcurementOrder>[] = [
    { key: 'orderNumber', header: 'Order #', render: (_, r) => <span className="text-[#37EFD1] font-mono text-xs">{r.orderNumber}</span> },
    { key: 'supplier', header: 'Supplier', render: (_, r) => <span className="text-white/70 text-sm font-sans">{r.supplier ?? '—'}</span> },
    { key: 'requestedBy', header: 'Requested By', render: (_, r) => <span className="text-white/70 text-sm font-sans">{r.requestedBy?.firstName} {r.requestedBy?.lastName}</span> },
    { key: 'status', header: 'Status', render: (_, r) => <ProcurementBadge status={r.status} /> },
    { key: 'expectedDate', header: 'Expected', render: (_, r) => <span className="text-white/40 text-xs font-sans">{fmtDate(r.expectedDate)}</span> },
    { key: 'createdAt', header: 'Created', render: (_, r) => <span className="text-white/40 text-xs font-sans">{fmtDate(r.createdAt)}</span> },
    {
      key: 'id', header: '',
      render: (_, r) => (
        <button onClick={() => setSelected(r)}
          className="px-3 py-1.5 rounded-lg border border-white/10 text-white/50 hover:text-white text-xs font-sans transition-all">
          Manage
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }} className={`${selectCls} w-40`}>
          <option value="">All Statuses</option>
          {Object.keys(PROCUREMENT_STATUS_CFG).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-[#C8102E] hover:bg-[#a00d24] text-white px-4 py-2 rounded-lg text-sm font-sans transition-all">
          <Plus size={14} /> New Order
        </button>
      </div>

      <div className="bg-[#1A1B21] border border-white/5 rounded-xl p-5">
        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-white/30" /></div>
        ) : (
          <>
            <DataTable data={orders as any[]} columns={columns as any[]} />
            <DataTablePagination page={page} totalPages={meta?.totalPages ?? 1} onPage={setPage} total={meta?.total ?? 0} limit={10} />
          </>
        )}
      </div>

      {showCreate && <CreateProcurementModal onClose={() => setShowCreate(false)} onSuccess={() => { qc.invalidateQueries({ queryKey: ['procurement-orders'] }); setShowCreate(false); }} />}
      {selected && <ManageProcurementModal order={selected} onClose={() => setSelected(null)} onSuccess={() => { qc.invalidateQueries({ queryKey: ['procurement-orders'] }); setSelected(null); }} />}
    </div>
  );
}

function CreateProcurementModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [supplier, setSupplier] = useState('');
  const [expectedDate, setExpectedDate] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([{ inventoryItemId: '', quantity: 1, unitCost: 0 }]);

  const { data: inventoryItems } = useQuery({
    queryKey: ['inventory-items-all'],
    queryFn: async () => {
      const r = await inventoryService.getAllItems({ limit: 200 });
      return (r.data?.data?.items ?? []) as InventoryItem[];
    },
  });

  const mut = useMutation({
    mutationFn: () => inventoryService.createProcurement({ supplier, expectedDate: expectedDate ? new Date(expectedDate).toISOString() : undefined, notes, items }),
    onSuccess: () => { toast.success('Procurement order created'); onSuccess(); },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });

  const addItem = () => setItems(p => [...p, { inventoryItemId: '', quantity: 1, unitCost: 0 }]);
  const removeItem = (i: number) => setItems(p => p.filter((_, idx) => idx !== i));
  const updateItem = (i: number, key: string, val: unknown) =>
    setItems(p => p.map((item, idx) => idx === i ? { ...item, [key]: val } : item));

  return (
    <Modal title="New Procurement Order" onClose={onClose}>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Supplier"><input value={supplier} onChange={e => setSupplier(e.target.value)} className={inputCls} placeholder="Supplier name" /></Field>
          <Field label="Expected Date"><input type="date" value={expectedDate} onChange={e => setExpectedDate(e.target.value)} className={inputCls} /></Field>
        </div>
        <Field label="Notes"><input value={notes} onChange={e => setNotes(e.target.value)} className={inputCls} placeholder="Optional notes" /></Field>

        <div className="border-t border-white/8 pt-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-white/40 text-xs font-sans">Items *</p>
            <button onClick={addItem} className="text-[#37EFD1] text-xs font-sans flex items-center gap-1 hover:underline"><Plus size={11} /> Add</button>
          </div>
          {items.map((item, i) => (
            <div key={i} className="flex gap-2 mb-2 items-center">
              <select value={item.inventoryItemId} onChange={e => updateItem(i, 'inventoryItemId', e.target.value)} className={`${selectCls} flex-1`}>
                <option value="">Select item</option>
                {inventoryItems?.map(it => <option key={it.id} value={it.id}>{it.name} ({it.sku})</option>)}
              </select>
              <input type="number" min={1} value={item.quantity} onChange={e => updateItem(i, 'quantity', Number(e.target.value))} className={`${inputCls} w-20`} placeholder="Qty" />
              <input type="number" step="0.01" value={item.unitCost} onChange={e => updateItem(i, 'unitCost', Number(e.target.value))} className={`${inputCls} w-24`} placeholder="Cost" />
              {items.length > 1 && <button onClick={() => removeItem(i)} className="text-red-400 hover:text-red-300"><X size={14} /></button>}
            </div>
          ))}
        </div>
      </div>
      <ModalFooter onClose={onClose} onSave={() => mut.mutate()} saving={mut.isPending} label="Create Order" />
    </Modal>
  );
}

function ManageProcurementModal({ order, onClose, onSuccess }: { order: ProcurementOrder; onClose: () => void; onSuccess: () => void }) {
  const [status, setStatus] = useState<ProcurementStatus>(order.status);
  const [notes, setNotes] = useState('');

  const mut = useMutation({
    mutationFn: () => inventoryService.updateProcurementStatus(order.id, { status, notes }),
    onSuccess: () => { toast.success('Status updated'); onSuccess(); },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });

  return (
    <Modal title={`Order ${order.orderNumber}`} onClose={onClose}>
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <ProcurementBadge status={order.status} />
          <span className="text-white/30 text-xs font-sans">Current status</span>
        </div>
        {order.items?.map((item, i) => (
          <div key={i} className="flex justify-between text-sm font-sans py-1.5 border-b border-white/5">
            <span className="text-white/70">{item.inventoryItem.name}</span>
            <span className="text-white/50">{item.quantity} × RM {Number(item.unitCost).toFixed(2)}</span>
          </div>
        ))}
        <div className="border-t border-white/8 pt-3">
          <Field label="Update Status">
            <select value={status} onChange={e => setStatus(e.target.value as ProcurementStatus)} className={selectCls}>
              {(Object.keys(PROCUREMENT_STATUS_CFG) as ProcurementStatus[]).filter(s => s !== 'DRAFT').map(s => (
                <option key={s} value={s}>{PROCUREMENT_STATUS_CFG[s].label}</option>
              ))}
            </select>
          </Field>
          <Field label="Notes"><input value={notes} onChange={e => setNotes(e.target.value)} className={inputCls} placeholder="Optional notes" /></Field>
        </div>
      </div>
      <ModalFooter onClose={onClose} onSave={() => mut.mutate()} saving={mut.isPending} label="Update Status" />
    </Modal>
  );
}