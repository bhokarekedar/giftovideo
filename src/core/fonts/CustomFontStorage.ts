import { LocalStorage } from '../storage/LocalStorage';
import * as FileSystem from 'expo-file-system';
import * as Font from 'expo-font';

export interface CustomFontItem {
  id: string;
  name: string;
  fileName: string;
  uri: string;
  createdAt: number;
}

export const BUILTIN_FONTS = [
  'System',
  'serif',
  'monospace',
  'Anton',
  'Bebas Neue',
  'Comic Neue',
];

const FONTS_STORAGE_KEY = '@giftovideo_custom_fonts_v1';

export const CustomFontStorage = {
  /**
   * Returns the directory dedicated to custom fonts
   */
  getFontsDirectory(): FileSystem.Directory {
    return new FileSystem.Directory(FileSystem.Paths.document, 'custom_fonts');
  },

  /**
   * Ensures the custom fonts directory exists
   */
  async ensureDirectory(): Promise<void> {
    try {
      const dir = this.getFontsDirectory();
      if (!dir.exists) {
        dir.create();
      }
    } catch (e) {
      console.warn('Could not ensure font directory', e);
    }
  },

  /**
   * Get all registered custom fonts metadata from storage
   */
  async getCustomFonts(): Promise<CustomFontItem[]> {
    try {
      const data = await LocalStorage.getItem(FONTS_STORAGE_KEY);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Failed to get custom fonts from storage', e);
      return [];
    }
  },

  /**
   * Loads all saved custom fonts into expo-font
   */
  async loadAllSavedFonts(): Promise<string[]> {
    await this.ensureDirectory();
    const customFonts = await this.getCustomFonts();
    const loadedFontNames: string[] = [];

    for (const fontItem of customFonts) {
      try {
        const file = new FileSystem.File(fontItem.uri);
        if (file.exists && (file.size ?? 0) > 0) {
          await Font.loadAsync({
            [fontItem.name]: { uri: fontItem.uri },
          });
          loadedFontNames.push(fontItem.name);
        } else {
          console.warn(`Font file empty or not found on disk at ${fontItem.uri}`);
        }
      } catch (err) {
        console.warn(`Error loading font ${fontItem.name}:`, err);
      }
    }

    return loadedFontNames;
  },

  /**
   * Saves a picked font File or URI permanently into app storage and registers it
   */
  async saveFont(sourceFileOrUri: FileSystem.File | string, rawFileName: string): Promise<CustomFontItem> {
    await this.ensureDirectory();

    // Clean font name (remove extension and invalid characters)
    const baseName = rawFileName.replace(/\.[^/.]+$/, '').trim() || 'CustomFont';
    const sanitizedFontName = baseName.replace(/[^a-zA-Z0-9_\-\s]/g, '').trim() || `Font_${Date.now()}`;
    const extension = rawFileName.includes('.') ? rawFileName.split('.').pop() || 'ttf' : 'ttf';
    const destinationFileName = `${Date.now()}_${sanitizedFontName}.${extension}`;

    const fontsDir = this.getFontsDirectory();
    const destinationFile = new FileSystem.File(fontsDir, destinationFileName);

    let copySucceeded = false;

    // Strategy 1: If an expo-file-system File instance is passed, read bytes and write to destination
    if (sourceFileOrUri instanceof FileSystem.File) {
      try {
        const bytes = await sourceFileOrUri.bytes();
        if (bytes && bytes.length > 0) {
          destinationFile.write(bytes);
          copySucceeded = true;
        }
      } catch (err1) {
        console.warn('Strategy 1 (File.bytes) failed:', err1);
      }
    }

    // Strategy 2: Native fetch blob / arrayBuffer (works seamlessly on Android content:// and file://)
    if (!copySucceeded) {
      const sourceUriStr = typeof sourceFileOrUri === 'string' ? sourceFileOrUri : sourceFileOrUri.uri;
      try {
        const response = await fetch(sourceUriStr);
        const arrayBuffer = await response.arrayBuffer();
        if (arrayBuffer && arrayBuffer.byteLength > 0) {
          const uint8 = new Uint8Array(arrayBuffer);
          destinationFile.write(uint8);
          copySucceeded = true;
        }
      } catch (err2) {
        console.warn('Strategy 2 (fetch arrayBuffer) failed:', err2);
      }
    }

    // Strategy 3: Try FileSystem.File(uri).bytes()
    if (!copySucceeded) {
      const sourceUriStr = typeof sourceFileOrUri === 'string' ? sourceFileOrUri : sourceFileOrUri.uri;
      try {
        const sourceFile = new FileSystem.File(sourceUriStr);
        const bytes = await sourceFile.bytes();
        if (bytes && bytes.length > 0) {
          destinationFile.write(bytes);
          copySucceeded = true;
        }
      } catch (err3) {
        console.warn('Strategy 3 (sourceFile.bytes) failed:', err3);
      }
    }

    // Verify destination exists and has content
    if (!destinationFile.exists || (destinationFile.size ?? 0) === 0) {
      throw new Error('Font file could not be copied or is empty.');
    }

    // Load into Expo Font immediately
    await Font.loadAsync({
      [sanitizedFontName]: { uri: destinationFile.uri },
    });

    const newFontItem: CustomFontItem = {
      id: `font_${Date.now()}`,
      name: sanitizedFontName,
      fileName: destinationFileName,
      uri: destinationFile.uri,
      createdAt: Date.now(),
    };

    const current = await this.getCustomFonts();
    const updated = [newFontItem, ...current.filter(f => f.name !== sanitizedFontName)];
    await LocalStorage.setItem(FONTS_STORAGE_KEY, JSON.stringify(updated));

    return newFontItem;
  },

  /**
   * Deletes a custom font from disk and storage
   */
  async deleteFont(id: string): Promise<CustomFontItem[]> {
    try {
      const current = await this.getCustomFonts();
      const target = current.find(f => f.id === id);

      if (target && target.uri) {
        try {
          const file = new FileSystem.File(target.uri);
          if (file.exists) {
            file.delete();
          }
        } catch (fileErr) {
          console.warn('Could not delete font file:', fileErr);
        }
      }

      const updated = current.filter(f => f.id !== id);
      await LocalStorage.setItem(FONTS_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.error('Failed to delete custom font:', e);
      throw e;
    }
  },
};
