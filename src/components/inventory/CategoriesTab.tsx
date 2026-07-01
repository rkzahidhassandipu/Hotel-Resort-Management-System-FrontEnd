'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Layers, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { inventoryService } from '@/service/inventory.service';

import { InventoryCategory, inputCls } from '@/types/inventoryTypes';
import { Modal, Field, ModalFooter } from './ModalHelpers';

export default function CategoriesTab() {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });

  const { data: categories, isLoading } = useQuery({
    queryKey: ['inventory-categories'],
    queryFn: async () => {
      const r = await inventoryService.getAllCategories();
      return (r.data?.data ?? []) as InventoryCategory[];
    },
  });

  const mut = useMutation({
    mutationFn: () => inventoryService.createCategory(form),
    onSuccess: () => {
      toast.success('Category created');
      qc.invalidateQueries({ queryKey: ['inventory-categories'] });
      setShowCreate(false);
      setForm({ name: '', description: '' });
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed'),
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-[#C8102E] hover:bg-[#a00d24] text-white px-4 py-2 rounded-lg text-sm font-sans transition-all">
          <Plus size={14} /> Add Category
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-white/30" /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {(categories ?? []).map(cat => (
            <div key={cat.id} className="bg-[#1A1B21] border border-white/5 rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#37EFD1]/10 flex items-center justify-center">
                <Layers className="h-5 w-5 text-[#37EFD1]" />
              </div>
              <div>
                <p className="text-white text-sm font-sans font-medium">{cat.name}</p>
                <p className="text-white/40 text-xs font-sans">{cat._count?.items ?? 0} items</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <Modal title="New Category" onClose={() => setShowCreate(false)}>
          <div className="space-y-3">
            <Field label="Name *"><input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className={inputCls} placeholder="Category name" /></Field>
            <Field label="Description"><input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className={inputCls} placeholder="Optional description" /></Field>
          </div>
          <ModalFooter onClose={() => setShowCreate(false)} onSave={() => mut.mutate()} saving={mut.isPending} label="Create" />
        </Modal>
      )}
    </div>
  );
}