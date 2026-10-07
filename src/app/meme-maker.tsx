import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../core/theme';
import { Button } from '../components/Button';
import { MediaAssetService } from '../core/media/MediaAssetService';

export default function MemeMakerScreen() {
  const router = useRouter();
  const [gifUri, setGifUri] = useState<string | null>(null);

  const handlePickGif = async () => {
    // In a real app we might restrict to GIFs specifically, but for now we'll allow video/image
    const media = await MediaAssetService.pickVideoAsset();
    if (media) {
      setGifUri(media.uri);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Meme Maker</Text>
        <View style={{ width: 60 }} />
      </View>
      
      <View style={styles.content}>
        {!gifUri ? (
          <View style={styles.emptyState}>
            <Text style={styles.emoji}>🖼️</Text>
            <Text style={styles.emptyTitle}>Upload a GIF</Text>
            <Text style={styles.emptyDesc}>Choose a GIF from your camera roll to get started.</Text>
            <Button title="Pick a GIF" onPress={handlePickGif} variant="primary" />
          </View>
        ) : (
          <View style={styles.editor}>
            <View style={styles.canvasPlaceholder}>
              <Text style={styles.canvasText}>GIF Preview ({gifUri.split('/').pop()})</Text>
            </View>
            <View style={styles.controls}>
              <Text style={styles.controlText}>1. Loop Duration: [Slider]</Text>
              <Text style={styles.controlText}>2. Add Meme Text: [Button]</Text>
              <Text style={styles.controlText}>3. Add Audio: [Button]</Text>
              <Button title="Export Reel" onPress={() => {}} variant="primary" />
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: theme.spacing.sm,
    width: 60,
  },
  backButtonText: {
    color: theme.colors.primary,
    fontSize: theme.typography.sizes.md,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
  },
  content: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emoji: {
    fontSize: 64,
    marginBottom: theme.spacing.md,
  },
  emptyTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    marginBottom: theme.spacing.sm,
  },
  emptyDesc: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.md,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  editor: {
    flex: 1,
    padding: theme.spacing.md,
  },
  canvasPlaceholder: {
    flex: 1,
    backgroundColor: '#000',
    borderRadius: theme.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  canvasText: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    padding: theme.spacing.md,
  },
  controls: {
    gap: theme.spacing.md,
  },
  controlText: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.md,
  }
});
