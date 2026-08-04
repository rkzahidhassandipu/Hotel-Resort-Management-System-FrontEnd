'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader2, Plus } from 'lucide-react';

import DataTable from '@/components/shared/table/DataTable';
import DataTablePagination from '@/components/shared/table/DataTablePagination';

import { maintenanceService } from '@/service/maintenance.service';
import { parseMaintenanceStats } from '@/lib/statsUtils';

import MaintenanceTicketModal from '@/components/maintenance/MaintenanceTicketModal';
import MaintenanceEditPanel from '@/components/maintenance/MaintenanceEditPanel';
import CreateHousekeepingModal from '@/components/maintenance/CreateHousekeepingModal';
import CreateMaintenanceModal from '@/components/maintenance/Createmaintenancemodal';

import MaintenanceTabs, { MaintenanceTab } from '@/components/maintenance/Maintenancetabs';
import { useMaintenanceColumns } from '@/components/maintenance/Usemaintenancecolumns';
import { useHousekeepingColumns } from '@/components/maintenance/Usehousekeepingcolumns';
import MaintenanceStatsRow from '@/components/maintenance/Maintenancestatsrow';

import type { MaintenanceStats } from '@/types';

function unwrapList<T = any>(res: any): T[] {
  const root = res?.data;
  if (Array.isArray(root?.data)) return root.data;
  if (Array.isArray(root?.data?.tickets)) return root.data.tickets;
  if (Array.isArray(root?.data?.logs)) return root.data.logs;
  return [];
}

function unwrapMeta(res: any): { total: number } {
  const root = res?.data;
  return root?.meta ?? root?.data?.meta ?? { total: 0 };
}

export default function AdminMaintenancePage() {
  const [activeTab, setActiveTab] = useState<MaintenanceTab>('MAINTENANCE');
  const [page, setPage] = useState(1);

  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState('');

  const [viewTicket, setViewTicket] = useState<any | null>(null);
  const [editTicket, setEditTicket] = useState<any | null>(null);

  const [showCreateMaintenance, setShowCreateMaintenance] = useState(false);
  const [showCreateHousekeeping, setShowCreateHousekeeping] = useState(false);

  const [startingId, setStartingId] = useState<string | null>(null);
  const [completingId, setCompletingId] = useState<string | null>(null);

  // ✅ FULL TYPE SAFE STATE
  const [stats, setStats] = useState<MaintenanceStats>({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
    overduePending: 0,
    byStatus: {},
    byPriority: {},
    byType: {},
  });

  console.log('stats',stats)
  const fetchData = useCallback(async () => {
    setLoading(true);

    try {
      if (activeTab === 'MAINTENANCE') {
        const [mRes, sRes] = await Promise.all([
          maintenanceService.getAll({ page, limit: 10 }),
          maintenanceService.getStats(),
        ]);

        console.log(sRes.data?.data);

        setData(unwrapList(mRes));
        setTotal(unwrapMeta(mRes).total || 0);

        // ✅ SAFE + FULL OBJECT
        setStats(sRes.data?.data ?? {});
      } else {
        const hRes = await maintenanceService.getHousekeepingLogs({
          page,
          limit: 10,
        });

        setData(unwrapList(hRes));
        setTotal(unwrapMeta(hRes).total || 0);
      }
    } catch (e) {
      console.error(e);
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleStartHousekeeping = async (id: string) => {
    setStartingId(id);
    setActionError('');

    try {
      await maintenanceService.startHousekeeping(id);
      fetchData();
    } catch (e: any) {
      setActionError(
        e?.response?.data?.message || 'Failed to start housekeeping'
      );
    } finally {
      setStartingId(null);
    }
  };

  const handleCompleteHousekeeping = async (id: string) => {
    setCompletingId(id);
    setActionError('');

    try {
      await maintenanceService.completeHousekeeping(id);
      fetchData();
    } catch (e: any) {
      setActionError(
        e?.response?.data?.message || 'Failed to mark as complete'
      );
    } finally {
      setCompletingId(null);
    }
  };

  const maintenanceColumns = useMaintenanceColumns({
    onView: setViewTicket,
    onEdit: setEditTicket,
  });

  const housekeepingColumns = useHousekeepingColumns({
    startingId,
    completingId,
    onStart: handleStartHousekeeping,
    onComplete: handleCompleteHousekeeping,
  });

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl text-white font-semibold">
        Maintenance & Housekeeping
      </h1>

      <MaintenanceTabs
        active={activeTab}
        onChange={(tab) => {
          setActiveTab(tab);
          setPage(1);
        }}
      />

      {actionError && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg px-4 py-2.5">
          {actionError}
        </div>
      )}

      {activeTab === 'MAINTENANCE' && (
        <MaintenanceStatsRow stats={stats} />
      )}

      <div className="bg-[#1A1B21] border border-white/5 rounded-xl p-5">
        {/* Header */}
        {activeTab === 'MAINTENANCE' && (
          <div className="flex items-center justify-between mb-4">
            <p className="text-white/50 text-sm">All maintenance tickets</p>

            <button
              onClick={() => setShowCreateMaintenance(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#37EFD1]/15 border border-[#37EFD1]/25 text-[#37EFD1] text-xs rounded-lg"
            >
              <Plus size={13} /> New Ticket
            </button>
          </div>
        )}

        {activeTab === 'HOUSEKEEPING' && (
          <div className="flex items-center justify-between mb-4">
            <p className="text-white/50 text-sm">
              All housekeeping activity logs
            </p>

            <button
              onClick={() => setShowCreateHousekeeping(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#37EFD1]/15 border border-[#37EFD1]/25 text-[#37EFD1] text-xs rounded-lg"
            >
              <Plus size={13} /> New Log
            </button>
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="py-16 text-center">
            <Loader2
              className="animate-spin text-white/30 inline"
              size={24}
            />
          </div>
        ) : data.length === 0 ? (
          <div className="py-16 text-center text-white/30 text-sm">
            No records found
          </div>
        ) : (
          <>
            <DataTable
              data={data}
              columns={
                activeTab === 'MAINTENANCE'
                  ? maintenanceColumns
                  : housekeepingColumns
              }
            />

            <DataTablePagination
              page={page}
              totalPages={Math.ceil(total / 10)}
              onPage={setPage}
              total={total}
              limit={10}
            />
          </>
        )}
      </div>

      {/* Modals */}
      {viewTicket && (
        <MaintenanceTicketModal
          ticket={viewTicket}
          onClose={() => setViewTicket(null)}
        />
      )}

      {editTicket && (
        <MaintenanceEditPanel
          ticket={editTicket}
          onClose={() => setEditTicket(null)}
          onSuccess={fetchData}
        />
      )}

      {showCreateMaintenance && (
        <CreateMaintenanceModal
          onClose={() => setShowCreateMaintenance(false)}
          onSuccess={fetchData}
        />
      )}

      {showCreateHousekeeping && (
        <CreateHousekeepingModal
          onClose={() => setShowCreateHousekeeping(false)}
          onSuccess={fetchData}
        />
      )}
    </div>
  );
}