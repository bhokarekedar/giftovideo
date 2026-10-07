import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, Text, Image } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { theme } from '../../core/theme';
import { useEditorStore } from '../../core/store/editorStore';
import { usePlaybackEngine } from '../../core/playback/usePlaybackEngine';
import { TextOverlayRenderer } from './TextOverlayRenderer';
import { HiddenAudioPlayer } from './HiddenAudioPlayer';

export function EditorCanvas() {
  const project = useEditorStore(state => state.project);
  const currentTime = useEditorStore(state => state.currentTime);
  const { isPlaying, visibleVideoItem, visibleAudioItems } = usePlaybackEngine();
  
  const player = useVideoPlayer(visibleVideoItem?.uri || null, player => {
    player.muted = true;
  });

  const aspectRatio = project?.canvas?.aspectRatio || '9:16';
  const [ratioW, ratioH] = aspectRatio.split(':').map(Number);
  const ratio = ratioW / ratioH;

  const screenWidth = Dimensions.get('window').width;
  const padding = theme.spacing.md * 2;
  const availableWidth = screenWidth - padding;
  
  const canvasWidth = availableWidth;
  const canvasHeight = availableWidth / ratio;

  // Play/pause and initial sync when playback starts
  useEffect(() => {
    if (!player) return;
    
    if (isPlaying) {
      if (visibleVideoItem) {
        const stateTime = useEditorStore.getState().currentTime;
        const relativeTime = stateTime - visibleVideoItem.startTime;
        player.currentTime = Math.max(0, relativeTime) / 1000;
      }
      player.play();
    } else {
      player.pause();
    }
  }, [isPlaying, player, visibleVideoItem]);

  // Scrubbing/Seeking sync (only when paused)
  useEffect(() => {
    if (!isPlaying && visibleVideoItem && player) {
      const relativeTime = currentTime - visibleVideoItem.startTime;
      player.currentTime = Math.max(0, relativeTime) / 1000;
    }
  }, [currentTime, isPlaying, visibleVideoItem, player]);

  return (
    <View style={styles.container}>
      <View style={[styles.canvasBox, { width: canvasWidth, height: canvasHeight }]}>
        {visibleVideoItem ? (
          visibleVideoItem.uri.toLowerCase().endsWith('.gif') ? (
            <Image 
              source={{ uri: visibleVideoItem.uri }} 
              style={StyleSheet.absoluteFill} 
              resizeMode="contain" 
            />
          ) : (
            <VideoView
              player={player}
              style={StyleSheet.absoluteFill}
              contentFit="contain"
            />
          )
        ) : (
          <Text style={styles.placeholder}>No Video</Text>
        )}
        
        <TextOverlayRenderer canvasWidth={canvasWidth} canvasHeight={canvasHeight} />
        
        {visibleAudioItems.map(item => (
          <HiddenAudioPlayer 
            key={item.id} 
            item={item} 
            isPlaying={isPlaying} 
            currentTime={currentTime} 
          />
        ))}
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
