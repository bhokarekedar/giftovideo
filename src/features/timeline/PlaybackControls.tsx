import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../core/theme';
import { usePlaybackEngine } from '../../core/playback/usePlaybackEngine';
import { useEditorStore } from '../../core/store/editorStore';

export function PlaybackControls() {
  const { isPlaying, setIsPlaying } = usePlaybackEngine();
  const setPlayhead = useEditorStore(state => state.setPlayhead);

  const handleRewind = () => {
    setIsPlaying(false);
    setPlayhead(0);
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={handleRewind}>
        <Ionicons name="play-back" size={24} color={theme.colors.text} />
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.playButton} onPress={togglePlayback}>
        <Ionicons name={isPlaying ? "pause" : "play"} size={28} color={theme.colors.background} />
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.button} onPress={() => {}}>
        <Ionicons name="play-forward" size={24} color={theme.colors.border} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.sm,
    gap: theme.spacing.lg,
  },
  button: {
    padding: theme.spacing.sm,
  },
  playButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 4,
  }
});
