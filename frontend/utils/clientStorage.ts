interface StoredContent {
  url: string;
  timestamp: number;
}

class ClientStorage {
  private readonly PREFIX = 'medusa_io_';

  storeContent(type: 'image' | 'video', content: StoredContent): string {
    const key = `${this.PREFIX}${type}_${Date.now()}`;
    localStorage.setItem(key, JSON.stringify(content));
    return key;
  }

  get(key: string): string | null {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  }

  clear(): void {
    Object.keys(localStorage)
      .filter(key => key.startsWith(this.PREFIX))
      .forEach(key => localStorage.removeItem(key));
  }
}

export const clientStorage = new ClientStorage(); 