import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, runOnJS, withSpring } from 'react-native-reanimated';
import { theme } from '../../core/theme';
import { TrackItem } from '../../core/models/Project';
import { useEditorStore } from '../../core/store/editorStore';
import { PIXELS_PER_SECOND } from './constants';

interface TrackItemViewProps {
  trackId: string;
  item: TrackItem;
}

export function TrackItemView({ trackId, item }: TrackItemViewProps) {
  const updateItem = useEditorStore(state => state.updateItem);
  const selectItem = useEditorStore(state => state.selectItem);
  const selectedItemId = useEditorStore(state => state.selectedItemId);
  
  const isSelected = selectedItemId === item.id;
  
  // Calculate initial position based on ms
  const initialLeft = (item.startTime / 1000) * PIXELS_PER_SECOND;
  const baseWidth = (item.duration / 1000) * PIXELS_PER_SECOND;

  const translateX = useSharedValue(0);
  const resizeWidth = useSharedValue(0);
  const isDragging = useSharedValue(false);

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      isDragging.value = true;
      runOnJS(selectItem)(item.id);
    })
    .onUpdate((e) => {
      translateX.value = e.translationX;
    })
    .onEnd(() => {
      isDragging.value = false;
      const msDelta = (translateX.value / PIXELS_PER_SECOND) * 1000;
      const newStartTime = Math.max(0, item.startTime + msDelta);
      runOnJS(updateItem)(trackId, item.id, { startTime: newStartTime });
      translateX.value = withSpring(0);
    });

  const resizeGesture = Gesture.Pan()
    .onBegin(() => {
      runOnJS(selectItem)(item.id);
    })
    .onUpdate((e) => {
      resizeWidth.value = e.translationX;
    })
    .onEnd(() => {
      const msDelta = (resizeWidth.value / PIXELS_PER_SECOND) * 1000;
      const newDuration = Math.max(500, item.duration + msDelta); // min 0.5s
      runOnJS(updateItem)(trackId, item.id, { duration: newDuration });
      resizeWidth.value = 0;
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
      width: Math.max(20, baseWidth + resizeWidth.value),
      zIndex: isDragging.value ? 10 : 1,
      opacity: isDragging.value ? 0.8 : 1,
    };
  });

  const getBackgroundColor = () => {
    switch (item.type) {
      case 'video': return '#3B82F6'; // Blue
      case 'audio': return '#10B981'; // Green
      case 'text': return '#F59E0B'; // Yellow
      default: return theme.colors.primary;
    }
  };

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View 
        style={[
          styles.container, 
          animatedStyle, 
          { 
            left: initialLeft, 
            backgroundColor: getBackgroundColor(),
            borderColor: isSelected ? '#FFF' : 'transparent',
            borderWidth: isSelected ? 2 : 0,
          }
        ]}
      >
        <Text style={styles.label} numberOfLines={1}>{item.type}</Text>
        
        {isSelected && (
          <GestureDetector gesture={resizeGesture}>
            <View style={styles.rightHandle} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} />
          </GestureDetector>
        )}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    height: '100%',
    borderRadius: theme.radius.sm,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xs,
  },
  label: {
    color: '#FFF',
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
  },
  rightHandle: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 12,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderTopRightRadius: theme.radius.sm,
    borderBottomRightRadius: theme.radius.sm,
  }
});
