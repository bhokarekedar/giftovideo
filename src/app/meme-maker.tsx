import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { theme } from '../core/theme';
import { MediaAssetService } from '../core/media/MediaAssetService';

const { width } = Dimensions.get('window');
const CANVAS_WIDTH = width * 0.55; // 55% of screen width
const CANVAS_HEIGHT = CANVAS_WIDTH * (16 / 9);

export default function MemeMakerScreen() {
  const router = useRouter();
  const [gifUri, setGifUri] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(5);
  const [background, setBackground] = useState<'blur' | 'solid'>('blur');
  const [memeText, setMemeText] = useState<string>('');

  // Gesture State
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = savedScale.value * e.scale;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = savedTranslateX.value + e.translationX;
      translateY.value = savedTranslateY.value + e.translationY;
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const composedGesture = Gesture.Simultaneous(pinchGesture, panGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value }
    ]
  }));

  // Automatically open picker when screen mounts if no GIF is selected
  useEffect(() => {
    if (!gifUri) {
      handlePickGif();
    }
  }, []);

  const handlePickGif = async () => {
    const media = await MediaAssetService.pickVideoAsset();
    if (media) {
      setGifUri(media.uri);
    } else if (!gifUri) {
      // If they cancelled and have no gif, go back
      router.back();
    }
  };

  if (!gifUri) {
    // Blank state while picker is open
    return <View style={styles.container} />;
  }

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Format GIF',
          headerStyle: { backgroundColor: '#0F172A' },
          headerTintColor: '#F8FAFC',
          headerShadowVisible: false,
          headerRight: () => (
            <TouchableOpacity style={styles.navSaveBtn}>
              <Text style={styles.navSaveBtnText}>Save</Text>
            </TouchableOpacity>
          )
        }} 
      />
      
      <View style={styles.content}>
        {/* 1. The 9:16 Canvas Preview */}
        <View style={styles.canvasContainer}>
          <View style={styles.canvas}>
            {/* Background Layer */}
            {background === 'blur' ? (
              <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: '#0F172A', overflow: 'hidden' }}>
                {/* Massive scale creates a moving ambient light gradient from the GIF */}
                <Image 
                  source={{ uri: gifUri }} 
                  style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, width: '100%', height: '100%', opacity: 0.35, transform: [{ scale: 12 }] }} 
                  resizeMode="cover" 
                />
              </View>
            ) : (
              <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: '#0F172A' }} />
            )}
            
            {/* Foreground Layer (Transformable GIF) */}
            <GestureDetector gesture={composedGesture}>
              <Animated.Image 
                source={{ uri: gifUri }} 
                style={[
                  { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, width: '100%', height: '100%' }, 
                  animatedStyle
                ]} 
                resizeMode="contain" 
              />
            </GestureDetector>

            {/* Meme Text Overlay */}
            {memeText ? (
              <Text style={styles.memeTextPreview}>{memeText}</Text>
            ) : null}
          </View>
        </View>

        {/* 2. Quick Toggles */}
        <View style={styles.controlsContainer}>
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>Loop Duration</Text>
            <View style={styles.toggleGroup}>
              {[5, 10, 15].map(val => (
                <TouchableOpacity 
                  key={val}
                  style={[styles.toggleBtn, duration === val && styles.toggleBtnActive]}
                  onPress={() => setDuration(val)}
                >
                  <Text style={[styles.toggleText, duration === val && styles.toggleTextActive]}>
                    {val}s
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>Background</Text>
            <View style={styles.toggleGroup}>
              {['blur', 'solid'].map(type => (
                <TouchableOpacity 
                  key={type}
                  style={[styles.toggleBtn, background === type && styles.toggleBtnActive]}
                  onPress={() => setBackground(type as 'blur' | 'solid')}
                >
                  <Text style={[styles.toggleText, background === type && styles.toggleTextActive]}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 3. Add Caption Button */}
          <TouchableOpacity 
            style={styles.actionBtn}
            onPress={() => setMemeText('Sample Meme Text')} // Placeholder for text input
          >
            <Text style={styles.actionBtnText}>📝 Add Meme Text</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  canvasContainer: {
    flex: 1, // Let it fill available vertical space
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm, // Reduced padding
    paddingHorizontal: theme.spacing.sm,
    width: '100%',
  },
  canvas: {
    flex: 1,
    aspectRatio: 9 / 16, // Automatically maintains 9:16
    backgroundColor: '#1E293B',
    borderRadius: theme.radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    overflow: 'hidden',
  },
  canvasPlaceholderText: {
    color: '#64748B',
  },
  memeTextPreview: {
    position: 'absolute',
    top: '15%',
    width: '90%',
    color: '#FFF',
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  controlsContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.xl, // Keep it above system buttons
    gap: theme.spacing.md,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  controlLabel: {
    color: '#94A3B8',
    fontSize: theme.typography.sizes.sm,
    fontWeight: '600',
  },
  toggleGroup: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: theme.radius.sm,
    padding: 4,
  },
  toggleBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: theme.radius.sm,
  },
  toggleBtnActive: {
    backgroundColor: '#334155',
  },
  toggleText: {
    color: '#64748B',
    fontSize: theme.typography.sizes.sm,
    fontWeight: '600',
  },
  toggleTextActive: {
    color: '#F8FAFC',
  },
  actionBtn: {
    backgroundColor: '#1E293B',
    paddingVertical: 14,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  actionBtnText: {
    color: '#F8FAFC',
    fontSize: theme.typography.sizes.md,
    fontWeight: 'bold',
  },
  navSaveBtn: {
    backgroundColor: '#38BDF8',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 100,
  },
  navSaveBtnText: {
    color: '#0F172A',
    fontWeight: 'bold',
    fontSize: theme.typography.sizes.sm,
  }
});
