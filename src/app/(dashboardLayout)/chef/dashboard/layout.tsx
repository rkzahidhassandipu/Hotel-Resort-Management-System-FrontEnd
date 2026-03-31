/** Middleware enforces CHEF role for /chef/* — passthrough. */
export default function ChefDashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
