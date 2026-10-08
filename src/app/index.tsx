import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { theme } from '../core/theme';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();

  const handleStart = () => {
    router.push('/meme-maker');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 1. The "Show, Don't Tell" Banner (Top) */}
      <View style={styles.bannerContainer}>
        <Text style={styles.bannerTitle}>GIF to Reel</Text>
        <View style={styles.visualDemo}>
          {/* Left: Raw GIF */}
          <View style={styles.demoRaw}>
            <Text style={styles.demoEmoji}>🔲</Text>
            <Text style={styles.demoText}>Raw GIF</Text>
          </View>
          
          <Text style={styles.demoArrow}>→</Text>
          
          {/* Right: Finished Reel */}
          <View style={styles.demoFinished}>
            <Text style={styles.demoTextTop}>Meme Text</Text>
            <Text style={styles.demoEmoji}>🔲</Text>
            <Text style={styles.demoTextBottom}>Blurred BG</Text>
          </View>
        </View>
      </View>

      {/* 2. The Primary Call to Action (Center) */}
      <View style={styles.ctaContainer}>
        <TouchableOpacity 
          style={styles.mainButton} 
          activeOpacity={0.8}
          onPress={handleStart}
        >
          <Text style={styles.mainButtonIcon}>+</Text>
          <Text style={styles.mainButtonText}>Choose GIF / Image</Text>
        </TouchableOpacity>
        <Text style={styles.microText}>Auto-formats to 9:16 and loops perfectly.</Text>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A', // Deep slate dark mode
  },
  
  // Banner Styles
  bannerContainer: {
    paddingTop: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  bannerTitle: {
    color: '#F8FAFC',
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    marginBottom: theme.spacing.lg,
    letterSpacing: 1,
  },
  visualDemo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    width: '100%',
    justifyContent: 'space-between',
  },
  demoRaw: {
    width: 70,
    height: 70,
    backgroundColor: '#334155',
    borderRadius: theme.radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#475569',
  },
  demoArrow: {
    color: '#94A3B8',
    fontSize: 24,
    fontWeight: 'bold',
  },
  demoFinished: {
    width: 70,
    height: 120, // 9:16 aspect ratio representation
    backgroundColor: '#334155',
    borderRadius: theme.radius.sm,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderWidth: 2,
    borderColor: '#38BDF8', // Highlighted to show it's the premium result
  },
  demoEmoji: {
    fontSize: 24,
  },
  demoText: {
    color: '#94A3B8',
    fontSize: 10,
    marginTop: 4,
  },
  demoTextTop: {
    color: '#F8FAFC',
    fontSize: 10,
    fontWeight: 'bold',
  },
  demoTextBottom: {
    color: '#94A3B8',
    fontSize: 8,
  },

  // CTA Styles
  ctaContainer: {
    flex: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  mainButton: {
    backgroundColor: '#38BDF8', // Vivid Sky Blue
    width: '100%',
    paddingVertical: 20,
    borderRadius: 100, // Pill shape
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
    marginBottom: theme.spacing.md,
  },
  mainButtonIcon: {
    color: '#0F172A',
    fontSize: 28,
    fontWeight: 'bold',
    marginRight: 12,
    marginTop: -2,
  },
  mainButtonText: {
    color: '#0F172A',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  microText: {
    color: '#94A3B8',
    fontSize: theme.typography.sizes.sm,
    textAlign: 'center',
  }
});
