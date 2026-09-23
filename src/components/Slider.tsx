import React, { useState } from 'react';
import { View, StyleSheet, LayoutChangeEvent, DimensionValue } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  runOnJS 
} from 'react-native-reanimated';
import { theme } from '../core/theme';

interface SliderProps {
  value: number; // 0 to 1
  onValueChange?: (value: number) => void;
  onSlidingComplete?: (value: number) => void;
  width?: DimensionValue;
}

export function Slider({ value, onValueChange, onSlidingComplete, width = '100%' }: SliderProps) {
  const [trackWidth, setTrackWidth] = useState(0);
  const progress = useSharedValue(value);
  const isScrubbing = useSharedValue(false);

  // Update shared value if external value changes (and we're not scrubbing)
  React.useEffect(() => {
    if (!isScrubbing.value) {
      progress.value = withTiming(value, { duration: 100 });
    }
  }, [value, isScrubbing, progress]);

  const onLayout = (e: LayoutChangeEvent) => {
    setTrackWidth(e.nativeEvent.layout.width);
  };

  const handleValueChange = (val: number) => {
    if (onValueChange) onValueChange(val);
  };

  const handleSlidingComplete = (val: number) => {
    if (onSlidingComplete) onSlidingComplete(val);
  };

  const panGesture = Gesture.Pan()
    .onBegin((e) => {
      isScrubbing.value = true;
      if (trackWidth > 0) {
        const newValue = Math.max(0, Math.min(1, e.x / trackWidth));
        progress.value = newValue;
        runOnJS(handleValueChange)(newValue);
      }
    })
    .onUpdate((e) => {
      if (trackWidth > 0) {
        const newValue = Math.max(0, Math.min(1, e.x / trackWidth));
        progress.value = newValue;
        runOnJS(handleValueChange)(newValue);
      }
    })
    .onEnd(() => {
      isScrubbing.value = false;
      runOnJS(handleSlidingComplete)(progress.value);
    })
    .onFinalize(() => {
      isScrubbing.value = false;
    });

  const animatedIndicatorStyle = useAnimatedStyle(() => {
    return {
      left: `${progress.value * 100}%`,
    };
  });

  const animatedFillStyle = useAnimatedStyle(() => {
    return {
      width: `${progress.value * 100}%`,
    };
  });

  return (
    <GestureDetector gesture={panGesture}>
      <View style={[styles.container, { width }]} onLayout={onLayout}>
        <View style={styles.track}>
          <Animated.View style={[styles.fill, animatedFillStyle]} />
        </View>
        <Animated.View style={[styles.thumb, animatedIndicatorStyle]} />
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 40, // Generous touch target
    justifyContent: 'center',
    position: 'relative',
  },
  track: {
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
  },
  thumb: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.primary,
    top: 12,
    transform: [{ translateX: -8 }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
