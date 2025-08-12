import Image from 'next/image';
import Link from 'next/link';

export default function HeroCarousel() {
  return (
    <div className="relative w-full bg-white">
      <Link
        href="/cards/exams/congrats"
        className="block relative w-full"
        style={{ height: '350px' }}
      >
        <Image
          src="/banner-exam.jpg"
          alt="Exam Congrats w/c 31"
          fill
          className="object-cover object-center"
          priority
          quality={100}
          sizes="100vw"
        />
      </Link>
    </div>
  );
}