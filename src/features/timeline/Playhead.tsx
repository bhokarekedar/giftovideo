import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { theme } from '../../core/theme';
import { useEditorStore } from '../../core/store/editorStore';
import { PIXELS_PER_SECOND } from './Timeline';

export function Playhead() {
  const currentTime = useEditorStore(state => state.currentTime);

  const animatedStyle = useAnimatedStyle(() => {
    const leftPos = (currentTime / 1000) * PIXELS_PER_SECOND;
    return {
      left: withTiming(leftPos, { duration: 100 }),
    };
  });

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View style={styles.head} />
      <View style={styles.line} />
    </Animated.View>
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
