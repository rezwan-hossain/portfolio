// components/header/Logo.tsx
"use client";

import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  scrolled: boolean;
}

export default function Logo({ scrolled }: LogoProps) {
  return (
    <Link
      href="/"
      className="relative z-10 group"
      prefetch={true} // Prefetch homepage
    >
      <Image
        src="/MerchSports-small.png"
        alt="MerchSports Logo"
        width={82}
        height={82}
        className={`rounded-full object-cover transition-all duration-300 ${
          scrolled
            ? "w-[62px] h-[62px]"
            : "w-[62px] h-[62px] md:w-[82px] md:h-[82px]"
        }`}
        priority
        quality={90}
        sizes="(max-width: 768px) 62px, 82px"
        placeholder="blur"
        blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
      />
    </Link>
  );
}
