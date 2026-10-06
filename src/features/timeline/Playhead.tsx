import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withTiming, useSharedValue, runOnJS } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { theme } from '../../core/theme';
import { useEditorStore } from '../../core/store/editorStore';
import { PIXELS_PER_SECOND } from './constants';

export function Playhead() {
  const currentTime = useEditorStore(state => state.currentTime);

  const setPlayhead = useEditorStore(state => state.setPlayhead);
  const isScrubbing = useSharedValue(false);

  const animatedStyle = useAnimatedStyle(() => {
    // Only animate to currentTime if not scrubbing
    const leftPos = (currentTime / 1000) * PIXELS_PER_SECOND;
    return {
      left: withTiming(leftPos, { duration: isScrubbing.value ? 0 : 100 }),
    };
  });

  const startScrubTime = useSharedValue(0);

  const pan = Gesture.Pan()
    .onBegin(() => {
      isScrubbing.value = true;
      startScrubTime.value = useEditorStore.getState().currentTime;
    })
    .onChange((e) => {
      const newTime = Math.max(0, startScrubTime.value + (e.translationX / PIXELS_PER_SECOND) * 1000);
      runOnJS(setPlayhead)(newTime);
    })
    .onFinalize(() => {
      isScrubbing.value = false;
    });

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.container, animatedStyle]}>
        <View style={styles.head} />
        <View style={styles.line} />
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    alignItems: 'center',
    zIndex: 100,
    marginLeft: theme.spacing.md, // offset to match track lane margins
  },
  line: {
    flex: 1,
    width: 2,
    backgroundColor: theme.colors.danger,
  },
  head: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.danger,
    position: 'absolute',
    top: theme.spacing.sm,
  }
});
