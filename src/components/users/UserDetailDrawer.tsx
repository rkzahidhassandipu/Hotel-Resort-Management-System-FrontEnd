"use client";
import { 
  X, CreditCard, Mail, MailCheck, Phone, ShieldCheck, 
  User as UserIcon, Cake, Flag, BadgeCheck, BookOpen, 
  MapPin, Building2, Mailbox, Globe, CalendarPlus, 
  RefreshCw, LogIn, Network 
} from "lucide-react";
import type { User } from "@/types";

interface Props {
  user: User | null;
  open: boolean;
  onClose: () => void;
}

function Row({
  icon: Icon,
  label,
  value,
  mono,
  badge,
}: {
  icon: React.ElementType;
  label: string;
  value?: string | null;
  mono?: boolean;
  badge?: { text: string; variant: "success" | "danger" | "neutral" };
}) {
  return (
    <div className="flex items-center gap-2.5 px-3 py-2.5 border-b border-white/[0.07] last:border-b-0">
      <Icon className="h-[15px] w-[15px] text-white/30 shrink-0" />
      <span className="text-[12px] text-white/50 w-[100px] shrink-0">{label}</span>
      {badge ? (
        <span
          className={`text-[11px] px-2 py-0.5 rounded-full ${
            badge.variant === "success"
              ? "bg-emerald-500/10 text-emerald-400"
              : badge.variant === "danger"
              ? "bg-red-500/10 text-red-400"
              : "bg-white/5 text-white/40 border border-white/10"
          }`}
        >
          {badge.text}
        </span>
      ) : value ? (
        <span
          className={`text-[12px] text-white truncate ${
            mono ? "font-mono" : ""
          }`}
        >
          {value}
        </span>
      ) : (
        <span className="text-[12px] text-white/25 italic">Not set</span>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="pt-[18px]">
      <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-white/30 mb-2.5">
        {title}
      </p>
      <div className="border border-white/[0.07] rounded-lg overflow-hidden">
        {children}
      </div>
    </div>
  );
}

function fmt(date?: string | null) {
  if (!date) return null;
  return new Date(date).toLocaleString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function UserDetailDrawer({ user, open, onClose }: Props) {
  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 transition-opacity z-40 ${
          open ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={onClose}
      />
      <div
        className={`fixed top-0 right-0 h-full w-[400px] bg-[#111113] border-l border-white/[0.07] z-50 transition-transform duration-300 flex flex-col ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07] shrink-0">
          <span className="text-[14px] font-medium text-white">User details</span>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-md border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:border-white/20 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {!user ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-white/25 text-sm">No user selected</p>
          </div>
        ) : (
          <>
            {/* profile hero */}
            <div className="flex items-center gap-3.5 px-5 py-5 border-b border-white/[0.07]">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} className="w-[52px] h-[52px] rounded-full object-cover shrink-0" />
              ) : (
                <div className="w-[52px] h-[52px] rounded-full bg-blue-500/10 flex items-center justify-center text-[16px] font-medium text-blue-400 shrink-0">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-medium text-white">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-[12px] text-white/40 mt-0.5 truncate">{user.email}</p>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">
                  {user.status.charAt(0) + user.status.slice(1).toLowerCase()}
                </span>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/5 text-white/40 border border-white/10">
                  {user.role.charAt(0) + user.role.slice(1).toLowerCase()}
                </span>
              </div>
            </div>

            {/* scrollable body */}
            <div className="flex-1 overflow-y-auto px-5 pb-6">
              <Section title="Account">
                <Row icon={UserIcon} label="User ID" value={`${user.id.slice(0, 8)}…${user.id.slice(-6)}`} mono />
                <Row icon={Mail} label="Email" value={user.email} />
                <Row
                  icon={MailCheck}
                  label="Email verified"
                  badge={user.emailVerifiedAt
                    ? { text: "Verified", variant: "success" }
                    : { text: "Not verified", variant: "danger" }}
                />
                <Row icon={Phone} label="Phone" value={user.phone} />
                <Row
                  icon={ShieldCheck}
                  label="2FA"
                  badge={user.twoFactorEnabled
                    ? { text: "Enabled", variant: "success" }
                    : { text: "Disabled", variant: "neutral" }}
                />
              </Section>

              <Section title="Personal">
                <Row icon={UserIcon} label="Gender" value={user.gender} />
                <Row icon={Cake} label="Date of birth" value={user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString("en-GB") : null} />
                <Row icon={Flag} label="Nationality" value={user.nationality} />
                <Row icon={BadgeCheck} label="National ID" value={user.nationalId} />
                <Row icon={BookOpen} label="Passport" value={user.passportNumber} />
              </Section>

              <Section title="Address">
                <Row icon={MapPin} label="Address" value={user.address} />
                <Row icon={Building2} label="City" value={user.city} />
                <Row icon={Mailbox} label="Zip code" value={user.zipCode} />
                <Row icon={Globe} label="Country" value={user.country} />
              </Section>

              <Section title="Activity">
                <Row icon={CalendarPlus} label="Joined" value={fmt(user.createdAt) ?? undefined} />
                <Row icon={RefreshCw} label="Last updated" value={fmt(user.updatedAt) ?? undefined} />
                <Row icon={LogIn} label="Last login" value={user.lastLoginAt ? fmt(user.lastLoginAt)! : "Never"} />
                <Row icon={Network} label="Login IP" value={user.lastLoginIp} />
              </Section>
            </div>
          </>
        )}
      </div>
    </>
  );
}