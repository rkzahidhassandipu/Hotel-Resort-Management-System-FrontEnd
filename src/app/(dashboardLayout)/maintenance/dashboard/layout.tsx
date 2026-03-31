/** Middleware enforces MAINTENANCE role for /maintenance/* — passthrough. */
export default function MaintenanceDashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
