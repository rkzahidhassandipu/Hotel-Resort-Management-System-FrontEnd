import React from 'react';
import Link from 'next/link';
import { Phone, Mail, MapPin, Facebook, Instagram, Youtube, Twitter } from 'lucide-react';

export default function PublicFooter() {
  return (
    <footer className="bg-[#0B0C10] text-white">
      <div className="h-px bg-gradient-to-r from-transparent via-[#C8102E] to-transparent" />
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-5">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-[#C8102E] flex items-center justify-center shadow-lg shadow-[#C8102E]/40">
                  <span className="text-white font-display font-bold text-lg">L</span>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#37EFD1]" />
              </div>
              <div>
                <p className="font-display text-base font-semibold tracking-widest uppercase">Lexis</p>
                <p className="text-[#37EFD1] text-[8px] tracking-[0.4em] uppercase font-sans">Hibiscus Resort</p>
              </div>
            </div>
            <p className="text-white/50 text-sm font-sans leading-relaxed mb-6">
              Malaysia's most iconic overwater resort on the shores of Port Dickson — where every day begins above the sea.
            </p>
            <div className="flex gap-3">
              {[Facebook, Instagram, Youtube, Twitter].map((Icon, i) => (
                <a key={i} href="#" className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:border-[#37EFD1] hover:text-[#37EFD1] transition-all">
                  <Icon className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-[11px] font-sans tracking-[0.3em] uppercase text-[#C8102E] mb-5">Explore</h4>
            <ul className="space-y-2.5">
              {['Rooms & Suites', 'Dining', 'Facilities', 'Special Offers', 'Weddings', 'Meetings & Events', 'Spa & Wellness'].map(item => (
                <li key={item}><a href="#" className="text-white/50 text-sm font-sans hover:text-[#37EFD1] transition-colors">{item}</a></li>
              ))}
            </ul>
          </div>

          {/* Guest Services */}
          <div>
            <h4 className="text-[11px] font-sans tracking-[0.3em] uppercase text-[#C8102E] mb-5">Guest Services</h4>
            <ul className="space-y-2.5">
              {['Online Booking', 'Concierge', 'Loyalty Programme', 'Airport Transfer', 'Gift Vouchers', 'Privacy Policy', 'Terms of Use'].map(item => (
                <li key={item}><a href="#" className="text-white/50 text-sm font-sans hover:text-[#37EFD1] transition-colors">{item}</a></li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[11px] font-sans tracking-[0.3em] uppercase text-[#C8102E] mb-5">Contact</h4>
            <ul className="space-y-4">
              <li className="flex gap-3 text-white/50 text-sm font-sans">
                <MapPin className="h-4 w-4 mt-0.5 text-[#C8102E] flex-shrink-0" />
                Jalan Persiaran Taman Samudera, Batu 3, Port Dickson, 71050 Negeri Sembilan
              </li>
              <li>
                <a href="tel:+60-6-647-1188" className="flex gap-3 text-white/50 text-sm font-sans hover:text-[#37EFD1] transition-colors">
                  <Phone className="h-4 w-4 text-[#37EFD1] flex-shrink-0" /> +60 6-647 1188
                </a>
              </li>
              <li>
                <a href="mailto:reservations@lexishibiscus.com" className="flex gap-3 text-white/50 text-sm font-sans hover:text-[#37EFD1] transition-colors">
                  <Mail className="h-4 w-4 text-[#37EFD1] flex-shrink-0" /> reservations@lexishibiscus.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/25 text-xs font-sans">© {new Date().getFullYear()} Lexis Hibiscus Port Dickson. All rights reserved.</p>
          <p className="text-white/20 text-xs font-sans">A member of The Resort Collection</p>
        </div>
      </div>
    </footer>
  );
}
