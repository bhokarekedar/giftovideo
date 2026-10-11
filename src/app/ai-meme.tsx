import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Image, ScrollView, Dimensions, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown, Layout } from 'react-native-reanimated';
import { AiMemeService } from '../core/services/aiMemeService';
import { GifSearchService, GiphyGif } from '../core/services/gifSearchService';
import { MediaAssetService } from '../core/media/MediaAssetService';
import { theme } from '../core/theme';

const { width } = Dimensions.get('window');

export default function AiMemeScreen() {
  const router = useRouter();
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [results, setResults] = useState<GiphyGif[]>([]);
  const [selectedGif, setSelectedGif] = useState<GiphyGif | null>(null);

  const executeGenerate = async (textToUse: string) => {
    setIsGenerating(true);
    setResults([]);
    setSelectedGif(null);

    try {
      setLoadingStep('Analyzing vibe with LLM...');
      const reaction = await AiMemeService.analyzeTextForReaction(textToUse);

      setLoadingStep('Searching the Giphy archives...');
      
      console.log('--- AI MEME MAKER LOGS ---');
      console.log('LLM Raw Output:', JSON.stringify(reaction, null, 2));

      // Fetch GIFs across queries in parallel for high variety and hit rate
      const queriesToTry = (reaction.searchQueries || []).slice(0, 6);
      const queryResults = await Promise.allSettled(
        queriesToTry.map((q) => GifSearchService.searchGifs(q, 4))
      );

      const seenIds = new Set<string>();
      let gifs: GiphyGif[] = [];

      for (const res of queryResults) {
        if (res.status === 'fulfilled' && Array.isArray(res.value)) {
          for (const gif of res.value) {
            if (!seenIds.has(gif.id)) {
              seenIds.add(gif.id);
              gifs.push(gif);
            }
          }
        }
      }

      // If still empty or very few, try remaining queries
      if (gifs.length === 0 && reaction.searchQueries && reaction.searchQueries.length > 6) {
        for (const q of reaction.searchQueries.slice(6)) {
          try {
            const fallbackGifs = await GifSearchService.searchGifs(q, 5);
            for (const gif of fallbackGifs) {
              if (!seenIds.has(gif.id)) {
                seenIds.add(gif.id);
                gifs.push(gif);
              }
            }
            if (gifs.length > 0) break;
          } catch (e) {
            // continue
          }
        }
      }

      // If all queries failed, try the raw emotion as fallback
      if (gifs.length === 0 && reaction.emotion) {
        console.log('Fallback to emotion:', reaction.emotion);
        try {
          const fallbackGifs = await GifSearchService.searchGifs(reaction.emotion, 6);
          for (const gif of fallbackGifs) {
            if (!seenIds.has(gif.id)) {
              seenIds.add(gif.id);
              gifs.push(gif);
            }
          }
        } catch (e) {
          // continue
        }
      }
      
      if (gifs.length === 0) {
        throw new Error('No GIFs found. Please try rephrasing or using different keywords.');
      }

      setResults(gifs);
    } catch (error: any) {
      console.error(error);
      Alert.alert('Generation Failed', error.message || 'Something went wrong while generating the meme.');
    } finally {
      setIsGenerating(false);
      setLoadingStep('');
    }
  };

  const handleImagePick = async () => {
    try {
      const media = await MediaAssetService.pickImageAsset();
      if (!media) return;

      setIsGenerating(true);
      setLoadingStep('Extracting text from image...');
      setResults([]);
      setSelectedGif(null);
      
      const file = new FileSystem.File(media.uri);
      const base64 = await file.base64();
      
      const extractedText = await AiMemeService.extractTextFromImage(base64);
      
      setInputText(extractedText);

      if (extractedText && extractedText.trim()) {
        await executeGenerate(extractedText.trim());
      } else {
        setIsGenerating(false);
        setLoadingStep('');
        Alert.alert('No Text Found', 'Could not detect any text in the selected image.');
      }
    } catch (error: any) {
      setIsGenerating(false);
      setLoadingStep('');
      Alert.alert('OCR Error', error.message || 'Failed to extract text from the image.');
    }
  };

  const handleGenerate = () => {
    if (!inputText.trim()) {
      Alert.alert('Oops', 'Please enter a joke, quote, or thought first!');
      return;
    }
    executeGenerate(inputText.trim());
  };

  const handleSelectGif = async (gif: GiphyGif) => {
    setSelectedGif(gif);
    try {
      setLoadingStep('Downloading GIF...');
      setIsGenerating(true);
      const localUri = await GifSearchService.downloadGifToCache(gif.url, gif.id);
      
      // Navigate to Meme Maker with the payload
      router.replace({ 
        pathname: '/meme-maker', 
        params: { 
          initialGifUri: localUri, 
          initialText: inputText 
        } 
      });
    } catch (error) {
      Alert.alert('Download Error', 'Failed to download the selected GIF.');
      setIsGenerating(false);
      setLoadingStep('');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="close" size={28} color="#F8FAFC" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>✨ AI Meme Maker</Text>
        <View style={{ width: 28 }} />
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 90}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          
          <Animated.View entering={FadeInDown.duration(600).springify()} style={styles.inputContainer}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={styles.inputLabel}>What's on your mind?</Text>
              <TouchableOpacity 
                style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#334155', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 }}
                onPress={handleImagePick}
                disabled={isGenerating}
              >
                <Ionicons name="camera-outline" size={16} color="#38BDF8" style={{ marginRight: 6 }} />
                <Text style={{ color: '#38BDF8', fontSize: 12, fontWeight: 'bold' }}>Extract Image Text</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInput}
                multiline
                placeholder="e.g., When the code compiles on the first try but you didn't change anything..."
                placeholderTextColor="#64748B"
                value={inputText}
                onChangeText={setInputText}
                autoFocus
              />
            </View>
          </Animated.View>

          {isGenerating ? (
            <Animated.View entering={FadeIn.duration(400)} style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#A855F7" />
              <Text style={styles.loadingText}>{loadingStep}</Text>
            </Animated.View>
          ) : (
            <Animated.View entering={FadeInDown.duration(600).delay(200).springify()} style={styles.ctaContainer}>
              <TouchableOpacity 
                style={styles.generateBtn} 
                activeOpacity={0.8}
                onPress={handleGenerate}
              >
                <Ionicons name="sparkles" size={20} color="#0F172A" style={{ marginRight: 8 }} />
                <Text style={styles.generateBtnText}>
                  {results.length > 0 ? '✨ Regenerate Magic' : 'Generate Magic'}
                </Text>
              </TouchableOpacity>
              <Text style={styles.disclaimerText}>Powered by Groq LLM & Giphy</Text>
            </Animated.View>
          )}

          {!isGenerating && results.length > 0 && (
            <Animated.View entering={FadeInDown.duration(600).springify()} style={styles.resultsContainer} layout={Layout.springify()}>
              <View style={styles.resultsHeader}>
                <Text style={styles.resultsTitle}>Choose your reaction</Text>
                <Text style={styles.resultsSubtitle}>{results.length} reactions found</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
                {results.map((gif, index) => (
                  <Animated.View key={gif.id} entering={FadeInDown.delay(index * 100).springify()}>
                    <TouchableOpacity 
                      style={styles.gifCard}
                      activeOpacity={0.8}
                      onPress={() => handleSelectGif(gif)}
                    >
                      <Image 
                        source={{ uri: gif.previewUrl }} 
                        style={styles.gifImage} 
                        resizeMode="cover"
                      />
                      <View style={styles.gifOverlay}>
                        <Ionicons name="color-wand" size={24} color="#FFF" />
                        <Text style={styles.gifOverlayText}>Use This</Text>
                      </View>
                    </TouchableOpacity>
                  </Animated.View>
                ))}
              </ScrollView>
            </Animated.View>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    color: '#D8B4FE',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 20,
  },
  inputContainer: {
    marginBottom: 32,
  },
  inputLabel: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  inputWrapper: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 16,
    shadowColor: '#A855F7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  textInput: {
    color: '#F8FAFC',
    fontSize: 18,
    lineHeight: 28,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  ctaContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  generateBtn: {
    backgroundColor: '#D8B4FE', // glowing purple
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 100,
    width: '100%',
    shadowColor: '#D8B4FE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  generateBtnText: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disclaimerText: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    color: '#D8B4FE',
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  resultsContainer: {
    marginTop: 24,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultsTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultsSubtitle: {
    color: '#A855F7',
    fontSize: 13,
    fontWeight: '600',
  },
  carousel: {
    gap: 16,
    paddingRight: 40,
  },
  gifCard: {
    width: width * 0.45,
    height: (width * 0.45) * 1.5, // 2:3 aspect ratio
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#1E293B',
    borderWidth: 2,
    borderColor: '#A855F7',
  },
  gifImage: {
    width: '100%',
    height: '100%',
  },
  gifOverlay: {
    position: 'absolute',
    top: 0, right: 0, bottom: 0, left: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0, // In a real app we could fade this on tap, but it's fine for now
  },
  gifOverlayText: {
    color: '#FFF',
    fontWeight: 'bold',
    marginTop: 8,
    fontSize: 16,
  },
});
