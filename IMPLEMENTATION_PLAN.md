# PATA Website — Header Video + Mobile Performance + Shader Cleanup

## Context
The header currently uses a static `shader-placeholder.webp` image as background. The WebGL liquid shader code still exists in the JS/CSS bundles but no `<canvas>` elements are present in the HTML. The goal is to:
1. Record the shader as a video, compress it, and use it as the header background on desktop/tablet
2. Completely remove all liquid shader code from the codebase
3. Improve mobile performance by disabling decorative hover animations (excluding FAQ, which needs to stay interactive)

---

## Step 1: Create `shader-recording.html` for screen recording

**New file:** `shader-recording.html` (project root)

- Fullscreen `<canvas>` covering the entire viewport, black body
- Inline a modified copy of the `LiquidShader` class from `src/js/liquid-shader.js` with:
  - Mobile-detection early-return **removed** (original lines 12-15)
  - IntersectionObserver pause logic **removed** — always animate
- Apply the exact production CSS filter: `filter: blur(125px) contrast(1.80)` (from `src/css/dist/styles.css:709`)
- No other UI, just the shader effect for recording

---

## Step 2: Compress the recorded video (deferred — awaiting user's file path)

Once the user provides the recorded video:

1. **Compress** with ffmpeg: H.264, CRF 28, 1280×720, no audio, `+faststart`
2. **Extract poster** frame at 1s as WebP
3. Output to `src/img/videos/compressed/header_shader_video.mp4` + `_poster.webp`

---

## Step 3: Apply video background to header (desktop/tablet only)

### HTML — `index.html:616`
Insert video container **inside** `<section id="hero">`, **before** `.header-container`:

```html
<div class="header-background-container">
  <video class="header-background-video"
    loop muted playsinline preload="none"
    poster="{PATH}/header_shader_video_poster.webp"
    data-lazy-video aria-hidden="true" role="presentation"
    width="1280" height="720">
    <source src="{PATH}/header_shader_video.mp4" type="video/mp4">
  </video>
</div>
```

Follows the exact pattern from Problem1 section (`index.html:725-735`). Lazy-loaded by existing `VideoLazyLoader`.

### CSS — `src/css/new/sections.css:22-45`

- Add `.header-background-container` styles (absolute, full coverage, z-index 0, overflow hidden)
- Add `.header-background-video` styles (absolute, object-fit cover, `display: none` by default)
- `@media (min-width: 769px)` → show video, hide `::before` static image
- Mobile keeps the existing static `shader-placeholder.webp` fallback
- Existing `::after` dark overlay (20%) stays unchanged

Z-index stacking: video (0) → static fallback/overlay (1) → content (2, already set at `sections.css:59`)

---

## Step 4: Remove liquid shader entirely

After the video is working, remove all liquid shader code:

### Source files to delete:
- `src/js/liquid-shader.js` — main shader class (293 lines)
- `src/js/liquid-shader-worker.js` — web worker version (166 lines)

### Build script — `build-js.sh:14`
Remove `"./src/js/liquid-shader.js"` from the `JS_FILES` array

### CSS cleanup — `src/css/new/global.css`
Remove all `.liquid-shader-canvas` rules, `.shader-ready` class, `@keyframes liquid-gradient-animation`, and the associated `@media (prefers-reduced-motion)` / `@media (max-width: 768px)` blocks that reference `.liquid-shader-canvas`

### Bundled files to rebuild:
- Run `build-js.sh` to regenerate `src/js/dist/scripts.js` + `scripts.min.js`
- Run `build-css.sh` to regenerate `src/css/dist/styles.css` + `styles.min.css`

**Note:** The `scroll-button-shader.js` (for scroll-to-top button hover effect) is a separate shader and stays untouched.

---

## Step 5: Disable mobile hover/click animations (except FAQ)

### CSS — `src/css/new/global.css:625-647`

Expand the existing `@media (max-width: 768px)` block to also disable:

| Component | Source file | Effect disabled |
|---|---|---|
| `.problem2-cost-box:hover / :active` | `src/css/new/problem2.css:365` | scale + translateY + circling-halo |
| `.joinus1-card.visible:hover / :active` | `src/css/new/joinus1.css:1195` | scale + translateY + circling-halo-joinus1 |
| `.bottom-plan-card.visible:hover / :active` | `src/css/new/joinus1.css:1207` | same pattern |
| `.joinus3-cta-button:hover / :active` | `src/css/new/joinus3.css:263` | scale + box-shadow |

Override with `transform: none !important; animation: none !important;`

**FAQ items are excluded** — they need hover/click interactions to reveal answer text.

### JS — `src/js/new/main.js:24`

Throttle navbar scroll listener with `requestAnimationFrame` + `{ passive: true }`. Currently fires on every scroll event with no throttling.

---

## Verification

1. `shader-recording.html` → shader fills screen, animates continuously, blur+contrast visible
2. Compressed video → ~300-500KB, plays smoothly, poster frame looks correct
3. Desktop header (>768px) → video loops as background, content above it, dark overlay visible
4. Mobile header (≤768px) → static image shown, no video element loaded
5. Mobile touch → no hover animations on cost box, joinus1 cards, joinus3 button
6. Mobile touch → FAQ hover/click interactions still work normally
7. After shader removal → no console errors, no references to `LiquidShader` in bundles
8. Build scripts run cleanly → `scripts.min.js` and `styles.min.css` regenerated without shader code
