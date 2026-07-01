"use client";
import { useState } from "react";
import { BarChart3, Calendar, ClipboardList, Star } from "lucide-react";
import OverviewTab from "@/components/staff/OverviewTab";
import ShiftsTab from "@/components/staff/ShiftsTab";
import TasksTab from "@/components/staff/TasksTab";
import PerformanceTab from "@/components/staff/PerformanceTab";

type Tab = "overview" | "shifts" | "tasks" | "performance";

export default function AdminStaffManagementPage() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "overview", label: "Overview", icon: <BarChart3 className="h-3.5 w-3.5" /> },
    { key: "shifts", label: "Shifts", icon: <Calendar className="h-3.5 w-3.5" /> },
    { key: "tasks", label: "Tasks", icon: <ClipboardList className="h-3.5 w-3.5" /> },
    { key: "performance", label: "Performance", icon: <Star className="h-3.5 w-3.5" /> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-white font-semibold">Staff Management</h1>
        <p className="text-white/35 text-sm font-sans mt-0.5">Shifts, tasks, and performance</p>
      </div>

      <div className="flex gap-1 bg-white/5 p-1 rounded-lg w-fit">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-sans transition-all ${activeTab === t.key ? "bg-[#C8102E] text-white" : "text-white/40 hover:text-white"}`}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && <OverviewTab />}
      {activeTab === "shifts" && <ShiftsTab />}
      {activeTab === "tasks" && <TasksTab />}
      {activeTab === "performance" && <PerformanceTab />}
    </div>
  );
}