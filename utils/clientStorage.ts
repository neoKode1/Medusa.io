interface StorageContent {
  url: string;
  timestamp: number;
  prompt?: string;
  model?: string;
  sourceImage?: string | null;
  referenceImage?: string | null;
}

interface ClientStorage {
  get: (key: string) => string | null;
  set: (key: string, value: string) => void;
  storeContent: (type: 'video' | 'image' | 'prompt', content: StorageContent) => string;
}

export const clientStorage: ClientStorage = {
  get: (key: string): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(key);
  },

  set: (key: string, value: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, value);
  },

  storeContent: (type: 'video' | 'image' | 'prompt', content: StorageContent): string => {
    if (typeof window === 'undefined') return '';

    const key = `${type}_${Date.now()}`;
    localStorage.setItem(key, JSON.stringify(content));
    return key;
  },
};
