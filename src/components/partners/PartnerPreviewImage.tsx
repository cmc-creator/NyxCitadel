'use client';

import { useState } from 'react';
import Image from 'next/image';

type PartnerPreviewImageProps = {
  primarySrc: string;
  fallbackSrc: string;
  alt: string;
};

export default function PartnerPreviewImage({
  primarySrc,
  fallbackSrc,
  alt,
}: PartnerPreviewImageProps) {
  const [src, setSrc] = useState(primarySrc);

  return (
    <Image
      src={src}
      alt={alt}
      width={1280}
      height={720}
      className="h-auto w-full"
      onError={() => {
        if (src !== fallbackSrc) {
          setSrc(fallbackSrc);
        }
      }}
    />
  );
}