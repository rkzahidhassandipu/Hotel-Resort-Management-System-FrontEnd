'use client';
import { useState, useEffect } from 'react';
import { User, Loader2, Save } from 'lucide-react';
import { userService } from '@/service/user.service';
import type { User as UserType } from '@/types';

export default function CustomerProfilePage() {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', address: '', city: '', country: '' });

  useEffect(() => {
    userService.getMyProfile().then(res => {
      const u = res.data?.data || res.data;
      setUser(u);
      setForm({ firstName: u.firstName || '', lastName: u.lastName || '', phone: u.phone || '', address: u.address || '', city: u.city || '', country: u.country || '' });
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await userService.updateMyProfile(form);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch {}
    setSaving(false);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-white/30" /></div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div><h1 className="font-display text-2xl text-white font-semibold">My Profile</h1><p className="text-white/35 text-sm font-sans mt-0.5">Manage your personal information</p></div>
      {success && <div className="bg-[#37EFD1]/10 border border-[#37EFD1]/20 rounded-lg px-4 py-3 text-[#37EFD1] text-sm font-sans">{success}</div>}
      <div className="bg-[#1A1B21] border border-white/5 rounded-xl p-6">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/5">
          <div className="w-14 h-14 rounded-full bg-[#C8102E]/20 flex items-center justify-center">
            {user?.avatarUrl ? <img src={user.avatarUrl} alt="" className="w-14 h-14 rounded-full object-cover" /> : <User className="h-7 w-7 text-white/30" />}
          </div>
          <div>
            <p className="text-white font-display text-lg">{user?.firstName} {user?.lastName}</p>
            <p className="text-white/40 text-sm font-sans">{user?.email}</p>
            <span className="inline-block mt-1 text-[10px] font-sans px-2 py-0.5 rounded-full bg-[#C8102E]/15 text-[#C8102E]">{user?.role}</span>
          </div>
        </div>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {[['First Name', 'firstName'], ['Last Name', 'lastName']].map(([label, key]) => (
              <div key={key}>
                <label className="text-white/50 text-xs font-sans uppercase tracking-widest mb-1.5 block">{label}</label>
                <input value={form[key as keyof typeof form]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  className="w-full bg-[#0B0C10] border border-white/8 text-white text-sm font-sans px-3 py-2.5 rounded-lg focus:outline-none focus:border-[#37EFD1]/40 transition-colors" />
              </div>
            ))}
          </div>
          {[['Phone', 'phone'], ['Address', 'address'], ['City', 'city'], ['Country', 'country']].map(([label, key]) => (
            <div key={key}>
              <label className="text-white/50 text-xs font-sans uppercase tracking-widest mb-1.5 block">{label}</label>
              <input value={form[key as keyof typeof form]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                className="w-full bg-[#0B0C10] border border-white/8 text-white text-sm font-sans px-3 py-2.5 rounded-lg focus:outline-none focus:border-[#37EFD1]/40 transition-colors" />
            </div>
          ))}
          <button type="submit" disabled={saving} className="flex items-center gap-2 bg-[#C8102E] hover:bg-[#a00d24] text-white font-sans font-medium px-6 py-2.5 rounded-lg transition-all disabled:opacity-60">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}
