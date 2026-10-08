import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../core/theme';

const { width } = Dimensions.get('window');

const SAMPLE_IMAGE_URL = 'https://picsum.photos/seed/meme/400/400';

export default function HomeScreen() {
  const router = useRouter();

  const handleStart = () => {
    router.push('/meme-maker');
  };

  const handleSample = (presetId: string) => {
    router.push({ pathname: '/meme-maker', params: { templateId: presetId } });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* 1. Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>GIF to Reel</Text>
        <TouchableOpacity style={styles.headerIcon}>
          <Ionicons name="settings-outline" size={24} color="#64748B" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. Interactive Preview Card */}
        <View style={styles.previewCard}>
          {/* Left: Raw Image */}
          <View style={styles.demoRawContainer}>
            <Image
              source={{ uri: SAMPLE_IMAGE_URL }}
              style={styles.demoRawImage}
            />
            <Text style={styles.demoLabelText}>Raw GIF</Text>
          </View>

          <Ionicons name="arrow-forward" size={24} color="#64748B" style={styles.demoArrow} />

          {/* Right: Finished Reel */}
          <View style={styles.demoFinishedContainer}>
            {/* Blurred background representation */}
            <Image
              source={{ uri: SAMPLE_IMAGE_URL }}
              style={styles.demoFinishedBg}
              blurRadius={10}
            />
            {/* Overlay darker tint */}
            <View style={styles.demoFinishedOverlay} />

            <Text style={styles.demoTextTop}>Monday Morning</Text>

            <Image
              source={{ uri: SAMPLE_IMAGE_URL }}
              style={styles.demoFinishedImage}
            />
          </View>
        </View>

        {/* 3. Feature Badges */}
        <View style={styles.featuresContainer}>
          <View style={styles.featureBadge}>
            <Ionicons name="crop" size={14} color="#38BDF8" style={styles.featureIcon} />
            <Text style={styles.featureText}>9:16 Auto-Fit</Text>
          </View>
          <View style={styles.featureBadge}>
            <Ionicons name="sparkles" size={14} color="#38BDF8" style={styles.featureIcon} />
            <Text style={styles.featureText}>Zero Quality Loss</Text>
          </View>
          <View style={styles.featureBadge}>
            <Ionicons name="hardware-chip" size={14} color="#38BDF8" style={styles.featureIcon} />
            <Text style={styles.featureText}>Offline Engine</Text>
          </View>
        </View>

        {/* 4. Recent / Samples Tray */}
        <View style={styles.samplesContainer}>
          <Text style={styles.samplesTitle}>Tap to Try (Templates)</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.samplesScroll}
          >
            <TouchableOpacity
              style={styles.sampleCard}
              activeOpacity={0.7}
              onPress={() => handleSample("st0")}
            >
              <Image source={{ uri: 'https://picsum.photos/seed/longtext/200/300' }} style={styles.sampleCardImage} />
              <View style={styles.sampleCardOverlay}>
                <Text style={styles.sampleCardText}>Long Text</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sampleCard}
              activeOpacity={0.7}
              onPress={() => handleSample("st4")}
            >
              <Image source={{ uri: 'https://picsum.photos/seed/wait/200/300' }} style={styles.sampleCardImage} />
              <View style={styles.sampleCardOverlay}>
                <Text style={styles.sampleCardText}>Wait for it</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sampleCard}
              activeOpacity={0.7}
              onPress={() => handleSample("st7")}
            >
              <Image source={{ uri: 'https://picsum.photos/seed/me/200/300' }} style={styles.sampleCardImage} />
              <View style={styles.sampleCardOverlay}>
                <Text style={styles.sampleCardText}>"Literally me"</Text>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </ScrollView>

      {/* 5. Sticky Bottom Action */}
      <View style={styles.ctaContainer}>
        <TouchableOpacity
          style={styles.mainButton}
          activeOpacity={0.8}
          onPress={handleStart}
        >
          <Ionicons name="add-circle" size={28} color="#0F172A" style={styles.mainButtonIcon} />
          <Text style={styles.mainButtonText}>Choose GIF / Image</Text>
        </TouchableOpacity>
        <SafeAreaView edges={['bottom']} style={{ width: '100%' }}>
          <Text style={styles.microText}>Auto-formats and loops perfectly.</Text>
        </SafeAreaView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A', // Deep slate dark mode
  },
  scrollContent: {
    paddingBottom: 120, // space for sticky footer
  },

  // 1. Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  headerTitle: {
    color: '#F8FAFC',
    fontSize: theme.typography.sizes.xl,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  headerIcon: {
    padding: 8,
    backgroundColor: '#1E293B',
    borderRadius: theme.radius.full,
  },

  // 2. Interactive Preview Card
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: 24,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  demoRawContainer: {
    alignItems: 'center',
  },
  demoRawImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#334155',
  },
  demoLabelText: {
    color: '#94A3B8',
    fontSize: 10,
    marginTop: 8,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  demoArrow: {
    marginHorizontal: 16,
    marginBottom: 20, // offset label height
  },
  demoFinishedContainer: {
    width: 90,
    height: 160, // 9:16 aspect ratio
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#38BDF8', // highlight
  },
  demoFinishedBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  demoFinishedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)', // darken background
  },
  demoFinishedImage: {
    width: '100%',
    height: 90,
    resizeMode: 'cover',
  },
  demoTextTop: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    textAlign: 'center',
    textTransform: 'uppercase',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    position: 'absolute',
    top: 12,
    zIndex: 2,
    width: '90%',
  },

  // 3. Feature Badges
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
    paddingHorizontal: theme.spacing.lg,
  },
  featureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.2)',
  },
  featureIcon: {
    marginRight: 6,
  },
  featureText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '600',
  },

  // 4. Samples Tray
  samplesContainer: {
    marginTop: 40,
    marginBottom: theme.spacing.xl,
  },
  samplesTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: 'bold',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: 16,
  },
  samplesScroll: {
    paddingHorizontal: theme.spacing.lg,
    gap: 16,
  },
  sampleCard: {
    width: width * 0.28,
    height: (width * 0.28) * (16 / 9),
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#334155',
  },
  sampleCardImage: {
    width: '100%',
    height: '100%',
  },
  sampleCardOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
    padding: 8,
  },
  sampleCardText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // 5. Sticky Bottom Action
  ctaContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    backgroundColor: 'rgba(15, 23, 42, 0.9)', // Deep slate with opacity
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  mainButton: {
    backgroundColor: '#38BDF8', // Vivid Sky Blue
    width: '100%',
    paddingVertical: 18,
    borderRadius: 100, // Pill shape
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 12,
  },
  mainButtonIcon: {
    marginRight: 12,
  },
  mainButtonText: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  microText: {
    color: '#64748B',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 12,
  }
});
