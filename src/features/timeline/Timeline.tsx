import React from 'react';
import { View, StyleSheet, ScrollView, Text, Dimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { theme } from '../../core/theme';
import { useEditorStore } from '../../core/store/editorStore';
import { TrackLane } from './TrackLane';
import { Playhead } from './Playhead';
import { PIXELS_PER_SECOND } from './constants';

const screenWidth = Dimensions.get('window').width;

export function Timeline() {
  const project = useEditorStore(state => state.project);
  const setPlayhead = useEditorStore(state => state.setPlayhead);
  
  // Use a boolean selector to avoid 60fps re-renders during playback
  const isAtStart = useEditorStore(state => state.currentTime === 0);
  const scrollViewRef = React.useRef<ScrollView>(null);

  React.useEffect(() => {
    if (isAtStart) {
      scrollViewRef.current?.scrollTo({ x: 0, animated: true });
    }
  }, [isAtStart]);

  if (!project) return null;

  const hasItems = project.timeline.tracks.some(track => track.items.length > 0);
  
  let maxDuration = 0;
  if (hasItems) {
    const allItems = project.timeline.tracks.flatMap(t => t.items);
    maxDuration = Math.max(...allItems.map(i => i.startTime + i.duration));
  }

  // Ensure scrollable area is at least screen width, plus 200px padding after max duration
  const contentWidth = Math.max(screenWidth, (maxDuration / 1000) * PIXELS_PER_SECOND + 200);

  const tapGesture = Gesture.Tap()
    .onEnd((e) => {
      if (hasItems) {
        const timeMs = (e.x / PIXELS_PER_SECOND) * 1000;
        runOnJS(setPlayhead)(Math.max(0, timeMs));
      }
    });

  return (
    <View style={styles.container}>
      <ScrollView ref={scrollViewRef} horizontal bounces={false} contentContainerStyle={styles.scrollContent}>
        <GestureDetector gesture={tapGesture}>
          <View style={[styles.tapWrapper, { width: contentWidth }]}>
            <ScrollView vertical bounces={true} style={styles.verticalScroll} contentContainerStyle={styles.verticalScrollContent}>
              <View style={styles.tracksContainer}>
                {project.timeline.tracks.map((track) => (
                  <TrackLane key={track.id} track={track} />
                ))}
                {!hasItems && (
                  <Text style={styles.emptyText}>Add media to start editing</Text>
                )}
              </View>
            </ScrollView>
            {hasItems && <Playhead />}
          </View>
        </GestureDetector>
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
  tapWrapper: {
    flex: 1,
  },
  verticalScroll: {
    flex: 1,
  },
  verticalScrollContent: {
    flexGrow: 1,
    paddingBottom: 24, // Extra padding at the bottom so last track isn't cramped
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
