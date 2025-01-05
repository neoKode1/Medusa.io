export const MODELS = {
  'fluxPro': {
    id: 'neokode1/deeptechai:8beff3369e81422112d93b89ca01426147de542cd4684c244b673b105188fe5f',
    name: 'Deeptechai',
    description: 'Advanced AI model for creative image generation',
    features: {
      isVideo: false,
      defaultParams: {
        prompt: '',
      }
    }
  },
  'lumaI2V': {
    id: 'lumaI2V',
    name: 'Luma I2V',
    description: 'Luma Image to Video model',
    type: 'video'
  }
} as const;

export type ModelName = keyof typeof MODELS;

export const isVideoModel = (model: string): boolean => {
  return model === 'lumaI2V';
}; 