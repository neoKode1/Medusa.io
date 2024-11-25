import React from 'react';

interface GalleryImage {
  url: string;
  prompt: string;
  timestamp: number;
}

interface GalleryContainerProps {
  images: GalleryImage[];
}

export const GalleryContainer: React.FC<GalleryContainerProps> = ({ images }) => {
  return (
    <div className="grid grid-cols-2 gap-4 h-full overflow-y-auto">
      {images.map((image, index) => (
        <div key={image.timestamp} className="relative group">
          <img 
            src={image.url} 
            alt={image.prompt}
            className="w-full aspect-square object-cover rounded-lg"
          />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-4 rounded-lg">
            <p className="text-white text-sm line-clamp-3">{image.prompt}</p>
          </div>
        </div>
      ))}
    </div>
  );
}; 