import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image, TextInput, KeyboardAvoidingView, Platform, ScrollView, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { useRouter, Stack, useLocalSearchParams } from 'expo-router';
import * as Font from 'expo-font';
import * as DocumentPicker from 'expo-document-picker';
import { VerticalSlider } from '../components/VerticalSlider';
let MediaLibrary: any = null;
let FFmpegKit: any = null;
let ReturnCode: any = null;

try {
  MediaLibrary = require('expo-media-library/legacy');
  const ffmpeg = require('@wokcito/ffmpeg-kit-react-native');
  FFmpegKit = ffmpeg.FFmpegKit;
  ReturnCode = ffmpeg.ReturnCode;
} catch (e) {
  console.log('Native video modules disabled. Running in Expo Go fallback mode.');
}
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, runOnJS } from 'react-native-reanimated';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { theme } from '../core/theme';
import { MediaAssetService } from '../core/media/MediaAssetService';
import ColorPickerModal from '../components/ColorPickerModal';

const { width } = Dimensions.get('window');
const CANVAS_WIDTH = width * 0.55;
const CANVAS_HEIGHT = CANVAS_WIDTH * (16 / 9);

const STICKER_PRESETS = [
  { id: 'st0', label: 'Long Text', text: 'Long text', color: '#FFFFFF', bg: 'rgba(0,0,0,0.6)', size: 18, font: 'System' },
  { id: 'st1', label: 'TOP TEXT', text: 'TOP TEXT', color: '#FFFFFF', bg: 'transparent', size: 36, font: 'Anton' },
  { id: 'st2', label: 'NEWS', text: 'BREAKING NEWS', color: '#FFFFFF', bg: '#EF4444', size: 28, font: 'Bebas Neue' },
  { id: 'st3', label: 'POV', text: 'POV:', color: '#FFFFFF', bg: 'transparent', size: 32, font: 'System' },
  { id: 'st4', label: 'WAIT', text: 'WAIT FOR IT', color: '#FACC15', bg: '#000000', size: 28, font: 'Anton' },
  { id: 'st5', label: 'Quote', text: '💬 Who said that?', color: '#000000', bg: '#FFFFFF', size: 20, font: 'Comic Neue' },
  { id: 'st6', label: 'vibes', text: 'v i b e s', color: '#FFFFFF', bg: '#A855F7', size: 24, font: 'serif' },
  { id: 'st7', label: 'Me', text: '"Literally me"', color: '#FFFFFF', bg: 'transparent', size: 26, font: 'System' },
  { id: 'st8', label: 'hello', text: 'hello.', color: '#000000', bg: '#F8FAFC', size: 18, font: 'monospace' },
  { id: 'st9', label: 'CAUTION', text: '⚠️ CAUTION', color: '#000000', bg: '#FACC15', size: 24, font: 'Bebas Neue' },
  { id: 'st10', label: '10/10', text: '10/10 WOULD RECOMMEND', color: '#FFFFFF', bg: '#22C55E', size: 20, font: 'Bebas Neue' },
  { id: 'st11', label: 'Verified', text: 'Verified ✅', color: '#FFFFFF', bg: '#38BDF8', size: 22, font: 'System' },
  { id: 'st12', label: 'darkness', text: 'darkness', color: '#FFFFFF', bg: '#0F172A', size: 24, font: 'monospace' },
];

