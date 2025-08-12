import Link from 'next/link';
import ProductCard from './ProductCard';

interface ProductSectionProps {
  title: string;
  viewAllLink?: string;
  viewAllText?: string;
  products: Array<{
    href: string;
    image: string;
    title: string;
  }>;
}

export default function ProductSection({ 
  title, 
  viewAllLink, 
  viewAllText = "See all cards",
  products 
}: ProductSectionProps) {
  return (
    <section className="max-w-[1200px] mx-auto px-[15px] py-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-2xl font-bold tracking-[0.5px]">{title}</h2>
        {viewAllLink && (
          <Link 
            href={viewAllLink}
            className="text-sm text-[#f57c00] hover:text-[#ef6c00] transition-colors"
          >
            {viewAllText}
          </Link>
        )}
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
        {products.map((product, index) => (
          <ProductCard
            key={index}
            href={product.href}
            image={product.image}
            title={product.title}
          />
        ))}
      </div>
    </section>
  );
}