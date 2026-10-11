import { LocalStorage } from '../storage/LocalStorage';

export interface PresetItem {
  id: string;
  label: string;
  text: string;
  color: string;
  bg: string;
  size: number;
  font: string;
  isCustom?: boolean;
}

export const BUILTIN_STICKER_PRESETS: PresetItem[] = [
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

const CUSTOM_PRESETS_STORAGE_KEY = '@giftovideo_custom_presets_v1';

export const CustomPresetStorage = {
  async getCustomPresets(): Promise<PresetItem[]> {
    try {
      const data = await LocalStorage.getItem(CUSTOM_PRESETS_STORAGE_KEY);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Failed to load custom presets from storage', e);
      return [];
    }
  },

  async saveCustomPreset(preset: Omit<PresetItem, 'id' | 'isCustom'>): Promise<PresetItem[]> {
    try {
      const current = await this.getCustomPresets();
      const newPreset: PresetItem = {
        ...preset,
        id: `custom_${Date.now()}`,
        isCustom: true,
      };
      const updated = [newPreset, ...current];
      await LocalStorage.setItem(CUSTOM_PRESETS_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.error('Failed to save custom preset to storage', e);
      throw e;
    }
  },

  async deleteCustomPreset(id: string): Promise<PresetItem[]> {
    try {
      const current = await this.getCustomPresets();
      const updated = current.filter(p => p.id !== id);
      await LocalStorage.setItem(CUSTOM_PRESETS_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.error('Failed to delete custom preset from storage', e);
      throw e;
    }
  }
};
