'use client';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
interface DataItem { label: string; value: number; color?: string; }
interface Props { data: DataItem[]; height?: number; innerRadius?: number; }
const COLORS = ['#C8102E', '#37EFD1', '#60a5fa', '#fb923c', '#a78bfa', '#facc15'];
const tooltipStyle = { backgroundColor: '#1A1B21', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#fff', fontSize: '11px' };
export default function AppointmentPieChart({ data, height = 240, innerRadius = 50 }: Props) {
  const chartData = data.map(d => ({ name: d.label, value: d.value }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={chartData} cx="50%" cy="50%" innerRadius={innerRadius} outerRadius={innerRadius + 30} dataKey="value" strokeWidth={0}>
          {chartData.map((_, i) => <Cell key={i} fill={data[i]?.color || COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
        <Legend formatter={(val: string) => <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>{val}</span>} />
      </PieChart>
    </ResponsiveContainer>
  );
}
