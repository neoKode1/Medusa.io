import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { cn } from '../lib/utils';
import Image from 'next/image';

interface ImageUploadProps {
  onImageSelect: (file: File | null) => void;
  currentImage: string | null;
  label: string;
  className?: string;
}

export default function ImageUpload({ onImageSelect, currentImage, label, className }: ImageUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      onImageSelect(file);
    }
  }, [onImageSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    maxFiles: 1,
    multiple: false
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        'border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-gray-400 transition-colors',
        isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300',
        className
      )}
    >
      <input {...getInputProps()} />
      {currentImage ? (
        <div className="relative aspect-square w-full overflow-hidden rounded-lg">
          <img
            src={currentImage}
            alt="Uploaded image"
            className="w-full h-full object-contain"
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              onImageSelect(null);
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
      ) : (
        <div className="text-gray-500">
          {isDragActive ? (
            <p>Drop the image here ...</p>
          ) : (
            <p>{label || 'Drag and drop an image here, or click to select one'}</p>
          )}
        </div>
      )}
    </div>
  );
} 