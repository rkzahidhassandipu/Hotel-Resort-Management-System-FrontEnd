import PublicNavbar from '@/components/modules/Public/PublicNavbar';
import PublicFooter from '@/components/modules/Public/PublicFooter';

export default function CommonLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PublicNavbar />
      <main>{children}</main>
      <PublicFooter />
    </>
  );
}
