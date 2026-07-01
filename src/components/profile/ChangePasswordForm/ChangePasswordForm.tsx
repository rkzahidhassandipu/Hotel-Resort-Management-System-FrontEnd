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
    mutationFn: async () => {
      const res = await authService.setup2fa();
      return res.data; // full response
    },
    onSuccess: (res) => {
      // FIXED: correct access path
      setQr(res.data.qrCode);
    },
  });

  /* ---------------- ENABLE 2FA ---------------- */
  const enableMutation = useMutation({
    mutationFn: async (token: string) => {
      const res = await authService.enable2fa(token);
      return res.data;
    },
    onSuccess: () => {
      alert('2FA Enabled Successfully');
      setQr(null);
      setToken('');
    },
    onError: (err) => {
      console.log('Enable 2FA error:', err);
    },
  });

  return (
    <Card className="p-6 bg-zinc-900 border border-zinc-800 space-y-5">

      <h2 className="text-lg font-semibold text-white">
        Two-Factor Authentication
      </h2>

      {/* STEP 1 */}
      {!qr ? (
        <Button
          onClick={() => setupMutation.mutate()}
          disabled={setupMutation.isPending}
        >
          {setupMutation.isPending ? 'Generating QR...' : 'Setup 2FA'}
        </Button>
      ) : (
        <div className="space-y-5">

          {/* QR CODE */}
          <div className="flex flex-col items-center space-y-3">
            <img
              src={qr}
              alt="QR Code"
              className="w-44 h-44 rounded-lg border border-zinc-700"
            />

            <p className="text-sm text-zinc-400 text-center">
              Scan this QR code using Google Authenticator
            </p>
          </div>

          {/* OTP INPUT */}
          <Input
            value={token}
            placeholder="Enter 6-digit code"
            className="bg-zinc-800 border-zinc-700 text-white text-center tracking-widest"
            onChange={(e) => setToken(e.target.value)}
          />

          {/* ENABLE BUTTON */}
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