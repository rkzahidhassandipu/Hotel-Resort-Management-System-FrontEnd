'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Loader2, Search, ArrowUpDown, Eye, X } from 'lucide-react';
import { toast } from 'sonner';
import { inventoryService } from '@/service/inventory.service';
import StockStatusBadge from './StockStatusBadge';
import DataTable, { Column } from '@/components/shared/table/DataTable';
import DataTablePagination from '@/components/shared/table/DataTablePagination';
import { InventoryItem, InventoryCategory, inputCls, selectCls, fmtDate } from '@/types/inventoryTypes';
import { Field, InfoRow, Modal, ModalFooter } from './ModalHelpers';

export default function ItemsTab() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [status, setStatus] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [showTransaction, setShowTransaction] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['inventory-items', page, search, categoryId, status],
    queryFn: async () => {
      const params: Record<string, unknown> = { page, limit: 10 };
      if (search) params.search = search;
      if (categoryId) params.categoryId = categoryId;
      if (status) params.status = status;
      const r = await inventoryService.getAllItems(params);
      return r.data?.data as { items: InventoryItem[]; meta: any };
    },
  });

  const { data: categories } = useQuery({
    queryKey: ['inventory-categories'],
    queryFn: async () => {
      const r = await inventoryService.getAllCategories();
      return (r.data?.data ?? []) as InventoryCategory[];
    },
  });

  const items = data ?? [];
  const meta = data?.meta;
  

  console.log("all categories",categories)

  const columns: Column<InventoryItem>[] = [
    {
      key: 'name', header: 'Item',
      render: (_, r) => (
        <div>
          <p className="text-white text-sm font-sans">{r.name}</p>
          <p className="text-white/40 text-xs font-sans">{r.sku}</p>
        </div>
      ),
    },
    { key: 'category', header: 'Category', render: (_, r) => <span className="text-white/60 text-sm font-sans">{r.category?.name ?? '—'}</span> },
    {
      key: 'currentStock', header: 'Stock',
      render: (_, r) => (
        <span className="text-white text-sm font-sans font-medium">{r.currentStock} <span className="text-white/40 font-normal">{r.unit}</span></span>
      ),
    },
    { key: 'unitCost', header: 'Unit Cost', render: (_, r) => <span className="text-white/70 text-sm font-sans">RM {Number(r.unitCost).toFixed(2)}</span> },
    { key: 'status', header: 'Status', render: (_, r) => <StockStatusBadge status={r.status} /> },
    {
      key: 'id', header: '',
      render: (_, r) => (
        <div className="flex gap-1.5">
          <button onClick={() => { setSelectedItem(r); setShowTransaction(true); }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#37EFD1]/10 text-[#37EFD1] text-xs font-sans hover:bg-[#37EFD1]/20 transition-all">
            <ArrowUpDown size={11} /> Stock
          </button>
          <button onClick={() => setSelectedItem(r)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-white/10 text-white/50 hover:text-white text-xs font-sans transition-all">
            <Eye size={11} /> View
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search items…"
              className={`${inputCls} pl-9 w-48`}
            />
          </div>
          <select value={categoryId} onChange={e => { setCategoryId(e.target.value); setPage(1); }} className={`${selectCls} w-40`}>
            <option value="">All Categories</option>
            {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className={`${selectCls} w-40`}>
            <option value="">All Statuses</option>
            {['SUFFICIENT', 'LOW', 'OUT_OF_STOCK', 'OVERSTOCKED'].map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          </select>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-[#C8102E] hover:bg-[#a00d24] text-white px-4 py-2 rounded-lg text-sm font-sans transition-all">
          <Plus size={14} /> Add Item
        </button>
      </div>

      <div className="bg-[#1A1B21] border border-white/5 rounded-xl p-5">
        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-white/30" /></div>
        ) : (
          <>
            <DataTable data={items as any[]} columns={columns as any[]} />
            <DataTablePagination page={page} totalPages={meta?.totalPages ?? 1} onPage={setPage} total={meta?.total ?? 0} limit={10} />
          </>
        )}
      </div>

      {showCreate && <CreateItemModal categories={categories ?? []} onClose={() => setShowCreate(false)} onSuccess={() => { qc.invalidateQueries({ queryKey: ['inventory-items'] }); setShowCreate(false); }} />}
      {selectedItem && !showTransaction && <ItemDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />}
      {selectedItem && showTransaction && <TransactionModal item={selectedItem} onClose={() => { setSelectedItem(null); setShowTransaction(false); }} onSuccess={() => { qc.invalidateQueries({ queryKey: ['inventory-items'] }); qc.invalidateQueries({ queryKey: ['inventory-stats'] }); }} />}
    </div>
  );
}

// ── Create Item Modal ─────────────────────────────────────
function CreateItemModal({ categories, onClose, onSuccess }: { categories: InventoryCategory[]; onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({
    categoryId: '', name: '', sku: '', unit: '', currentStock: 0,
    minimumStock: 0, reorderPoint: 0, unitCost: 0,
    supplier: '', location: '', notes: '',
  });

  const mut = useMutation({
    mutationFn: () => inventoryService.createItem(form),
    onSuccess: () => { toast.success('Item created'); onSuccess(); },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed to create item'),
  });

  return (
    <Modal title="Add Inventory Item" onClose={onClose}>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Category *">
            <select value={form.categoryId} onChange={e => setForm(p => ({ ...p, categoryId: e.target.value }))} className={selectCls}>
              <option value="">Select category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Name *"><input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className={inputCls} placeholder="Item name" /></Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="SKU *"><input value={form.sku} onChange={e => setForm(p => ({ ...p, sku: e.target.value }))} className={inputCls} placeholder="SKU-001" /></Field>
          <Field label="Unit *"><input value={form.unit} onChange={e => setForm(p => ({ ...p, unit: e.target.value }))} className={inputCls} placeholder="kg / pcs / L" /></Field>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Current Stock"><input type="number" value={form.currentStock} onChange={e => setForm(p => ({ ...p, currentStock: Number(e.target.value) }))} className={inputCls} /></Field>
          <Field label="Min Stock *"><input type="number" value={form.minimumStock} onChange={e => setForm(p => ({ ...p, minimumStock: Number(e.target.value) }))} className={inputCls} /></Field>
          <Field label="Reorder Point *"><input type="number" value={form.reorderPoint} onChange={e => setForm(p => ({ ...p, reorderPoint: Number(e.target.value) }))} className={inputCls} /></Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Unit Cost (RM) *"><input type="number" step="0.01" value={form.unitCost} onChange={e => setForm(p => ({ ...p, unitCost: Number(e.target.value) }))} className={inputCls} /></Field>
          <Field label="Supplier"><input value={form.supplier} onChange={e => setForm(p => ({ ...p, supplier: e.target.value }))} className={inputCls} placeholder="Supplier name" /></Field>
        </div>
        <Field label="Location"><input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} className={inputCls} placeholder="Storage location" /></Field>
        <Field label="Notes"><input value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} className={inputCls} placeholder="Optional notes" /></Field>
      </div>
      <ModalFooter onClose={onClose} onSave={() => mut.mutate()} saving={mut.isPending} label="Create Item" />
    </Modal>
  );
}

// ── Item Detail Modal ─────────────────────────────────────
function ItemDetailModal({ item, onClose }: { item: InventoryItem; onClose: () => void }) {
  const { data: transactions } = useQuery({
    queryKey: ['inventory-transactions', item.id],
    queryFn: async () => {
      const r = await inventoryService.getTransactions(item.id);
      return r.data?.data?.transactions ?? [];
    },
  });

  return (
    <Modal title={item.name} onClose={onClose}>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <InfoRow label="SKU" value={item.sku} />
          <InfoRow label="Category" value={item.category?.name ?? '—'} />
          <InfoRow label="Stock" value={`${item.currentStock} ${item.unit}`} />
          <InfoRow label="Min Stock" value={`${item.minimumStock} ${item.unit}`} />
          <InfoRow label="Unit Cost" value={`RM ${Number(item.unitCost).toFixed(2)}`} />
          <InfoRow label="Supplier" value={item.supplier ?? '—'} />
          <InfoRow label="Location" value={item.location ?? '—'} />
        </div>
        <div className="border-t border-white/8 pt-3">
          <p className="text-white/40 text-xs font-sans mb-2">Recent Transactions</p>
          {(transactions ?? []).slice(0, 5).map((t: any) => (
            <div key={t.id} className="flex items-center justify-between py-1.5 border-b border-white/5">
              <span className={`text-xs font-sans font-medium ${t.type === 'IN' ? 'text-green-400' : 'text-red-400'}`}>{t.type}</span>
              <span className="text-white/70 text-xs font-sans">{t.quantity} {item.unit}</span>
              <span className="text-white/30 text-xs font-sans">{fmtDate(t.createdAt)}</span>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}

// ── Transaction Modal ─────────────────────────────────────
function TransactionModal({ item, onClose, onSuccess }: { item: InventoryItem; onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({ type: 'IN', quantity: 1, notes: '' });

  const mut = useMutation({
    mutationFn: () => inventoryService.addTransaction(item.id, form),
    onSuccess: () => { toast.success('Transaction recorded'); onSuccess(); onClose(); },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });

  return (
    <Modal title={`Stock Adjustment — ${item.name}`} onClose={onClose}>
      <p className="text-white/40 text-xs font-sans mb-4">Current stock: <span className="text-white">{item.currentStock} {item.unit}</span></p>
      <div className="space-y-3">
        <Field label="Type">
          <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} className={selectCls}>
            {['IN', 'OUT', 'ADJUSTMENT', 'WASTAGE', 'TRANSFER', 'RETURN'].map(t => <option key={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Quantity">
          <input type="number" min={1} value={form.quantity} onChange={e => setForm(p => ({ ...p, quantity: Number(e.target.value) }))} className={inputCls} />
        </Field>
        <Field label="Notes">
          <input value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} className={inputCls} placeholder="Optional notes" />
        </Field>
      </div>
      <ModalFooter onClose={onClose} onSave={() => mut.mutate()} saving={mut.isPending} label="Record Transaction" />
    </Modal>
  );
}