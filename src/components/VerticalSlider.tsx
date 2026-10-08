import React from 'react';
import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';

export const VerticalSlider = ({ value, onValueChange }: { value: number, onValueChange: (v: number) => void }) => {
  const SLIDER_HEIGHT = 150;
  const MIN = 12;
  const MAX = 144;
  
  const getValFromY = (y: number) => {
    'worklet';
    let clampedY = Math.max(0, Math.min(y, SLIDER_HEIGHT));
    let ratio = 1 - (clampedY / SLIDER_HEIGHT);
    return Math.round(MIN + ratio * (MAX - MIN));
  };
  
  const getYFromVal = (val: number) => {
    let ratio = (val - MIN) / (MAX - MIN);
    return (1 - ratio) * SLIDER_HEIGHT;
  };
  
  const pan = Gesture.Pan()
    .onBegin((e) => {
      'worklet';
      runOnJS(onValueChange)(getValFromY(e.y));
    })
    .onUpdate((e) => {
      'worklet';
      runOnJS(onValueChange)(getValFromY(e.y));
    });

  return (
    <GestureDetector gesture={pan}>
      <View style={{ width: 40, height: SLIDER_HEIGHT, justifyContent: 'center', alignItems: 'center' }}>
         <View style={{ width: 4, height: SLIDER_HEIGHT, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 2 }} />
         <View style={{ 
           position: 'absolute', 
           top: getYFromVal(value) - 10, 
           width: 20, 
           height: 20, 
           borderRadius: 10, 
           backgroundColor: '#FFF', 
           elevation: 5, 
           shadowColor: '#000', 
           shadowOpacity: 0.3, 
           shadowRadius: 4,
           shadowOffset: { width: 0, height: 2 } 
         }} />
      </View>
    </GestureDetector>
  );
};
