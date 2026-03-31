"use client";
import { useState } from "react";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  Loader2,
  User,
  Mail,
  Lock,
  ArrowRight,
} from "lucide-react";
import { authService } from "@/service/auth.service";
import { Toaster, toast } from "sonner";

export default function RegisterPage() {
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const f =
    (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const res = await authService.register({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
      });

      console.log(res.data);
      toast.success("Account created successfully!");
      setTimeout(() => (window.location.href = "/auth/login"), 2000);
    } catch (err: any) {
      console.log("FULL ERROR:", err?.response?.data);
      toast.error(err?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0C10] flex items-center justify-center py-10 relative overflow-hidden">
      <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-[#C8102E]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-80 h-80 rounded-full bg-[#37EFD1]/4 blur-[100px] pointer-events-none" />
      <div className="w-full max-w-md px-4 relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-[#C8102E] flex items-center justify-center shadow-2xl shadow-[#C8102E]/40">
                <span className="text-white font-display font-bold text-2xl">
                  L
                </span>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#37EFD1]" />
            </div>
          </div>
          <h1 className="font-display text-3xl text-white font-semibold">
            LEXIS Hibiscus
          </h1>
          <p className="text-white/35 text-sm font-sans mt-1 tracking-wider">
            Create Your Account
          </p>
        </div>
        <div className="bg-[#1A1B21] border border-white/8 rounded-2xl overflow-hidden">
          <div className="h-px bg-gradient-to-r from-transparent via-[#C8102E]/50 to-transparent" />
          <div className="p-8">
            <h2 className="font-display text-xl text-white font-semibold mb-1">
              Create Account
            </h2>
            <p className="text-white/35 text-sm font-sans mb-6">
              Join the Lexis Hibiscus guest portal
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {(["firstName", "lastName"] as const).map((k) => (
                  <div key={k}>
                    <label className="text-white/50 text-[10px] font-sans uppercase tracking-widest mb-1.5 block">
                      {k === "firstName" ? "First Name" : "Last Name"}
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                      <input
                        type="text"
                        required
                        value={form[k]}
                        onChange={f(k)}
                        placeholder={k === "firstName" ? "Ahmad" : "Razali"}
                        className="w-full bg-[#0B0C10] border border-white/8 text-white text-sm font-sans pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:border-[#37EFD1]/40 transition-colors placeholder:text-white/20"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <label className="text-white/50 text-[10px] font-sans uppercase tracking-widest mb-1.5 block">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={f("email")}
                    placeholder="you@example.com"
                    className="w-full bg-[#0B0C10] border border-white/8 text-white text-sm font-sans pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:border-[#37EFD1]/40 transition-colors placeholder:text-white/20"
                  />
                </div>
              </div>
              <div>
                <label className="text-white/50 text-[10px] font-sans uppercase tracking-widest mb-1.5 block">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                  <input
                    type={showPw ? "text" : "password"}
                    required
                    value={form.password}
                    onChange={f("password")}
                    placeholder="Min. 8 characters"
                    className="w-full bg-[#0B0C10] border border-white/8 text-white text-sm font-sans pl-10 pr-10 py-3 rounded-lg focus:outline-none focus:border-[#37EFD1]/40 transition-colors placeholder:text-white/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50"
                  >
                    {showPw ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-white/50 text-[10px] font-sans uppercase tracking-widest mb-1.5 block">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                  <input
                    type={showPw ? "text" : "password"}
                    required
                    value={form.confirmPassword}
                    onChange={f("confirmPassword")}
                    placeholder="Repeat password"
                    className="w-full bg-[#0B0C10] border border-white/8 text-white text-sm font-sans pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:border-[#37EFD1]/40 transition-colors placeholder:text-white/20"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#C8102E] hover:bg-[#a00d24] disabled:opacity-60 text-white font-sans font-medium py-3 rounded-lg transition-all hover:shadow-lg hover:shadow-[#C8102E]/25 flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
            <p className="text-center text-white/30 text-xs font-sans mt-5">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="text-[#37EFD1] hover:text-[#37EFD1]/80 transition-colors font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
