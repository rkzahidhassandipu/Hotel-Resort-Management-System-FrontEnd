'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowRight, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setLoading(false);
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-[#0B0C10] flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full bg-[#C8102E]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-[#37EFD1]/4 blur-[100px] pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.1) 0, rgba(255,255,255,0.1) 1px, transparent 0, transparent 50%)', backgroundSize: '20px 20px' }} />

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
          <div className="h-px bg-gradient-to-r from-transparent via-[#37EFD1]/40 to-transparent" />
          <div className="p-8">
            {sent ? (
              <div className="text-center py-4">
                <CheckCircle className="h-12 w-12 text-[#37EFD1] mx-auto mb-4" />
                <h2 className="font-display text-xl text-white font-semibold mb-2">Check Your Email</h2>
                <p className="text-white/45 text-sm font-sans leading-relaxed mb-6">We've sent a password reset link to <span className="text-white">{email}</span>. Please check your inbox.</p>
                <Link href="/auth/login" className="text-[#37EFD1] text-sm font-sans hover:text-[#37EFD1]/70 transition-colors flex items-center justify-center gap-1">
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
                </Link>
              </div>
            ) : (
              <>
                <h2 className="font-display text-xl text-white font-semibold mb-1">Reset Password</h2>
                <p className="text-white/35 text-sm font-sans mb-6">Enter your email and we'll send you a reset link.</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-white/50 text-[10px] font-sans uppercase tracking-widest mb-1.5 block">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                      <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                        className="w-full bg-[#0B0C10] border border-white/8 text-white text-sm font-sans pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:border-[#37EFD1]/40 transition-colors placeholder:text-white/20"
                        placeholder="you@lexishibiscus.com" />
                    </div>
                  </div>
                  <button type="submit" disabled={loading}
                    className="w-full bg-[#C8102E] hover:bg-[#a00d24] disabled:opacity-60 text-white font-sans font-medium py-3 rounded-lg transition-all hover:shadow-lg hover:shadow-[#C8102E]/25 flex items-center justify-center gap-2">
                    {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Sending...</> : <>Send Reset Link <ArrowRight className="h-4 w-4" /></>}
                  </button>
                </form>
                <Link href="/auth/login" className="flex items-center justify-center gap-1 mt-4 text-white/30 text-xs font-sans hover:text-white/50 transition-colors">
                  <ArrowLeft className="h-3 w-3" /> Back to Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
