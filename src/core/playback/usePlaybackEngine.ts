import { useEffect, useRef, useState } from 'react';
import { useEditorStore } from '../store/editorStore';
import { VideoItem, AudioItem } from '../models/Project';

export function usePlaybackEngine() {
  const project = useEditorStore(state => state.project);
  const currentTime = useEditorStore(state => state.currentTime);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const lastUpdateRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);

  // Find the video item that should be visible at the current time
  const visibleVideoItem = project?.timeline.tracks
    .filter(t => t.type === 'video')
    .flatMap(t => t.items)
    .find(i => 
      currentTime >= i.startTime && currentTime <= (i.startTime + i.duration)
    ) as VideoItem | undefined;

  // Find all audio items playing at the current time
  const visibleAudioItems = project?.timeline.tracks
    .filter(t => t.type === 'audio')
    .flatMap(t => t.items)
    .filter(i => 
      currentTime >= i.startTime && currentTime <= (i.startTime + i.duration)
    ) as AudioItem[] || [];

  // Playback Loop
  useEffect(() => {
    if (isPlaying) {
      lastUpdateRef.current = Date.now();
      
      const loop = () => {
        const now = Date.now();
        const delta = now - lastUpdateRef.current;
        lastUpdateRef.current = now;
        
        const state = useEditorStore.getState();
        const currentPlayhead = state.currentTime;
        
        let MAX_DURATION = 0;
        if (state.project) {
          const allItems = state.project.timeline.tracks.flatMap(t => t.items);
          if (allItems.length > 0) {
            MAX_DURATION = Math.max(...allItems.map(i => i.startTime + i.duration));
          }
        }
        
        if (MAX_DURATION === 0 || currentPlayhead >= MAX_DURATION) {
          setIsPlaying(false);
          state.setPlayhead(MAX_DURATION);
          return;
        }

        if (currentPlayhead + delta >= MAX_DURATION) {
          setIsPlaying(false);
          state.setPlayhead(MAX_DURATION);
        } else {
          state.setPlayhead(currentPlayhead + delta);
          rafRef.current = requestAnimationFrame(loop);
        }
      };
      
      rafRef.current = requestAnimationFrame(loop);
    }
    
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isPlaying]);

  return {
    isPlaying,
    setIsPlaying,
    visibleVideoItem,
    visibleAudioItems,
  };
}
