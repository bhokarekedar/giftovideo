import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useEditorStore } from '../../core/store/editorStore';
import { TextItem } from '../../core/models/Project';
import { DraggableTextItem } from './DraggableTextItem';

interface TextOverlayRendererProps {
  canvasWidth: number;
  canvasHeight: number;
}

export function TextOverlayRenderer({ canvasWidth, canvasHeight }: TextOverlayRendererProps) {
  const project = useEditorStore(state => state.project);
  const currentTime = useEditorStore(state => state.currentTime);

  if (!project) return null;

  // Find all text items that should be visible at currentTime
  const visibleTextItems: { trackId: string, item: TextItem }[] = [];

  project.timeline.tracks.forEach(track => {
    if (track.type === 'text') {
      track.items.forEach(item => {
        if (currentTime >= item.startTime && currentTime <= (item.startTime + item.duration)) {
          visibleTextItems.push({ trackId: track.id, item: item as TextItem });
        }
      });
    }
  });

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {visibleTextItems.map(({ trackId, item }) => (
        <DraggableTextItem 
          key={item.id} 
          trackId={trackId} 
          item={item} 
          canvasWidth={canvasWidth} 
          canvasHeight={canvasHeight} 
        />
      ))}
    </View>
  );
}
