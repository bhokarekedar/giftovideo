import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image, TextInput, KeyboardAvoidingView, Platform, ScrollView, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, runOnJS } from 'react-native-reanimated';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { theme } from '../core/theme';
import { MediaAssetService } from '../core/media/MediaAssetService';

const { width } = Dimensions.get('window');
const CANVAS_WIDTH = width * 0.55;
const CANVAS_HEIGHT = CANVAS_WIDTH * (16 / 9);

export default function MemeMakerScreen() {
  const router = useRouter();
  const [gifUri, setGifUri] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(5);
  const [durationStr, setDurationStr] = useState<string>('5');
  const [background, setBackground] = useState<'blur' | 'solid' | 'custom'>('blur');
  const [customBgUri, setCustomBgUri] = useState<string | null>(null);
  const [isBgModalVisible, setIsBgModalVisible] = useState(false);
  
  // Text Editor State (Multiple Texts)
  const [texts, setTexts] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isEditingText, setIsEditingText] = useState(false);
  const [activeTool, setActiveTool] = useState<'none' | 'color' | 'bg' | 'size' | 'font'>('none');

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
            <TouchableOpacity style={styles.navSaveBtn}>
              <Text style={styles.navSaveBtnText}>Save</Text>
            </TouchableOpacity>
          )
        }} 
      />
      
      <View style={styles.content}>
        <View style={styles.canvasContainer}>
          <View style={styles.canvas}>
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

            {/* Render Multiple Text Layers */}
            {texts.map(textItem => (
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
      </View>

      {/* Text Editor Overlay */}
      {isEditingText && (
        <Modal transparent animationType="fade" visible={isEditingText}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.editorOverlay}
          >
            <TouchableOpacity 
              style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }} 
              activeOpacity={1} 
              onPress={() => setIsEditingText(false)}
            >
              <View style={styles.editorBackdrop} />
            </TouchableOpacity>
            
            <View style={styles.editorPanel}>
              <View style={styles.editorHeader}>
                <TouchableOpacity onPress={handleDeleteActiveText}>
                  <Text style={{ color: '#EF4444', fontWeight: 'bold', fontSize: 16 }}>Delete</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {
                  if (editorText.trim() === '') handleDeleteActiveText();
                  else setIsEditingText(false);
                }}>
                  <Text style={styles.editorDone}>Done</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.editorTools}>
                {activeTool === 'none' ? (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                     <TouchableOpacity style={[styles.categoryBtn, { flexDirection: 'row', alignItems: 'center' }]} onPress={() => setActiveTool('color')}>
                       <Ionicons name="color-palette" size={16} color="#F8FAFC" style={{ marginRight: 6 }} />
                       <Text style={styles.categoryBtnText}>Color</Text>
                     </TouchableOpacity>
                     
                     <TouchableOpacity style={[styles.categoryBtn, { flexDirection: 'row', alignItems: 'center' }]} onPress={() => setActiveTool('bg')}>
                       <MaterialIcons name="format-color-fill" size={16} color="#F8FAFC" style={{ marginRight: 6 }} />
                       <Text style={styles.categoryBtnText}>Background</Text>
                     </TouchableOpacity>

                     <TouchableOpacity style={[styles.categoryBtn, { flexDirection: 'row', alignItems: 'center' }]} onPress={() => setActiveTool('size')}>
                       <Ionicons name="text-outline" size={16} color="#F8FAFC" style={{ marginRight: 6 }} />
                       <Text style={styles.categoryBtnText}>Size</Text>
                     </TouchableOpacity>

                     <TouchableOpacity style={[styles.categoryBtn, { flexDirection: 'row', alignItems: 'center' }]} onPress={() => setActiveTool('font')}>
                       <Ionicons name="language" size={16} color="#F8FAFC" style={{ marginRight: 6 }} />
                       <Text style={styles.categoryBtnText}>Font</Text>
                     </TouchableOpacity>
                  </ScrollView>
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => setActiveTool('none')} style={{ marginRight: 16, padding: 4 }}>
                      <Ionicons name="chevron-back" size={24} color="#94A3B8" />
                    </TouchableOpacity>
                    
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                      {activeTool === 'color' && ['#FFFFFF', '#000000', '#EF4444', '#EAB308', '#22C55E', '#3B82F6'].map(color => (
                        <TouchableOpacity 
                          key={color} 
                          onPress={() => { setEditorColor(color); updateActiveText({ color }); }}
                          style={[styles.colorSwatch, { backgroundColor: color, borderColor: editorColor === color ? '#38BDF8' : 'transparent' }]} 
                        />
                      ))}
                      
                      {activeTool === 'bg' && ['transparent', '#000000', '#FFFFFF', '#EF4444'].map(color => (
                        <TouchableOpacity 
                          key={`bg-${color}`} 
                          onPress={() => { setEditorBg(color); updateActiveText({ bg: color }); }}
                          style={[styles.colorSwatch, { backgroundColor: color, borderWidth: 2, borderColor: editorBg === color ? '#38BDF8' : '#334155' }]} 
                        >
                          {color === 'transparent' && <Text style={{fontSize: 10, textAlign: 'center', lineHeight: 26, color: '#94A3B8'}}>None</Text>}
                        </TouchableOpacity>
                      ))}

                      {activeTool === 'size' && [16, 24, 32, 48, 64].map(size => (
                        <TouchableOpacity 
                          key={`size-${size}`} 
                          onPress={() => { setEditorSize(size); updateActiveText({ size }); }}
                          style={[styles.categoryBtn, { backgroundColor: editorSize === size ? '#334155' : '#0F172A', borderWidth: editorSize === size ? 1 : 0, borderColor: '#38BDF8' }]}
                        >
                          <Text style={styles.categoryBtnText}>{size}px</Text>
                        </TouchableOpacity>
                      ))}

                      {activeTool === 'font' && ['System', 'serif', 'monospace'].map(font => (
                        <TouchableOpacity 
                          key={`font-${font}`} 
                          onPress={() => { setEditorFont(font); updateActiveText({ font }); }}
                          style={[styles.categoryBtn, { backgroundColor: editorFont === font ? '#334155' : '#0F172A', borderWidth: editorFont === font ? 1 : 0, borderColor: '#38BDF8' }]}
                        >
                          <Text style={[styles.categoryBtnText, { fontFamily: font }]}>{font}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
              
              <TextInput
                autoFocus
                value={editorText}
                onChangeText={(t) => { setEditorText(t); updateActiveText({ text: t }); }}
                style={[styles.editorInput, { color: '#FFF', backgroundColor: '#0F172A' }]}
                placeholder="Type your meme caption..."
                placeholderTextColor="#64748B"
                multiline
              />
            </View>
          </KeyboardAvoidingView>
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
        <Text style={[styles.memeTextPreview, { color: item.color, fontSize: item.size, fontFamily: item.font }]}>{item.text}</Text>
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
  editorInput: { minHeight: 60, padding: 12, borderRadius: 12, fontSize: 18, fontWeight: 'bold' }
});
