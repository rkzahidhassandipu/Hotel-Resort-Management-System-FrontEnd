'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from '@tanstack/react-form';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';

import { userService } from '@/service/user.service';
import { authService } from '@/service/auth.service';
import ProfileTab from '@/components/profile/ProfileTab';
import TwoFactorForm from '@/components/profile/TwoFactorForm/TwoFactorForm';
import ChangePasswordForm from '@/components/profile/ChangePasswordForm/ChangePasswordForm';
import PreferencesTab from '@/components/profile/Preferences/Preferences';

export default function SettingsPage() {
  const [qr, setQr] = useState<string | null>(null);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const res = await userService.getMyProfile();
      return res.data;
    },
  });

  // ... (আপনার মিউটেশন এবং ফর্ম কোড একই থাকবে)
  const changePasswordMutation = useMutation({ mutationFn: authService.changePassword });
  const setup2FAMutation = useMutation({ mutationFn: authService.setup2fa, onSuccess: (res) => setQr(res.data.qrCode) });
  const enable2FAMutation = useMutation({ mutationFn: authService.enable2fa });

  const passwordForm = useForm({
    defaultValues: { currentPassword: '', newPassword: '' },
    onSubmit: ({ value }) => changePasswordMutation.mutate(value),
  });

  const otpForm = useForm({
    defaultValues: { token: '' },
    onSubmit: ({ value }) => enable2FAMutation.mutate(value.token),
  });

  if (isLoading) return <div className="p-6 space-y-4 max-w-5xl mx-auto"><Skeleton className="h-6 w-40" /><Skeleton className="h-32 w-full" /></div>;

  return (
    // একটিমাত্র Tabs র্যাপার ব্যবহার করা হয়েছে
    <Tabs defaultValue="profile" className="min-h-screen bg-zinc-950 text-white">
      <div className="w-4/5 mx-auto">
        
        {/* STICKY HEADER WRAPPER */}
        <div className="sticky top-0 z-50 bg-zinc-950 pb-4 pt-5 border-b border-zinc-800">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-zinc-400 text-sm mt-1">Manage your account settings and security</p>

          <TabsList className="w-full bg-zinc-900 border border-zinc-800 p-2 rounded-xl flex gap-2 mt-4">
            <TabsTrigger value="profile" className="flex-1 rounded-lg data-[state=active]:bg-zinc-800">Profile</TabsTrigger>
            <TabsTrigger value="security" className="flex-1 rounded-lg data-[state=active]:bg-zinc-800">Security</TabsTrigger>
            <TabsTrigger value="Preferences" className="flex-1 rounded-lg data-[state=active]:bg-zinc-800">Preferences</TabsTrigger>
            <TabsTrigger value="2fa" className="flex-1 rounded-lg data-[state=active]:bg-zinc-800">2FA</TabsTrigger>
          </TabsList>
        </div>

        {/* CONTENT */}
        <div className="mt-6">
          <TabsContent value="profile">
            <ProfileTab profile={profile} />
          </TabsContent>

          <TabsContent value="security">
            <ChangePasswordForm />
          </TabsContent>

          <TabsContent value="Preferences">
            <PreferencesTab user={profile} />
          </TabsContent>

          <TabsContent value="2fa">
            <TwoFactorForm />
          </TabsContent>
        </div>
      </div>
    </Tabs>
  );
}