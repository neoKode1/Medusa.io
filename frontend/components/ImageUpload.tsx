import React from 'react';
import Image from 'next/image';

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  currentImage?: string | null;
  label?: string;
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageSelect,
  currentImage,
  label = "Upload Image",
  className = ""
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageSelect(e.target.files[0]);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        id="image-upload"
      />
      <label
        htmlFor="image-upload"
        className="cursor-pointer flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-400 rounded-lg hover:border-white/50 transition-colors"
      >
        {currentImage ? (
          <div className="relative w-32 h-32">
            <Image
              src={currentImage}
              alt="Uploaded image"
              fill
              className="object-cover rounded-lg"
            />
          </div>
        ) : (
          <>
            <div className="text-white/50 text-center">
              <p>{label}</p>
              <p className="text-sm">Click to browse</p>
            </div>
          </>
        )}
      </label>
    </div>
  );
};

export default ImageUpload; 