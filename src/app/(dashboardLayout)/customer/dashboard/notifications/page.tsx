'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Bell, Loader2, CheckCheck, X, Calendar } from 'lucide-react';
import DataTable from '@/components/shared/table/DataTable';
import DataTablePagination from '@/components/shared/table/DataTablePagination';
import { notificationService } from '@/service/notification.service';
import type { Notification } from '@/types';
import { notificationColumns } from '@/components/notification/notification.columns';

const LIMIT = 10;

function ViewDetailsModal({
  notification,
  onClose,
}: {
  notification: Notification | null;
  onClose: () => void;
}) {
  if (!notification) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#1A1B21] border border-white/10 rounded-xl w-full max-w-md p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#37EFD1]/10 flex items-center justify-center shrink-0">
              <Bell className="h-4 w-4 text-[#37EFD1]" />
            </div>
            <h2 className="font-display text-white text-[15px] font-medium">
              {notification.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white transition-colors shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="text-white/60 text-sm font-sans leading-relaxed whitespace-pre-wrap">
          {notification.message}
        </p>

        <div className="flex items-center gap-1.5 mt-4 pt-4 border-t border-white/5 text-white/30 text-xs font-sans">
          <Calendar className="h-3.5 w-3.5" />
          {new Date(notification.createdAt).toLocaleString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>
    </div>
  );
}

export default function CustomerNotificationsPage() {
  const [page, setPage] = useState(1);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [viewingNotification, setViewingNotification] = useState<Notification | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['my-notifications', page],
    queryFn: () =>
      notificationService.getMyNotifications({ page, limit: LIMIT }),
    select: (res) => ({
      notifications: (res.data?.data ?? []) as Notification[],
      total: res.data?.meta?.total ?? 0,
    }),
    // fixes stale "doesn't show without reload" issue
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchInterval: 30_000,
  });

  const invalidate = () =>
    // matches this page AND any bell/count query keyed with a 'notification' prefix
    queryClient.invalidateQueries({
      predicate: (query) =>
        typeof query.queryKey[0] === 'string' &&
        query.queryKey[0].toLowerCase().includes('notification'),
    });

  const markAllReadMutation = useMutation({
    mutationFn: notificationService.markAllRead,
    onSuccess: () => {
      toast.success('All notifications marked as read');
      invalidate();
    },
    onError: () => toast.error('Failed to mark all as read'),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => invalidate(),
    onError: () => toast.error('Failed to mark as read'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => notificationService.delete(id),
    onMutate: (id) => setActionLoadingId(id),
    onSuccess: () => {
      toast.success('Notification deleted');
      invalidate();
    },
    onError: () => toast.error('Failed to delete notification'),
    onSettled: () => setActionLoadingId(null),
  });

  const notifications = data?.notifications ?? [];
  const total = data?.total ?? 0;

  const handleViewDetails = (notification: Notification) => {
    setViewingNotification(notification);
    // mark as read when opened, if not already
    if (!notification.isRead) {
      markReadMutation.mutate(notification.id);
    }
  };

  const columns = notificationColumns({
    onMarkRead: (id) => markReadMutation.mutate(id),
    onDelete: (id) => deleteMutation.mutate(id),
    onViewDetails: handleViewDetails,
    actionLoadingId,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-white font-semibold">
            Notifications
          </h1>
          <p className="text-white/35 text-sm font-sans mt-0.5">
            Stay updated with your hotel activities
          </p>
        </div>
        <button
          onClick={() => markAllReadMutation.mutate()}
          disabled={markAllReadMutation.isPending}
          className="flex items-center gap-2 text-[#37EFD1] text-sm font-sans hover:text-[#37EFD1]/70 transition-colors disabled:opacity-40"
        >
          {markAllReadMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCheck className="h-4 w-4" />
          )}
          Mark all read
        </button>
      </div>

      <div className="bg-[#1A1B21] border border-white/5 rounded-xl p-5">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-white/30" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-3">
            <Bell className="h-8 w-8 text-white/10" />
            <p className="text-white/25 text-sm font-sans">No notifications yet</p>
          </div>
        ) : (
          <>
            <DataTable data={notifications} columns={columns} />
            <DataTablePagination
              page={page}
              totalPages={Math.ceil(total / LIMIT)}
              onPage={setPage}
              total={total}
              limit={LIMIT}
            />
          </>
        )}
      </div>

      <ViewDetailsModal
        notification={viewingNotification}
        onClose={() => setViewingNotification(null)}
      />
    </div>
  );
}