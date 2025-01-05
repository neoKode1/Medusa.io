import React from 'react';
import Image from 'next/image';
import { Button } from './button';

interface GenerationContainerProps {
  isLoading: boolean;
  generatedImage: string | null;
  onRegenerate?: () => void;
  loadingText?: string;
}

export function GenerationContainer({
  isLoading,
  generatedImage,
  onRegenerate,
  loadingText = 'Generating...'
}: GenerationContainerProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-4">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent" />
        <p className="text-sm text-muted-foreground">{loadingText}</p>
      </div>
    );
  }

  if (!generatedImage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] gap-4">
        <p className="text-sm text-muted-foreground">No image generated yet</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="relative aspect-square w-full">
        <Image
          src={generatedImage}
          alt="Generated image"
          fill
          className="rounded-lg object-contain"
        />
      </div>
      {onRegenerate && (
        <div className="absolute bottom-4 right-4">
          <Button onClick={onRegenerate} size="sm">
            Regenerate
          </Button>
        </div>
      )}
    </div>
  );
}
