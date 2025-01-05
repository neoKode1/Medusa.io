import React from 'react';
import Image from 'next/image';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';

interface TrainingFormProps {
  images: string[];
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImageRemove: (index: number) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  instanceName: string;
  onInstanceNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function TrainingForm({
  images,
  onImageUpload,
  onImageRemove,
  onSubmit,
  isLoading,
  instanceName,
  onInstanceNameChange,
}: TrainingFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <Label htmlFor="instanceName">Instance Name</Label>
        <Input
          id="instanceName"
          value={instanceName}
          onChange={onInstanceNameChange}
          placeholder="Enter a name for your character"
          required
        />
      </div>

      <div>
        <Label htmlFor="images">Upload Images (4-20 images recommended)</Label>
        <Input
          id="images"
          type="file"
          onChange={onImageUpload}
          accept="image/*"
          multiple
          required={images.length === 0}
          className="mt-2"
        />
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative aspect-square">
              <Image
                src={image}
                alt={`Training image ${index + 1}`}
                fill
                className="rounded-lg object-cover"
              />
              <button
                type="button"
                onClick={() => onImageRemove(index)}
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

      <Button type="submit" disabled={isLoading || images.length === 0}>
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
            Training...
          </>
        ) : (
          'Start Training'
        )}
      </Button>
    </form>
  );
} 