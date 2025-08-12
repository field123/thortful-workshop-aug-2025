import Image from 'next/image';
import Link from 'next/link';

interface ProductCardProps {
  href: string;
  image: string;
  title: string;
  showPlaceholder?: boolean;
}

export default function ProductCard({ href, image, title, showPlaceholder = false }: ProductCardProps) {
  return (
    <Link 
      href={href}
      className="group block"
    >
      <div className="relative overflow-hidden rounded-lg mb-2">
        <div className="relative aspect-[280/350] bg-gray-100">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 250px"
          />
          {showPlaceholder && (
            <div className="absolute inset-0 pointer-events-none">
              <Image
                src="https://images-fe.thortful.com/cdn-cgi/image/width=250,format=auto,quality=90/img/hosted/carousel-blank-tile.png"
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 250px"
              />
            </div>
          )}
        </div>
      </div>
      <h3 className="text-center text-sm font-normal text-black group-hover:text-[#f57c00] transition-colors">
        {title}
      </h3>
    </Link>
  );
}