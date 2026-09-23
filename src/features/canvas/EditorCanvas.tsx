import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { theme } from '../../core/theme';
import { useEditorStore } from '../../core/store/editorStore';
import { usePlaybackEngine } from '../../core/playback/usePlaybackEngine';
import { TextOverlayRenderer } from './TextOverlayRenderer';

export function EditorCanvas() {
  const project = useEditorStore(state => state.project);
  const currentTime = useEditorStore(state => state.currentTime);
  const { isPlaying, visibleVideoItem } = usePlaybackEngine();
  
  const videoRef = useRef<Video>(null);

  const aspectRatio = project?.canvas?.aspectRatio || '9:16';
  const [ratioW, ratioH] = aspectRatio.split(':').map(Number);
  const ratio = ratioW / ratioH;

  const screenWidth = Dimensions.get('window').width;
  const padding = theme.spacing.md * 2;
  const availableWidth = screenWidth - padding;
  
  const canvasWidth = availableWidth;
  const canvasHeight = availableWidth / ratio;

  // Sync video position with currentTime
  useEffect(() => {
    if (visibleVideoItem && videoRef.current) {
      if (!isPlaying) {
        const relativeTime = currentTime - visibleVideoItem.startTime;
        videoRef.current.setPositionAsync(Math.max(0, relativeTime));
      } else {
        videoRef.current.playAsync();
      }
    }
  }, [currentTime, isPlaying, visibleVideoItem]);

  useEffect(() => {
    if (!isPlaying && videoRef.current) {
      videoRef.current.pauseAsync();
    }
  }, [isPlaying]);

  return (
    <View style={styles.container}>
      <View style={[styles.canvasBox, { width: canvasWidth, height: canvasHeight }]}>
        {visibleVideoItem ? (
          <Video
            ref={videoRef}
            source={{ uri: visibleVideoItem.uri }}
            style={StyleSheet.absoluteFill}
            resizeMode={ResizeMode.CONTAIN}
            isMuted={true}
          />
        ) : (
          <Text style={styles.placeholder}>No Video</Text>
        )}
        
        <TextOverlayRenderer canvasWidth={canvasWidth} canvasHeight={canvasHeight} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  canvasBox: {
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  placeholder: {
    color: theme.colors.textSecondary,
  }
});
