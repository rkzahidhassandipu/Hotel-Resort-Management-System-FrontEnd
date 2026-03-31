'use client';
import { useState, useEffect } from 'react';
import { getCookie } from '@/lib/cookieUtils';
import { decodeJwt } from '@/lib/jwtUtils';
import { authService } from '@/service/auth.service';
import type { User } from '@/types';
import type { Role } from '@/types';

export interface CurrentUser {
  id: string;
  email: string;
  role: Role;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
}

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // First: decode role/email from JWT in cookie (instant, no network)
    const token = getCookie('accessToken');
    if (token) {
      const payload = decodeJwt(token);
      if (payload) {
        setUser({
          id: payload.userId,
          email: payload.email,
          role: payload.role as Role,
          firstName: '',
          lastName: '',
        });
      }
    }

    // Then: fetch full user info from /auth/me
    authService.me()
      .then(res => {
        const u: User = res.data?.data || res.data;
        if (u) {
          setUser({
            id: u.id,
            email: u.email,
            role: u.role,
            firstName: u.firstName,
            lastName: u.lastName,
            avatarUrl: u.avatarUrl,
          });
        }
      })
      .catch(() => {
        // keep token-decoded user if API fails
      })
      .finally(() => setLoading(false));
  }, []);

  return { user, loading };
}
