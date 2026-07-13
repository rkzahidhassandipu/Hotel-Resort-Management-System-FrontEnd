
'use client';
import { useState } from 'react';
import { Eye, UserX, UserCheck, Trash2, Loader2 } from 'lucide-react';
import { userService } from '@/service/user.service';
import type { User } from '@/types';

export default function CustomerActions({ user, onRefresh, onView, isAdmin }: {
  user: User;
  onRefresh: () => void;
  onView: (u: User) => void;
  isAdmin: boolean;
}) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleStatus = async (status: string) => {
    setLoading(status);
    try { await userService.updateStatus(user.id, status); onRefresh(); } catch {}
    setLoading(null);
  };

  const handleDelete = async () => {
    if (!confirm('Delete this user?')) return;
    setLoading('del');
    try { await userService.delete(user.id); onRefresh(); } catch {}
    setLoading(null);
  };

  return (
  <div className="flex gap-2 items-center">
    <button
      onClick={() => onView(user)}
      className="p-1 rounded text-white/60 hover:text-[#37EFD1] hover:bg-white/5"
    >
      <Eye className="h-4 w-4" />
    </button>

    {isAdmin && (
      <>
        {user.status === 'ACTIVE' ? (
          <button
            onClick={() => handleStatus('SUSPENDED')}
            disabled={!!loading}
            className="text-[9px] px-2 py-0.5 rounded border border-[#fb923c]/30 text-[#fb923c] hover:bg-[#fb923c]/10 disabled:opacity-50"
          >
            {loading === 'SUSPENDED' ? (
              <Loader2 className="h-3 w-3 animate-spin inline" />
            ) : (
              <UserX className="h-3 w-3 inline mr-1" />
            )}
            Suspend
          </button>
        ) : (
          <button
            onClick={() => handleStatus('ACTIVE')}
            disabled={!!loading}
            className="text-[9px] px-2 py-0.5 rounded border border-[#37EFD1]/30 text-[#37EFD1] hover:bg-[#37EFD1]/10 disabled:opacity-50"
          >
            {loading === 'ACTIVE' ? (
              <Loader2 className="h-3 w-3 animate-spin inline" />
            ) : (
              <UserCheck className="h-3 w-3 inline mr-1" />
            )}
            Activate
          </button>
        )}

        <button
          onClick={handleDelete}
          disabled={!!loading}
          className="p-1 text-[#C8102E]/60 hover:text-[#C8102E] disabled:opacity-50"
        >
          {loading === 'del' ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Trash2 className="h-3 w-3" />
          )}
        </button>
      </>
    )}
  </div>
);
}