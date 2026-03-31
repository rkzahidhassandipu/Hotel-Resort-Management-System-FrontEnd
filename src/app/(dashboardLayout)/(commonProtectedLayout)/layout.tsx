/**
 * Common protected layout — passthrough.
 * Role protection is handled by middleware.ts (cookie-based JWT check).
 */
export default function CommonProtectedLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
