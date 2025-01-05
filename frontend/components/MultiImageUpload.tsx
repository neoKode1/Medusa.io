import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { cn } from '../lib/utils';

interface MultiImageUploadProps {
  onImagesSelect: (files: File[]) => void;
  currentImages: string[];
  onImageRemove: (index: number) => void;
  label: string;
  className?: string;
}

export default function MultiImageUpload({
  onImagesSelect,
  currentImages,
  onImageRemove,
  label,
  className
}: MultiImageUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onImagesSelect(acceptedFiles);
  }, [onImagesSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    multiple: true
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors',
          isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300',
          className
        )}
      >
        <input {...getInputProps()} />
        <div className="text-gray-500">
          {isDragActive ? (
            <p>Drop the images here ...</p>
          ) : (
            <p>{label || 'Drag and drop images here, or click to select files'}</p>
          )}
          <p className="text-sm mt-2 text-gray-400">
            Recommended: 4-20 high-quality images
          </p>
        </div>
      </div>

      {currentImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {currentImages.map((image, index) => (
            <div key={index} className="relative aspect-square">
              <img
                src={image}
                alt={`Training image ${index + 1}`}
                className="w-full h-full object-cover rounded-lg"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onImageRemove(index);
                }}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 