import PublicNavbar from '@/components/modules/Public/PublicNavbar';
import PublicFooter from '@/components/modules/Public/PublicFooter';
import HomePage from '@/components/modules/Public/HomePage';
export default function RootPage() {
  return <>
    <PublicNavbar />
    <main><HomePage /></main>
    <PublicFooter />
  </>;
}
