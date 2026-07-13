
'use client';
import { useState } from 'react';
import { Eye, Trash2, Loader2, ShieldCheck } from 'lucide-react';
import { userService } from '@/service/user.service';
import type { User } from '@/types';

export default function StaffActions({ user, isAdmin, onRefresh, onView }: {
  user: User;
  isAdmin: boolean;
  onRefresh: () => void;
  onView: (u: User) => void;
}) {
  const [deleting, setDeleting]   = useState(false);
  const [toggling, setToggling]   = useState(false);

  const handleDelete = async () => {
    if (!confirm('Delete this staff member?')) return;
    setDeleting(true);
    try { await userService.updateStatus(user.id, 'INACTIVE'); onRefresh(); } catch {}
    setDeleting(false);
  };

  console.log(isAdmin)

  const handleToggle = async () => {
    setToggling(true);
    try {
      if (user.status === 'ACTIVE') await userService.updateStatus(user.id, 'INACTIVE');
      else await userService.approveStaff(user.id);
      onRefresh();
    } catch {}
    setToggling(false);
  };

  return (
    <div className="flex items-center gap-2">
      <button onClick={() => onView(user)}
        className="p-1.5 rounded-lg bg-white/5 text-white/50 hover:bg-white/10 hover:text-white transition-all">
        <Eye className="h-3.5 w-3.5" />
      </button>
      {isAdmin && (
        <>
          <button onClick={handleDelete} disabled={deleting}
            className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-40">
            {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
          </button>
          <button onClick={handleToggle} disabled={toggling}
            className={`p-1.5 rounded-lg transition-all ${user.status === 'ACTIVE' ? 'bg-[#37EFD1]/10 text-[#37EFD1]' : 'bg-white/5 text-white/30'}`}>
            {toggling ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShieldCheck className="h-3.5 w-3.5" />}
          </button>
        </>
      )}
    </div>
  );
}