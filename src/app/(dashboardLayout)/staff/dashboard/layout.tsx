/** Middleware enforces STAFF role for /staff/* — passthrough. */
export default function StaffDashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
