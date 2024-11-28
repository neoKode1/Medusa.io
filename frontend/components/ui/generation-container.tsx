import React from 'react';
import { LoadingParticles } from '../LoadingParticles';

interface GenerationContainerProps {
  generation: {
    assets?: {
      image?: string;
      video?: string;
    };
  };
  isLoading: boolean;
  isVideo: boolean;
}

export const GenerationContainer: React.FC<GenerationContainerProps> = ({
  generation,
  isLoading,
  isVideo
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white" />
      </div>
    );
  }

  if (!generation?.assets?.image) {
    return (
      <div className="flex items-center justify-center w-full h-full text-white/50">
        Generated image will appear here
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {isVideo && generation?.assets?.video ? (
        <video
          src={generation.assets.video}
          controls
          className="w-full h-full object-contain"
        />
      ) : (
        <img
          src={generation.assets.image}
          alt="Generated content"
          className="w-full h-full object-contain"
        />
      )}
    </div>
  );
};
