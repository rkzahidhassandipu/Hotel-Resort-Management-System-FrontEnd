"use client";
import React from "react";
import { X } from "lucide-react";
import { User } from "@/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export default function StaffViewSlideOver({ isOpen, onClose, user }: Props) {
  if (!isOpen || !user) return null;

  // Helper function to format null values
  const display = (value: any) => value ?? "—";

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      {/* Panel */}
      <div className="relative w-full max-w-lg bg-[#0B0C10] border-l border-white/10 p-6 shadow-2xl overflow-y-auto">
        <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/5">
          <h2 className="text-xl text-white font-semibold">User Profile Details</h2>
          <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-8">
          {/* Personal Information */}
          <section>
            <h3 className="text-xs font-bold text-[#37EFD1] uppercase tracking-wider mb-4">Personal Info</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] uppercase text-white/30">First Name</p>
                <p className="text-white">{display(user.firstName)}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-white/30">Last Name</p>
                <p className="text-white">{display(user.lastName)}</p>
              </div>
              <div className="col-span-2">
                <p className="text-[10px] uppercase text-white/30">Email</p>
                <p className="text-white">{display(user.email)}</p>
              </div>
            </div>
          </section>

          {/* Professional Information */}
          <section>
            <h3 className="text-xs font-bold text-[#60a5fa] uppercase tracking-wider mb-4">Professional Info</h3>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] uppercase text-white/30">Role</p>
                <p className="text-white">{display(user.role)}</p>
              </div>

              <div className="col-span-2">
                <p className="text-[10px] uppercase text-white/30">ID Number</p>
                <p className="text-white break-all">{display(user.id)}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] uppercase text-white/30">Department</p>
                  <p className="text-white">{display(user.staffProfile?.department)}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase text-white/30">Designation</p>
                  <p className="text-white">{display(user.staffProfile?.designation)}</p>
                </div>
              </div>
            </div>
          </section>

          {/* System & Meta Information */}
          <section className="pt-4 border-t border-white/5">
            <h3 className="text-xs font-bold text-white/30 uppercase tracking-wider mb-4">System Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] uppercase text-white/30">Status</p>
                <p className={`text-sm ${user.status === 'ACTIVE' ? 'text-green-400' : 'text-red-400'}`}>{user.status}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-white/30">Created At</p>
                <p className="text-white text-xs">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}