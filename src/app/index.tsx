import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { theme } from '../core/theme';

export default function HomeScreen() {
  const router = useRouter();

  const handleStart = () => {
    router.push('/meme-maker');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>GifToVideo</Text>
        <Text style={styles.subtitle}>The fastest way to turn GIFs into Social Reels</Text>
        
        <View style={styles.cardsContainer}>
          <TouchableOpacity 
            style={[styles.card, styles.featuredCard]} 
            activeOpacity={0.8}
            onPress={handleStart}
          >
            <View style={styles.cardIconPlaceholder}>
              <Text style={styles.cardIconText}>🚀</Text>
            </View>
            <Text style={styles.cardTitle}>GIF to Reel / Meme Maker</Text>
            <Text style={styles.cardDescription}>
              Upload a GIF, set looping duration, add text & audio, and export to social media in 5 seconds. Entirely offline.
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
    justifyContent: 'center',
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.xxl,
    fontWeight: theme.typography.weights.bold,
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.md,
    marginBottom: 40,
    textAlign: 'center',
  },
  cardsContainer: {
    gap: theme.spacing.lg,
  },
  card: {
    borderRadius: theme.radius.md,
    padding: theme.spacing.xl,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  featuredCard: {
    backgroundColor: '#064E3B', // Deep emerald green
    borderColor: '#059669',
    shadowColor: '#059669',
  },
  cardIconPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  cardIconText: {
    fontSize: 24,
  },
  cardTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    marginBottom: theme.spacing.sm,
  },
  cardDescription: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: theme.typography.sizes.sm,
    lineHeight: 20,
  }
});
