'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

import { authService } from '@/service/auth.service';
import { storeTokens } from '@/lib/tokenUtils';
import { getDefaultDashboardRoute } from '@/lib/authUtils';
import type { Role } from '@/types';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState<'login' | '2fa'>('login');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const [token, setToken] = useState('');

  /* ---------------- LOGIN ---------------- */
  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError('');

      const res = await authService.login(form);
      const data = res.data?.data || res.data;

      console.log('LOGIN RESPONSE:', data);

      // ✅ 2FA required
      if (data.requires2FA) {
        setStep('2fa');
        return;
      }

      // ✅ Normal Login
      const { accessToken, refreshToken, user } = data;

      if (!accessToken) {
        throw new Error('Access token missing');
      }

      storeTokens(accessToken, refreshToken);

      const redirectTo = searchParams.get('redirect');

      const roleDashboard =
        getDefaultDashboardRoute(
          (user?.role ?? 'CUSTOMER') as Role
        );

      router.replace(
        redirectTo || roleDashboard
      );
    } catch (err: any) {
      console.log(err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Login failed'
      );
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- VERIFY 2FA ---------------- */
  const handleVerify2FA = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError('');

      const res = await authService.login2fa({
        email: form.email,
        token,
      });

      const data = res.data?.data || res.data;

      console.log('2FA RESPONSE:', data);

      const {
        accessToken,
        refreshToken,
        user,
      } = data;

      if (!accessToken) {
        throw new Error('Access token missing');
      }

      // ✅ save token after OTP verify
      storeTokens(accessToken, refreshToken);

      const redirectTo =
        searchParams.get('redirect');

      const roleDashboard =
        getDefaultDashboardRoute(
          (user?.role ?? 'CUSTOMER') as Role
        );

      router.replace(
        redirectTo || roleDashboard
      );
    } catch (err: any) {
      console.log(err);

      setError(
        err?.response?.data?.message ||
          'Invalid OTP code'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0C10] flex items-center justify-center">
      <div className="w-full max-w-md px-4">
        <div className="bg-[#1A1B21] border border-white/10 rounded-2xl p-8">

          <h2 className="text-xl font-semibold text-white mb-1">
            {step === 'login'
              ? 'Sign In'
              : 'Two Factor Verification'}
          </h2>

          <p className="text-sm text-white/50 mb-6">
            {step === 'login'
              ? 'Enter your credentials'
              : 'Enter OTP from Google Authenticator'}
          </p>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <p className="text-xs text-red-400">
                {error}
              </p>
            </div>
          )}

          {/* LOGIN */}
          {step === 'login' && (
            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <input
                type="email"
                required
                placeholder="Email"
                value={form.email}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
                className="w-full rounded-lg border border-white/10 bg-[#0B0C10] px-4 py-3 text-white"
              />

              <div className="relative">
                <input
                  type={
                    showPw
                      ? 'text'
                      : 'password'
                  }
                  required
                  placeholder="Password"
                  value={form.password}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-white/10 bg-[#0B0C10] px-4 py-3 text-white"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPw(!showPw)
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40"
                >
                  {showPw ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-red-600 py-3 text-white"
              >
                {loading
                  ? 'Signing in...'
                  : 'Login'}
              </button>
            </form>
          )}

          {/* 2FA */}
          {step === '2fa' && (
            <form
              onSubmit={handleVerify2FA}
              className="space-y-4"
            >
              <input
                type="text"
                maxLength={6}
                required
                placeholder="000000"
                value={token}
                onChange={(e) =>
                  setToken(
                    e.target.value
                  )
                }
                className="w-full rounded-lg border border-white/10 bg-[#0B0C10] px-4 py-3 text-center tracking-[0.3em] text-white"
              />

              <button
                type="submit"
                disabled={
                  loading ||
                  token.length !== 6
                }
                className="w-full rounded-lg bg-red-600 py-3 text-white disabled:opacity-50"
              >
                {loading
                  ? 'Verifying...'
                  : 'Verify OTP'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}