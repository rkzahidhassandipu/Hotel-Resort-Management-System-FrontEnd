export default function StaffDashboard() {
  return (
    <div className="space-y-6">
      <div><h1 className="font-display text-2xl text-white font-semibold">My Tasks</h1><p className="text-white/35 text-sm font-sans mt-0.5">Staff portal — task management and housekeeping</p></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[{ label: 'Tasks Today', val: 8, col: '#37EFD1' },{ label: 'Completed', val: 3, col: '#C8102E' },{ label: 'Pending', val: 5, col: '#fb923c' }].map(s => (
          <div key={s.label} className="bg-[#1A1B21] border border-white/5 rounded-xl p-5">
            <p className="text-white/35 text-[10px] font-sans uppercase tracking-widest mb-2">{s.label}</p>
            <p className="font-display text-3xl text-white">{s.val}</p>
          </div>
        ))}
      </div>
      <div className="bg-[#1A1B21] border border-white/5 rounded-xl p-5">
        <h3 className="font-display text-white text-base font-semibold mb-4">Today's Task List</h3>
        {['Room 204 — Turndown Service', 'Room 108 — Cleaning', 'Lobby — Floor maintenance', 'Pool Area — General upkeep', 'Room 512 — Welcome amenities setup'].map((task, i) => (
          <div key={i} className="flex items-center gap-3 py-3 border-b border-white/5 last:border-0">
            <div className={`w-2 h-2 rounded-full ${i < 3 ? 'bg-[#37EFD1]' : 'bg-[#fb923c]'}`} />
            <span className="text-white/60 text-sm font-sans">{task}</span>
            <span className={`ml-auto text-[9px] font-sans px-2 py-0.5 rounded-full ${i < 3 ? 'text-[#37EFD1] bg-[#37EFD1]/10' : 'text-[#fb923c] bg-[#fb923c]/10'}`}>{i < 3 ? 'Done' : 'Pending'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
