"use client";

import Image from "next/image";
import { useState } from "react";

interface CartItemProps {
  item: {
    id: string;
    title: string;
    price: number;
    quantity: number;
    image: string;
    creator: string;
  };
}

export default function CartItem({ item }: CartItemProps) {
  const [quantity, setQuantity] = useState(item.quantity);

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const handleRemove = () => {
    // This would typically update global cart state
    console.log("Remove item:", item.id);
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Product Image */}
        <div className="flex-shrink-0">
          <div className="relative w-24 h-32 sm:w-32 sm:h-40">
            <Image
              src={item.image}
              alt={item.title}
              fill
              className="object-cover rounded-lg"
              sizes="(max-width: 640px) 96px, 128px"
            />
          </div>
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row justify-between h-full">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {item.title}
              </h3>
              <p className="text-sm text-gray-600 mb-2">By {item.creator}</p>
              <p className="text-sm text-gray-500 mb-4">
                Standard card size - A5
              </p>
            </div>

            <div className="flex flex-col sm:items-end justify-between">
              {/* Price */}
              <div className="text-right mb-4 sm:mb-0">
                <p className="text-lg font-semibold text-gray-900">
                  £{item.price.toFixed(2)}
                </p>
                <p className="text-sm text-gray-500">each</p>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center gap-3 mb-4 sm:mb-0">
                <label className="text-sm text-gray-600">Qty:</label>
                <div className="flex items-center border border-gray-300 rounded">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    className="px-3 py-1 hover:bg-gray-100 transition-colors"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="px-3 py-1 border-x border-gray-300 min-w-[3rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    className="px-3 py-1 hover:bg-gray-100 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Remove Button */}
              <button
                onClick={handleRemove}
                className="text-sm text-red-600 hover:text-red-800 transition-colors self-start sm:self-end"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Item Total */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">
            {quantity} × £{item.price.toFixed(2)}
          </span>
          <span className="text-lg font-semibold text-gray-900">
            £{(quantity * item.price).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
