import React from 'react';
import { LoadingParticles } from '../LoadingParticles';

interface GenerationContainerProps {
  generation: {
    assets?: {
      video?: string;
      image?: string;
    };
  } | null;
  isLoading: boolean;
  isVideo: boolean;
}

export const GenerationContainer: React.FC<GenerationContainerProps> = ({
  generation,
  isLoading,
  isVideo
}) => {
  const hasContent = generation?.assets?.video || generation?.assets?.image;

  return (
    <div className="w-full h-full min-h-[512px] flex items-center justify-center">
      {hasContent ? (
        isVideo ? (
          <video
            src={generation.assets?.video}
            controls
            className="max-w-full max-h-full"
          />
        ) : (
          <img
            src={generation.assets?.image}
            alt="Generated content"
            className="max-w-full max-h-full"
          />
        )
      ) : (
        <div className="relative w-full h-full flex items-center justify-center">
          
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <LoadingParticles />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
