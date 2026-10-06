import { useEffect, useRef, useState } from 'react';
import { useEditorStore } from '../store/editorStore';
import { VideoItem } from '../models/Project';

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

  // Playback Loop
  useEffect(() => {
    if (isPlaying) {
      lastUpdateRef.current = Date.now();
      
      const loop = () => {
        const now = Date.now();
        const delta = now - lastUpdateRef.current;
        lastUpdateRef.current = now;
        
        const currentPlayhead = useEditorStore.getState().currentTime;
        const MAX_DURATION = 30000; // MVP limit
        
        if (currentPlayhead + delta >= MAX_DURATION) {
          setIsPlaying(false);
          useEditorStore.getState().setPlayhead(MAX_DURATION);
        } else {
          useEditorStore.getState().setPlayhead(currentPlayhead + delta);
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
  };
}
