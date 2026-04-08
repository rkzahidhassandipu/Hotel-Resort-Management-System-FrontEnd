'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { authService } from '@/service/auth.service';
import { CheckCircle, XCircle, Loader2, ArrowRight, RefreshCw } from 'lucide-react';

type Status = 'loading' | 'success' | 'error';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const token        = searchParams.get('token');

  const [status,  setStatus]  = useState<Status>('loading');
  const [message, setMessage] = useState('Verifying your email address…');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid or missing verification token.');
      return;
    }

    authService
      .verifyEmail(token)
      .then(() => {
        setStatus('success');
        setMessage('Your email has been verified successfully!');
      })
      .catch(() => {
        setStatus('error');
        setMessage('Verification failed or the link has expired.');
      });
  }, [token]);

  return (
    <div className="min-h-screen bg-[#0B0C10] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#C8102E]/6 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-[#37EFD1]/5 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-[#C8102E] flex items-center justify-center shadow-2xl shadow-[#C8102E]/40">
                <span className="text-white font-display font-bold text-xl">L</span>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#37EFD1]" />
            </div>
          </div>
          <p className="text-white/30 text-xs font-sans tracking-widest uppercase">
            Lexis Hibiscus · Port Dickson
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#1A1B21] border border-white/8 rounded-2xl overflow-hidden">
          <div className="h-px bg-gradient-to-r from-transparent via-[#C8102E]/50 to-transparent" />

          <div className="p-10 flex flex-col items-center text-center">

            {/* Icon */}
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-all ${
              status === 'loading' ? 'bg-white/5 border border-white/10'
              : status === 'success' ? 'bg-[#37EFD1]/10 border border-[#37EFD1]/20'
              : 'bg-[#C8102E]/10 border border-[#C8102E]/20'
            }`}>
              {status === 'loading' && (
                <Loader2 className="h-9 w-9 text-white/30 animate-spin" />
              )}
              {status === 'success' && (
                <CheckCircle className="h-9 w-9 text-[#37EFD1]" />
              )}
              {status === 'error' && (
                <XCircle className="h-9 w-9 text-[#C8102E]" />
              )}
            </div>

            {/* Title */}
            <h1 className="font-display text-2xl text-white font-semibold mb-2">
              {status === 'loading' && 'Verifying…'}
              {status === 'success' && 'Email Verified!'}
              {status === 'error'   && 'Verification Failed'}
            </h1>

            {/* Message */}
            <p className="text-white/45 font-sans text-sm leading-relaxed mb-8">
              {message}
            </p>

            {/* Actions */}
            {status === 'success' && (
              <div className="w-full space-y-3">
                <button
                  onClick={() => router.push('/login')}
                  className="w-full flex items-center justify-center gap-2 bg-[#C8102E] hover:bg-[#a00d24] text-white font-sans font-medium py-3 rounded-lg transition-all hover:shadow-lg hover:shadow-[#C8102E]/25"
                >
                  Continue to Login <ArrowRight className="h-4 w-4" />
                </button>
                <p className="text-white/25 text-xs font-sans">
                  You can now sign in with your credentials.
                </p>
              </div>
            )}

            {status === 'error' && (
              <div className="w-full space-y-3">
                <button
                  onClick={() => router.push('/login')}
                  className="w-full flex items-center justify-center gap-2 bg-[#C8102E] hover:bg-[#a00d24] text-white font-sans font-medium py-3 rounded-lg transition-all hover:shadow-lg hover:shadow-[#C8102E]/25"
                >
                  Back to Login <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => router.push('/auth/register')}
                  className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/8 text-white/60 hover:text-white font-sans font-medium py-3 rounded-lg transition-all border border-white/8"
                >
                  <RefreshCw className="h-4 w-4" /> Resend Verification Email
                </button>
              </div>
            )}

            {status === 'loading' && (
              <p className="text-white/25 text-xs font-sans animate-pulse">
                Please wait a moment…
              </p>
            )}
          </div>
        </div>

        <p className="text-center text-white/15 text-xs font-sans mt-6">
          © {new Date().getFullYear()} Lexis Hibiscus Port Dickson
        </p>
      </div>
    </div>
  );
}