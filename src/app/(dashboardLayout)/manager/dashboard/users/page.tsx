"use client";
import { useState, useEffect } from "react";
import { Users, UserCheck, UserX } from "lucide-react";
import StatsCard from "@/components/shared/StatsCard";
import CustomersTab from "@/components/users/CustomersTab";
import StaffTab from "@/components/users/StaffTab";
import { userService } from "@/service/user.service";
import { useCurrentUser } from "@/hooks/useCurrentUser";

type Tab = "customers" | "staff";

export default function AdminUsersPage() {
  const [activeTab, setActiveTab] = useState<Tab>("customers");
  const [stats, setStats] = useState<Record<string, number>>({});
  const { user: currentUser, loading: userLoading } = useCurrentUser();
  const isAdmin = currentUser?.role === "ADMIN";

  useEffect(() => {
    userService
      .getStats()
      .then((res) => setStats(res?.data?.data || {}))
      .catch(() => {});
  }, []);

  const tabs: { key: Tab; label: string }[] = [
    { key: "customers", label: "Customers" },
    { key: "staff", label: "Staff" },
  ];

  return (
    <div className="space-y-6">
      <div className="pt-5">
        <h1 className="font-display text-2xl text-white font-semibold">
          Users
        </h1>
        <p className="text-white/35 text-sm font-sans mt-0.5">
          Manage all system users
        </p>
      </div>

      <div className="flex gap-1 bg-white/5 p-1 rounded-lg w-fit">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-5 py-1.5 rounded-md text-sm font-sans transition-all ${
              activeTab === t.key
                ? "bg-[#C8102E] text-white"
                : "text-white/40 hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "customers" ? <CustomersTab isAdmin={isAdmin} /> : <StaffTab isAdmin={isAdmin} />}
    </div>
  );
}
