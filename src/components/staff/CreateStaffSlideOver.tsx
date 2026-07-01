"use client";

import { useState } from "react";
import {
  X, Loader2, UserPlus, User, ChefHat,
  Wrench, AlertCircle, Check, Utensils, ShieldCheck,
} from "lucide-react";
import { userService } from "@/service/user.service";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type Role = "STAFF" | "CHEF" | "MAINTENANCE" | "MANAGER";

const BASE_ROLES: { value: Role; label: string; icon: React.ReactNode }[] = [
  { value: "STAFF",       label: "Staff",       icon: <User size={16} /> },
  { value: "CHEF",        label: "Chef",         icon: <Utensils size={16} /> },
  { value: "MAINTENANCE", label: "Maintenance",  icon: <Wrench size={16} /> },
];

// Only shown when the logged-in user is ADMIN
const ADMIN_ONLY_ROLES: { value: Role; label: string; icon: React.ReactNode }[] = [
  { value: "MANAGER", label: "Manager", icon: <ShieldCheck size={16} /> },
];

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  department?: string;
  designation?: string;
  salary?: string;
  joiningDate?: string;
}

export default function CreateStaffSlideOver({ isOpen, onClose, onSuccess }: Props) {
  const { user } = useCurrentUser(); // ← gives us the logged-in user; adjust if needed
  const isAdmin = user?.role === "ADMIN";

  // Build the visible role list based on the current user's role
  const ROLES = isAdmin ? [...BASE_ROLES, ...ADMIN_ONLY_ROLES] : BASE_ROLES;

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});
  const [selectedRole, setSelectedRole] = useState<Role>("STAFF");

  const clearErrors = () => {
    setFieldErrors({});
    setApiError(null);
  };

  const validate = (data: Record<string, string | number>): FormErrors => {
    const errors: FormErrors = {};

    if (!String(data.firstName).trim()) errors.firstName = "First name is required";
    if (!String(data.lastName).trim()) errors.lastName = "Last name is required";
    if (!String(data.department).trim()) errors.department = "Department is required";
    if (!String(data.designation).trim()) errors.designation = "Designation is required";
    if (!String(data.joiningDate)) errors.joiningDate = "Joining date is required";

    const email = String(data.email).trim();
    if (!email) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Enter a valid email address";
    }

    const password = String(data.password);
    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 8) {
      errors.password = "Minimum 8 characters";
    }

    const salary = Number(data.salary);
    if (!data.salary) {
      errors.salary = "Salary is required";
    } else if (isNaN(salary) || salary < 0) {
      errors.salary = "Enter a valid salary";
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;

    clearErrors();

    const form = e.currentTarget;
    const fd = new FormData(form);

    const raw = {
      firstName: String(fd.get("firstName") ?? "").trim(),
      lastName: String(fd.get("lastName") ?? "").trim(),
      email: String(fd.get("email") ?? "").trim(),
      password: String(fd.get("password") ?? ""),
      department: String(fd.get("department") ?? "").trim(),
      designation: String(fd.get("designation") ?? "").trim(),
      salary: String(fd.get("salary") ?? ""),
      joiningDate: String(fd.get("joiningDate") ?? ""),
      bankAccount: String(fd.get("bankAccount") ?? "").trim(),
      emergencyContact: String(fd.get("emergencyContact") ?? "").trim(),
    };

    const errors = validate(raw);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    const payload = {
      role: selectedRole,
      firstName: raw.firstName,
      lastName: raw.lastName,
      email: raw.email,
      password: raw.password,
      department: raw.department,
      designation: raw.designation,
      salary: Number(raw.salary),
      joiningDate: new Date(raw.joiningDate).toISOString(),
      ...(raw.bankAccount && { bankAccount: raw.bankAccount }),
      ...(raw.emergencyContact && { emergencyContact: raw.emergencyContact }),
    };

    setLoading(true);

    try {
      await userService.createStaff(payload);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onSuccess();
        form.reset();
        setSelectedRole("STAFF");
      }, 1400);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.[0]?.message ||
        err?.response?.data?.error ||
        `Request failed (${err?.response?.status ?? "unknown"})`;
      setApiError(msg);
      console.error("Create staff error:", err?.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    clearErrors();
    setSuccess(false);
    onClose();
  };

  return (
    <div
      className={`fixed inset-0 z-50 transition-all duration-300 ${
        isOpen ? "visible" : "invisible"
      }`}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleClose}
      />

      {/* Panel */}
      <div
        className={`absolute right-0 top-0 h-full w-full max-w-[440px] flex flex-col
          bg-[#16171d] border-l border-white/[0.07] shadow-2xl
          transition-transform duration-300 ${
            isOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.07]">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-blue-500/15 flex items-center justify-center">
              <UserPlus size={14} className="text-blue-400" />
            </div>
            <h2 className="text-[14px] font-medium text-white">Create staff account</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="w-7 h-7 rounded-lg border border-white/10 flex items-center justify-center
              text-white/40 hover:text-white hover:bg-white/5 disabled:opacity-50 transition"
            aria-label="Close"
          >
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* API error */}
          {apiError && (
            <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/20
              text-red-400 px-3 py-2.5 rounded-lg text-[13px] animate-in fade-in slide-in-from-top-1">
              <AlertCircle size={14} className="shrink-0 mt-px" />
              <span>{apiError}</span>
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="flex items-center gap-2.5 bg-green-500/10 border border-green-500/20
              text-green-400 px-3 py-2.5 rounded-lg text-[13px] animate-in fade-in slide-in-from-top-1">
              <Check size={14} />
              <span>Staff account created successfully</span>
            </div>
          )}

          <form id="staff-form" onSubmit={handleSubmit} noValidate className="space-y-5">

            {/* Role */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <p className="text-[11px] font-medium uppercase tracking-wider text-white/30">
                  Role
                </p>
                {/* Badge shown only to admins so they know Manager is an elevated role */}
                {isAdmin && (
                  <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md
                    bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-medium">
                    <ShieldCheck size={10} />
                    Admin
                  </span>
                )}
              </div>

              {/* Role buttons — grid adapts to 3 or 4 columns */}
              <div className={`grid gap-2 ${ROLES.length === 4 ? "grid-cols-4" : "grid-cols-3"}`}>
                {ROLES.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setSelectedRole(r.value)}
                    className={`flex flex-col items-center gap-1.5 py-2.5 rounded-lg border
                      text-[12px] font-medium transition ${
                        selectedRole === r.value
                          ? r.value === "MANAGER"
                            ? "bg-amber-500/15 border-amber-500/50 text-amber-400"
                            : "bg-blue-500/15 border-blue-500/50 text-blue-400"
                          : "bg-white/[0.03] border-white/[0.08] text-white/50 hover:text-white/70 hover:bg-white/[0.05]"
                      }`}
                  >
                    {r.icon}
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-px bg-white/[0.06]" />

            {/* Personal info */}
            <div className="space-y-3">
              <p className="text-[11px] font-medium uppercase tracking-wider text-white/30">Personal info</p>

              <div className="grid grid-cols-2 gap-3">
                <Field label="First name" required error={fieldErrors.firstName}>
                  <Input name="firstName" placeholder="Alice" />
                </Field>
                <Field label="Last name" required error={fieldErrors.lastName}>
                  <Input name="lastName" placeholder="Wong" />
                </Field>
              </div>

              <Field label="Email" required error={fieldErrors.email}>
                <Input name="email" type="email" placeholder="alice@company.com" />
              </Field>

              <Field label="Password" required error={fieldErrors.password}>
                <Input name="password" type="password" placeholder="Min. 8 characters" />
              </Field>
            </div>

            <div className="h-px bg-white/[0.06]" />

            {/* Employment */}
            <div className="space-y-3">
              <p className="text-[11px] font-medium uppercase tracking-wider text-white/30">Employment</p>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Department" required error={fieldErrors.department}>
                  <Input name="department" placeholder="Front Office" />
                </Field>
                <Field label="Designation" required error={fieldErrors.designation}>
                  <Input name="designation" placeholder="Supervisor" />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Salary" required error={fieldErrors.salary}>
                  <Input name="salary" type="number" placeholder="0.00" min={0} step={0.01} />
                </Field>
                <Field label="Joining date" required error={fieldErrors.joiningDate}>
                  <Input name="joiningDate" type="date" />
                </Field>
              </div>
            </div>

            <div className="h-px bg-white/[0.06]" />

            {/* Optional */}
            <div className="space-y-3">
              <p className="text-[11px] font-medium uppercase tracking-wider text-white/30">
                Optional{" "}
                <span className="normal-case tracking-normal text-white/20 font-normal">
                  (not required)
                </span>
              </p>

              <Field label="Bank account">
                <Input name="bankAccount" placeholder="Account number" />
              </Field>

              <Field label="Emergency contact">
                <Input name="emergencyContact" placeholder="+60 12 345 6789" />
              </Field>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-white/[0.07] flex gap-2">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="flex-1 h-9 rounded-lg border border-white/10 text-white/50
              hover:text-white hover:bg-white/5 text-[13px] font-medium
              disabled:opacity-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="staff-form"
            disabled={loading || success}
            className={`flex-[2] h-9 rounded-lg text-[13px] font-medium flex items-center
              justify-center gap-2 transition disabled:opacity-60 disabled:cursor-not-allowed ${
                success
                  ? "bg-green-600 text-white"
                  : "bg-blue-600 hover:bg-blue-500 text-white"
              }`}
          >
            {loading ? (
              <><Loader2 className="animate-spin" size={14} /> Creating...</>
            ) : success ? (
              <><Check size={14} /> Created</>
            ) : (
              <><UserPlus size={14} /> Create staff</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── helpers ── */

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[12px] font-medium text-white/50">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-[11px] text-red-400">{error}</p>}
    </div>
  );
}

function Input({ className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full h-8 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3
        text-[13px] text-white placeholder:text-white/20 outline-none
        focus:border-blue-500/60 focus:bg-blue-500/5 transition ${className}`}
    />
  );
}