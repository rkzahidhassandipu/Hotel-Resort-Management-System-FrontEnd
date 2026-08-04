// ── components/system/PermissionsTab.tsx ─────────────────
'use client';
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Plus, Key } from 'lucide-react';
import DataTable, { Column } from '@/components/shared/table/DataTable';
import { systemService } from '@/service/system.service';
import CreatePermissionModal from './CreatePermissionModal';
import RolePermissionsPanel  from './RolePermissionsPanel';
import UserPermissionsPanel  from './UserPermissionsPanel';
import type { Permission } from '@/types/system.types';

export default function PermissionsTab() {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);

  const { data: permissions = [], isLoading } = useQuery({
    queryKey: ['all-permissions'],
    queryFn: async () => {
      const res = await systemService.getPermissions();
      return (res.data?.data ?? res.data ?? []) as Permission[];
    },
  });

  const permColumns: Column<Permission>[] = [
    { key: 'name',        header: 'Name',        render: (_, r) => <span className="text-white text-sm">{r.name}</span> },
    { key: 'resource',    header: 'Resource',    render: (_, r) => <span className="text-white/60 text-xs font-mono">{r.resource}</span> },
    { key: 'action',      header: 'Action',      render: (_, r) => <span className="text-xs px-2 py-0.5 rounded bg-[#37EFD1]/10 text-[#37EFD1] font-mono">{r.action}</span> },
    { key: 'description', header: 'Description', render: (_, r) => <span className="text-white/40 text-xs">{r.description ?? '—'}</span> },
    { key: 'id',          header: 'Usage',        render: (_, r) => <span className="text-white/40 text-xs">{r._count?.userPermissions ?? 0} users · {r._count?.rolePermissions ?? 0} roles</span> },
  ];

  return (
    <div className="space-y-5">
      <div className="bg-[#1A1B21] border border-white/8 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-display font-semibold flex items-center gap-2">
            <Key className="h-4 w-4 text-[#37EFD1]" /> All Permissions
          </h3>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#C8102E] hover:bg-[#a00d24] text-white rounded-lg text-sm font-sans transition-all">
            <Plus className="h-3.5 w-3.5" /> Create
          </button>
        </div>
        {isLoading
          ? <div className="flex items-center justify-center py-10"><Loader2 className="h-5 w-5 animate-spin text-white/30" /></div>
          : <DataTable data={permissions} columns={permColumns} />
        }
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <RolePermissionsPanel permissions={permissions} />
        <UserPermissionsPanel permissions={permissions} />
      </div>

      {showCreate && (
        <CreatePermissionModal
          onClose={() => setShowCreate(false)}
          onCreated={() => qc.invalidateQueries({ queryKey: ['all-permissions'] })}
        />
      )}
    </div>
  );
}