export default function MemeMakerScreen() {
  const router = useRouter();
  const { templateId } = useLocalSearchParams();
  const [gifUri, setGifUri] = useState<string | null>(null);

  // Text Editor State (Multiple Texts)
  const [texts, setTexts] = useState<any[]>([]);

  useEffect(() => {
    if (templateId) {
      const preset = STICKER_PRESETS.find(p => p.id === templateId);
      if (preset) {
        setTexts([{
          id: Date.now().toString(),
          text: preset.text,
          color: preset.color,
          bg: preset.bg,
          size: preset.size,
          font: preset.font
        }]);
      }
    }
  }, [templateId]);

  // Custom Fonts State
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [availableFonts, setAvailableFonts] = useState(['System', 'serif', 'monospace', 'Anton', 'Bebas Neue', 'Comic Neue']);

  useEffect(() => {
    async function loadPredefinedFonts() {
      try {
        await Font.loadAsync({
          'Anton': require('../../assets/fonts/Anton-Regular.ttf'),
          'Bebas Neue': require('../../assets/fonts/BebasNeue-Regular.ttf'),
          'Comic Neue': require('../../assets/fonts/ComicNeue-Bold.ttf'),
        });
        setFontsLoaded(true);
      } catch (e) {
        console.warn('Error loading preset fonts', e);
        setFontsLoaded(true);
      }
    }
    loadPredefinedFonts();
  }, []);

  const handleUploadFont = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: ['*/*'] });
      if (result.canceled || !result.assets || result.assets.length === 0) return;

      const file = result.assets[0];
      let fontName = file.name.split('.')[0];
      // Keep it unique if needed, but simple name is fine for now

      await Font.loadAsync({
        [fontName]: { uri: file.uri }
      });

      setAvailableFonts(prev => [...prev, fontName]);
      setEditorFont(fontName);
      if (isEditingText) {
        updateActiveText({ font: fontName });
      }
      Alert.alert('Font Loaded', `Custom font "${fontName}" applied!`);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to load custom font.');
    }
  };
  const [duration, setDuration] = useState<number>(5);
  const [durationStr, setDurationStr] = useState<string>('5');
  const [background, setBackground] = useState<'blur' | 'solid' | 'custom'>('blur');
  const [customBgUri, setCustomBgUri] = useState<string | null>(null);
  const [isBgModalVisible, setIsBgModalVisible] = useState(false);
  const [hideMediaLayers, setHideMediaLayers] = useState(false);
  const [showAllStickers, setShowAllStickers] = useState(false);

  const canvasRef = useRef<View>(null);
  const [canvasLayout, setCanvasLayout] = useState({ width: 360, height: 640 });
  const [isSaving, setIsSaving] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentSession, setCurrentSession] = useState<any>(null);

  const handleCancel = async () => {
    if (currentSession) {
      await FFmpegKit.cancel(currentSession.getSessionId());
    }
    setIsSaving(false);
    setProgress(0);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      // EXPO GO FALLBACK (Save as image via sharing)
      if (!MediaLibrary || !FFmpegKit) {
        Alert.alert(
          'Expo Go Mode',
          'Video generation requires a native build. Would you like to share an image snapshot instead?',
          [
            { text: 'Cancel', style: 'cancel', onPress: () => setIsSaving(false) },
            {
              text: 'Share Image',
              onPress: async () => {
                try {
                  if (!canvasRef.current) return;
                  const uri = await captureRef(canvasRef, { format: 'png', quality: 1 });
                  await Sharing.shareAsync(uri, { dialogTitle: 'Share Meme Snapshot', mimeType: 'image/png' });
                } catch (e) {
                  console.error(e);
                  Alert.alert('Error', 'Failed to share snapshot.');
                } finally {
                  setIsSaving(false);
                }
              }
            }
          ]
        );
        return;
      }

      // NATIVE BUILD (Generate Video)
      const { status } = await MediaLibrary.requestPermissionsAsync(true);
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant permission to save videos to your library.');
        setIsSaving(false);
        return;
      }

      if (!canvasRef.current || !gifUri) return;

      // 1. Hide media layers to capture ONLY the text overlays
      setHideMediaLayers(true);

      // Give React time to render the hidden state
      await new Promise(resolve => setTimeout(resolve, 200));

      const overlayUri = await captureRef(canvasRef, {
        format: 'png',
        quality: 1,
      });

      // Show media layers again
      setHideMediaLayers(false);

      const outputUri = new FileSystem.File(FileSystem.Paths.cache, `meme_${Date.now()}.mp4`).uri;
      const cleanGifUri = gifUri.replace('file://', '');
      const cleanOverlayUri = overlayUri.replace('file://', '');
      const cleanOutputUri = outputUri.replace('file://', '');

      let parsedDuration = parseInt(durationStr);
      if (isNaN(parsedDuration) || parsedDuration < 1) parsedDuration = 5;
      if (parsedDuration > 60) parsedDuration = 60;
      const durationSec = parsedDuration;
      setProgress(0);

      const gifScale = scale.value;
      const gifTx = translateX.value * (720 / canvasLayout.width);
      const gifTy = translateY.value * (1280 / canvasLayout.height);

      // Filter graph for blurring the background and placing gif, then text
      let filterComplex = '';
      if (background === 'blur') {
        filterComplex = `[0:v]scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280,boxblur=20:20[bg];[0:v]scale=720:1280:force_original_aspect_ratio=decrease,scale=iw*${gifScale}:ih*${gifScale}[fg];[bg][fg]overlay=(W-w)/2+(${gifTx}):(H-h)/2+(${gifTy})[vid];[1:v]scale=720:1280[ovrl];[vid][ovrl]overlay=0:0`;
      } else {
        filterComplex = `[0:v]scale=720:1280:force_original_aspect_ratio=decrease,scale=iw*${gifScale}:ih*${gifScale}[fg];color=c=black:s=720x1280[bg];[bg][fg]overlay=(W-w)/2+(${gifTx}):(H-h)/2+(${gifTy})[vid];[1:v]scale=720:1280[ovrl];[vid][ovrl]overlay=0:0`;
      }

      // Loop the GIF until the specified duration
      const ffmpegCommand = `-stream_loop -1 -i "${cleanGifUri}" -i "${cleanOverlayUri}" -filter_complex "${filterComplex}" -t ${durationSec} -c:v mpeg4 -q:v 2 -y "${cleanOutputUri}"`;

      const session = await FFmpegKit.executeAsync(
        ffmpegCommand,
        async (sessionObj: any) => {
          const returnCode = await sessionObj.getReturnCode();
          if (ReturnCode.isSuccess(returnCode)) {
            try {
              await MediaLibrary.saveToLibraryAsync(outputUri);
              Alert.alert('Success!', 'Video saved to your gallery!');
            } catch (err: any) {
              Alert.alert('Error', `Failed to save to gallery: ${err?.message}`);
            }
          } else if (ReturnCode.isCancel(returnCode)) {
            console.log('User cancelled');
          } else {
            const logs = await sessionObj.getLogs();
            console.error("FFmpeg error:", logs);
            Alert.alert('Error', 'Failed to generate video.');
          }
          setIsSaving(false);
          setHideMediaLayers(false);
          setCurrentSession(null);
        },
        (log: any) => {},
        (statistics: any) => {
          const timeMs = statistics.getTime();
          if (timeMs > 0) {
            setProgress(Math.min(timeMs / (durationSec * 1000), 1));
          }
        }
      );
      setCurrentSession(session);

    } catch (error: any) {
      console.error(error);
      Alert.alert('Error', `Failed to save meme: ${error?.message || error}`);
      setIsSaving(false);
      setHideMediaLayers(false);
    }
  };

  // Text Editor State (Multiple Texts) - initialized at top
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isEditingText, setIsEditingText] = useState(false);
  const [activeTool, setActiveTool] = useState<'none' | 'color' | 'bg' | 'size' | 'font'>('none');
  const [pickerTarget, setPickerTarget] = useState<'color' | 'bg' | null>(null);

  // Currently editing values (mirrored to active text)
  const [editorText, setEditorText] = useState('');
  const [editorColor, setEditorColor] = useState('#FFFFFF');
  const [editorBg, setEditorBg] = useState('transparent');
  const [editorSize, setEditorSize] = useState(24);
  const [editorFont, setEditorFont] = useState('System');

  // Helper to instantly update the text on the canvas while editing
  const updateActiveText = (updates: any) => {
    setTexts(prev => prev.map(t => t.id === editingId ? { ...t, ...updates } : t));
  };

  const handleOpenEditor = (textItem?: any) => {
    setActiveTool('none');
    if (textItem) {
      setEditingId(textItem.id);
      setEditorText(textItem.text);
      setEditorColor(textItem.color);
      setEditorBg(textItem.bg);
      setEditorSize(textItem.size);
      setEditorFont(textItem.font);
    } else {
      const newId = Date.now().toString();
      const newItem = { id: newId, text: '', color: '#FFFFFF', bg: 'transparent', size: 24, font: 'System' };
      setTexts(prev => [...prev, newItem]);
      setEditingId(newId);
      setEditorText('');
      setEditorColor('#FFFFFF');
      setEditorBg('transparent');
      setEditorSize(24);
      setEditorFont('System');
    }
    setIsEditingText(true);
  };

  const handleDeleteActiveText = () => {
    setTexts(prev => prev.filter(t => t.id !== editingId));
    setIsEditingText(false);
  };

  // GIF Gesture State
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => { scale.value = savedScale.value * e.scale; })
    .onEnd(() => { savedScale.value = scale.value; });

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
      router.back();
    }
  };

  if (!gifUri) return <View style={styles.container} />;

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Format GIF',
          headerStyle: { backgroundColor: '#0F172A' },
          headerTintColor: '#F8FAFC',
          headerShadowVisible: false,
          headerRight: () => (
            <TouchableOpacity
              style={[styles.navSaveBtn, isSaving && { opacity: 0.5 }]}
              onPress={handleSave}
              disabled={isSaving}
            >
              <Text style={styles.navSaveBtnText}>{isSaving ? 'Saving...' : 'Save'}</Text>
            </TouchableOpacity>
          )
        }}
      />
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 90}
      >
        <View style={styles.canvasContainer}>
          <View 
            style={[styles.canvas, hideMediaLayers && { backgroundColor: 'transparent', borderColor: 'transparent' }]} 
            ref={canvasRef} 
            collapsable={false}
            onLayout={(e) => setCanvasLayout(e.nativeEvent.layout)}
          >
            {!hideMediaLayers && (
              <>
                {/* Background Layer */}
                {background === 'blur' ? (
                  <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: '#0F172A', overflow: 'hidden' }}>
                    <Image
                      source={{ uri: gifUri }}
                      style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, width: '100%', height: '100%', opacity: 0.35, transform: [{ scale: 12 }] }}
                      resizeMode="cover"
                    />
                  </View>
                ) : background === 'custom' && customBgUri ? (
                  <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: '#0F172A', overflow: 'hidden' }}>
                    <Image
                      source={{ uri: customBgUri }}
                      style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, width: '100%', height: '100%' }}
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
              </>
            )}

            {/* Render Multiple Text Layers */}
            {texts.map(textItem => (
              (isEditingText && textItem.id === editingId) ? null :
                <DraggableText key={textItem.id} item={textItem} onTap={() => handleOpenEditor(textItem)} />
            ))}
          </View>
        </View>

        {/* Single Row Bottom Toolbar */}
        <View style={styles.bottomToolbar}>
          {/* Duration Input */}
          <View style={[styles.toolbarBtn, { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }]}>
            <Ionicons name="timer-outline" size={16} color="#94A3B8" style={{ marginRight: 4 }} />
            <TextInput
              style={[styles.toolbarInput, { padding: 0, textAlign: 'center', minWidth: 20 }]}
              keyboardType="number-pad"
              value={durationStr}
              onChangeText={setDurationStr}
              onBlur={() => {
                let num = parseInt(durationStr);
                if (isNaN(num) || num < 5) num = 5;
                if (num > 60) num = 60;
                setDurationStr(num.toString());
                setDuration(num);
              }}
            />
            <Text style={{ color: '#94A3B8', fontSize: 14, marginLeft: 2 }}>s</Text>
          </View>

          {/* Background Toggle */}
          <TouchableOpacity
            style={[styles.toolbarBtn, { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }]}
            onPress={() => setIsBgModalVisible(true)}
          >
            {background === 'blur' ? <MaterialIcons name="blur-on" size={16} color="#F8FAFC" style={{ marginRight: 6 }} /> :
              background === 'solid' ? <Ionicons name="color-fill" size={16} color="#F8FAFC" style={{ marginRight: 6 }} /> :
                <Ionicons name="image" size={16} color="#F8FAFC" style={{ marginRight: 6 }} />}
            <Text style={[styles.toolbarBtnText, { textAlign: 'center' }]}>
              {background === 'blur' ? 'Blur' : background === 'solid' ? 'Solid' : 'Custom'}
            </Text>
          </TouchableOpacity>

          {/* Add Text Button */}
          <TouchableOpacity
            style={[styles.toolbarPrimaryBtn, { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }]}
            onPress={() => handleOpenEditor()}
          >
            <Ionicons name="text" size={16} color="#0F172A" style={{ marginRight: 6 }} />
            <Text style={[styles.toolbarPrimaryBtnText, { textAlign: 'center' }]}>Add Text</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {isEditingText && (
        <Modal transparent animationType="fade" visible={isEditingText}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.7)' }} />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
              <View style={{ flex: 1 }}>

                {/* Top Toolbar */}
                <SafeAreaView>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 24 : 16 }}>
                    <TouchableOpacity onPress={handleDeleteActiveText} style={{ padding: 8, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 20 }}>
                      <Ionicons name="trash-outline" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{ backgroundColor: '#F8FAFC', paddingHorizontal: 18, paddingVertical: 8, borderRadius: 24, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 }}
                      onPress={() => {
                        if (editorText.trim() === '') handleDeleteActiveText();
                        else setIsEditingText(false);
                      }}>
                      <Text style={{ color: '#0F172A', fontSize: 16, fontWeight: 'bold' }}>Done</Text>
                    </TouchableOpacity>
                  </View>
                </SafeAreaView>

                {/* Central Editor Area & Slider */}
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ width: 60, alignItems: 'center', justifyContent: 'center' }}>
                    <VerticalSlider value={editorSize} onValueChange={(val) => { setEditorSize(val); updateActiveText({ size: val }); }} />
                  </View>

                  <View style={{ flex: 1, paddingRight: 60, justifyContent: 'center', alignItems: 'center' }}>
                    <TextInput
                      autoFocus
                      multiline
                      value={editorText}
                      onChangeText={(t) => { setEditorText(t); updateActiveText({ text: t }); }}
                      style={{
                        color: editorColor,
                        backgroundColor: editorBg === 'transparent' ? 'transparent' : editorBg,
                        fontSize: editorSize,
                        fontFamily: fontsLoaded && editorFont !== 'System' && editorFont !== 'serif' && editorFont !== 'monospace' ? editorFont : undefined,
                        fontWeight: editorFont === 'System' ? 'bold' : 'normal',
                        textAlign: 'center',
                        minWidth: '50%',
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        borderRadius: 12
                      }}
                      placeholder="Type here..."
                      placeholderTextColor="rgba(255,255,255,0.5)"
                    />
                  </View>
                </View>

                {/* Bottom Toolbars Floating Above Keyboard */}
                <View style={{ paddingBottom: 16 }}>

                  {/* Floating Stickers / Presets Row (Always Visible) */}
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={{ marginBottom: 16 }}
                    contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
                  >
                    {STICKER_PRESETS.map(preset => (
                      <TouchableOpacity
                        key={preset.id}
                        onPress={() => {
                          setEditorText(preset.text);
                          setEditorColor(preset.color);
                          setEditorBg(preset.bg);
                          setEditorSize(preset.size);
                          setEditorFont(preset.font);
                          updateActiveText({ text: preset.text, color: preset.color, bg: preset.bg, size: preset.size, font: preset.font });
                        }}
                        style={{
                          backgroundColor: preset.bg === 'transparent' ? 'rgba(255,255,255,0.2)' : preset.bg,
                          paddingHorizontal: 20,
                          paddingVertical: 12,
                          borderRadius: 24,
                          borderWidth: 1,
                          borderColor: 'rgba(255,255,255,0.4)',
                          justifyContent: 'center',
                          alignItems: 'center'
                        }}
                      >
                        <Text style={{
                          color: preset.color,
                          fontSize: 14,
                          fontWeight: preset.font === 'System' ? 'bold' : 'normal',
                          fontFamily: preset.font !== 'System' && preset.font !== 'serif' && preset.font !== 'monospace' ? preset.font : undefined
                        }}>
                          {preset.label || preset.text}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  {/* Tools Toolbar */}
                  <View style={{ marginBottom: 12, paddingHorizontal: 16 }}>
                    {activeTool === 'none' ? (
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                        <TouchableOpacity style={[styles.categoryBtn, { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', borderColor: 'rgba(255,255,255,0.3)' }]} onPress={() => setActiveTool('color')}>
                          <Ionicons name="color-palette" size={16} color="#FFF" style={{ marginRight: 6 }} />
                          <Text style={[styles.categoryBtnText, { color: '#FFF' }]}>Color</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.categoryBtn, { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', borderColor: 'rgba(255,255,255,0.3)' }]} onPress={() => setActiveTool('bg')}>
                          <MaterialIcons name="format-color-fill" size={16} color="#FFF" style={{ marginRight: 6 }} />
                          <Text style={[styles.categoryBtnText, { color: '#FFF' }]}>Background</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.categoryBtn, { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', borderColor: 'rgba(255,255,255,0.3)' }]} onPress={() => setActiveTool('font')}>
                          <Ionicons name="language" size={16} color="#FFF" style={{ marginRight: 6 }} />
                          <Text style={[styles.categoryBtnText, { color: '#FFF' }]}>Font</Text>
                        </TouchableOpacity>
                      </ScrollView>
                    ) : (
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <TouchableOpacity onPress={() => setActiveTool('none')} style={{ marginRight: 16, padding: 4 }}>
                          <Ionicons name="chevron-back" size={24} color="#FFF" />
                        </TouchableOpacity>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                          {activeTool === 'color' && (
                            <>
                              <TouchableOpacity onPress={() => setPickerTarget('color')} style={[styles.colorSwatch, { justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.3)' }]}>
                                <Ionicons name="color-filter-outline" size={18} color="#FFF" />
                              </TouchableOpacity>
                              {['#FFFFFF', '#000000', '#FACC15', '#EF4444', '#38BDF8', '#22C55E', '#A855F7', '#F43F5E'].map(color => (
                                <TouchableOpacity key={color} onPress={() => { setEditorColor(color); updateActiveText({ color }); }} style={[styles.colorSwatch, { backgroundColor: color, borderColor: editorColor === color ? '#FFF' : 'transparent' }]} />
                              ))}
                            </>
                          )}
                          {activeTool === 'bg' && (
                            <>
                              <TouchableOpacity onPress={() => setPickerTarget('bg')} style={[styles.colorSwatch, { justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.3)' }]}>
                                <Ionicons name="color-filter-outline" size={18} color="#FFF" />
                              </TouchableOpacity>
                              {['transparent', '#000000', '#FFFFFF', '#EF4444', '#FACC15', '#3B82F6'].map(color => (
                                <TouchableOpacity key={`bg-${color}`} onPress={() => { setEditorBg(color); updateActiveText({ bg: color }); }} style={[styles.colorSwatch, { backgroundColor: color, borderWidth: 2, borderColor: editorBg === color ? '#FFF' : 'rgba(255,255,255,0.3)' }]}>
                                  {color === 'transparent' && <Text style={{ fontSize: 10, textAlign: 'center', lineHeight: 26, color: '#FFF' }}>None</Text>}
                                </TouchableOpacity>
                              ))}
                            </>
                          )}
                          {activeTool === 'font' && (
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                              <TouchableOpacity onPress={handleUploadFont} style={[styles.categoryBtn, { backgroundColor: '#38BDF8', borderColor: '#0EA5E9', marginRight: 12 }]}>
                                <Text style={[styles.categoryBtnText, { color: '#0F172A' }]}>Upload Font 📤</Text>
                              </TouchableOpacity>
                              {availableFonts.map(font => (
                                <TouchableOpacity key={`font-${font}`} onPress={() => { setEditorFont(font); updateActiveText({ font }); }} style={[styles.categoryBtn, { backgroundColor: editorFont === font ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.1)', borderWidth: editorFont === font ? 1 : 0, borderColor: '#FFF', marginRight: 8 }]}>
                                  <Text style={[styles.categoryBtnText, { fontFamily: fontsLoaded && font !== 'System' && font !== 'serif' && font !== 'monospace' ? font : undefined, color: '#FFF' }]}>{font}</Text>
                                </TouchableOpacity>
                              ))}
                            </View>
                          )}
                        </ScrollView>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </KeyboardAvoidingView>

          </GestureHandlerRootView>
        </Modal>
      )}
      {/* Background Action Sheet Modal */}
      <Modal visible={isBgModalVisible} transparent animationType="slide">
        <View style={styles.actionSheetOverlay}>
          <TouchableOpacity style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }} activeOpacity={1} onPress={() => setIsBgModalVisible(false)} />
          <View style={styles.actionSheetContainer}>
            <View style={styles.actionSheetHandle} />
            <Text style={styles.actionSheetTitle}>Select Background</Text>

            <TouchableOpacity style={styles.actionSheetOption} onPress={() => { setBackground('blur'); setIsBgModalVisible(false); }}>
              <MaterialIcons name="blur-on" size={24} color="#F8FAFC" style={{ marginRight: 16 }} />
              <Text style={styles.actionSheetOptionText}>Blur Effect</Text>
              {background === 'blur' && <Ionicons name="checkmark" size={24} color="#38BDF8" />}
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionSheetOption} onPress={() => { setBackground('solid'); setIsBgModalVisible(false); }}>
              <Ionicons name="color-fill" size={24} color="#F8FAFC" style={{ marginRight: 16 }} />
              <Text style={styles.actionSheetOptionText}>Solid Dark</Text>
              {background === 'solid' && <Ionicons name="checkmark" size={24} color="#38BDF8" />}
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionSheetOption} onPress={async () => {
              setIsBgModalVisible(false);
              const media = await MediaAssetService.pickVideoAsset();
              if (media && media.type === 'image') {
                setCustomBgUri(media.uri);
                setBackground('custom');
              }
            }}>
              <Ionicons name="image" size={24} color="#F8FAFC" style={{ marginRight: 16 }} />
              <Text style={styles.actionSheetOptionText}>Upload Custom Image...</Text>
              {background === 'custom' && <Ionicons name="checkmark" size={24} color="#38BDF8" />}
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionSheetCancel} onPress={() => setIsBgModalVisible(false)}>
              <Text style={styles.actionSheetCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ColorPickerModal
        visible={!!pickerTarget}
        currentColor={pickerTarget === 'color' ? editorColor : editorBg === 'transparent' ? '#000000' : editorBg}
        onPick={(color) => {
          if (pickerTarget === 'color') {
            setEditorColor(color);
            updateActiveText({ color });
          } else {
            setEditorBg(color);
            updateActiveText({ bg: color });
          }
        }}
        onClose={() => setPickerTarget(null)}
      />

      <Modal visible={isSaving} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.9)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#1E293B', padding: 24, paddingTop: 32, borderRadius: 16, width: '80%', alignItems: 'center', borderWidth: 1, borderColor: '#334155' }}>
            
            <TouchableOpacity 
              style={{ position: 'absolute', top: 12, right: 12, padding: 4 }}
              onPress={handleCancel}
            >
              <Ionicons name="close" size={24} color="#94A3B8" />
            </TouchableOpacity>

            <Text style={{ color: '#F8FAFC', fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>Generating Video...</Text>
            
            <View style={{ width: '100%', height: 8, backgroundColor: '#0F172A', borderRadius: 4, marginBottom: 12, overflow: 'hidden' }}>
              <View style={{ width: `${progress * 100}%`, height: '100%', backgroundColor: '#38BDF8', borderRadius: 4 }} />
            </View>
            <Text style={{ color: '#94A3B8', fontSize: 14 }}>{Math.round(progress * 100)}%</Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// Child component so each text layer manages its own independent gestures
const DraggableText = ({ item, onTap }: { item: any, onTap: () => void }) => {
  const textScale = useSharedValue(1);
  const textSavedScale = useSharedValue(1);
  const textTranslateX = useSharedValue(0);
  const textTranslateY = useSharedValue(0);
  const textSavedTranslateX = useSharedValue(0);
  const textSavedTranslateY = useSharedValue(0);

  const textPinchGesture = Gesture.Pinch()
    .onUpdate((e) => { textScale.value = textSavedScale.value * e.scale; })
    .onEnd(() => { textSavedScale.value = textScale.value; });

  const textPanGesture = Gesture.Pan()
    .onUpdate((e) => {
      textTranslateX.value = textSavedTranslateX.value + e.translationX;
      textTranslateY.value = textSavedTranslateY.value + e.translationY;
    })
    .onEnd(() => {
      textSavedTranslateX.value = textTranslateX.value;
      textSavedTranslateY.value = textTranslateY.value;
    });

  const textDoubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      runOnJS(onTap)();
    });

  const textComposedGesture = Gesture.Simultaneous(textPinchGesture, textPanGesture, textDoubleTapGesture);
  const textAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: textTranslateX.value },
      { translateY: textTranslateY.value },
      { scale: textScale.value }
    ]
  }));

  if (!item.text) return null;

  return (
    <GestureDetector gesture={textComposedGesture}>
      <Animated.View
        hitSlop={{ top: 40, bottom: 40, left: 40, right: 40 }}
        style={[styles.memeTextWrapper, textAnimatedStyle, { backgroundColor: item.bg }]}
      >
        <Text style={[
          styles.memeTextPreview,
          {
            color: item.color,
            fontSize: item.size,
            fontFamily: item.font !== 'System' && item.font !== 'serif' && item.font !== 'monospace' ? item.font : undefined,
            fontWeight: item.font === 'System' ? 'bold' : 'normal'
          }
        ]}>{item.text}</Text>
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  content: { flex: 1, justifyContent: 'space-between' },
  canvasContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    width: '100%',
  },
  canvas: {
    flex: 1,
    aspectRatio: 9 / 16,
    backgroundColor: '#1E293B',
    borderRadius: theme.radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    overflow: 'hidden',
  },
  memeTextWrapper: {
    position: 'absolute',
    top: '15%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  memeTextPreview: {
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  bottomToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  toolbarInput: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: 'bold',
  },
  toolbarBtn: {
    backgroundColor: '#1E293B',
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: '#334155',
    height: 48,
    justifyContent: 'center',
  },
  toolbarBtnText: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: 'bold',
  },
  toolbarPrimaryBtn: {
    backgroundColor: '#38BDF8',
    borderRadius: theme.radius.md,
    height: 48,
    justifyContent: 'center',
  },
  toolbarPrimaryBtnText: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '900',
  },
  navSaveBtn: { backgroundColor: '#38BDF8', paddingVertical: 6, paddingHorizontal: 16, borderRadius: 100 },
  navSaveBtnText: { color: '#0F172A', fontWeight: 'bold', fontSize: theme.typography.sizes.sm },

  // Action Sheet Styles
  actionSheetOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  actionSheetContainer: {
    backgroundColor: '#1E293B',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  actionSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#334155',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  actionSheetTitle: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  actionSheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  actionSheetOptionIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  actionSheetOptionText: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  actionSheetOptionCheck: {
    color: '#38BDF8',
    fontSize: 18,
    fontWeight: 'bold',
  },
  actionSheetCancel: {
    marginTop: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  actionSheetCancelText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Editor Styles
  editorOverlay: { flex: 1, justifyContent: 'flex-end' },
  editorBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  editorPanel: { backgroundColor: '#1E293B', padding: 16, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  editorHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, alignItems: 'center' },
  editorTitle: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  editorDone: { color: '#38BDF8', fontWeight: 'bold', fontSize: 16 },
  editorTools: { marginBottom: 16 },
  categoryBtn: { backgroundColor: '#0F172A', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 100, borderWidth: 1, borderColor: '#334155' },
  categoryBtnText: { color: '#F8FAFC', fontWeight: 'bold', fontSize: 14 },
  colorSwatch: { width: 32, height: 32, borderRadius: 16, marginRight: 12, borderWidth: 2 },
  toolDivider: { width: 2, height: 32, backgroundColor: '#334155', marginRight: 12 },
  editorInput: { minHeight: 60, padding: 12, borderRadius: 12, fontSize: 18, fontWeight: 'bold' },

  // Stickers Styles
  stickersSection: { marginBottom: 16 },
  stickersHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  stickersTitle: { color: '#94A3B8', fontSize: 13, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
  stickersViewAll: { color: '#38BDF8', fontSize: 14, fontWeight: 'bold' },
  stickersRow: { flexDirection: 'row', gap: 12 },
  stickersGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  stickerCard: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    overflow: 'hidden'
  },
  stickerCardGrid: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    overflow: 'hidden',
    width: '48%',
    marginBottom: 12
  },
  stickerPreview: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8
  }
});
