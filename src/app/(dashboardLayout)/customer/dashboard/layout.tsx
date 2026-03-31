/** Middleware enforces CUSTOMER role for /customer/* — passthrough. */
export default function CustomerDashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
