'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Activity, Loader2, CheckCircle, AlertTriangle,
  Shield, Database, Plus, Trash2, Key, Users,
} from 'lucide-react';
import { toast } from 'sonner';
import DataTable, { Column } from '@/components/shared/table/DataTable';
import DataTableFilters from '@/components/shared/table/DataTableFilters';
import DataTablePagination from '@/components/shared/table/DataTablePagination';
import DateCell from '@/components/shared/cell/DateCell';
import StatsCard from '@/components/shared/StatsCard';
import { systemService } from '@/service/system.service';

// ── Types ─────────────────────────────────────────────────
type MainTab = 'logs' | 'errors' | 'audit' | 'permissions';
type LogTab  = 'logs' | 'errors' | 'audit';

interface LogEntry {
  id: string;
  level: string;
  action?: string;
  resource?: string;
  description?: string;
  message?: string;
  isResolved?: boolean;
  tableName?: string;
  recordId?: string;
  createdAt: string;
  user?: { firstName: string; lastName: string; email: string };
}

interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description?: string;
  _count?: { userPermissions: number; rolePermissions: number };
}

const LEVEL_COLOR: Record<string, string> = {
  INFO: '#37EFD1', WARNING: '#fb923c',
  ERROR: '#C8102E', CRITICAL: '#ef4444', DEBUG: '#60a5fa',
};

const ROLES = ['ADMIN', 'MANAGER', 'STAFF', 'CUSTOMER'];

const inputCls = 'w-full bg-[#0B0C10] border border-white/8 text-white text-sm font-sans px-3 py-2.5 rounded-lg focus:border-[#37EFD1]/40 transition-colors placeholder:text-white/20 outline-none';

// ── Create Permission Modal ───────────────────────────────
function CreatePermissionModal({ onClose, onCreated }: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName]         = useState('');
  const [resource, setResource] = useState('');
  const [action, setAction]     = useState('');
  const [desc, setDesc]         = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await systemService.createPermission({ name, resource, action, description: desc || undefined });
      toast.success('Permission created');
      onCreated();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to create');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative bg-[#1A1B21] border border-white/8 rounded-2xl p-6 w-full max-w-md space-y-4 z-10"
        onClick={e => e.stopPropagation()}>
        <h2 className="text-white font-display font-semibold text-lg">Create Permission</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-white/50 text-xs uppercase tracking-widest font-sans mb-1 block">Name</label>
            <input required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. view_reports" className={inputCls} />
          </div>
          <div>
            <label className="text-white/50 text-xs uppercase tracking-widest font-sans mb-1 block">Resource</label>
            <input required value={resource} onChange={e => setResource(e.target.value)} placeholder="e.g. reports" className={inputCls} />
          </div>
          <div>
            <label className="text-white/50 text-xs uppercase tracking-widest font-sans mb-1 block">Action</label>
            <input required value={action} onChange={e => setAction(e.target.value)} placeholder="e.g. READ" className={inputCls} />
          </div>
          <div>
            <label className="text-white/50 text-xs uppercase tracking-widest font-sans mb-1 block">
              Description <span className="text-white/25 normal-case">(optional)</span>
            </label>
            <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="What this permission allows" className={inputCls} />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={submitting}
              className="flex items-center gap-2 bg-[#C8102E] hover:bg-[#a00d24] disabled:opacity-60 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create'}
            </button>
            <button type="button" onClick={onClose}
              className="px-5 py-2.5 rounded-lg text-sm font-sans text-white/50 hover:text-white bg-white/5 hover:bg-white/10 transition-all">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Role Permissions Panel ────────────────────────────────
