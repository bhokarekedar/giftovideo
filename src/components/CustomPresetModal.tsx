import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import ColorPickerModal from './ColorPickerModal';
import { PresetItem } from '../core/presets/CustomPresetStorage';

interface CustomPresetModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (preset: Omit<PresetItem, 'id' | 'isCustom'>) => void;
  availableFonts: string[];
  initialColor?: string;
  initialBg?: string;
  initialFont?: string;
  initialSize?: number;
  initialText?: string;
}

const COMMON_TEXT_COLORS = ['#FFFFFF', '#000000', '#FACC15', '#EF4444', '#38BDF8', '#22C55E', '#A855F7', '#F43F5E'];
const COMMON_BG_COLORS = ['transparent', '#000000', '#FFFFFF', 'rgba(0,0,0,0.6)', '#EF4444', '#FACC15', '#3B82F6', '#A855F7'];

export default function CustomPresetModal({
  visible,
  onClose,
  onSave,
  availableFonts,
  initialColor = '#FFFFFF',
  initialBg = '#000000',
  initialFont = 'System',
  initialSize = 24,
  initialText = 'My Custom Preset',
}: CustomPresetModalProps) {
  const [label, setLabel] = useState('');
  const [sampleText, setSampleText] = useState('');
  const [color, setColor] = useState(initialColor);
  const [bg, setBg] = useState(initialBg);
  const [font, setFont] = useState(initialFont);
  const [size, setSize] = useState(initialSize);

  // Color picker submodal state
  const [colorPickerTarget, setColorPickerTarget] = useState<'text' | 'bg' | null>(null);

  useEffect(() => {
    if (visible) {
      setLabel('');
      setSampleText(initialText || 'Preset Preview');
      setColor(initialColor || '#FFFFFF');
      setBg(initialBg || '#000000');
      setFont(initialFont || 'System');
      setSize(initialSize || 24);
      setColorPickerTarget(null);
    }
  }, [visible, initialColor, initialBg, initialFont, initialSize, initialText]);

  const handleSave = () => {
    const finalLabel = label.trim() || sampleText.trim() || 'Custom Preset';
    const finalText = sampleText.trim() || finalLabel;

    onSave({
      label: finalLabel,
      text: finalText,
      color,
      bg,
      size,
      font,
    });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={styles.sparkleIconWrapper}>
                <Ionicons name="sparkles" size={18} color="#A855F7" />
              </View>
              <Text style={styles.title}>Create Custom Preset</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={10}>
              <MaterialIcons name="close" size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16 }}>
            {/* Live Interactive Preview Card */}
            <Text style={styles.sectionLabel}>Live Preview</Text>
            <View style={styles.previewContainer}>
              <View
                style={[
                  styles.previewBox,
                  {
                    backgroundColor: bg === 'transparent' ? '#0F172A' : bg,
                    borderWidth: bg === 'transparent' ? 1.5 : 0,
                    borderColor: '#334155',
                  },
                ]}
              >
                <Text
                  style={{
                    color,
                    fontSize: Math.min(Math.max(size, 16), 32),
                    fontFamily: font !== 'System' && font !== 'serif' && font !== 'monospace' ? font : undefined,
                    fontWeight: font === 'System' ? 'bold' : 'normal',
                    textAlign: 'center',
                  }}
                  numberOfLines={2}
                >
                  {sampleText || 'Preview Text'}
                </Text>
              </View>
            </View>

            {/* Preset Name / Label Input */}
            <Text style={styles.sectionLabel}>Preset Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Neon Cyber, Minimal Quote"
              placeholderTextColor="#64748B"
              value={label}
              onChangeText={setLabel}
              maxLength={24}
            />

            {/* Default Text Input */}
            <Text style={styles.sectionLabel}>Default Text (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Text to apply when selected"
              placeholderTextColor="#64748B"
              value={sampleText}
              onChangeText={setSampleText}
              maxLength={40}
            />

            {/* Text Color Picker */}
            <View style={styles.paletteHeaderRow}>
              <Text style={styles.sectionLabel}>Text Color</Text>
              <TouchableOpacity
                onPress={() => setColorPickerTarget('text')}
                style={styles.customColorLink}
              >
                <Ionicons name="color-palette-outline" size={14} color="#38BDF8" />
                <Text style={styles.customColorLinkText}>Palette Wheel</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.colorRow}>
              {COMMON_TEXT_COLORS.map(c => (
                <TouchableOpacity
                  key={`text-color-${c}`}
                  onPress={() => setColor(c)}
                  style={[
                    styles.colorCircle,
                    { backgroundColor: c },
                    color === c && styles.colorCircleActive,
                  ]}
                >
                  {color === c && (
                    <Ionicons
                      name="checkmark"
                      size={14}
                      color={c === '#FFFFFF' || c === '#FACC15' ? '#000000' : '#FFFFFF'}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Background Color Picker */}
            <View style={styles.paletteHeaderRow}>
              <Text style={styles.sectionLabel}>Background Color</Text>
              <TouchableOpacity
                onPress={() => setColorPickerTarget('bg')}
                style={styles.customColorLink}
              >
                <Ionicons name="color-palette-outline" size={14} color="#38BDF8" />
                <Text style={styles.customColorLinkText}>Palette Wheel</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.colorRow}>
              {COMMON_BG_COLORS.map(c => (
                <TouchableOpacity
                  key={`bg-color-${c}`}
                  onPress={() => setBg(c)}
                  style={[
                    styles.colorCircle,
                    {
                      backgroundColor: c === 'transparent' ? '#1E293B' : c,
                      borderWidth: c === 'transparent' ? 1.5 : 1,
                      borderColor: c === 'transparent' ? '#64748B' : 'rgba(255,255,255,0.2)',
                    },
                    bg === c && styles.colorCircleActive,
                  ]}
                >
                  {c === 'transparent' ? (
                    <Text style={{ fontSize: 9, color: '#94A3B8', fontWeight: 'bold' }}>None</Text>
                  ) : bg === c ? (
                    <Ionicons
                      name="checkmark"
                      size={14}
                      color={c === '#FFFFFF' || c === '#FACC15' ? '#000000' : '#FFFFFF'}
                    />
                  ) : null}
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Font Picker */}
            <Text style={styles.sectionLabel}>Font Family</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.fontRow}>
              {availableFonts.map(f => (
                <TouchableOpacity
                  key={`preset-font-${f}`}
                  onPress={() => setFont(f)}
                  style={[
                    styles.fontChip,
                    font === f && styles.fontChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.fontChipText,
                      {
                        fontFamily: f !== 'System' && f !== 'serif' && f !== 'monospace' ? f : undefined,
                      },
                      font === f && styles.fontChipTextActive,
                    ]}
                  >
                    {f}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Size Selector */}
            <Text style={styles.sectionLabel}>Text Size ({size}px)</Text>
            <View style={styles.sizePresetsRow}>
              {[18, 22, 28, 34, 40].map(s => (
                <TouchableOpacity
                  key={`size-${s}`}
                  onPress={() => setSize(s)}
                  style={[styles.sizeBtn, size === s && styles.sizeBtnActive]}
                >
                  <Text style={[styles.sizeBtnText, size === s && styles.sizeBtnTextActive]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Action Footer */}
          <View style={styles.actions}>
            <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
              <Ionicons name="checkmark-circle" size={18} color="#0F172A" />
              <Text style={styles.saveBtnText}>Save Preset</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Reanimated Full Color Picker Submodal */}
      <ColorPickerModal
        visible={colorPickerTarget !== null}
        currentColor={colorPickerTarget === 'text' ? color : bg}
        onPick={(newColor) => {
          if (colorPickerTarget === 'text') {
            setColor(newColor);
          } else if (colorPickerTarget === 'bg') {
            setBg(newColor);
          }
        }}
        onClose={() => setColorPickerTarget(null)}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '90%',
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderColor: '#334155',
  },
  sparkleIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionLabel: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 12,
    marginBottom: 8,
  },
  previewContainer: {
    width: '100%',
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 85,
    borderWidth: 1,
    borderColor: '#334155',
  },
  previewBox: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: '90%',
  },
  input: {
    backgroundColor: '#0F172A',
    color: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
  },
  paletteHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  customColorLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  customColorLinkText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '600',
  },
  colorRow: {
    gap: 10,
    paddingVertical: 4,
  },
  colorCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  colorCircleActive: {
    borderColor: '#38BDF8',
    borderWidth: 2.5,
    transform: [{ scale: 1.1 }],
  },
  fontRow: {
    gap: 8,
    paddingVertical: 4,
  },
  fontChip: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  fontChipActive: {
    backgroundColor: '#334155',
    borderColor: '#38BDF8',
  },
  fontChipText: {
    color: '#94A3B8',
    fontSize: 13,
  },
  fontChipTextActive: {
    color: '#38BDF8',
    fontWeight: 'bold',
  },
  sizePresetsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  sizeBtn: {
    flex: 1,
    backgroundColor: '#0F172A',
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  sizeBtnActive: {
    backgroundColor: '#38BDF8',
    borderColor: '#38BDF8',
  },
  sizeBtnText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  sizeBtnTextActive: {
    color: '#0F172A',
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: '#334155',
  },
  cancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  cancelBtnText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
  },
  saveBtn: {
    flex: 1.5,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#38BDF8',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  saveBtnText: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
