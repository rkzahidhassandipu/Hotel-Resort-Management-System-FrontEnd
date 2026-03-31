'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Loader2, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { authService } from '@/service/auth.service';
import { storeTokens } from '@/lib/tokenUtils';
import { getDefaultDashboardRoute } from '@/lib/authUtils';
import type { Role } from '@/types';

export default function LoginForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const [showPw,  setShowPw]  = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [form,    setForm]    = useState({ email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await authService.login(form);
      const { accessToken, refreshToken, user } = res.data?.data || res.data;

      // ✅ Save tokens in COOKIES (readable by Next.js middleware)
      storeTokens(accessToken, refreshToken);

      // Redirect: use ?redirect param if present, otherwise go to role dashboard
      const redirectTo = searchParams.get('redirect');
      const roleDashboard = getDefaultDashboardRoute((user?.role ?? 'CUSTOMER') as Role);
      router.replace(redirectTo || roleDashboard);

    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        || 'Invalid credentials. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0C10] flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#C8102E]/6 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-[#37EFD1]/5 blur-[100px] pointer-events-none" />
      <div className="absolute inset-0 opacity-3" style={{ backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.02) 0, rgba(255,255,255,0.02) 1px, transparent 0, transparent 50%)', backgroundSize: '20px 20px' }} />

      <div className="w-full max-w-md px-4 relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-[#C8102E] flex items-center justify-center shadow-2xl shadow-[#C8102E]/40">
                <span className="text-white font-display font-bold text-2xl">L</span>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#37EFD1]" />
            </div>
          </div>
          <h1 className="font-display text-3xl text-white font-semibold">LEXIS Hibiscus</h1>
          <p className="text-white/35 text-sm font-sans mt-1 tracking-wider">Management Portal</p>
        </div>

        <div className="bg-[#1A1B21] border border-white/8 rounded-2xl overflow-hidden">
          <div className="h-px bg-gradient-to-r from-transparent via-[#C8102E]/50 to-transparent" />
          <div className="p-8">
            <h2 className="font-display text-xl text-white font-semibold mb-1">Sign In</h2>
            <p className="text-white/35 text-sm font-sans mb-6">Enter your credentials to access the dashboard</p>

            {error && (
              <div className="flex items-center gap-2 bg-[#C8102E]/10 border border-[#C8102E]/20 rounded-lg px-3 py-2.5 mb-4">
                <AlertCircle className="h-4 w-4 text-[#C8102E] shrink-0" />
                <p className="text-[#C8102E] text-xs font-sans">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-white/50 text-xs font-sans uppercase tracking-widest mb-1.5 block">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                  <input
                    type="email" required
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full bg-[#0B0C10] border border-white/8 text-white text-sm font-sans pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:border-[#37EFD1]/40 transition-colors placeholder:text-white/20"
                    placeholder="you@lexishibiscus.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-white/50 text-xs font-sans uppercase tracking-widest">Password</label>
                  <Link href="/forgot-password" className="text-[#37EFD1]/70 text-xs font-sans hover:text-[#37EFD1] transition-colors">
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                  <input
                    type={showPw ? 'text' : 'password'} required
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    className="w-full bg-[#0B0C10] border border-white/8 text-white text-sm font-sans pl-10 pr-10 py-3 rounded-lg focus:outline-none focus:border-[#37EFD1]/40 transition-colors placeholder:text-white/20"
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors">
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-[#C8102E] hover:bg-[#a00d24] disabled:opacity-60 text-white font-sans font-medium py-3 rounded-lg transition-all hover:shadow-lg hover:shadow-[#C8102E]/25 flex items-center justify-center gap-2 mt-2">
                {loading
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <><span>Sign In</span><ArrowRight className="h-4 w-4" /></>
                }
              </button>
            </form>

            <p className="text-center text-white/30 text-xs font-sans mt-6">
              Don&apos;t have an account?{' '}
              <Link href="/auth/register" className="text-[#37EFD1] hover:text-[#37EFD1]/80 transition-colors font-medium">
                Register
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-white/15 text-xs font-sans mt-6">
          © {new Date().getFullYear()} Lexis Hibiscus Port Dickson
        </p>
      </div>
    </div>
  );
}