function RolePermissionsPanel({ permissions }: { permissions: Permission[] }) {
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

      {/* Role selector */}
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

      {/* Assign */}
      <div className="flex gap-2">
        <select value={selectedPerm} onChange={e => setSelectedPerm(e.target.value)}
          className="flex-1 bg-[#0B0C10] border border-white/8 text-white text-sm font-sans px-3 py-2 rounded-lg focus:border-[#37EFD1]/40 outline-none">
          <option value="">Select permission to assign</option>
          {permissions.map(p => (
            <option key={p.id} value={p.id}>{p.name} ({p.resource}:{p.action})</option>
          ))}
        </select>
        <button
          onClick={() => selectedPerm && assignMut.mutate()}
          disabled={!selectedPerm || assignMut.isPending}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#37EFD1]/10 border border-[#37EFD1]/20 text-[#37EFD1] hover:bg-[#37EFD1]/20 disabled:opacity-50 rounded-lg text-sm transition-all"
        >
          {assignMut.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
          Assign
        </button>
      </div>

      {/* List */}
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

// ── User Permissions Panel ────────────────────────────────
function UserPermissionsPanel({ permissions }: { permissions: Permission[] }) {
  const qc = useQueryClient();
  const [userId, setUserId]       = useState('');
  const [searchId, setSearchId]   = useState('');
  const [selectedPerm, setSelectedPerm] = useState('');
  const [expiresAt, setExpiresAt] = useState('');

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
    mutationFn: () => systemService.grantPermissionToUser(searchId, {
      permissionId: selectedPerm,
      expiresAt: expiresAt || undefined,
    }),
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

      {/* Search */}
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
          {/* Grant */}
          <div className="flex gap-2 flex-wrap">
            <select value={selectedPerm} onChange={e => setSelectedPerm(e.target.value)}
              className="flex-1 min-w-40 bg-[#0B0C10] border border-white/8 text-white text-sm font-sans px-3 py-2 rounded-lg focus:border-[#37EFD1]/40 outline-none">
              <option value="">Select permission</option>
              {permissions.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <input type="datetime-local" value={expiresAt} onChange={e => setExpiresAt(e.target.value)}
              className="bg-[#0B0C10] border border-white/8 text-white/60 text-sm font-sans px-3 py-2 rounded-lg focus:border-[#37EFD1]/40 outline-none" />
            <button
              onClick={() => selectedPerm && grantMut.mutate()}
              disabled={!selectedPerm || grantMut.isPending}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#37EFD1]/10 border border-[#37EFD1]/20 text-[#37EFD1] hover:bg-[#37EFD1]/20 disabled:opacity-50 rounded-lg text-sm transition-all"
            >
              {grantMut.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
              Grant
            </button>
          </div>

          {/* List */}
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

// ── Permissions Tab ───────────────────────────────────────
function PermissionsTab() {
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
    { key: 'name',     header: 'Name',     render: (_, r) => <span className="text-white text-sm">{r.name}</span> },
    { key: 'resource', header: 'Resource', render: (_, r) => <span className="text-white/60 text-xs font-mono">{r.resource}</span> },
    { key: 'action',   header: 'Action',   render: (_, r) => (
      <span className="text-xs px-2 py-0.5 rounded bg-[#37EFD1]/10 text-[#37EFD1] font-mono">{r.action}</span>
    )},
    { key: 'description', header: 'Description', render: (_, r) => (
      <span className="text-white/40 text-xs">{r.description ?? '—'}</span>
    )},
    { key: 'id', header: 'Usage', render: (_, r) => (
      <span className="text-white/40 text-xs">
        {r._count?.userPermissions ?? 0} users · {r._count?.rolePermissions ?? 0} roles
      </span>
    )},
  ];

  return (
    <div className="space-y-5">
      {/* All Permissions */}
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
        {isLoading ? (
          <div className="flex items-center justify-center py-10"><Loader2 className="h-5 w-5 animate-spin text-white/30" /></div>
        ) : (
          <DataTable data={permissions} columns={permColumns} />
        )}
      </div>

      {/* Role & User panels */}
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

// ── Main Page ─────────────────────────────────────────────
export default function AdminSystemPage() {
  const qc = useQueryClient();
  const [mainTab, setMainTab] = useState<MainTab>('logs');
  const [logTab, setLogTab]   = useState<LogTab>('logs');
  const [filters, setFilters] = useState({ level: '', isResolved: '' });
  const [page, setPage]       = useState(1);

  // Health
  const { data: health } = useQuery({
    queryKey: ['system-health'],
    queryFn: async () => {
      const res = await systemService.healthCheck();
      return res.data?.data ?? res.data;
    },
    refetchInterval: 60_000,
  });

  // Stats
  const { data: statsData } = useQuery({
    queryKey: ['system-stats'],
    queryFn: async () => {
      const res = await systemService.getStats();
      return res.data?.data ?? res.data;
    },
    refetchInterval: 30_000,
  });

  // Table
  const { data: tableResult, isLoading } = useQuery({
    queryKey: ['system-table', logTab, page, filters],
    queryFn: async () => {
      const params: Record<string, unknown> = { page, limit: 10 };
      if (filters.level) params.level = filters.level;
      if (filters.isResolved && logTab === 'errors') params.isResolved = filters.isResolved;

      let res;
      if (logTab === 'logs')        res = await systemService.getLogs(params);
      else if (logTab === 'errors') res = await systemService.getErrors(params);
      else                          res = await systemService.getAuditTrail(params);

      const d = res.data?.data;
      const rows  = d?.data || d?.logs || d?.trail || d || [];
      const total = d?.total ?? (Array.isArray(d) ? d.length : 0);
      return { rows: rows as LogEntry[], total };
    },
    enabled: mainTab === 'logs',
  });

  const rows  = tableResult?.rows  ?? [];
  const total = tableResult?.total ?? 0;

  // Mutations
  const resolveMut = useMutation({
    mutationFn: (id: string) => systemService.resolveError(id),
    onSuccess: () => {
      toast.success('Error resolved');
      qc.invalidateQueries({ queryKey: ['system-table'] });
      qc.invalidateQueries({ queryKey: ['system-stats'] });
    },
    onError: () => toast.error('Failed to resolve'),
  });

  const clearMut = useMutation({
    mutationFn: () => systemService.clearOldLogs(),
    onSuccess: () => {
      toast.success('Old logs cleared');
      qc.invalidateQueries({ queryKey: ['system-table'] });
    },
    onError: () => toast.error('Failed to clear logs'),
  });

  // Columns
  const logColumns: Column<LogEntry>[] = [
    {
      key: 'level', header: 'Level',
      render: (_, r) => {
        const color = LEVEL_COLOR[r.level] ?? '#94a3b8';
        return <span className="text-xs px-2 py-0.5 rounded font-mono" style={{ color, background: color + '20' }}>{r.level}</span>;
      },
    },
    ...(logTab === 'logs' ? [
      { key: 'action'      as keyof LogEntry, header: 'Action',      render: (_: unknown, r: LogEntry) => <span className="text-white/60 text-xs">{r.action ?? '—'}</span> },
      { key: 'resource'    as keyof LogEntry, header: 'Resource',    render: (_: unknown, r: LogEntry) => <span className="text-white/60 text-xs">{r.resource ?? '—'}</span> },
      { key: 'description' as keyof LogEntry, header: 'Description', render: (_: unknown, r: LogEntry) => <span className="text-white/50 text-xs truncate max-w-64 block">{r.description ?? '—'}</span> },
    ] : []),
    ...(logTab === 'errors' ? [
      { key: 'message'    as keyof LogEntry, header: 'Message', render: (_: unknown, r: LogEntry) => <span className="text-white/60 text-xs truncate max-w-64 block">{r.message ?? '—'}</span> },
      { key: 'isResolved' as keyof LogEntry, header: 'Status',  render: (_: unknown, r: LogEntry) => r.isResolved
        ? <span className="text-xs px-2 py-0.5 rounded bg-[#37EFD1]/10 text-[#37EFD1]">Resolved</span>
        : <span className="text-xs px-2 py-0.5 rounded bg-[#C8102E]/10 text-[#C8102E]">Unresolved</span>
      },
    ] : []),
    ...(logTab === 'audit' ? [
      { key: 'tableName' as keyof LogEntry, header: 'Table',     render: (_: unknown, r: LogEntry) => <span className="text-white/60 text-xs">{r.tableName ?? '—'}</span> },
      { key: 'action'    as keyof LogEntry, header: 'Action',    render: (_: unknown, r: LogEntry) => <span className="text-white/60 text-xs">{r.action ?? '—'}</span> },
      { key: 'recordId'  as keyof LogEntry, header: 'Record ID', render: (_: unknown, r: LogEntry) => <span className="text-white/40 text-xs font-mono truncate max-w-32 block">{r.recordId ?? '—'}</span> },
    ] : []),
    {
      key: 'user', header: 'User',
      render: (_, r) => r.user
        ? <span className="text-white/50 text-xs">{r.user.firstName} {r.user.lastName}</span>
        : <span className="text-white/20 text-xs">System</span>,
    },
    { key: 'createdAt', header: 'Time', render: (_, r) => <DateCell date={r.createdAt} /> },
    ...(logTab === 'errors' ? [{
      key: 'id' as keyof LogEntry, header: 'Actions',
      render: (_: unknown, r: LogEntry) => !r.isResolved ? (
        <button onClick={() => resolveMut.mutate(r.id)} disabled={resolveMut.isPending}
          className="flex items-center gap-1 text-[10px] px-2 py-1 rounded border border-[#37EFD1]/30 text-[#37EFD1] hover:bg-[#37EFD1]/10 transition-all">
          {resolveMut.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />}
          Resolve
        </button>
      ) : null,
    }] : []),
  ];

  const errorCount = statsData?.errorsByLevel?.find((e: any) => e.level === 'ERROR')?._count?.level ?? 0;
  const warnCount  = statsData?.errorsByLevel?.find((e: any) => e.level === 'WARNING')?._count?.level ?? 0;

  const mainTabs = [
    { key: 'logs'        as MainTab, label: 'Logs & Audit' },
    { key: 'permissions' as MainTab, label: 'Permissions'  },
  ];

  const logTabs = [
    { key: 'logs'   as LogTab, label: 'System Logs' },
    { key: 'errors' as LogTab, label: 'Error Logs'  },
    { key: 'audit'  as LogTab, label: 'Audit Trail' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-white font-semibold">System</h1>
          <p className="text-white/35 text-sm font-sans mt-0.5">Monitor health, logs, and permissions</p>
        </div>
        {health && (
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-sans ${
            health.status === 'healthy'
              ? 'border-[#37EFD1]/30 bg-[#37EFD1]/10 text-[#37EFD1]'
              : 'border-[#C8102E]/30 bg-[#C8102E]/10 text-[#C8102E]'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${health.status === 'healthy' ? 'bg-[#37EFD1]' : 'bg-[#C8102E]'}`} />
            {health.status === 'healthy' ? 'System Healthy' : 'System Degraded'}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Logs (24h)"      value={statsData?.activity?.last24h ?? 0} icon={Activity}      color="#37EFD1" />
        <StatsCard title="Errors"          value={errorCount}                         icon={AlertTriangle} color="#C8102E" />
        <StatsCard title="Warnings"        value={warnCount}                          icon={AlertTriangle} color="#fb923c" />
        <StatsCard title="Active Sessions" value={health?.users?.activeSessions ?? 0} icon={Shield}        color="#60a5fa" />
      </div>

      {/* Main tabs */}
      <div className="flex gap-0 border-b border-white/5">
        {mainTabs.map(t => (
          <button key={t.key} onClick={() => setMainTab(t.key)}
            className={`px-5 py-2.5 text-sm font-sans transition-all border-b-2 -mb-px ${
              mainTab === t.key ? 'border-[#C8102E] text-white' : 'border-transparent text-white/40 hover:text-white'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Logs & Audit */}
      {mainTab === 'logs' && (
        <div className="bg-[#1A1B21] border border-white/5 rounded-xl p-5">
          <div className="flex items-center gap-1 mb-5 border-b border-white/5 pb-4 flex-wrap gap-y-3">
            {logTabs.map(t => (
              <button key={t.key}
                onClick={() => { setLogTab(t.key); setPage(1); setFilters({ level: '', isResolved: '' }); }}
                className={`px-4 py-1.5 rounded-lg text-sm font-sans transition-all ${
                  logTab === t.key ? 'bg-[#C8102E] text-white' : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}>
                {t.label}
              </button>
            ))}

            <div className="ml-auto flex items-center gap-2">
              {logTab === 'logs' && (
                <button onClick={() => clearMut.mutate()} disabled={clearMut.isPending}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans border border-white/10 text-white/40 hover:text-white hover:border-white/20 transition-all disabled:opacity-50">
                  {clearMut.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Database className="h-3 w-3" />}
                  Clear Old Logs
                </button>
              )}
              <DataTableFilters
                filters={[
                  { key: 'level', label: 'All Levels', options: [
                    { label: 'Info',     value: 'INFO'     },
                    { label: 'Warning',  value: 'WARNING'  },
                    { label: 'Error',    value: 'ERROR'    },
                    { label: 'Critical', value: 'CRITICAL' },
                    { label: 'Debug',    value: 'DEBUG'    },
                  ]},
                  ...(logTab === 'errors' ? [{
                    key: 'isResolved', label: 'All Status', options: [
                      { label: 'Resolved',   value: 'true'  },
                      { label: 'Unresolved', value: 'false' },
                    ],
                  }] : []),
                ]}
                values={filters}
                onChange={(k, v) => { setFilters(f => ({ ...f, [k]: v })); setPage(1); }}
                onReset={() => { setFilters({ level: '', isResolved: '' }); setPage(1); }}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-white/30" /></div>
          ) : (
            <>
              <DataTable data={rows} columns={logColumns} />
              <DataTablePagination page={page} totalPages={Math.ceil(total / 10)} onPage={setPage} total={total} limit={10} />
            </>
          )}
        </div>
      )}

      {/* Permissions */}
      {mainTab === 'permissions' && <PermissionsTab />}
    </div>
  );
}