import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { theme } from '../core/theme';

export default function HomeScreen() {
  const router = useRouter();

  const handleBlankVideo = () => {
    router.push('/editor/new_project_' + Date.now());
  };

  const handleImageTextToVideo = () => {
    Alert.alert(
      "Coming Soon", 
      "The Image-Text to Video AI feature is under development."
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to GifToVideo</Text>
        <Text style={styles.subtitle}>What would you like to create today?</Text>
        
        <View style={styles.cardsContainer}>
          <TouchableOpacity 
            style={[styles.card, styles.featuredCard]} 
            activeOpacity={0.8}
            onPress={handleBlankVideo} // We can route this to a specialized flow later
          >
            <View style={[styles.cardIconPlaceholder, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Text style={styles.cardIconText}>🚀</Text>
            </View>
            <Text style={styles.cardTitle}>GIF to Reel / Meme Maker</Text>
            <Text style={styles.cardDescription}>
              Upload a GIF, set looping duration, add text & audio, and export to social media in 5 seconds. Entirely offline.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.card, styles.primaryCard]} 
            activeOpacity={0.8}
            onPress={handleBlankVideo}
          >
            <View style={styles.cardIconPlaceholder}>
              <Text style={styles.cardIconText}>🎬</Text>
            </View>
            <Text style={styles.cardTitle}>Advanced Video Editor</Text>
            <Text style={styles.cardDescription}>
              Start from scratch with our powerful timeline editor. Add videos, audio, and text.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.card, styles.secondaryCard]} 
            activeOpacity={0.8}
            onPress={handleImageTextToVideo}
          >
            <View style={styles.cardIconPlaceholder}>
              <Text style={styles.cardIconText}>✨</Text>
            </View>
            <Text style={styles.cardTitle}>Image-Text to Video</Text>
            <Text style={styles.cardDescription}>
              Upload an image, we extract text, and automatically generate a stunning video layout.
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
  primaryCard: {
    backgroundColor: '#1E1B4B', // Deep indigo
    borderColor: '#4338CA',
    shadowColor: '#4338CA',
  },
  featuredCard: {
    backgroundColor: '#064E3B', // Deep emerald green
    borderColor: '#059669',
    shadowColor: '#059669',
  },
  secondaryCard: {
    backgroundColor: '#2A1525', // Deep pink/purple
    borderColor: '#BE185D',
    shadowColor: '#BE185D',
  },
  cardIconPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
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
    color: 'rgba(255,255,255,0.7)',
    fontSize: theme.typography.sizes.sm,
    lineHeight: 20,
  }
});
