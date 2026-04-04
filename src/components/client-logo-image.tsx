'use client';

import Image from 'next/image';

interface ClientLogoImageProps {
  src: string;
  fallbackSrc?: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  unoptimized?: boolean;
  /** Set to true for images above the fold to enable eager loading (Next.js priority). */
  priority?: boolean;
}

/**
 * Logo image with a client-side fallback.
 * Wraps next/image so that the onError handler (a function prop) stays
 * inside a Client Component — React Server Components cannot pass
 * event-handler functions to Client Components.
 */
export function ClientLogoImage({
  src,
  fallbackSrc = '/logo-white.svg',
  alt,
  width,
  height,
  className,
  unoptimized,
  priority,
}: ClientLogoImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      unoptimized={unoptimized}
      priority={priority}
      className={className}
      onError={(e) => {
        const img = e.currentTarget as HTMLImageElement;
        if (!img.src.includes(fallbackSrc)) {
          img.src = fallbackSrc;
        }
      }}
    />
  );
}
