import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { theme } from '../../core/theme';
import { Button } from '../../components/Button';
import { MediaAssetService } from '../../core/media/MediaAssetService';
import { useEditorStore } from '../../core/store/editorStore';
import { EditorCanvas } from '../../features/canvas/EditorCanvas';
import { Timeline } from '../../features/timeline/Timeline';
import { PlaybackControls } from '../../features/timeline/PlaybackControls';
import { TextPropertyPanel } from '../../features/editor/TextPropertyPanel';
import { TextItem, VideoItem } from '../../core/models/Project';

export default function EditorScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const addTrack = useEditorStore(state => state.addTrack);
  const currentTime = useEditorStore(state => state.currentTime);

  React.useEffect(() => {
    const state = useEditorStore.getState();
    if (!state.project) {
      state.loadProject({
        id: id as string,
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        canvas: {
          width: 1080,
          height: 1920,
          aspectRatio: '9:16',
        },
        timeline: {
          tracks: [],
          duration: 30000,
        },
        exportSettings: {
          presetId: '1080p',
          resolution: { width: 1080, height: 1920 },
          fps: 30,
        },
        metadata: {
          name: 'New Project',
        }
      });
    }
  }, [id]);

  const handleAddVideo = async () => {
    const media = await MediaAssetService.pickVideoAsset();
    if (media) {
      addTrack('video');
      console.log('Picked Video:', media.uri);
      
      setTimeout(() => {
        const state = useEditorStore.getState();
        const videoTracks = state.project?.timeline.tracks.filter(t => t.type === 'video') || [];
        const newTrack = videoTracks[videoTracks.length - 1];
        if (newTrack) {
          const newItem: VideoItem = {
            id: `video_${Date.now()}`,
            type: 'video',
            uri: media.uri,
            startTime: currentTime,
            duration: media.duration || 5000,
            sourceStartTime: 0,
            volume: 1,
            position: { x: 0.5, y: 0.5 },
            scale: 1,
            rotation: 0,
            opacity: 1,
          };
          state.addItemToTrack(newTrack.id, newItem);
          state.selectItem(newItem.id);
        }
      }, 10);
    }
  };

  const handleAddAudio = async () => {
    const media = await MediaAssetService.pickAudioAsset();
    if (media) {
      addTrack('audio');
      console.log('Picked Audio:', media.uri);
    }
  };

  const handleAddText = () => {
    addTrack('text');
    
    // Wait a tick for track to be added to state, then add a text item
    setTimeout(() => {
      const state = useEditorStore.getState();
      const textTracks = state.project?.timeline.tracks.filter(t => t.type === 'text') || [];
      const newTrack = textTracks[textTracks.length - 1];
      if (newTrack) {
        const newItem: TextItem = {
          id: `text_${Date.now()}`,
          type: 'text',
          text: 'Tap to select & edit below',
          fontFamily: 'System',
          fontSize: 32,
          fontWeight: '700',
          color: '#FFFFFF',
          alignment: 'center',
          position: { x: 0.5, y: 0.5 },
          scale: 1,
          rotation: 0,
          opacity: 1,
          startTime: currentTime,
          duration: 3000,
        };
        state.addItemToTrack(newTrack.id, newItem);
        state.selectItem(newItem.id);
      }
    }, 10);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Button 
          title="Back" 
          variant="ghost" 
          onPress={() => router.back()} 
        />
        <Text style={styles.title}>Project {id}</Text>
        <Button 
          title="Export" 
          variant="primary" 
          onPress={() => {}} 
        />
      </View>
      
      <View style={styles.canvasContainer}>
        <EditorCanvas />
      </View>

      <TextPropertyPanel />

      <View style={styles.timelineContainer}>
        <PlaybackControls />
        <Timeline />
      </View>

      <View style={styles.toolbar}>
        <Button title="+ Video/GIF" variant="secondary" onPress={handleAddVideo} />
        <Button title="+ Audio" variant="secondary" onPress={handleAddAudio} />
        <Button title="+ Text" variant="secondary" onPress={handleAddText} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
  },
  canvasContainer: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  timelineContainer: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingBottom: 40,
  }
});
