# Rendering Pipeline

The rendering pipeline transforms the `Project Model` into a final video file without blocking the UI thread.

## Architecture

`Project Model` -> `Render Plan` -> `Command Builder` -> `Native Execution`

### 1. Render Plan Generation
A service analyzes the `Project Model` and generates a declarative `RenderPlan`. This plan details all inputs, filters, complex overlays (e.g., text positioning relative to the normalized canvas), and outputs.

### 2. VideoFilterBuilder
Converts the normalized coordinates of the text layers and media sources into FFmpeg-compatible filter strings (e.g., `drawtext`, `scale`, `overlay`).

### 3. Command Execution (FFmpeg)
The `FFmpegCommandBuilder` constructs the final command string and executes it on a background thread via the native FFmpeg module. 

### 4. Job Management
The export is treated as an `ExportJob` with states:
`queued` -> `preparing` -> `rendering` -> `finalizing` -> `completed` / `failed`

This decouples the UI from the rendering progress, allowing the potential integration of a `CloudRenderer` in the future.
