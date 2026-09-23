# Technical Decisions

## Framework
**Decision:** Expo + React Native with development builds.
**Reasoning:** Expo provides an excellent ecosystem for file system access, media picking, and router navigation. Development builds are required because standard Expo Go cannot bundle custom native FFmpeg libraries.

## Rendering Engine
**Decision:** FFmpeg via a native compatible library.
**Reasoning:** FFmpeg is the industry standard for robust, customizable video processing. It will be abstracted behind a `VideoRenderer` interface to prevent coupling.

## State Management
**Decision:** To be decided (e.g., Zustand).
**Reasoning:** We will select the optimal library when implementing Phase A. Crucially, gesture state will be handled locally by React Native Reanimated to prevent JS bridge bottlenecking, syncing with the global store only when gestures complete.

## Styling
**Decision:** Shared Design System using React Native stylesheets or a lightweight styling solution.
**Reasoning:** Ensuring visual consistency without bloating the application.

## Layer Abstraction
**Decision:** Polymorphic layer model using Discriminated Unions in TypeScript.
**Reasoning:** Allows the easy addition of future layers (Images, Shapes) without breaking the timeline or canvas rendering logic.
