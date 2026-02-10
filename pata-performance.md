PATA Website Performance Optimization Plan
Context
The PATA website (pata.care) scores 68 on mobile and 90 on desktop in PageSpeed Insights. The main problems are:

CLS of 0.897 on mobile (target: < 0.1) — caused by header-container layout shifts
LCP of 3.3s on mobile (target: < 2.5s) — caused by oversized LCP image
Desktop GPU at 92-98% — 3 WebGL liquid shader contexts running at 60fps
Firefox using 1710 MB RAM — WebGL + videos + large DOM
Oversized images — up to 196 KiB savings on desktop
Mobile jank — hover effects, draggable elements, animated box-shadows all wasting cycles on touch devices
User decisions:

Shader replacement: Static CSS gradient (no animation)
BONE.svg on mobile: Hide completely
Halo animations: Keep on desktop, remove on mobile
Step 1: Remove WebGL Liquid Shader on ALL Devices
Why: 3 WebGL contexts at 60fps = 92-98% GPU usage, 1710MB RAM in Firefox.

Files to modify:

index.html
src/js/dist/scripts-critical.js
src/css/new/global.css (or inline critical CSS)
src/css/new/joinus2.css
src/css/new/joinus3.css
Changes:

index.html — Remove these 3 canvas elements:

Line 622: <canvas id="liquid-shader-canvas" ...>
Line 1788: <canvas id="liquid-shader-canvas-joinus2" ...>
Line 2295: <canvas id="liquid-shader-canvas-joinus3" ...>
Also remove the <div class="mouse-highlight"> element if present in the header
index.html critical CSS — Add static gradient to header:


.header-section {
  background: linear-gradient(135deg,
    rgba(33, 76, 110, 0.75) 0%,
    rgba(165, 70, 26, 0.75) 50%,
    rgba(191, 150, 97, 0.75) 100%);
}
joinus2.css — Add static gradient background:


.joinus2-section {
  background: linear-gradient(135deg,
    rgba(33, 76, 110, 0.75) 0%,
    rgba(165, 70, 26, 0.75) 50%,
    rgba(191, 150, 97, 0.75) 100%);
}
joinus3.css — Add static gradient background:


.joinus3-section {
  background: linear-gradient(135deg,
    rgba(33, 76, 110, 0.75) 0%,
    rgba(165, 70, 26, 0.75) 50%,
    rgba(191, 150, 97, 0.75) 100%);
}
scripts-critical.js — Remove:

initShaderWorker() function (lines 13-80)
LiquidShader class (lines 86-304)
MouseHighlight class (lines 441-500)
Shader initialization in DOMContentLoaded (lines 611-622)
Shader cleanup in beforeunload (lines 639-645)
HeaderParallax class (lines 369-435) — also remove, it tracks mouse for parallax effect on desktop header elements
index.html — Remove data-parallax attributes from header elements (if any)

Files no longer loaded (can leave or delete):

src/js/liquid-shader.js
src/js/liquid-shader-worker.js
src/js/liquid-shader-worker.min.js
src/js/new/scroll-button-shader.js
Step 2: Fix CLS on Mobile (0.897 → < 0.1)
Why: header-container shifts as fonts load and content reflows.

Files to modify:

index.html (critical CSS <style> block)
Changes:

Preload the bold font (used in header h1):


<link rel="preload" href="https://fonts.bunny.net/mona-sans/files/mona-sans-latin-700-normal.woff2" as="font" type="font/woff2" crossorigin>
Reserve header space in critical CSS:


.header-container {
  min-height: 600px; /* Reserve space to prevent CLS */
}
@media (max-width: 768px) {
  .header-container {
    min-height: 400px;
  }
}
Add font size-adjust to reduce FOUT layout shift:


@font-face {
  font-family: 'Mona Sans';
  size-adjust: 100%;
  /* existing properties */
}
Add dimensions to video elements — All <video> tags need width and height:


<video ... width="1280" height="720">
Apply to all 5 video elements in the HTML.

Step 3: Optimize Images
Why: 196 KiB savings possible. Images served larger than displayed.

Action required (manual, outside Claude Code):
Use Squoosh or cwebp CLI to create properly-sized variants:

Image	Current Size	Display Size	Action
mockup_no_bg.webp	928x1000	476x513	Resize to 512w, re-compress at quality 75
gatinho.webp	571x800	300x400	Resize to 320w, re-compress
vet.webp	534x800	300x400	Resize to 320w, re-compress
cao.webp	270x800	297x447	Re-compress at quality 70 (size already ok)
cao_medico.webp	800x533	300x400	Resize to 320w, re-compress
Files to modify after creating resized images:

index.html — Update <picture> elements with proper srcset and sizes:

<img srcset="./src/img/new_images/gatinho-300w.webp 300w,
             ./src/img/new_images/gatinho.webp 571w"
     sizes="300px"
     ...>
Step 4: Simplify Mobile Experience
Why: Touch devices don't benefit from hover effects, draggable elements, or animated box-shadows.

A) Hide BONE.svg on mobile
File: src/css/new/global.css


