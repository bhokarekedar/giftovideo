import { create } from 'zustand';
import { Project, Track, TrackItem, TrackType } from '../models/Project';

interface EditorState {
  project: Project | null;
  currentTime: number; // Playhead position in ms
  selectedItemId: string | null;
  isPlaying: boolean;

  // Actions
  loadProject: (project: Project) => void;
  setPlayhead: (time: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  selectItem: (itemId: string | null) => void;
  
  // Track Actions
  addTrack: (type: TrackType) => void;
  addItemToTrack: (trackId: string, item: TrackItem) => void;
  updateItem: (trackId: string, itemId: string, updates: Partial<TrackItem>) => void;
  deleteItem: (trackId: string, itemId: string) => void;

  // UI State
  focusInputSignal: number;
  triggerFocusInput: () => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  project: null,
  currentTime: 0,
  selectedItemId: null,
  isPlaying: false,
  focusInputSignal: 0,

  loadProject: (project) => set({ project }),
  
  setPlayhead: (time) => set({ currentTime: time }),
  
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  
  selectItem: (itemId) => set({ selectedItemId: itemId }),

  triggerFocusInput: () => set(state => ({ focusInputSignal: state.focusInputSignal + 1 })),

  addTrack: (type) => set((state) => {
    if (!state.project) return state;
    const newTrack: Track = {
      id: `track_${Date.now()}`,
      type,
      items: [],
      locked: false,
      hidden: false,
      volume: type === 'audio' || type === 'video' ? 1.0 : undefined,
    };
    return {
      project: {
        ...state.project,
        timeline: {
          ...state.project.timeline,
          tracks: [...state.project.timeline.tracks, newTrack],
        }
      }
    };
  }),

  addItemToTrack: (trackId, item) => set((state) => {
    if (!state.project) return state;
    const tracks = state.project.timeline.tracks.map(track => 
      track.id === trackId 
        ? { ...track, items: [...track.items, item] } 
        : track
    );
    return {
      project: {
        ...state.project,
        timeline: { ...state.project.timeline, tracks }
      }
    };
  }),

  updateItem: (trackId, itemId, updates) => set((state) => {
    if (!state.project) return state;
    const tracks = state.project.timeline.tracks.map(track => {
      if (track.id !== trackId) return track;
      return {
        ...track,
        items: track.items.map(item => 
          item.id === itemId ? { ...item, ...updates } as TrackItem : item
        )
      };
    });
    return {
      project: {
        ...state.project,
        timeline: { ...state.project.timeline, tracks }
      }
    };
  }),

  deleteItem: (trackId, itemId) => set((state) => {
    if (!state.project) return state;
    const tracks = state.project.timeline.tracks.map(track => {
      if (track.id !== trackId) return track;
      return {
        ...track,
        items: track.items.filter(item => item.id !== itemId)
      };
    });
    return {
      project: {
        ...state.project,
        timeline: { ...state.project.timeline, tracks }
      }
    };
  }),
}));
