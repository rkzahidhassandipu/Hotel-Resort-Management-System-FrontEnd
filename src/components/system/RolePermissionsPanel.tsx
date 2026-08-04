// ── components/system/RolePermissionsPanel.tsx ────────────
'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Plus, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { systemService } from '@/service/system.service';
import type { Permission } from '@/types/system.types';

const ROLES = ['ADMIN', 'MANAGER', 'STAFF', 'CUSTOMER'];

export default function RolePermissionsPanel({ permissions }: { permissions: Permission[] }) {
  const qc = useQueryClient();
  const [selectedRole, setSelectedRole] = useState('ADMIN');
  const [selectedPerm, setSelectedPerm] = useState('');

  const { data: rolePerms = [], isLoading } = useQuery({
    queryKey: ['role-permissions', selectedRole],
    queryFn: async () => {
      const res = await systemService.getRolePermissions(selectedRole);
      return (res.data?.data ?? res.data ?? []) as { id: string; permission: Permission }[];
    },
  });

  const assignMut = useMutation({
    mutationFn: () => systemService.assignPermissionToRole(selectedRole, { permissionId: selectedPerm }),
    onSuccess: () => {
      toast.success('Permission assigned to role');
      qc.invalidateQueries({ queryKey: ['role-permissions', selectedRole] });
      setSelectedPerm('');
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed to assign'),
  });

  return (
    <div className="bg-[#1A1B21] border border-white/8 rounded-xl p-5 space-y-4">
      <h3 className="text-white font-display font-semibold flex items-center gap-2">
        <Shield className="h-4 w-4 text-[#37EFD1]" /> Role Permissions
      </h3>

      <div className="flex gap-1 flex-wrap">
        {ROLES.map(r => (
          <button key={r} onClick={() => setSelectedRole(r)}
            className={`px-3 py-1 rounded-lg text-xs font-sans transition-all ${
              selectedRole === r ? 'bg-[#C8102E] text-white' : 'bg-white/5 text-white/40 hover:text-white hover:bg-white/10'
            }`}>
            {r}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <select value={selectedPerm} onChange={e => setSelectedPerm(e.target.value)}
          className="flex-1 bg-[#0B0C10] border border-white/8 text-white text-sm font-sans px-3 py-2 rounded-lg focus:border-[#37EFD1]/40 outline-none">
          <option value="">Select permission to assign</option>
          {permissions.map(p => (
            <option key={p.id} value={p.id}>{p.name} ({p.resource}:{p.action})</option>
          ))}
        </select>
        <button onClick={() => selectedPerm && assignMut.mutate()} disabled={!selectedPerm || assignMut.isPending}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#37EFD1]/10 border border-[#37EFD1]/20 text-[#37EFD1] hover:bg-[#37EFD1]/20 disabled:opacity-50 rounded-lg text-sm transition-all">
          {assignMut.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
          Assign
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-white/30" /></div>
      ) : rolePerms.length === 0 ? (
        <p className="text-white/30 text-sm font-sans text-center py-6">No permissions assigned to {selectedRole}</p>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {rolePerms.map(rp => (
            <div key={rp.id} className="flex items-center justify-between bg-[#0B0C10] border border-white/5 rounded-lg px-3 py-2">
              <div>
                <p className="text-white text-sm font-sans">{rp.permission.name}</p>
                <p className="text-white/40 text-xs font-sans">{rp.permission.resource}:{rp.permission.action}</p>
              </div>
              <span className="text-[#37EFD1] text-xs font-mono px-2 py-0.5 rounded bg-[#37EFD1]/10">{rp.permission.action}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}