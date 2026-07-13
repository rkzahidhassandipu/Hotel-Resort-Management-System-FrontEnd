// src/app/(admin)/notifications/components/TemplatesTab.tsx
'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, Plus, Trash2, Pencil } from 'lucide-react';
import { notificationService } from '@/service/notification.service';
import { NotificationTemplate } from '@/types/notification.types';
import TemplateFormModal from './TemplateFormModal';

export default function TemplatesTab() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<NotificationTemplate | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notification-templates'],
    queryFn: () => notificationService.getTemplates(),
    select: (res) => (res.data?.data ?? []) as NotificationTemplate[],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => notificationService.deleteTemplate(id),
    onMutate: (id) => setDeletingId(id),
    onSuccess: () => {
      toast.success('Template deleted');
      queryClient.invalidateQueries({ queryKey: ['notification-templates'] });
    },
    onError: () => toast.error('Failed to delete template'),
    onSettled: () => setDeletingId(null),
  });

  const templates = data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
          className="flex items-center gap-2 bg-[#37EFD1]/10 text-[#37EFD1] text-sm font-sans px-3 py-2 rounded-lg hover:bg-[#37EFD1]/20 transition-colors"
        >
          <Plus className="h-4 w-4" /> New Template
        </button>
      </div>

      <div className="bg-[#1A1B21] border border-white/5 rounded-xl p-5">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-white/30" />
          </div>
        ) : templates.length === 0 ? (
          <p className="text-white/25 text-sm font-sans text-center py-16">
            No templates yet
          </p>
        ) : (
          <div className="divide-y divide-white/5">
            {templates.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
              >
                <div>
                  <p className="text-white text-sm font-sans font-medium">{t.name}</p>
                  <p className="text-white/30 text-xs mt-0.5">
                    {t.type.replaceAll('_', ' ')} · {t.channel}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditing(t);
                      setModalOpen(true);
                    }}
                    className="p-1.5 rounded text-white/20 hover:text-[#37EFD1] transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(t.id)}
                    disabled={deletingId === t.id}
                    className="p-1.5 rounded text-white/20 hover:text-[#C8102E] transition-colors"
                  >
                    {deletingId === t.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <TemplateFormModal
          template={editing}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}