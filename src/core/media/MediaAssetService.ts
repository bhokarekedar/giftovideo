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
        mediaTypes: ['images', 'videos'], // For Expo 50+ this is a string array or MediaTypeOptions
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        return {
          uri: asset.uri,
          type: asset.type === 'image' ? 'image' : 'video',
          duration: asset.duration ?? undefined,
        };
      }
      return null;
    } catch (e) {
      console.error("ImagePicker error: ", e);
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
