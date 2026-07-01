'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { authService } from '@/service/auth.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export default function TwoFactorForm() {
  const [qr, setQr] = useState<string | null>(null);
  const [token, setToken] = useState('');

  /* ---------------- SETUP 2FA ---------------- */
  const setupMutation = useMutation({
    mutationFn: () => authService.setup2fa(),
    onSuccess: (res: any) => {
      // ব্যাকএন্ডের রেসপন্স স্ট্রাকচার অনুযায়ী ডাটা সেট করা
      const qrData = res.data?.data?.qrCode || res.qrCode;
      setQr(qrData);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to setup 2FA';
      alert(msg);
    },
  });

  /* ---------------- ENABLE 2FA ---------------- */
  const enableMutation = useMutation({
    mutationFn: (token: string) => authService.enable2fa(token),
    onSuccess: () => {
      alert('2FA Enabled Successfully');
      setQr(null);
      setToken('');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Invalid 6-digit code';
      alert(msg);
    },
  });

  return (
    <Card className="p-6 space-y-5 bg-zinc-900 border border-zinc-800">
      <h2 className="text-lg font-semibold text-white">
        Two-Factor Authentication
      </h2>

      {!qr ? (
        <Button
          onClick={() => setupMutation.mutate()}
          disabled={setupMutation.isPending}
          className="w-full"
        >
          {setupMutation.isPending ? 'Generating...' : 'Setup 2FA'}
        </Button>
      ) : (
        <div className="space-y-5">
          {/* QR CODE */}
          <div className="flex flex-col items-center gap-3">
            <img
              src={qr}
              alt="QR Code"
              className="w-44 h-44 rounded-lg border border-zinc-700 bg-white p-1"
            />
            <p className="text-sm text-zinc-400 text-center">
              Scan QR code with Google Authenticator
            </p>
          </div>

          {/* INPUT */}
          <Input
            type="text"
            maxLength={6}
            value={token}
            onChange={(e) => setToken(e.target.value.replace(/\D/g, ''))}
            placeholder="000000"
            className="bg-zinc-800 border-zinc-700 text-white text-center text-xl tracking-[0.5em]"
          />

          {/* BUTTON */}
          <Button
            className="w-full"
            disabled={token.length !== 6 || enableMutation.isPending}
            onClick={() => enableMutation.mutate(token)}
          >
            {enableMutation.isPending ? 'Verifying...' : 'Enable 2FA'}
          </Button>
        </div>
      )}
    </Card>
  );
}