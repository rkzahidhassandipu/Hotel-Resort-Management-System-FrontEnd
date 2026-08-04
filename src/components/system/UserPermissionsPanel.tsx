// ── components/system/UserPermissionsPanel.tsx ────────────
'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Plus, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';
import { systemService } from '@/service/system.service';
import { inputCls } from '@/types/system.types';
import type { Permission } from '@/types/system.types';

export default function UserPermissionsPanel({ permissions }: { permissions: Permission[] }) {
  const qc = useQueryClient();
  const [userId, setUserId]             = useState('');
  const [searchId, setSearchId]         = useState('');
  const [selectedPerm, setSelectedPerm] = useState('');
  const [expiresAt, setExpiresAt]       = useState('');

  const { data: userPerms = [], isLoading } = useQuery({
    queryKey: ['user-permissions', searchId],
    queryFn: async () => {
      if (!searchId) return [];
      const res = await systemService.getUserPermissions(searchId);
      return (res.data?.data ?? res.data ?? []) as { id: string; permission: Permission; expiresAt?: string }[];
    },
    enabled: !!searchId,
  });

  const grantMut = useMutation({
    mutationFn: () => systemService.grantPermissionToUser(searchId, { permissionId: selectedPerm, expiresAt: expiresAt || undefined }),
    onSuccess: () => {
      toast.success('Permission granted');
      qc.invalidateQueries({ queryKey: ['user-permissions', searchId] });
      setSelectedPerm(''); setExpiresAt('');
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed to grant'),
  });

  const revokeMut = useMutation({
    mutationFn: (permissionId: string) => systemService.revokePermission(searchId, permissionId),
    onSuccess: () => {
      toast.success('Permission revoked');
      qc.invalidateQueries({ queryKey: ['user-permissions', searchId] });
    },
    onError: () => toast.error('Failed to revoke'),
  });

  return (
    <div className="bg-[#1A1B21] border border-white/8 rounded-xl p-5 space-y-4">
      <h3 className="text-white font-display font-semibold flex items-center gap-2">
        <Users className="h-4 w-4 text-[#37EFD1]" /> User Permissions
      </h3>

      <div className="flex gap-2">
        <input value={userId} onChange={e => setUserId(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && setSearchId(userId)}
          placeholder="Enter User ID" className={`${inputCls} flex-1`} />
        <button onClick={() => setSearchId(userId)} disabled={!userId}
          className="px-4 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-50 text-white/60 hover:text-white rounded-lg text-sm transition-all">
          Search
        </button>
      </div>

      {searchId && (
        <>
          <div className="flex gap-2 flex-wrap">
            <select value={selectedPerm} onChange={e => setSelectedPerm(e.target.value)}
              className="flex-1 min-w-40 bg-[#0B0C10] border border-white/8 text-white text-sm font-sans px-3 py-2 rounded-lg focus:border-[#37EFD1]/40 outline-none">
              <option value="">Select permission</option>
              {permissions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <input type="datetime-local" value={expiresAt} onChange={e => setExpiresAt(e.target.value)}
              className="bg-[#0B0C10] border border-white/8 text-white/60 text-sm font-sans px-3 py-2 rounded-lg focus:border-[#37EFD1]/40 outline-none" />
            <button onClick={() => selectedPerm && grantMut.mutate()} disabled={!selectedPerm || grantMut.isPending}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#37EFD1]/10 border border-[#37EFD1]/20 text-[#37EFD1] hover:bg-[#37EFD1]/20 disabled:opacity-50 rounded-lg text-sm transition-all">
              {grantMut.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
              Grant
            </button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-white/30" /></div>
          ) : userPerms.length === 0 ? (
            <p className="text-white/30 text-sm font-sans text-center py-6">No permissions for this user</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {userPerms.map(up => (
                <div key={up.id} className="flex items-center justify-between bg-[#0B0C10] border border-white/5 rounded-lg px-3 py-2">
                  <div>
                    <p className="text-white text-sm font-sans">{up.permission.name}</p>
                    <p className="text-white/40 text-xs font-sans">
                      {up.permission.resource}:{up.permission.action}
                      {up.expiresAt && ` · expires ${new Date(up.expiresAt).toLocaleDateString()}`}
                    </p>
                  </div>
                  <button onClick={() => revokeMut.mutate(up.permission.id)} disabled={revokeMut.isPending}
                    className="p-1.5 rounded text-[#C8102E] hover:bg-[#C8102E]/10 transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}