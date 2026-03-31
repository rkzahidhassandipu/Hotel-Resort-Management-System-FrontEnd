export default function MaintenanceDashboard() {
  return (
    <div className="space-y-6">
      <div><h1 className="font-display text-2xl text-white">Work Orders</h1><p className="text-white/35 text-sm font-sans mt-0.5">Maintenance portal — track and manage work orders</p></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[{ label: 'Open Orders', val: 6, col: '#C8102E' },{ label: 'In Progress', val: 3, col: '#fb923c' },{ label: 'Completed Today', val: 4, col: '#37EFD1' }].map(s => (
          <div key={s.label} className="bg-[#1A1B21] border border-white/5 rounded-xl p-5"><p className="text-white/35 text-[10px] font-sans uppercase tracking-widest mb-2">{s.label}</p><p className="font-display text-3xl text-white">{s.val}</p></div>
        ))}
      </div>
    </div>
  );
}
