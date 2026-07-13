// src/app/(admin)/notifications/components/TemplateFormModal.tsx
'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, X } from 'lucide-react';
import { notificationService } from '@/service/notification.service';
import { NotificationTemplate } from '@/types/notification.types';

const TYPES = [
  'BOOKING_CONFIRMATION', 'BOOKING_CANCELLATION',
  'CHECK_IN_REMINDER', 'CHECK_OUT_REMINDER',
  'PAYMENT_RECEIVED', 'PAYMENT_DUE',
  'MAINTENANCE_UPDATE', 'SERVICE_UPDATE',
  'GENERAL_ALERT', 'SYSTEM_ALERT',
];
const CHANNELS = ['EMAIL', 'SMS', 'PUSH', 'IN_APP'];

export default function TemplateFormModal({
  template,
  onClose,
}: {
  template: NotificationTemplate | null;
  onClose: () => void;
}) {
  const isEdit = !!template;
  const [name, setName] = useState(template?.name ?? '');
  const [type, setType] = useState(template?.type ?? TYPES[0]);
  const [channel, setChannel] = useState(template?.channel ?? CHANNELS[0]);
  const [subject, setSubject] = useState(template?.subject ?? '');
  const [bodyTemplate, setBodyTemplate] = useState(template?.bodyTemplate ?? '');
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () =>
      isEdit
        ? notificationService.updateTemplate(template!.id, {
            name, type, channel, subject, bodyTemplate,
          })
        : notificationService.createTemplate({
            name, type: type as any, channel: channel as any, subject, bodyTemplate,
          }),
    onSuccess: () => {
      toast.success(isEdit ? 'Template updated' : 'Template created');
      queryClient.invalidateQueries({ queryKey: ['notification-templates'] });
      onClose();
    },
    onError: () => toast.error('Failed to save template'),
  });

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1A1B21] border border-white/10 rounded-xl p-6 w-full max-w-lg space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-white font-display text-lg font-semibold">
            {isEdit ? 'Edit Template' : 'New Template'}
          </h2>
          <button onClick={onClose} className="text-white/30 hover:text-white/70">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs text-white/40 font-sans">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-[#0B0C10] border border-white/5 rounded-lg px-3 py-2 text-sm text-white font-sans focus:outline-none focus:border-[#37EFD1]/40"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs text-white/40 font-sans">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full bg-[#0B0C10] border border-white/5 rounded-lg px-3 py-2 text-sm text-white font-sans focus:outline-none focus:border-[#37EFD1]/40"
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>{t.replaceAll('_', ' ')}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-white/40 font-sans">Channel</label>
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              className="w-full bg-[#0B0C10] border border-white/5 rounded-lg px-3 py-2 text-sm text-white font-sans focus:outline-none focus:border-[#37EFD1]/40"
            >
              {CHANNELS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs text-white/40 font-sans">Subject (optional)</label>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full bg-[#0B0C10] border border-white/5 rounded-lg px-3 py-2 text-sm text-white font-sans focus:outline-none focus:border-[#37EFD1]/40"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs text-white/40 font-sans">Body Template</label>
          <textarea
            value={bodyTemplate}
            onChange={(e) => setBodyTemplate(e.target.value)}
            rows={5}
            placeholder="Use {{variable}} placeholders"
            className="w-full bg-[#0B0C10] border border-white/5 rounded-lg px-3 py-2 text-sm text-white font-sans focus:outline-none focus:border-[#37EFD1]/40 resize-none"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-sans text-white/50 hover:text-white/80 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => mutation.mutate()}
            disabled={!name.trim() || !bodyTemplate.trim() || mutation.isPending}
            className="flex items-center gap-2 bg-[#37EFD1] text-[#0B0C10] font-sans font-medium text-sm px-4 py-2 rounded-lg disabled:opacity-40 hover:bg-[#37EFD1]/90 transition-colors"
          >
            {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEdit ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}