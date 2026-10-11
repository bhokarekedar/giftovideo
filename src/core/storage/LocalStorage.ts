import * as FileSystem from 'expo-file-system';

/**
 * Universal JSON file-backed storage fallback.
 * Works seamlessly in Expo Go, Development Builds, and Native production
 * without requiring any native module linking!
 */
export const LocalStorage = {
  getStorageFile(key: string): FileSystem.File {
    const sanitizedKey = key.replace(/[^a-zA-Z0-9_-]/g, '_');
    return new FileSystem.File(FileSystem.Paths.document, `${sanitizedKey}.json`);
  },

  async getItem(key: string): Promise<string | null> {
    try {
      const file = this.getStorageFile(key);
      if (!file.exists) return null;
      const content = await file.text();
      return content || null;
    } catch (e) {
      console.warn(`[LocalStorage] Error reading ${key}:`, e);
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      const file = this.getStorageFile(key);
      file.write(value);
    } catch (e) {
      console.error(`[LocalStorage] Error writing ${key}:`, e);
      throw e;
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      const file = this.getStorageFile(key);
      if (file.exists) {
        file.delete();
      }
    } catch (e) {
      console.warn(`[LocalStorage] Error removing ${key}:`, e);
    }
  },
};
