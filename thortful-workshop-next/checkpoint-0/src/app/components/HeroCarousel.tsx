"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';

const slides = [
  {
    id: 1,
    image: '/banner-exam.jpg',
    alt: 'Exam Congrats w/c 31',
    link: '/cards/exams/congrats'
  },
  {
    id: 2,
    image: '/banner-exam.jpg',
    alt: 'Exam Congrats w/c 31',
    link: '/cards/exams/congrats'
  },
  {
    id: 3,
    image: '/banner-exam.jpg',
    alt: 'Exam Congrats w/c 31',
    link: '/cards/exams/congrats'
  }
];

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full overflow-hidden">
      <div className="relative h-[400px] lg:h-[500px] w-full">
        <div 
          className="flex transition-transform duration-500 ease-in-out h-full"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide) => (
            <Link
              key={slide.id}
              href={slide.link}
              className="relative min-w-full h-full block"
            >
              <Image
                src={slide.image}
                alt={slide.alt}
                fill
                className="object-cover"
                priority={slide.id === 1}
                sizes="100vw"
              />
            </Link>
          ))}
        </div>
      </div>

      {/* Dots indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              index === currentSlide ? 'bg-white w-8' : 'bg-white/50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Navigation buttons */}
      <button
        onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
        className="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90 rounded-full w-12 h-12 flex items-center justify-center shadow-md transition-all"
        aria-label="Previous slide"
      >
        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
        className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90 rounded-full w-12 h-12 flex items-center justify-center shadow-md transition-all"
        aria-label="Next slide"
      >
        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}