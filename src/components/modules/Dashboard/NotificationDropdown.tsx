'use client';
import { useState, useEffect, useCallback } from 'react';
import { Bell, X, CheckCheck } from 'lucide-react';
import { notificationService } from '@/service/notification.service';
import type { Notification } from '@/types';

const typeColor: Record<string, string> = {
  BOOKING_CONFIRMATION: '#37EFD1', BOOKING_CANCELLATION: '#C8102E',
  CHECK_IN_REMINDER: '#60a5fa', CHECK_OUT_REMINDER: '#60a5fa',
  PAYMENT_RECEIVED: '#C8102E', PAYMENT_DUE: '#fb923c',
  MAINTENANCE_UPDATE: '#fb923c', SERVICE_UPDATE: '#a78bfa',
  GENERAL_ALERT: '#37EFD1', SYSTEM_ALERT: '#fb923c',
};

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return `${Math.floor(hrs / 24)} days ago`;
}

// unwraps common API envelope shapes: {data:{count}}, {data:{data:{count}}}, {count}
function extractCount(res: any): number {
  return (
    res?.data?.data?.count ??
    res?.data?.count ??
    res?.data?.data ??
    res?.count ??
    0
  );
}

function extractList(res: any): Notification[] {
  const data = res?.data?.data?.data ?? res?.data?.data ?? res?.data ?? [];
  return Array.isArray(data) ? data : [];
}

const POLL_MS = 15000;

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await notificationService.getMyNotifications({ limit: 10 });
      const list = extractList(res);
      setItems(list);
      return list;
    } catch {
      return null;
    }
  }, []);

  // Always derives unread from BOTH the dedicated count endpoint and the
  // notification list itself (isRead flags), taking whichever is higher.
  // This makes the badge reliable even if the count endpoint is broken.
  const fetchUnread = useCallback(async () => {
    let apiCount = 0;
    try {
      const res = await notificationService.getUnreadCount();
      apiCount = Number(extractCount(res)) || 0;
    } catch {}

    const list = await fetchNotifications();
    const listCount = list ? list.filter(n => !n.isRead).length : 0;

    setUnread(Math.max(apiCount, listCount));
  }, [fetchNotifications]);

  useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, POLL_MS);

    // refetch instantly when tab regains focus / becomes visible
    const onFocus = () => fetchUnread();
    const onVisibility = () => {
      if (document.visibilityState === 'visible') fetchUnread();
    };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [fetchUnread]);

  const markAll = async () => {
    try {
      await notificationService.markAllRead();
      setItems(n => n.map(i => ({ ...i, isRead: true })));
      setUnread(0);
    } catch {}
  };

  const markOne = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setItems(n => n.map(i => i.id === id ? { ...i, isRead: true } : i));
      setUnread(u => Math.max(0, u - 1));
    } catch {}
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative w-8 h-8 rounded-full bg-[#1A1B21] border border-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span
            className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-[#C8102E] text-white text-[9px] font-sans font-semibold flex items-center justify-center leading-none animate-pulse"
          >
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-10 z-50 w-80 bg-[#1A1B21] border border-white/8 rounded-xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <h3 className="text-white text-sm font-sans font-medium">
                Notifications {unread > 0 && <span className="text-[#C8102E] text-xs">({unread})</span>}
              </h3>
              <div className="flex items-center gap-2">
                {unread > 0 && (
                  <button onClick={markAll} className="text-[#37EFD1] text-[10px] font-sans flex items-center gap-1 hover:text-[#37EFD1]/70 transition-colors">
                    <CheckCheck className="h-3 w-3" />All read
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="text-white/25 hover:text-white/50 transition-colors"><X className="h-4 w-4" /></button>
              </div>
            </div>
            <div className="max-h-72 overflow-y-auto scrollbar-thin divide-y divide-white/5">
              {items.length === 0 ? (
                <div className="px-4 py-6 text-center text-white/25 text-xs font-sans">No notifications</div>
              ) : items.map(n => (
                <div key={n.id} onClick={() => !n.isRead && markOne(n.id)}
                  className={`px-4 py-3 transition-colors hover:bg-white/3 cursor-pointer ${!n.isRead ? 'bg-[#C8102E]/3' : ''}`}>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: typeColor[n.type] || '#94a3b8', opacity: n.isRead ? 0.3 : 1 }} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-sans font-medium ${n.isRead ? 'text-white/40' : 'text-white'}`}>{n.title}</p>
                      <p className="text-white/30 text-[10px] font-sans mt-0.5 leading-relaxed">{n.message}</p>
                      <p className="text-white/20 text-[9px] font-sans mt-1">{timeAgo(n.createdAt)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-4 py-2.5 border-t border-white/5">
              <button className="text-[#37EFD1] text-[10px] font-sans w-full text-center hover:text-[#37EFD1]/70 transition-colors">View all notifications</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}