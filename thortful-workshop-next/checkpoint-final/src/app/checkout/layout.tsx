import Header from '../components/Header';
import Footer from '../components/Footer';
import PlusBanner from '../components/PlusBanner';

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <PlusBanner />
      {children}
      <Footer />
    </>
  );
}