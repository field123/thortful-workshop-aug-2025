"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { addToCartAction } from "../actions";

interface ProductCardProps {
  id?: string;
  href: string;
  image: string;
  title: string;
  price?: string;
  showPlaceholder?: boolean;
  showAddToCart?: boolean;
}

export default function ProductCard({
  id,
  href,
  image,
  title,
  price,
  showPlaceholder = false,
  showAddToCart = false,
}: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  /*
    TUTORIAL STEP: Insert add to cart logic here.
  */

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!id) return;

    setIsAdding(true);
    try {
      const result = await addToCartAction(id, 1);
      if (result.success) {
        setJustAdded(true);
        setTimeout(() => setJustAdded(false), 2000);
      } else {
        console.error("Failed to add to cart:", result.error);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      setIsAdding(false);
    }
  };

  // const handleAddToCart = async (e: React.MouseEvent) => {
  //   e.preventDefault();
  //   e.stopPropagation();

  //   if (!id) return;

  //   alert("Add to cart coming soon!");
  // };

  return (
    <div className="group">
      <Link href={href} className="block">
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
      </Link>

      <div className="space-y-2">
        <Link href={href} className="block">
          <h3 className="text-center text-sm font-normal text-black group-hover:text-[#f57c00] transition-colors">
            {title}
          </h3>
        </Link>

        {price && (
          <p className="text-center text-sm font-semibold text-[#f57c00]">
            {price}
          </p>
        )}

        {showAddToCart && id && (
          <div className="text-center">
            <button
              onClick={handleAddToCart}
              disabled={isAdding}
              className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors ${
                justAdded
                  ? "bg-green-500 text-white"
                  : isAdding
                  ? "bg-gray-300 text-gray-500"
                  : "bg-[#f57c00] text-white hover:bg-[#ef6c00]"
              } disabled:cursor-not-allowed`}
            >
              {justAdded ? "Added!" : isAdding ? "Adding..." : "Add to Cart"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
