# PATA Website - Improvement Roadmap

## Current Performance Status
- **Mobile:** 100/100 (CLS: 0.016 - Excellent)
- **Desktop:** 92/100 (CLS: 0.158 - Needs Improvement)

The threshold for "good" CLS is < 0.1. Desktop is failing this metric.

---

## Priority 1: Fix CLS Issues (High Impact)

### 1.1 Add Missing Image Dimensions

**File:** `index.html` (Line ~1577)

**Issue:** The image `primeiros_500_2.png` lacks explicit width/height attributes.

**Current:**
```html
<img src="./src/img/new_images/primeiros_500_2.png" alt="" class="card-background-image">
```

**Fix:**
```html
<img src="./src/img/new_images/primeiros_500_2.png" alt="" class="card-background-image" width="800" height="534">
```

---

### 1.2 Add Aspect-Ratio to Card Background Images

**File:** `src/css/new/joinus2.css` or inline styles

**Issue:** `.card-background-image` uses absolute positioning without intrinsic aspect-ratio, which can cause layout shifts when images load.

**Add to CSS:**
```css
.card-background-image {
    aspect-ratio: 800 / 534;
}
```

---

### 1.3 Font Display Optimization (Reduce Font Swap Shift)

**File:** `index.html` (in `<style>` block or `global.css`)

**Issue:** `font-display: swap` causes text to reflow when the web font loads. On desktop, with more visible text, this causes larger CLS.

**Option A - Add size-adjust (Recommended):**
```css
@font-face {
    font-family: 'Mona Sans';
    src: url('https://fonts.bunny.net/mona-sans/files/mona-sans-latin-400-normal.woff2') format('woff2');
    font-weight: 400;
    font-style: normal;
    font-display: swap;
    size-adjust: 100%; /* Adjust this value to match fallback font metrics */
    ascent-override: 95%;
    descent-override: 22%;
    line-gap-override: 0%;
}
```

**Option B - Use font-display: optional:**
If the font fails to load quickly, keep the fallback font (no shift, but may not show custom font on slow connections):
```css
font-display: optional;
```

**Option C - Fallback Font Matching:**
Add a CSS variable fallback that closely matches Mona Sans metrics:
```css
body {
    font-family: 'Mona Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-synthesis: none;
}
```

---

## Priority 2: Fix Partytown 404 Error

### 2.1 Verify Deployment of ~partytown Folder

**Issue:** WebPageTest shows `partytown.js` returning 404.

**Local Status:** The `~partytown/` folder EXISTS locally with all required files:
- `partytown.js`
- `partytown-atomics.js`
- `partytown-sw.js`
- `partytown-media.js`
- `/debug/` subdirectory

**Possible Causes:**
1. The `~partytown/` folder wasn't included in deployment
2. The hosting provider strips or blocks folders starting with `~`
3. The path is case-sensitive and doesn't match

**Fix Options:**

**Option A - Ensure folder is deployed:**
Check your deployment configuration (e.g., `.gitignore`, hosting settings) to ensure `~partytown/` is included.

**Option B - Rename folder:**
If the `~` character causes issues, rename to `_partytown/` and update references:

```javascript
// index.html (Line 24-28)
partytown = {
    lib: "/_partytown/",  // Changed from /~partytown/
    forward: ["dataLayer.push", "gtag"],
    debug: false
};
```

```html
<!-- Line 30 -->
<script src="/_partytown/partytown.js"></script>
```

**Option C - Use CDN version:**
If self-hosting is problematic, use the unpkg CDN:
```javascript
partytown = {
    lib: "https://unpkg.com/@builder.io/partytown@0.10.3/lib/",
    forward: ["dataLayer.push", "gtag"],
    debug: false
};
```

---

## Priority 3: Additional Optimizations

### 3.1 Preload Critical Font Weights

**Current:** Only weight 400 is preloaded.

**Recommendation:** If weight 600 or 700 appears above the fold, preload those too:
```html
<link rel="preload" href="https://fonts.bunny.net/mona-sans/files/mona-sans-latin-600-normal.woff2" as="font" type="font/woff2" crossorigin>
```

---

### 3.2 Consider Inline Critical Font

For the fastest possible font rendering, subset and inline the critical characters:
```html
<style>
@font-face {
    font-family: 'Mona Sans';
    src: url('data:font/woff2;base64,...') format('woff2');
    font-weight: 400;
    font-display: swap;
    unicode-range: U+0000-00FF; /* Latin Basic subset */
}
</style>
```

---

### 3.3 Update Partytown Dependency

**Current:** `@builder.io/partytown` (moved to new organization)

**Recommendation:** Update to the new package name:
```json
{
    "dependencies": {
        "@qwik.dev/partytown": "^0.10.3"
    }
}
```

Then regenerate the lib files:
```bash
npm install @qwik.dev/partytown
npx @qwik.dev/partytown copylib ~partytown
```

---

## Verification Checklist

After making changes, verify improvements:

- [ ] Run WebPageTest on desktop and check CLS < 0.1
- [ ] Verify no 404 errors in Network tab for partytown.js
- [ ] Check Lighthouse Performance score in Chrome DevTools
- [ ] Test font loading with Network throttling (Slow 3G)
- [ ] Verify layout stability by recording Performance timeline

---

## Implementation Order

1. **Quick wins (< 5 min):**
   - Add width/height to `primeiros_500_2.png`
   - Add aspect-ratio CSS to `.card-background-image`

2. **Medium effort (15-30 min):**
   - Fix Partytown 404 (verify deployment or rename folder)
   - Test font-display options

3. **Longer-term (optional):**
   - Font subsetting and inlining
   - Update Partytown to new package
   - Advanced font metrics tuning (size-adjust, ascent-override)

---

## Expected Results

After implementing Priority 1 and 2 fixes:
- **Desktop CLS:** Should drop below 0.1 (green)
- **Desktop Score:** Should reach 95-100
- **No console errors** from partytown.js 404

---

*Generated: February 2026*
*Based on WebPageTest analysis of pata.care*
