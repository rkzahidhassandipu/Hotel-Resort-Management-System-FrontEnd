'use client';
import { useEffect, useState } from 'react';
import { BarChart2, Loader2, TrendingUp, Users, BedDouble, DollarSign } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import StatsCard from '@/components/shared/StatsCard';
import { reportService } from '@/service/report.service';

const tooltipStyle = { backgroundColor: '#1A1B21', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#fff', fontSize: '11px' };

export default function AdminReportsPage() {
  const [dashboard, setDashboard] = useState<Record<string, unknown>>({});
  const [revenue, setRevenue] = useState<{ date: string; revenue: number; bookings: number }[]>([]);
  const [occupancy, setOccupancy] = useState<{ date: string; rate: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [dRes, rRes, oRes] = await Promise.all([
          reportService.getDashboard(),
          reportService.getRevenue({ fromDate: new Date(Date.now() - 14 * 86400000).toISOString(), toDate: new Date().toISOString() }),
          reportService.getOccupancy({ fromDate: new Date(Date.now() - 7 * 86400000).toISOString(), toDate: new Date().toISOString() }),
        ]);
        const d = dRes.data?.data || {};
        setDashboard({
          occupancyRate:  d.rooms?.occupancyRate || '0',
          todayRevenue:   d.revenue?.today       || 0,
          monthlyRevenue: d.revenue?.thisMonth   || 0,
          totalGuests:    d.customers?.total     || 0,
          todayCheckIns:  d.bookings?.todayCheckIns  || 0,
          todayCheckOuts: d.bookings?.todayCheckOuts || 0,
          openMaintenance:    d.alerts?.pendingMaintenance    || 0,
          todayFoodOrders:    d.alerts?.pendingFoodOrders     || 0,
        });
        setRevenue(rRes.data?.data?.timeline || []);
        // occupancy has no timeline array; use single value
        setOccupancy([{ date: 'Now', rate: parseFloat(String(oRes.data?.data?.occupancyRate || '0')) }]);
      } catch {}
      setLoading(false);
    };
    fetchAll();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-white/30" /></div>;

  return (
    <div className="space-y-6">
      <div><h1 className="font-display text-2xl text-white font-semibold">Reports</h1><p className="text-white/35 text-sm font-sans mt-0.5">Hotel performance analytics and insights</p></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Occupancy Rate" value={`${Number(dashboard.occupancyRate || 0).toFixed(1)}%`} icon={BedDouble} color="#37EFD1" />
        <StatsCard title="Today's Revenue" value={`RM ${Number(dashboard.todayRevenue || 0).toLocaleString()}`} icon={DollarSign} color="#C8102E" />
        <StatsCard title="Monthly Revenue" value={`RM ${Number(dashboard.monthlyRevenue || 0).toLocaleString()}`} icon={TrendingUp} color="#60a5fa" />
        <StatsCard title="Total Guests" value={Number(dashboard.totalGuests || 0)} icon={Users} color="#a78bfa" />
      </div>

      {revenue.length > 0 && (
        <div className="bg-[#1A1B21] border border-white/5 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-display text-base font-semibold">Revenue — Last 14 Days</h3>
            <span className="text-white/30 text-xs font-sans">RM</span>
          </div>
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
              <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.25)' }} tickLine={false} axisLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={tooltipStyle} formatter={v => [`RM ${Number(v).toLocaleString()}`, 'Revenue']} />
              <Area type="monotone" dataKey="amount" stroke="#C8102E" strokeWidth={2} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {occupancy.length > 0 && (
        <div className="bg-[#1A1B21] border border-white/5 rounded-xl p-5">
          <h3 className="text-white font-display text-base font-semibold mb-4">Occupancy — Last 7 Days</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={occupancy}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.25)' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.25)' }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
              <Tooltip contentStyle={tooltipStyle} formatter={v => [`${v}%`, 'Occupancy']} />
              <Bar dataKey="rate" fill="#37EFD1" opacity={0.8} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="bg-[#1A1B21] border border-white/5 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-2">
          <BarChart2 className="h-4 w-4 text-white/30" />
          <span className="text-white/50 text-sm font-sans">Quick Summary</span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          {[
            { label: 'Check-ins Today', value: dashboard.todayCheckIns },
            { label: 'Check-outs Today', value: dashboard.todayCheckOuts },
            { label: 'Open Maintenance', value: dashboard.openMaintenance },
            { label: 'Food Orders Today', value: dashboard.todayFoodOrders },
          ].map(item => (
            <div key={item.label} className="bg-white/3 rounded-lg p-4 text-center">
              <p className="text-2xl font-display text-white font-semibold">{Number(item.value || 0)}</p>
              <p className="text-white/35 text-xs font-sans mt-1">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
