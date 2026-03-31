'use client';
import { useEffect, useState } from 'react';
import { BarChart2, Loader2, TrendingUp, Users, BedDouble, DollarSign } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import StatsCard from '@/components/shared/StatsCard';
import { reportService } from '@/service/report.service';

const tooltipStyle = { backgroundColor: '#1A1B21', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#fff', fontSize: '11px' };

export default function ManagerReportsPage() {
  const [dashboard, setDashboard] = useState<Record<string, unknown>>({});
  const [revenue, setRevenue] = useState<{ date: string; revenue: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [dRes, rRes] = await Promise.all([reportService.getDashboard(), reportService.getRevenue({ fromDate: new Date(Date.now()-14*86400000).toISOString(), toDate: new Date().toISOString() })]);
        const raw = dRes.data?.data || {};
        setDashboard({
          occupancyRate:  raw.rooms?.occupancyRate || '0',
          todayRevenue:   raw.revenue?.today       || 0,
          monthlyRevenue: raw.revenue?.thisMonth   || 0,
          totalGuests:    raw.customers?.total     || 0,
          todayCheckIns:  raw.bookings?.todayCheckIns  || 0,
          todayCheckOuts: raw.bookings?.todayCheckOuts || 0,
          openMaintenance:  raw.alerts?.pendingMaintenance || 0,
          todayFoodOrders:  raw.alerts?.pendingFoodOrders  || 0,
        });
        setRevenue(rRes.data?.data?.timeline || []);
      } catch {}
      setLoading(false);
    };
    fetchAll();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-white/30" /></div>;

  return (
    <div className="space-y-6">
      <div><h1 className="font-display text-2xl text-white font-semibold">Reports</h1><p className="text-white/35 text-sm font-sans mt-0.5">Performance overview and analytics</p></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Occupancy" value={`${Number(dashboard.occupancyRate || 0).toFixed(1)}%`} icon={BedDouble} color="#37EFD1" />
        <StatsCard title="Today Revenue" value={`RM ${Number(dashboard.todayRevenue || 0).toLocaleString()}`} icon={DollarSign} color="#C8102E" />
        <StatsCard title="Monthly Revenue" value={`RM ${Number(dashboard.monthlyRevenue || 0).toLocaleString()}`} icon={TrendingUp} color="#60a5fa" />
        <StatsCard title="Total Guests" value={Number(dashboard.totalGuests || 0)} icon={Users} color="#a78bfa" />
      </div>
      {revenue.length > 0 && (
        <div className="bg-[#1A1B21] border border-white/5 rounded-xl p-5">
          <h3 className="text-white font-display text-base font-semibold mb-4">Revenue — Last 14 Days</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={revenue}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C8102E" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#C8102E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.25)' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.25)' }} tickLine={false} axisLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <Tooltip contentStyle={tooltipStyle} formatter={v => [`RM ${Number(v).toLocaleString()}`, 'Revenue']} />
              <Area type="monotone" dataKey="amount" stroke="#C8102E" strokeWidth={2} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
      <div className="bg-[#1A1B21] border border-white/5 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4"><BarChart2 className="h-4 w-4 text-white/30" /><span className="text-white/50 text-sm font-sans">Today Summary</span></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[['Check-ins', dashboard.todayCheckIns], ['Check-outs', dashboard.todayCheckOuts], ['Open Maintenance', dashboard.openMaintenance], ['Food Orders', dashboard.todayFoodOrders]].map(([l, v]) => (
            <div key={l as string} className="bg-white/3 rounded-lg p-4 text-center">
              <p className="text-2xl font-display text-white font-semibold">{Number(v || 0)}</p>
              <p className="text-white/35 text-xs font-sans mt-1">{l as string}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
