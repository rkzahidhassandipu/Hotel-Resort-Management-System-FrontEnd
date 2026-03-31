'use client';
import { useEffect, useState } from 'react';
import { Calendar, ChefHat, Star, Bell, CreditCard, Loader2 } from 'lucide-react';
import StatsCard from '@/components/shared/StatsCard';
import { bookingService } from '@/service/booking.service';
import { notificationService } from '@/service/notification.service';

export default function CustomerDashboardPage() {
  const [stats, setStats] = useState({ bookings: 0, activeStay: false, foodOrders: 0, reviews: 0, notifications: 0, totalSpent: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [bRes, nRes] = await Promise.all([
          bookingService.getAll({ limit: 100 }),
          notificationService.getUnreadCount(),
        ]);
        const bookings = bRes.data?.data?.data || bRes.data?.data || [];
        const unread = nRes.data?.data?.count || 0;
        const active = Array.isArray(bookings) ? bookings.some((b: { status: string }) => b.status === 'CHECKED_IN') : false;
        const total = Array.isArray(bookings) ? bookings.reduce((s: number, b: { totalAmount: number }) => s + Number(b.totalAmount || 0), 0) : 0;
        setStats({ bookings: Array.isArray(bookings) ? bookings.length : 0, activeStay: active, foodOrders: 0, reviews: 0, notifications: unread, totalSpent: total });
      } catch {}
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-white/30" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-white font-semibold">My Dashboard</h1>
        <p className="text-white/35 text-sm font-sans mt-0.5">Welcome back! Here&apos;s your hotel activity</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Bookings" value={stats.bookings} icon={Calendar} color="#37EFD1" />
        <StatsCard title="Total Spent" value={`RM ${stats.totalSpent.toLocaleString()}`} icon={CreditCard} color="#C8102E" />
        <StatsCard title="Notifications" value={stats.notifications} icon={Bell} color="#fb923c" />
        <StatsCard title="Active Stay" value={stats.activeStay ? 'Yes' : 'No'} icon={Star} color={stats.activeStay ? '#37EFD1' : '#60a5fa'} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1A1B21] border border-white/5 rounded-xl p-5">
          <h3 className="text-white font-display text-base font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-2">
            {[
              { label: 'View My Bookings', href: '/customer/dashboard/bookings', color: '#37EFD1' },
              { label: 'Order Food / Room Service', href: '/customer/dashboard/food', color: '#C8102E' },
              { label: 'Request a Service', href: '/customer/dashboard/services', color: '#60a5fa' },
              { label: 'Leave a Review', href: '/customer/dashboard/reviews', color: '#a78bfa' },
            ].map(action => (
              <a key={action.label} href={action.href}
                className="flex items-center gap-3 px-4 py-3 bg-white/3 hover:bg-white/5 rounded-lg transition-colors group">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: action.color }} />
                <span className="text-white/60 group-hover:text-white text-sm font-sans transition-colors">{action.label}</span>
              </a>
            ))}
          </div>
        </div>
        <div className="bg-[#1A1B21] border border-white/5 rounded-xl p-5">
          <h3 className="text-white font-display text-base font-semibold mb-4">Hotel Services</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Dining', icon: ChefHat, color: '#C8102E' },
              { label: 'Spa & Wellness', icon: Star, color: '#a78bfa' },
              { label: 'Room Service', icon: Bell, color: '#37EFD1' },
              { label: 'Concierge', icon: Calendar, color: '#60a5fa' },
            ].map(s => (
              <div key={s.label} className="flex flex-col items-center gap-2 p-4 bg-white/3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                <s.icon className="h-6 w-6" style={{ color: s.color }} />
                <span className="text-white/50 text-xs font-sans">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
