/** Middleware enforces MANAGER role for /manager/* — passthrough. */
export default function ManagerDashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
