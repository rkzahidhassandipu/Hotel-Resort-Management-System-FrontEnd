import React from 'react';
import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: { value: number; label?: string };
  color?: '#C8102E' | '#37EFD1' | '#60a5fa' | '#fb923c' | '#a78bfa';
  loading?: boolean;
}

export default function StatsCard({ title, value, subtitle, icon: Icon, trend, color = '#37EFD1', loading }: StatsCardProps) {
  return (
    <div className="bg-[#1A1B21] border border-white/5 rounded-xl p-5 relative overflow-hidden group hover:border-white/10 transition-all">
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${color}40, transparent)` }} />
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-white/35 text-[10px] font-sans uppercase tracking-[0.15em] mb-2">{title}</p>
          {loading ? (
            <div className="h-7 w-28 rounded skeleton" />
          ) : (
            <p className="text-white text-2xl font-display font-semibold">{value}</p>
          )}
          {subtitle && !loading && <p className="text-white/30 text-xs font-sans mt-1 truncate">{subtitle}</p>}
          {trend && !loading && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-sans ${trend.value > 0 ? 'text-[#37EFD1]' : 'text-[#C8102E]'}`}>
              {trend.value > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {Math.abs(trend.value)}% {trend.label || 'vs last month'}
            </div>
          )}
        </div>
        {Icon && (
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ml-3" style={{ background: `${color}12`, border: `1px solid ${color}25` }}>
            <Icon className="h-5 w-5" style={{ color }} />
          </div>
        )}
      </div>
    </div>
  );
}
