# Project Model

The Project Model represents the single source of truth for an editing session. It must remain fully decoupled from device-specific screen coordinates.

## Core Schema
```typescript
interface Project {
  id: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  canvas: CanvasConfig;
  timeline: Timeline;
  exportSettings: ExportSettings;
  metadata: ProjectMetadata;
}

interface CanvasConfig {
  width: number;
  height: number;
  aspectRatio: string; // e.g., '16:9'
}

interface Timeline {
  tracks: Track[];
  duration: number; // total calculated project duration
}

type TrackType = 'video' | 'audio' | 'text';

interface Track {
  id: string;
  type: TrackType;
  items: TrackItem[];
  locked: boolean;
  hidden: boolean;
  volume?: number; // Audio/Video tracks mixing support (0.0 to 1.0)
}

type TrackItem = VideoItem | AudioItem | TextItem;

interface BaseItem {
  id: string;
  startTime: number; // Start time on the main timeline
  duration: number; // Duration on the main timeline
}

interface VisualItemBase extends BaseItem {
  position: { x: number; y: number }; // Normalized project coordinates
  scale: number;
  rotation: number;
  opacity: number;
}

interface VideoItem extends VisualItemBase {
  type: 'video';
  uri: string;
  sourceStartTime: number; // For trimming
  volume: number; // Clip-level volume overriding track volume
}

interface AudioItem extends BaseItem {
  type: 'audio';
  uri: string;
  sourceStartTime: number; // For trimming
  volume: number; // Clip-level volume overriding track volume
}

interface TextItem extends VisualItemBase {
  type: 'text';
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  color: string;
  alignment: 'left' | 'center' | 'right';
  stroke?: StrokeConfig;
  shadow?: ShadowConfig;
}

interface ExportSettings {
  presetId: string;
  resolution: { width: number; height: number };
  fps: number;
}
```