@media (max-width: 768px) {
  .draggable-element,
  #draggableElement {
    display: none !important;
  }
}
File: src/js/dist/scripts-deferred.js — Guard initialization:


// Only init DraggableElement on desktop with hover
if (window.matchMedia('(hover: hover)').matches) {
  new DraggableElement();
}
B) Disable animated box-shadow keyframes on mobile
Files: solution1.css, solution3.css, solution4.css, problem3.css

Add to each file:


@media (max-width: 768px) {
  /* Disable circling halo animation on mobile */
  .card-content,
  .solution3-card,
  .solution4-main-card,
  .problem3-stat-card {
    animation: none !important;
  }
}
C) Disable hover transforms on mobile
File: src/css/new/global.css — Extend existing mobile section (line ~620):


@media (max-width: 768px) {
  /* Disable all hover transforms on touch devices */
  .navbar-cta-button:hover,
  .footer-social-link:hover,
  .scroll-to-top-btn:hover,
  .joinus1-card:hover,
  .bottom-plan-card:hover,
  .benefit-card:hover,
  .faq-toggle-button:hover {
    transform: none !important;
    box-shadow: inherit !important;
    filter: none !important;
  }
}
D) Simplify scroll-to-top button on mobile
File: src/css/new/scroll-to-top.css


@media (max-width: 768px) {
  .scroll-to-top-btn:hover,
  .scroll-to-top-btn:active {
    filter: none !important;
    transform: translateX(-50%) !important;
  }
  .scroll-to-top-btn:hover .arrow-icon {
    filter: none !important;
  }
}
Step 5: Additional Quick Wins
A) Remove console.log statements from production
Files: scripts-critical.js, scripts-deferred.js
Remove all console.log('🐾 ...)andconsole.log('⚡ ...')` calls. These are minor but add unnecessary work.

B) Simplify Navbar scroll handler
File: scripts-critical.js
The Navbar handleScroll() fires on every scroll event without throttling. Add passive listener and throttle:


window.addEventListener('scroll', () => this.handleScroll(), { passive: true });
C) Remove unused SmoothScroll dead code
File: src/js/new/main.js — The SmoothScroll class has handleWheel, handleKeyboard, handleScroll, raf methods that are dead code (never called). The actual init() only calls setupAnchorLinks(). Clean up.
In scripts-critical.js line 578-603, the SmoothScroll class is already cleaned up. Just ensure main.js matches.

Step 6: Rebuild Minified Bundles
After all changes, rebuild:

src/css/dist/styles.min.css — Concatenate and minify all CSS from src/css/new/
src/js/dist/scripts-critical.min.js — Minify scripts-critical.js
src/js/dist/scripts-deferred.min.js — Minify scripts-deferred.js
Use the existing build-css.sh and build-js.sh scripts, or manually with terser for JS and csso/clean-css for CSS.

File Modification Summary
File	Changes
index.html	Remove 3 canvases, add video dimensions, preload font, add header min-heights, update critical CSS with gradient
src/js/dist/scripts-critical.js	Remove LiquidShader, initShaderWorker, MouseHighlight, HeaderParallax, shader init/cleanup, console.logs
src/js/dist/scripts-deferred.js	Guard DraggableElement with hover check, remove console.logs
src/css/new/global.css	Hide draggable on mobile, disable hover transforms on mobile
src/css/new/joinus2.css	Add static gradient fallback background
src/css/new/joinus3.css	Add static gradient fallback background
src/css/new/solution1.css	Disable halo animation on mobile
src/css/new/solution3.css	Disable halo animation on mobile
src/css/new/solution4.css	Disable halo animation on mobile
src/css/new/problem3.css	Disable halo animation on mobile
src/css/new/scroll-to-top.css	Simplify hover/active effects on mobile
src/css/dist/styles.min.css	Rebuild
src/js/dist/scripts-critical.min.js	Rebuild
src/js/dist/scripts-deferred.min.js	Rebuild
Testing & Verification
Tools:
PageSpeed Insights (https://pagespeed.web.dev/) — Mobile + Desktop
Chrome DevTools Performance tab — Record scroll, check for long frames
Chrome DevTools > Rendering > Frame Rendering Stats — Check dropped frames
Chrome DevTools > Performance Monitor — Watch GPU/CPU usage live
WebPageTest (https://www.webpagetest.org/) — Real device simulation
BrowserStack / LambdaTest — Test on real low-end Android devices
Checklist:
 Mobile PageSpeed > 85 (target: 90)
 Desktop PageSpeed > 95
 CLS < 0.1 on mobile
 LCP < 2.5s on mobile
 No WebGL contexts (check DevTools Performance)
 GPU usage < 30% on desktop
 Smooth scrolling on mobile without jank
 BONE.svg hidden on mobile
 Hover effects disabled on mobile
 Static gradients look good on header, joinus2, joinus3
 Videos play on desktop, show posters on mobile
 No visual regressions
Estimated Impact:
Metric	Before	Target
Mobile Performance	68	85-90
Desktop Performance	90	95+
Mobile CLS	0.897	< 0.1
Mobile LCP	3.3s	< 2.5s
Desktop GPU	92-98%	< 30%
Firefox memory	1710 MB	< 800 MB