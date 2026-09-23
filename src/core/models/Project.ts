export interface Project {
  id: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  canvas: CanvasConfig;
  timeline: Timeline;
  exportSettings: ExportSettings;
  metadata: ProjectMetadata;
}

export interface CanvasConfig {
  width: number;
  height: number;
  aspectRatio: string; // e.g., '16:9'
}

export interface Timeline {
  tracks: Track[];
  duration: number; // total calculated project duration
}

export type TrackType = 'video' | 'audio' | 'text';

export interface Track {
  id: string;
  type: TrackType;
  items: TrackItem[];
  locked: boolean;
  hidden: boolean;
  volume?: number; // Audio/Video tracks mixing support (0.0 to 1.0)
}

export type TrackItem = VideoItem | AudioItem | TextItem;

export interface BaseItem {
  id: string;
  startTime: number; // Start time on the main timeline in ms
  duration: number; // Duration on the main timeline in ms
}

export interface VisualItemBase extends BaseItem {
  position: { x: number; y: number }; // Normalized project coordinates (0.0 - 1.0)
  scale: number;
  rotation: number;
  opacity: number;
}

export interface VideoItem extends VisualItemBase {
  type: 'video';
  uri: string;
  sourceStartTime: number; // For trimming in ms
  volume: number; // Clip-level volume overriding track volume
}

export interface AudioItem extends BaseItem {
  type: 'audio';
  uri: string;
  sourceStartTime: number; // For trimming in ms
  volume: number; // Clip-level volume overriding track volume
}

export interface TextItem extends VisualItemBase {
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

export interface StrokeConfig {
  color: string;
  width: number;
}

export interface ShadowConfig {
  color: string;
  offsetX: number;
  offsetY: number;
  blur: number;
}

export interface ExportSettings {
  presetId: string;
  resolution: { width: number; height: number };
  fps: number;
}

export interface ProjectMetadata {
  name: string;
}
