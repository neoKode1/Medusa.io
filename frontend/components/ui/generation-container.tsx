import { useState } from 'react';

interface GenerationContainerProps {
  generation: {
    assets: {
      video?: string;
      image?: string;
    };
  } | null;
  isLoading: boolean;
  isVideo: boolean;
}

export function GenerationContainer({ generation, isLoading, isVideo }: GenerationContainerProps) {
  return (
    <div className="relative min-h-[200px] w-full rounded-lg border border-border bg-muted p-4">
      {isLoading ? (
        <div className="flex h-full w-full items-center justify-center">
          <span className="loading loading-spinner loading-lg" />
        </div>
      ) : generation ? (
        <div className="flex justify-center">
          {isVideo ? (
            generation.assets.video && (
              <video 
                src={generation.assets.video} 
                controls 
                className="max-h-[600px] rounded-lg"
              />
            )
          ) : (
            generation.assets.image && (
              <img 
                src={generation.assets.image} 
                alt="Generated content"
                className="max-h-[600px] rounded-lg"
              />
            )
          )}
        </div>
      ) : (
        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
          Your generation will appear here
        </div>
      )}
    </div>
  );
}
