import React from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { theme } from '../../core/theme';
import { useEditorStore } from '../../core/store/editorStore';
import { TrackLane } from './TrackLane';
import { Playhead } from './Playhead';

export const PIXELS_PER_SECOND = 50;

export function Timeline() {
  const project = useEditorStore(state => state.project);

  if (!project) return null;

  return (
    <View style={styles.container}>
      <ScrollView horizontal bounces={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.tracksContainer}>
          {project.timeline.tracks.map((track) => (
            <TrackLane key={track.id} track={track} />
          ))}
          {project.timeline.tracks.length === 0 && (
            <Text style={styles.emptyText}>Add media to start editing</Text>
          )}
        </View>
        <Playhead />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: theme.colors.surface,
  },
  scrollContent: {
    minWidth: '100%',
    paddingVertical: theme.spacing.md,
  },
  tracksContainer: {
    flex: 1,
    gap: theme.spacing.sm,
  },
  emptyText: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.xl,
  }
});
