/** Middleware enforces ADMIN role for /admin/* — this is just a passthrough. */
export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
