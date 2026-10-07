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
  const setPlayhead = useEditorStore(state => state.setPlayhead);
  const triggerFocusInput = useEditorStore(state => state.triggerFocusInput);
  
  const isSelected = selectedItemId === item.id;
  
  // Calculate initial position based on ms
  const initialLeft = (item.startTime / 1000) * PIXELS_PER_SECOND;
  const baseWidth = (item.duration / 1000) * PIXELS_PER_SECOND;

  const positionX = useSharedValue(initialLeft);
  const animatedWidth = useSharedValue(baseWidth);
  const isDragging = useSharedValue(false);

  React.useEffect(() => {
    positionX.value = initialLeft;
  }, [initialLeft]);

  React.useEffect(() => {
    animatedWidth.value = baseWidth;
  }, [baseWidth]);

  const panGesture = Gesture.Pan()
    .onBegin((e) => {
      isDragging.value = true;
      runOnJS(selectItem)(item.id);
      
      const timeMs = item.startTime + (e.x / PIXELS_PER_SECOND) * 1000;
      runOnJS(setPlayhead)(timeMs);
    })
    .onUpdate((e) => {
      positionX.value = initialLeft + e.translationX;
    })
    .onEnd((e) => {
      isDragging.value = false;
      const msDelta = (e.translationX / PIXELS_PER_SECOND) * 1000;
      const newStartTime = Math.max(0, item.startTime + msDelta);
      runOnJS(updateItem)(trackId, item.id, { startTime: newStartTime });
    });

  const tapGesture = Gesture.Tap()
    .maxDuration(250)
    .onEnd(() => {
      if (item.type === 'text') {
        runOnJS(triggerFocusInput)();
      }
    });

  const resizeGesture = Gesture.Pan()
    .onBegin(() => {
      runOnJS(selectItem)(item.id);
    })
    .onUpdate((e) => {
      animatedWidth.value = Math.max(20, baseWidth + e.translationX);
    })
    .onEnd((e) => {
      const msDelta = (e.translationX / PIXELS_PER_SECOND) * 1000;
      const newDuration = Math.max(500, item.duration + msDelta); // min 0.5s
      runOnJS(updateItem)(trackId, item.id, { duration: newDuration });
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      left: positionX.value,
      width: animatedWidth.value,
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

  const composedGesture = Gesture.Simultaneous(panGesture, tapGesture);

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View 
        style={[
          styles.container, 
          animatedStyle, 
          { 
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
