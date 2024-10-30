// Handle client-side storage
export const clientStorage = {
  // Store generated content
  storeContent: (type, content) => {
    try {
      const key = `medusa_${type}_${Date.now()}`;
      localStorage.setItem(key, JSON.stringify(content));
      return key;
    } catch (error) {
      console.error('Storage error:', error);
      return null;
    }
  },

  // Retrieve content
  getContent: (key) => {
    try {
      const content = localStorage.getItem(key);
      return content ? JSON.parse(content) : null;
    } catch (error) {
      console.error('Retrieval error:', error);
      return null;
    }
  },

  // Clear all stored content
  clearStorage: () => {
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('medusa_')) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Clear storage error:', error);
    }
  }
}; 