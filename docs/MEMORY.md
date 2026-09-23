# Project Memory

## Project Vision
A production-ready, scalable mobile video editing application, initially focusing on GIF-to-MP4 conversion with rich text layers, built as a foundation for a full-fledged mobile editor.

## Current Architecture
Feature-based modular architecture using Expo, React Native, and an FFmpeg-based native rendering pipeline. The architecture strictly separates the Project Model (editor state) from the UI and the Final Render pipeline.

## Current Features
* Documentation phase complete.
* Empty repository initialized.

## Current Limitations
* No UI or code implemented yet.

## Important Decisions
* **Normalized Coordinates:** Project state uses logical coordinates independent of screen size.
* **Deterministic Rendering:** The project JSON and source media fully dictate the final output.
* **Separation of Concerns:** Preview renderer and FFmpeg renderer share the same Project Model but operate independently.
* **Versioned Models:** The project data model is strictly versioned for future migrations.

## Do Not Change
* Do not merge the UI coordinate space with the project coordinate space.
* Do not embed FFmpeg command strings directly in React components.
* Do not store media binaries in JSON or memory; use file paths.

## Current Roadmap
1. Phase A: Project foundation
2. Phase B: Navigation and design system
3. Phase C: Media import

## Known Technical Problems
* None yet.

## Dependencies
* Expo, Expo Router, React Native Gesture Handler, React Native Reanimated.

## File Structure
* Currently only contains `/docs` directory.

## Development Commands
* TBD

## Migration Notes
* `v1` Architecture initialized.
