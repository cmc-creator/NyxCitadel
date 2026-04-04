'use client';

import Image from 'next/image';

interface LogoImageProps {
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
}

export function LogoImage({ width, height, className, priority }: LogoImageProps) {
  return (
    <Image
      src="/citadellogo-clean.png"
      alt="NyxCitadel"
      width={width}
      height={height}
      unoptimized
      priority={priority}
      onError={(e) => {
        const img = e.currentTarget as HTMLImageElement;
        if (!img.src.includes('/logo-white.svg')) {
          img.src = '/logo-white.svg';
        }
      }}
      className={className}
    />
  );
}
