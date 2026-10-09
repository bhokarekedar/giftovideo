import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

export interface PickedMedia {
  uri: string;
  type: 'video' | 'audio' | 'image';
  duration?: number;
}

export class MediaAssetService {
  static async pickVideoAsset(): Promise<PickedMedia | null> {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images', 'videos'], // We allow both to gracefully handle wrong selections and alert the user
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        
        // Since this is a "GIF to Video" app, the primary asset MUST be a GIF.
        const isGif = asset.uri.toLowerCase().endsWith('.gif') || 
                      (asset.mimeType && asset.mimeType.toLowerCase() === 'image/gif');
                      
        if (!isGif) {
          Alert.alert('Unsupported Format', 'Please select a GIF file to convert to a video. JPGs, PNGs, and existing videos are not supported here.');
          return null;
        }

        return {
          uri: asset.uri,
          type: 'image', // We know it's an image (GIF) now
          duration: asset.duration ?? undefined,
        };
      }
      return null;
    } catch (e) {
      console.error("ImagePicker error: ", e);
      return null;
    }
  }

  /**
   * Pick an image from the library for custom background usage.
   */
  static async pickImageAsset(): Promise<PickedMedia | null> {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        
        // Reject GIFs as they are not supported by the FFmpeg background filter properly
        const isGif = asset.uri.toLowerCase().endsWith('.gif') || 
                      (asset.mimeType && asset.mimeType.toLowerCase() === 'image/gif');
                      
        if (isGif) {
          Alert.alert('Unsupported Format', 'Please select a JPG or PNG image. GIFs are not supported for custom backgrounds.');
          return null;
        }
        
        return {
          uri: asset.uri,
          type: 'image',
        };
      }
      return null;
    } catch (e) {
      console.error('ImagePicker error (image only): ', e);
      return null;
    }
  }

  static async pickAudioAsset(): Promise<PickedMedia | null> {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['audio/*'],
      copyToCacheDirectory: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      return {
        uri: asset.uri,
        type: 'audio',
      };
    }
    return null;
  }
}
