'use client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
interface Props { data: { label: string; value: number }[]; color?: string; unit?: string; height?: number; }
const tooltipStyle = { backgroundColor: '#1A1B21', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#fff', fontSize: '11px' };
export default function AppointmentBarChart({ data, color = '#C8102E', unit = '', height = 200 }: Props) {
  const chartData = data.map(d => ({ name: d.label, value: d.value }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.25)' }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.25)' }} tickLine={false} axisLine={false} unit={unit} />
        <Tooltip contentStyle={tooltipStyle} formatter={(v: unknown) => [`${v}${unit}`, 'Value']} />
        <Bar dataKey="value" fill={color} fillOpacity={0.85} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
