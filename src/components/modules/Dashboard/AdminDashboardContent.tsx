'use client';
import React, { useEffect, useState } from 'react';
import { BedDouble, Calendar, CreditCard, Users, Wrench, ChefHat, Activity, Loader2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import StatsCard from '@/components/shared/StatsCard';
import { reportService } from '@/service/report.service';

const tooltipStyle = { backgroundColor: '#1A1B21', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#fff', fontSize: '11px' };

export default function AdminDashboardContent() {
  const [dashboard, setDashboard]     = useState<Record<string, unknown>>({});
  const [revenueData, setRevenueData] = useState<{ date: string; amount: number }[]>([]);
  const [roomStatus, setRoomStatus]   = useState([
    { name: 'Occupied',    value: 0, color: '#C8102E' },
    { name: 'Available',   value: 0, color: '#37EFD1' },
    { name: 'Cleaning',    value: 0, color: '#60a5fa' },
    { name: 'Maintenance', value: 0, color: '#fb923c' },
  ]);
  const [recentBookings, setRecentBookings] = useState<{ guest: string; room: string; checkIn: string; status: string; statusColor: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [dRes, rRes] = await Promise.all([
          reportService.getDashboard(),
          reportService.getRevenue({}),
        ]);

        // Backend response shape:
        // { rooms:{total,occupied,available,occupancyRate}, bookings:{todayCheckIns,todayCheckOuts,totalToday,pending},
        //   revenue:{today,thisMonth}, customers:{total,newThisMonth}, alerts:{pendingMaintenance,...} }
        const d = dRes.data?.data || {};
        setDashboard(d);

        // Revenue timeline: { total, timeline:[{date,amount}], ... }
        const revData = rRes.data?.data || {};
        setRevenueData((revData.timeline as { date: string; amount: number }[]) || []);

        // Room status from dashboard data
        const rooms = (d.rooms as Record<string, number>) || {};
        setRoomStatus([
          { name: 'Occupied',    value: rooms.occupied    || 0, color: '#C8102E' },
          { name: 'Available',   value: rooms.available   || 0, color: '#37EFD1' },
          { name: 'Cleaning',    value: 0,                      color: '#60a5fa' },
          { name: 'Maintenance', value: 0,                      color: '#fb923c' },
        ]);

        // Recent bookings from d.recentBookings if present
        if (Array.isArray(d.recentBookings)) {
          const statusColors: Record<string, string> = { CHECKED_IN: '#37EFD1', CONFIRMED: '#60a5fa', PENDING: '#fb923c', CANCELLED: '#C8102E', CHECKED_OUT: '#a78bfa' };
          setRecentBookings((d.recentBookings as Array<Record<string, unknown>>).map(b => ({
            guest: `${(b.customer as { firstName?: string })?.firstName || ''} ${(b.customer as { lastName?: string })?.lastName || ''}`.trim(),
            room: `Room #${(b.room as { roomNumber?: string })?.roomNumber || '—'}`,
            checkIn: String(b.checkInDate || ''),
            status: String(b.status || ''),
            statusColor: statusColors[String(b.status)] || '#94a3b8',
          })));
        }
      } catch { /* keep defaults */ }
      setLoading(false);
    };
    fetchAll();
  }, []);

  // Extract nested fields from backend response
  const rooms     = (dashboard.rooms     as Record<string, number>)  || {};
  const bookings  = (dashboard.bookings  as Record<string, number>)  || {};
  const revenue   = (dashboard.revenue   as Record<string, number>)  || {};
  const customers = (dashboard.customers as Record<string, number>)  || {};
  const alerts    = (dashboard.alerts    as Record<string, number>)  || {};

  const greet = () => { const h = new Date().getHours(); return h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening'; };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-white/30" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-white font-semibold">Dashboard</h1>
        <p className="text-white/35 text-sm font-sans mt-0.5">Good {greet()} — here&apos;s what&apos;s happening today</p>
      </div>

      {/* Row 1 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Occupancy Rate"    value={`${Number(rooms.occupancyRate || 0)}%`}              subtitle={`${rooms.occupied || 0} / ${rooms.total || 0} rooms`}     icon={BedDouble}  color="#37EFD1" />
        <StatsCard title="Today's Revenue"   value={`RM ${Number(revenue.today || 0).toLocaleString()}`}  subtitle="Payments received"                                          icon={CreditCard}  color="#C8102E" />
        <StatsCard title="Check-ins Today"   value={Number(bookings.todayCheckIns || 0)}                  subtitle={`${bookings.todayCheckOuts || 0} check-outs`}               icon={Calendar}    color="#60a5fa" />
        <StatsCard title="Pending Bookings"  value={Number(bookings.pending || 0)}                        subtitle="Awaiting confirmation"                                       icon={Activity}    color="#fb923c" />
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Guests"      value={Number(customers.total || 0)}                         icon={Users}    color="#a78bfa" />
        <StatsCard title="Open Maintenance"  value={Number(alerts.pendingMaintenance || 0)}               subtitle="Active requests"  icon={Wrench}   color="#fb923c" />
        <StatsCard title="Food Orders"       value={Number(alerts.pendingFoodOrders || 0)}                subtitle="Pending today"    icon={ChefHat}  color="#37EFD1" />
        <StatsCard title="Monthly Revenue"   value={`RM ${Number(revenue.thisMonth || 0).toLocaleString()}`}  icon={Activity} color="#C8102E" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#1A1B21] border border-white/5 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-display text-base font-semibold">Revenue Timeline</h3>
            <span className="text-white/30 text-xs font-sans">RM</span>
          </div>
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#C8102E" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#C8102E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date"   tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.25)' }} tickLine={false} axisLine={false} />
                <YAxis                  tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.25)' }} tickLine={false} axisLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={tooltipStyle} formatter={v => [`RM ${Number(v).toLocaleString()}`, 'Revenue']} />
                <Area type="monotone" dataKey="amount" stroke="#C8102E" strokeWidth={2} fill="url(#revGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-44 flex items-center justify-center text-white/20 text-sm font-sans">No revenue data yet</div>
          )}
        </div>

        <div className="bg-[#1A1B21] border border-white/5 rounded-xl p-5">
          <h3 className="text-white font-display text-base font-semibold mb-4">Room Status</h3>
          <div className="flex justify-center mb-4">
            <PieChart width={140} height={140}>
              <Pie data={roomStatus} cx={70} cy={70} innerRadius={40} outerRadius={60} dataKey="value" strokeWidth={0}>
                {roomStatus.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
            </PieChart>
          </div>
          <div className="space-y-2">
            {roomStatus.map(r => (
              <div key={r.name} className="flex items-center justify-between text-xs font-sans">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: r.color }} />
                  <span className="text-white/50">{r.name}</span>
                </div>
                <span className="text-white/70 font-medium">{r.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      {recentBookings.length > 0 && (
        <div className="bg-[#1A1B21] border border-white/5 rounded-xl p-5">
          <h3 className="text-white font-display text-base font-semibold mb-4">Recent Bookings</h3>
          <div className="divide-y divide-white/5">
            {recentBookings.map((b, i) => (
              <div key={i} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-white text-sm font-sans">{b.guest}</p>
                  <p className="text-white/35 text-xs font-sans">{b.room}</p>
                </div>
                <div className="text-right">
                  <p className="text-white/50 text-xs font-sans">{b.checkIn ? new Date(b.checkIn).toLocaleDateString() : '—'}</p>
                  <span className="text-xs font-sans" style={{ color: b.statusColor }}>{b.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick summary */}
      <div className="bg-[#1A1B21] border border-white/5 rounded-xl p-5">
        <h3 className="text-white font-display text-base font-semibold mb-4">Alerts</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Pending Maintenance', value: alerts.pendingMaintenance },
            { label: 'Open Service Requests', value: alerts.openServiceRequests },
            { label: 'Pending Food Orders', value: alerts.pendingFoodOrders },
            { label: 'Low Stock Items', value: alerts.lowStockItems },
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
