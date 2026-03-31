export default function ChefDashboard() {
  return (
    <div className="space-y-6">
      <div><h1 className="font-display text-2xl text-white">Kitchen Dashboard</h1><p className="text-white/35 text-sm font-sans mt-0.5">Food orders and menu management</p></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[{ label: 'Active Orders', val: 12, col: '#C8102E' },{ label: 'Ready to Serve', val: 5, col: '#37EFD1' },{ label: 'Completed Today', val: 34, col: '#60a5fa' }].map(s => (
          <div key={s.label} className="bg-[#1A1B21] border border-white/5 rounded-xl p-5"><p className="text-white/35 text-[10px] font-sans uppercase tracking-widest mb-2">{s.label}</p><p className="font-display text-3xl text-white">{s.val}</p></div>
        ))}
      </div>
    </div>
  );
}
