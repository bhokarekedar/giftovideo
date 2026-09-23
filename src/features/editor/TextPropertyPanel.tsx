import React from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { theme } from '../../core/theme';
import { useEditorStore } from '../../core/store/editorStore';
import { TextItem } from '../../core/models/Project';

const COLORS = ['#FFFFFF', '#000000', '#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#7C3AED'];

export function TextPropertyPanel() {
  const project = useEditorStore(state => state.project);
  const selectedItemId = useEditorStore(state => state.selectedItemId);
  const updateItem = useEditorStore(state => state.updateItem);

  if (!project || !selectedItemId) return null;

  // Find the selected item
  let selectedTrackId = '';
  let selectedItem: TextItem | null = null;

  for (const track of project.timeline.tracks) {
    if (track.type === 'text') {
      const item = track.items.find(i => i.id === selectedItemId);
      if (item) {
        selectedTrackId = track.id;
        selectedItem = item as TextItem;
        break;
      }
    }
  }

  if (!selectedItem) return null;

  const handleChangeText = (text: string) => {
    updateItem(selectedTrackId, selectedItemId, { text });
  };

  const handleChangeColor = (color: string) => {
    updateItem(selectedTrackId, selectedItemId, { color });
  };

  return (
    <View style={styles.container}>
      <TextInput 
        style={styles.input} 
        value={selectedItem.text} 
        onChangeText={handleChangeText} 
        placeholder="Enter text..."
        placeholderTextColor={theme.colors.textSecondary}
      />
      <View style={styles.colorRow}>
        {COLORS.map(c => (
          <TouchableOpacity 
            key={c} 
            style={[styles.colorSwatch, { backgroundColor: c }, selectedItem?.color === c && styles.selectedSwatch]} 
            onPress={() => handleChangeColor(c)} 
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  input: {
    backgroundColor: theme.colors.background,
    color: theme.colors.text,
    padding: theme.spacing.sm,
    borderRadius: theme.radius.sm,
    marginBottom: theme.spacing.md,
    fontSize: theme.typography.sizes.md,
  },
  colorRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  colorSwatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  selectedSwatch: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
  }
});
