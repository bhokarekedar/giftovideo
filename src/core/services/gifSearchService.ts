import * as FileSystem from 'expo-file-system';

export interface GiphyGif {
  id: string;
  url: string;
  previewUrl: string;
  title: string;
}

const GIPHY_API_KEY = process.env.EXPO_PUBLIC_GIPHY_API_KEY;

export class GifSearchService {
  /**
   * Searches Giphy for GIFs based on a query string.
   */
  static async searchGifs(query: string, limit: number = 10): Promise<GiphyGif[]> {
    if (!GIPHY_API_KEY) {
      throw new Error("Giphy API key is not configured in .env");
    }

    try {
      const encodedQuery = encodeURIComponent(query);
      const url = `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodedQuery}&limit=${limit}&rating=pg-13`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Giphy API error: ${response.status}`);
      }

      const data = await response.json();
      
      return data.data.map((gif: any) => ({
        id: gif.id,
        // High quality MP4 or original GIF
        url: gif.images.original.url,
        // Lower quality preview for list rendering
        previewUrl: gif.images.fixed_height_small.url,
        title: gif.title,
      }));
    } catch (error) {
      console.error("Gif Search Error:", error);
      throw error;
    }
  }

  /**
   * Downloads a GIF to the local file system cache for FFmpeg processing.
   */
  static async downloadGifToCache(url: string, id: string): Promise<string> {
    const file = new FileSystem.File(FileSystem.Paths.cache, `giphy_${id}.gif`);
    
    try {
      // Use the static method and overwrite if exists (idempotent: true) to avoid buggy file.exists getter
      await FileSystem.File.downloadFileAsync(url, file, { idempotent: true });
      return file.uri;
    } catch (error) {
      console.error("Failed to download GIF:", error);
      throw error;
    }
  }
}
