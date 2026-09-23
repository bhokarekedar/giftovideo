# Architecture Document

## Overview
The application is designed as a scalable, layer-based mobile video editor. It strictly separates the editor state (Project Model) from the rendering pipeline (Final Video). 

## Directory Structure (Feature-Based)
```
src/
├── app/              # Expo Router screens
├── components/       # Shared UI components
├── features/         # Feature modules (editor, text-editor, layers, export, projects)
├── core/
│   ├── project/      # Project Model definitions & state
│   ├── rendering/    # Video renderer interfaces and FFmpeg builders
│   ├── media/        # MediaAssetService and file management
│   └── storage/      # Persistence and local storage
├── utils/
├── types/
└── constants/
```

## Module Boundaries
* **UI Layer:** Dispatches intents/actions. No business logic.
* **Feature Layer:** Orchestrates domain logic and UI interactions.
* **Domain Layer:** Project model, layer definitions, coordinate math.
* **Infrastructure Layer:** FFmpeg execution, File System access.

## State Management
State is divided into three categories:
1. **Persistent Project State:** The source of truth for the project.
2. **Temporary UI State:** Selected layers, open toolbars.
3. **Gesture/Animation State:** Local animated values (Reanimated) that sync with project state upon gesture completion.

## Layer System
* `LayerRenderer` interface defines how a layer appears in the preview.
* Discriminant Unions define layer types (e.g., `TextLayer`, `ImageLayer`).

## Rendering Architecture
* **Preview Renderer:** React Native-based canvas displaying the Project Model.
* **Final Video Renderer:** Consumes the exact same Project Model to construct an FFmpeg `RenderPlan`.
