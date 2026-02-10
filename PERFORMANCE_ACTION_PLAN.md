# PATA Website Performance Action Plan

## Current Scores
| Metric | Mobile | Desktop |
|--------|--------|---------|
| Performance | 72 | 86 |
| FCP | 1.8s | 0.3s |
| LCP | 3.3s | 0.8s |
| TBT | 40ms | 30ms |
| CLS | 0.418 | 0.268 |
| Speed Index | 2.8s | 0.6s |

## Root Cause Analysis

### Problem #1: CLS (Cumulative Layout Shift) - CRITICAL
**Mobile: 0.418 | Desktop: 0.268** (target: < 0.1)

This is the single biggest issue dragging down the score. Two causes:

1. **Font swap reflow**: `font-display: swap` loads fallback fonts first, then swaps to Mona Sans. The text size difference between fallback and Mona Sans causes the entire hero `<section id="hero">` to shift. Lighthouse explicitly identifies the web font `mona-sans-latin-600-normal.woff2` as a CLS culprit.

2. **Header animation with transform**: `.header-content` starts at `opacity: 0; transform: translateY(30px)` and transitions to `translateY(0)`. While `transform` alone shouldn't cause layout shifts, combined with the font swap timing, it contributes.

### Problem #2: LCP on Mobile (3.3s)
The LCP element is the hero section text (not the mockup image). Font loading is the bottleneck - the critical chain goes through `fonts.bunny.net` woff2 files at 398ms. Only weight 700 is preloaded, but weight 400 and 600 are also render-blocking for the hero.

### Problem #3: Image Oversizing
- `cao.webp` is 270x800px but displayed at 297x447 - oversized, wastes ~15.7 KiB
- `mockup_no_bg_mobile.webp` could save 5.4 KiB with higher compression
- `vet.webp` could save 4.7 KiB with higher compression

---

## Action Plan

### Step 1: Fix CLS from Font Loading (HIGH IMPACT)
**Expected CLS improvement: 0.3+ reduction**

Change `font-display: swap` to `font-display: optional` for the hero-critical fonts (600, 700). This tells the browser: if the font isn't already cached, use the fallback and don't swap later. No swap = no layout shift.

To ensure the fonts ARE available on repeat visits (so users see Mona Sans), we preload them. On first visit, users may see the system font for a split second, but there will be zero CLS.

**Changes in `index.html` inline `<style>` block (lines 108-135):**
```css
/* Mona Sans Regular (400) - used for body, can swap safely */
@font-face {
    font-family: 'Mona Sans';
    src: url('https://fonts.bunny.net/mona-sans/files/mona-sans-latin-400-normal.woff2') format('woff2');
    font-weight: 400;
    font-style: normal;
    font-display: optional;
}

/* Mona Sans SemiBold (600) - used in hero */
@font-face {
    font-family: 'Mona Sans';
    src: url('https://fonts.bunny.net/mona-sans/files/mona-sans-latin-600-normal.woff2') format('woff2');
    font-weight: 600;
    font-style: normal;
    font-display: optional;
}

/* Mona Sans Bold (700) - used in hero */
@font-face {
    font-family: 'Mona Sans';
    src: url('https://fonts.bunny.net/mona-sans/files/mona-sans-latin-700-normal.woff2') format('woff2');
    font-weight: 700;
    font-style: normal;
    font-display: optional;
}
```

Also preload ALL critical font weights (not just 700):
```html
<!-- Preload ALL critical fonts for hero section -->
<link rel="preload" href="https://fonts.bunny.net/mona-sans/files/mona-sans-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="https://fonts.bunny.net/mona-sans/files/mona-sans-latin-600-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="https://fonts.bunny.net/mona-sans/files/mona-sans-latin-700-normal.woff2" as="font" type="font/woff2" crossorigin>
```

### Step 2: Fix CLS from Header Animation (MEDIUM IMPACT)
**Expected CLS improvement: eliminates remaining shift**

Remove `transform: translateY(30px)` from `.header-content` initial state. Use only `opacity` for the fade-in animation (opacity changes do NOT cause layout shifts).

**Changes in `src/css/new/sections.css` (lines 411-414) AND `src/css/dist/styles.css` (lines 1190-1193):**
```css
/* BEFORE */
.header-content {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}
.header-content.visible {
  opacity: 1;
  transform: translateY(0);
}

/* AFTER */
.header-content {
  opacity: 0;
  transition: opacity 0.6s ease;
}
.header-content.visible {
  opacity: 1;
}
```

Also in the **critical inline CSS** in `index.html` (around line 486-489), the `!important` override on `.mockup-center` is good - keep it.

### Step 3: Add Font Size Adjustment to Reduce Swap Impact (MEDIUM IMPACT)
Add `size-adjust` and fallback font metrics to minimize text reflow. This makes the fallback font occupy the same space as Mona Sans.

**Add to the inline `<style>` in `index.html`:**
```css
/* Adjusted fallback to match Mona Sans metrics */
@font-face {
    font-family: 'Mona Sans Fallback';
    src: local('Segoe UI'), local('Arial'), local('Helvetica');
    size-adjust: 100.5%;
    ascent-override: 96%;
    descent-override: 25%;
    line-gap-override: 0%;
}

body {
    font-family: 'Mona Sans', 'Mona Sans Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
```

### Step 4: Compress Images Further (LOW-MEDIUM IMPACT)
**Expected savings: ~25 KiB total**

Re-compress the following images with higher compression:

1. **`cao.webp`** - Currently 41KB. Resize from 270x800 to proper display size (~300x400) and re-encode. Target: ~20KB
2. **`mockup_no_bg_mobile.webp`** - Currently 34KB. Re-encode with quality 75 instead of current. Target: ~28KB
3. **`vet.webp`** - Currently 18KB. Re-encode with quality 75. Target: ~13KB

Command (requires cwebp installed):
```bash
cwebp -q 75 -resize 300 400 src/img/new_images/cao.png -o src/img/new_images/cao.webp
cwebp -q 75 src/img/new_images/mockup_no_bg_mobile.webp -o src/img/new_images/mockup_no_bg_mobile.webp
cwebp -q 75 src/img/new_images/vet.png -o src/img/new_images/vet.webp
```

### Step 5: Rebuild Minified CSS (REQUIRED)
After editing the source CSS files, rebuild the minified version:
```
styles.css changes must be reflected in styles.min.css
```

---

## Expected Results After All Changes

| Metric | Mobile (Current) | Mobile (Expected) | Desktop (Current) | Desktop (Expected) |
|--------|-------------------|--------------------|--------------------|---------------------|
| CLS | 0.418 | < 0.1 | 0.268 | < 0.05 |
| LCP | 3.3s | ~2.0-2.5s | 0.8s | ~0.5-0.7s |
| Performance | 72 | 85-95 | 86 | 92-98 |

The CLS fix alone (Steps 1-3) should boost the score by 10-20 points since CLS has a 25% weight in Lighthouse scoring and going from 0.418 to < 0.1 is a massive improvement.

---

## Execution Order
1. Step 1 (font-display + preload) - edit `index.html`
2. Step 2 (remove translateY) - edit `sections.css`, `styles.css`, `styles.min.css`
3. Step 3 (font fallback metrics) - edit `index.html`
4. Step 4 (image compression) - requires cwebp tool
5. Step 5 (rebuild minified CSS)

Steps 1-3 can be done immediately in code. Step 4 requires image processing tools.
