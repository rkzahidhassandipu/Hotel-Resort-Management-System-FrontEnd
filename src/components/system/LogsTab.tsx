// ── components/system/LogsTab.tsx ─────────────────────────
'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, CheckCircle, Database } from 'lucide-react';
import { toast } from 'sonner';
import DataTable, { Column } from '@/components/shared/table/DataTable';
import DataTableFilters from '@/components/shared/table/DataTableFilters';
import DataTablePagination from '@/components/shared/table/DataTablePagination';
import DateCell from '@/components/shared/cell/DateCell';
import { systemService } from '@/service/system.service';
import { LEVEL_COLOR } from '@/types/system.types';
import type { LogEntry } from '@/types/system.types';

type LogTab = 'logs' | 'errors' | 'audit';

export default function LogsTab() {
  const qc = useQueryClient();
  const [logTab, setLogTab]   = useState<LogTab>('logs');
  const [filters, setFilters] = useState({ level: '', isResolved: '' });
  const [page, setPage]       = useState(1);

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
      return {
        rows:  (d?.data || d?.logs || d?.trail || d || []) as LogEntry[],
        total: d?.total ?? (Array.isArray(d) ? d.length : 0),
      };
    },
  });

  const rows  = tableResult?.rows  ?? [];
  const total = tableResult?.total ?? 0;

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

  const logColumns: Column<LogEntry>[] = [
    {
      key: 'level' as keyof LogEntry & string, header: 'Level',
      render: (_, r) => {
        const color = LEVEL_COLOR[r.level] ?? '#94a3b8';
        return <span className="text-xs px-2 py-0.5 rounded font-mono" style={{ color, background: color + '20' }}>{r.level}</span>;
      },
    },
    ...(logTab === 'logs' ? [
      { key: 'action'      as keyof LogEntry & string, header: 'Action',      render: (_: unknown, r: LogEntry) => <span className="text-white/60 text-xs">{r.action ?? '—'}</span> },
      { key: 'resource'    as keyof LogEntry & string, header: 'Resource',    render: (_: unknown, r: LogEntry) => <span className="text-white/60 text-xs">{r.resource ?? '—'}</span> },
      { key: 'description' as keyof LogEntry & string, header: 'Description', render: (_: unknown, r: LogEntry) => <span className="text-white/50 text-xs truncate max-w-64 block">{r.description ?? '—'}</span> },
    ] : []),
    ...(logTab === 'errors' ? [
      { key: 'message'    as keyof LogEntry & string, header: 'Message', render: (_: unknown, r: LogEntry) => <span className="text-white/60 text-xs truncate max-w-64 block">{r.message ?? '—'}</span> },
      { key: 'isResolved' as keyof LogEntry & string, header: 'Status',  render: (_: unknown, r: LogEntry) => r.isResolved
        ? <span className="text-xs px-2 py-0.5 rounded bg-[#37EFD1]/10 text-[#37EFD1]">Resolved</span>
        : <span className="text-xs px-2 py-0.5 rounded bg-[#C8102E]/10 text-[#C8102E]">Unresolved</span>
      },
    ] : []),
    ...(logTab === 'audit' ? [
      { key: 'tableName' as keyof LogEntry & string, header: 'Table',     render: (_: unknown, r: LogEntry) => <span className="text-white/60 text-xs">{r.tableName ?? '—'}</span> },
      { key: 'action'    as keyof LogEntry & string, header: 'Action',    render: (_: unknown, r: LogEntry) => <span className="text-white/60 text-xs">{r.action ?? '—'}</span> },
      { key: 'recordId'  as keyof LogEntry & string, header: 'Record ID', render: (_: unknown, r: LogEntry) => <span className="text-white/40 text-xs font-mono truncate max-w-32 block">{r.recordId ?? '—'}</span> },
    ] : []),
    {
      key: 'user' as keyof LogEntry & string, header: 'User',
      render: (_, r) => r.user
        ? <span className="text-white/50 text-xs">{r.user.firstName} {r.user.lastName}</span>
        : <span className="text-white/20 text-xs">System</span>,
    },
    { key: 'createdAt' as keyof LogEntry & string, header: 'Time', render: (_, r) => <DateCell date={r.createdAt} /> },
    ...(logTab === 'errors' ? [{
      key: 'id' as keyof LogEntry & string, header: 'Actions',
      render: (_: unknown, r: LogEntry) => !r.isResolved ? (
        <button onClick={() => resolveMut.mutate(r.id)} disabled={resolveMut.isPending}
          className="flex items-center gap-1 text-[10px] px-2 py-1 rounded border border-[#37EFD1]/30 text-[#37EFD1] hover:bg-[#37EFD1]/10 transition-all">
          {resolveMut.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />}
          Resolve
        </button>
      ) : null,
    }] : []),
  ];

  const logTabs: { key: LogTab; label: string }[] = [
    { key: 'logs',   label: 'System Logs' },
    { key: 'errors', label: 'Error Logs'  },
    { key: 'audit',  label: 'Audit Trail' },
  ];

  return (
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
  );
}