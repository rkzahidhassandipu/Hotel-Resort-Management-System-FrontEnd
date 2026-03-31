// src/app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import QueryProvider from '@/providers/QueryProvider';
import { Toaster } from 'sonner';
import { Jost } from 'next/font/google';

// Primary font via Next.js font optimization
const jost = Jost({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Lexis Hibiscus | Where the Sea Meets Luxury',
    template: '%s | Lexis Hibiscus',
  },
  description:
    "Malaysia's most iconic overwater resort in Port Dickson. 526 exclusive water chalets, villas, and suites.",
  keywords: ['luxury resort', 'Port Dickson', 'overwater', 'Malaysia', 'hotel'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={jost.className}>
      <body>
        <QueryProvider>
          {children}
          <Toaster position="top-right" richColors closeButton />
        </QueryProvider>
      </body>
    </html>
  );
}