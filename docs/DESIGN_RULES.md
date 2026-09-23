# Strict Engineering Rules

1. **No business logic inside UI components.** UI only dispatches actions.
2. **No direct FFmpeg calls from components.** Use the Rendering abstraction.
3. **No direct file-system manipulation from random screens.** Use `MediaAssetService`.
4. **No hard-coded resolution logic.** Use configurable presets.
5. **No hard-coded fonts.** Use the Font Registry.
6. **No screen-pixel coordinates in project state.** Always use normalized/project coordinates.
7. **No binary media in global state.** Store file references (URIs) only.
8. **No giant components.** Break down UI into modular controls.
9. **No circular dependencies.** Adhere to strict UI -> Feature -> Domain -> Infrastructure flow.
10. **No duplicated business logic.**
11. **No direct infrastructure calls from presentation components.**
12. **All project models must be versioned.** Essential for future migrations.
13. **New layer types must use the layer abstraction.**
14. **Rendering must consume project state.** The JSON model is the single source of truth.
15. **Preview and final rendering must share the same project model.**
16. **Keep dependencies replaceable.** (e.g., wrap FFmpeg behind `VideoRenderer`).
17. **Prefer composition over inheritance.**
18. **Avoid premature abstractions.** Build abstractions where future change is foreseeable.
19. **Every new feature must identify its domain boundary.**
20. **Do not break existing features when introducing new capabilities.**
