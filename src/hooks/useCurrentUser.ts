"use client";

import { useEffect, useState } from "react";
import { authService } from "@/service/auth.service";
import type { User, Role } from "@/types";

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
    const getCurrentUser = async () => {
      try {
        const res = await authService.me();
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
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getCurrentUser();
  }, []);

  return { user, loading };
}