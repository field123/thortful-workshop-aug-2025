'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  type CartEntityResponse,
  type CartItemObjectData,
  type SubscriptionItemObjectData,
    type CartIncluded
} from "@epcc-sdk/sdks-shopper";

function filterItems(item: NonNullable<CartIncluded["items"]>[number]): item is CartItemObjectData | SubscriptionItemObjectData {
  return item.type === 'cart_item' || item.type === 'subscription_item';
}

export default function CartDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [cartData, setCartData] = useState<CartEntityResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchCart();
    }
  }, [isOpen]);

  const fetchCart = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/cart");
      const responseData = await response.json();
      setCartData(responseData.data);
    } catch (error) {
      console.error('Failed to fetch cart data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalQuantity = cartData?.included?.items?.filter(filterItems)?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const cartTotal = cartData?.data?.meta?.display_price?.with_tax?.formatted || '£0.00';
  console.log("Cart items:", cartData?.included?.items);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-gray-700 hover:text-orange-500 font-medium relative flex items-center gap-1 px-3 py-2"
      >
        <Image src="/basket-icon.svg" alt="Basket" width={20} height={20} />
        <span style={{ fontSize: '13px', fontFamily: 'Roboto, Arial, Helvetica, sans-serif' }}>Basket</span>
        {totalQuantity > 0 && (
          <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {totalQuantity}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Your Basket</h3>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">Loading...</div>
            ) : !cartData?.included?.items || cartData?.included.items.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500 mb-4">Your basket is empty</p>
                <Link
                  href="/plus"
                  className="inline-block bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Browse Memberships
                </Link>
              </div>
            ) : (
              <div className="p-4">
                {cartData.included?.items?.filter(filterItems).map((item: any) => {
                  return (
                    <div key={item.type} className="flex items-start space-x-3 mb-4 pb-4 border-b border-gray-100 last:border-b-0">
                      <div className="flex-1">
                        <h4 className={`font-medium text-gray-900'}`}>
                          {item.name}
                        </h4>
                        {item.description && (
                          <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {cartData?.included?.items && cartData?.included.items.length > 0 && (
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between mb-4">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="font-semibold text-lg text-gray-900">
                  {cartTotal}
                </span>
              </div>
              <Link
                href="/cart"
                className="block w-full bg-orange-500 text-white text-center px-4 py-2 rounded hover:bg-orange-600 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Go to Cart
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}