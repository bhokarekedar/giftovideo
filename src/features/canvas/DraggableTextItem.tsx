import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, runOnJS } from 'react-native-reanimated';
import { TextItem } from '../../core/models/Project';
import { useEditorStore } from '../../core/store/editorStore';

interface DraggableTextItemProps {
  trackId: string;
  item: TextItem;
  canvasWidth: number;
  canvasHeight: number;
}

export function DraggableTextItem({ trackId, item, canvasWidth, canvasHeight }: DraggableTextItemProps) {
  const updateItem = useEditorStore(state => state.updateItem);
  const selectItem = useEditorStore(state => state.selectItem);
  const selectedItemId = useEditorStore(state => state.selectedItemId);

  const triggerFocusInput = useEditorStore(state => state.triggerFocusInput);

  const isSelected = selectedItemId === item.id;

  // Convert normalized position to absolute pixels
  const initialX = item.position.x * canvasWidth;
  const initialY = item.position.y * canvasHeight;

  const translateX = useSharedValue(initialX);
  const translateY = useSharedValue(initialY);
  const scale = useSharedValue(item.scale);
  const savedScale = useSharedValue(item.scale);

  // Gesture handling
  const panGesture = Gesture.Pan()
    .onBegin(() => {
      runOnJS(selectItem)(item.id);
    })
    .onUpdate((e) => {
      translateX.value = initialX + e.translationX;
      translateY.value = initialY + e.translationY;
    })
    .onEnd(() => {
      const normX = translateX.value / canvasWidth;
      const normY = translateY.value / canvasHeight;
      runOnJS(updateItem)(trackId, item.id, { position: { x: normX, y: normY } });
    });

  const pinchGesture = Gesture.Pinch()
    .onBegin(() => {
      runOnJS(selectItem)(item.id);
    })
    .onUpdate((e) => {
      scale.value = savedScale.value * e.scale;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      runOnJS(updateItem)(trackId, item.id, { scale: scale.value });
    });

  const tapGesture = Gesture.Tap()
    .maxDuration(250)
    .onEnd(() => {
      runOnJS(selectItem)(item.id);
      runOnJS(triggerFocusInput)();
    });

  const composedGesture = Gesture.Simultaneous(panGesture, pinchGesture, tapGesture);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value }
      ],
    };
  });

  return (
    <GestureDetector gesture={composedGesture}>
      <Animated.View style={[styles.container, animatedStyle, isSelected && styles.selected]}>
        <Text style={{
          color: item.color,
          fontSize: item.fontSize,
          fontWeight: item.fontWeight as any,
          textAlign: item.alignment,
        }}>
          {item.text}
        </Text>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    padding: 8,
  },
  selected: {
    borderColor: '#7C3AED',
    borderWidth: 2,
    borderStyle: 'dashed',
  }
});
