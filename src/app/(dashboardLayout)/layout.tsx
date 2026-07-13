import DashboardSidebar from '@/components/modules/Dashboard/DashboardSidebar';
import DashboardNavbar  from '@/components/modules/Dashboard/DashboardNavbar';

/**
 * Root dashboard layout shell.
 * Middleware at src/middleware.ts already enforces:
 *   - authentication (redirects to /login if no valid token)
 *   - role-based access (redirects to own dashboard if wrong role)
 * This layout just renders the sidebar + navbar chrome.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#0D0E12] overflow-hidden">
      <DashboardSidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <DashboardNavbar />
        <main className="flex-1 overflow-y-auto scrollbar-thin pb-5 px-5">
          {children}
        </main>
      </div>
    </div>
  );
}
