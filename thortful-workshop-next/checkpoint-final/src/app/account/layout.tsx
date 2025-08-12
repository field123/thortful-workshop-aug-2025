import HeaderWrapper from '../components/HeaderWrapper';
import Footer from '../components/Footer';
import PlusBanner from '../components/PlusBanner';

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <HeaderWrapper />
      <PlusBanner />
      {children}
      <Footer />
    </>
  );
}