// src/app/(admin)/notifications/page.tsx
'use client';

import { useState } from 'react';
import { Bell, Send, LayoutTemplate, BarChart3 } from 'lucide-react';
import SendNotificationForm from '@/components/notification/SendNotificationForm';
import TemplatesTab from '@/components/notification/TemplatesTab';
import NotificationStats from '@/components/notification/NotificationStats';

type Tab = 'send' | 'templates' | 'stats';

const TABS: { key: Tab; label: string; icon: typeof Bell }[] = [
  { key: 'send', label: 'Send / Broadcast', icon: Send },
  { key: 'templates', label: 'Templates', icon: LayoutTemplate },
  { key: 'stats', label: 'Stats', icon: BarChart3 },
];

export default function AdminNotificationsPage() {
  const [tab, setTab] = useState<Tab>('send');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-white font-semibold">
          Notifications
        </h1>
        <p className="text-white/35 text-sm font-sans mt-0.5">
          Send, broadcast, and manage notification templates
        </p>
      </div>

      <div className="flex items-center gap-1 border-b border-white/5">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-sans border-b-2 transition-colors ${
              tab === key
                ? 'border-[#37EFD1] text-white'
                : 'border-transparent text-white/40 hover:text-white/70'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {tab === 'send' && <SendNotificationForm />}
      {tab === 'templates' && <TemplatesTab />}
      {tab === 'stats' && <NotificationStats />}
    </div>
  );
}