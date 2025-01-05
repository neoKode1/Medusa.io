import React from 'react';
import Image from 'next/image';

interface GalleryContainerProps {
  images: string[];
}

export function GalleryContainer({ images }: GalleryContainerProps) {
  if (!images || images.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
      {images.map((image) => (
        <div key={image} className="relative aspect-square w-full">
          <Image
            src={image}
            alt="Generated image"
            fill
            className="rounded-lg object-cover"
          />
        </div>
      ))}
    </div>
  );
} 