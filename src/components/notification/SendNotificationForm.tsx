// src/app/(admin)/notifications/components/SendNotificationForm.tsx
'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, Send, Users, User } from 'lucide-react';
import { notificationService } from '@/service/notification.service';

const TYPES = [
  'BOOKING_CONFIRMATION', 'BOOKING_CANCELLATION',
  'CHECK_IN_REMINDER', 'CHECK_OUT_REMINDER',
  'PAYMENT_RECEIVED', 'PAYMENT_DUE',
  'MAINTENANCE_UPDATE', 'SERVICE_UPDATE',
  'GENERAL_ALERT', 'SYSTEM_ALERT',
];
const CHANNELS = ['IN_APP', 'EMAIL', 'SMS', 'PUSH'];
const ROLES = ['ADMIN', 'MANAGER', 'STAFF', 'CUSTOMER', 'MAINTENANCE', 'CHEF'];

export default function SendNotificationForm() {
  const [mode, setMode] = useState<'single' | 'broadcast'>('single');
  const [userId, setUserId] = useState('');
  const [roles, setRoles] = useState<string[]>([]);
  const [type, setType] = useState(TYPES[0]);
  const [channel, setChannel] = useState('IN_APP');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  const sendMutation = useMutation({
    mutationFn: () =>
      mode === 'single'
        ? notificationService.create({ userId, type, channel: channel as any, title, message })
        : notificationService.broadcast({ roles, type, channel: channel as any, title, message }),
    onSuccess: (res) => {
      toast.success(res.data?.message || 'Notification sent');
      setTitle('');
      setMessage('');
      setUserId('');
      setRoles([]);
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message || 'Failed to send notification'),
  });

  const toggleRole = (role: string) =>
    setRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );

  const canSubmit =
    title.trim() &&
    message.trim() &&
    (mode === 'single' ? userId.trim() : roles.length > 0);

  return (
    <div className="bg-[#1A1B21] border border-white/5 rounded-xl p-6 max-w-2xl space-y-5">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setMode('single')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-sans transition-colors ${
            mode === 'single' ? 'bg-[#37EFD1]/10 text-[#37EFD1]' : 'text-white/40 hover:text-white/70'
          }`}
        >
          <User className="h-3.5 w-3.5" /> Single User
        </button>
        <button
          onClick={() => setMode('broadcast')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-sans transition-colors ${
            mode === 'broadcast' ? 'bg-[#37EFD1]/10 text-[#37EFD1]' : 'text-white/40 hover:text-white/70'
          }`}
        >
          <Users className="h-3.5 w-3.5" /> Broadcast by Role
        </button>
      </div>

      {mode === 'single' ? (
        <div className="space-y-1.5">
          <label className="text-xs text-white/40 font-sans">User ID</label>
          <input
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="UUID of the user"
            className="w-full bg-[#0B0C10] border border-white/5 rounded-lg px-3 py-2 text-sm text-white font-sans focus:outline-none focus:border-[#37EFD1]/40"
          />
        </div>
      ) : (
        <div className="space-y-1.5">
          <label className="text-xs text-white/40 font-sans">Target Roles</label>
          <div className="flex flex-wrap gap-2">
            {ROLES.map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => toggleRole(role)}
                className={`px-3 py-1 rounded-full text-xs font-sans border transition-colors ${
                  roles.includes(role)
                    ? 'bg-[#37EFD1]/10 border-[#37EFD1]/40 text-[#37EFD1]'
                    : 'border-white/10 text-white/40 hover:text-white/70'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>
      )}

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
        <label className="text-xs text-white/40 font-sans">Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          className="w-full bg-[#0B0C10] border border-white/5 rounded-lg px-3 py-2 text-sm text-white font-sans focus:outline-none focus:border-[#37EFD1]/40"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs text-white/40 font-sans">Message</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={1000}
          rows={4}
          className="w-full bg-[#0B0C10] border border-white/5 rounded-lg px-3 py-2 text-sm text-white font-sans focus:outline-none focus:border-[#37EFD1]/40 resize-none"
        />
      </div>

      <button
        onClick={() => sendMutation.mutate()}
        disabled={!canSubmit || sendMutation.isPending}
        className="flex items-center gap-2 bg-[#37EFD1] text-[#0B0C10] font-sans font-medium text-sm px-4 py-2 rounded-lg disabled:opacity-40 hover:bg-[#37EFD1]/90 transition-colors"
      >
        {sendMutation.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
        {mode === 'single' ? 'Send Notification' : 'Broadcast'}
      </button>
    </div>
  );
}