import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { AudioItem } from '../../core/models/Project';
import { useEditorStore } from '../../core/store/editorStore';

interface HiddenAudioPlayerProps {
  item: AudioItem;
  isPlaying: boolean;
  currentTime: number;
}

export function HiddenAudioPlayer({ item, isPlaying, currentTime }: HiddenAudioPlayerProps) {
  const player = useVideoPlayer(item.uri, p => {
    p.volume = item.volume ?? 1;
  });

  // Play/pause and initial sync when playback starts
  useEffect(() => {
    if (!player) return;
    
    if (isPlaying) {
      const stateTime = useEditorStore.getState().currentTime;
      const relativeTime = stateTime - item.startTime;
      player.currentTime = Math.max(0, relativeTime) / 1000;
      player.play();
    } else {
      player.pause();
    }
  }, [isPlaying, player, item.startTime]);

  // Scrubbing/Seeking sync (only when paused)
  useEffect(() => {
    if (!isPlaying && player) {
      const relativeTime = currentTime - item.startTime;
      player.currentTime = Math.max(0, relativeTime) / 1000;
    }
  }, [currentTime, isPlaying, item.startTime, player]);

  // Mount a hidden VideoView to ensure the native player instance is fully active
  return (
    <View style={styles.hidden}>
      <VideoView player={player} style={styles.hidden} />
    </View>
  );
}

const styles = StyleSheet.create({
  hidden: {
    position: 'absolute',
    width: 0,
    height: 0,
    opacity: 0,
  }
});
