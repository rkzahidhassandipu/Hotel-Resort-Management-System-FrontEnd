"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Phone } from "lucide-react";
import { authService } from "@/service/auth.service";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Rooms & Suites", href: "/rooms-suites" },
  { label: "Dining", href: "/dining" },
  { label: "Facilities", href: "/facilities" },
  { label: "Offers", href: "/offers" },
];

export default function PublicNavbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  // ✅ check logged in user
  useEffect(() => {
    authService
      .me()
      .then((res) => setUser(res.data?.data))
      .catch(() => setUser(null));
  }, []);

  const isHome = pathname === "/";
  const transparent = isHome && !scrolled;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        transparent
          ? "bg-transparent"
          : "bg-[#0B0C10]/95 backdrop-blur-md border-b border-white/5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          
          {/* logo */}
          <Link href="/" className="text-white font-bold">
            Lexis
          </Link>

          {/* desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="text-white/70 px-4 py-2">
                {link.label}
              </Link>
            ))}
          </nav>

          {/* right side */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="tel:+60-6-647-1188"
              className="flex items-center gap-1.5 text-white/60 text-xs"
            >
              <Phone className="h-3.5 w-3.5" /> +60 6-647 1188
            </a>

            {/* ✅ logged in হলে profile */}
            {user ? (
              <Link
                href="/dashboard"
                className="text-white hover:text-[#37EFD1] text-sm px-3"
              >
                {user.firstName || "Profile"}
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-white/70 hover:text-white text-sm px-3"
                >
                  Sign In
                </Link>

                <Link
                  href="/auth/register"
                  className="bg-[#C8102E] text-white text-sm px-5 py-2 rounded"
                >
                  Book Now
                </Link>
              </>
            )}
          </div>

          {/* mobile toggle */}
          <button
            className="md:hidden text-white p-1"
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </header>
  );
}