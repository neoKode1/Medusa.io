// utils/clientStorage.js

const clientStorage = {
  /**
   * Sets a value in localStorage.
   * @param {string} key - The storage key.
   * @param {any} value - The value to store, will be JSON.stringified.
   */
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting item in localStorage: ${error}`);
    }
  },

  /**
   * Gets a parsed value from localStorage.
   * @param {string} key - The storage key.
   * @returns {any} - The parsed value, or null if it does not exist.
   */
  getItem: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error getting item from localStorage: ${error}`);
      return null;
    }
  },

  /**
   * Removes an item from localStorage.
   * @param {string} key - The storage key.
   */
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing item from localStorage: ${error}`);
    }
  },

  /**
   * Clears all items from localStorage.
   */
  clear: () => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error(`Error clearing localStorage: ${error}`);
    }
  },
};

export default clientStorage;
