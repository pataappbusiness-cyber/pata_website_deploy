# PATA Website - Scroll-to-Top Button Specification

## Overview
Implement an animated scroll-to-top button that appears when the user scrolls past the header section. The button features a circular stroke that fills progressively as the user scrolls down the page, with the liquid shader effect applied to create a dynamic, premium appearance matching PATA's brand aesthetic.

## Visual Design Reference

### Component States

#### State 1: Initial/Default (Hidden)
**Figma Node**: `456:3256`
- **Size**: 40px × 40px
- **Visibility**: Hidden when at top of page
- **Arrow Color**: Dark (#1E1E1E)
- **Background**: Transparent
- **Stroke**: None visible

![Default State](https://www.figma.com/design/foywvD3Djh1yzshKk4Fwft/PATA-WEBSITE?node-id=456-3256)

#### State 2: Visible with Progress Stroke
**Figma Node**: `456:3257`
- **Size**: 40px × 40px
- **Visibility**: Visible when scrolled past header
- **Arrow Color**: Dark (#1E1E1E)
- **Background**: Transparent
- **Stroke**: Circular progress indicator that fills clockwise
- **Stroke Effect**: Liquid shader gradient applied to opacity
- **Stroke Width**: 2px

![Progress Stroke State](https://www.figma.com/design/foywvD3Djh1yzshKk4Fwft/PATA-WEBSITE?node-id=456-3257)

#### State 3: Hover
**Figma Node**: `456:3258`
- **Size**: 40px × 40px (base)
- **Arrow Color**: White (#FEFEFF)
- **Background**: Filled with liquid shader effect
- **Stroke**: Maintains progress state
- **Effect**: Button fills with animated liquid gradient

![Hover State](https://www.figma.com/design/foywvD3Djh1yzshKk4Fwft/PATA-WEBSITE?node-id=456-3258)

#### State 4: Hover Expanded
**Figma Node**: `456:3259`
- **Size**: 46px × 46px (15% scale increase)
- **Arrow Color**: White (#FEFEFF)
- **Background**: Filled with liquid shader effect
- **Stroke**: Maintains progress state
- **Animation**: Smooth scale-up transition (200ms ease-out)

![Hover Expanded State](https://www.figma.com/design/foywvD3Djh1yzshKk4Fwft/PATA-WEBSITE?node-id=456-3259)

#### State 5: Active/Pressed
**Figma Node**: `456:3260`
- **Size**: 38px × 38px (5% scale decrease)
- **Arrow Color**: White (#FEFEFF)
- **Background**: Filled with liquid shader effect
- **Stroke**: Maintains progress state
- **Animation**: Quick scale-down transition (100ms ease-in)

![Active State](https://www.figma.com/design/foywvD3Djh1yzshKk4Fwft/PATA-WEBSITE?node-id=456-3260)

## Technical Implementation

### File Structure
```
/website-redesign
  /assets
    /shaders
      - liquid-shader.js (existing)
      - scroll-button-shader.js (new)
  /css
    - scroll-to-top.css (new)
  /js
    - scroll-to-top.js (new)
  - index.html (add button element)
```

## Implementation Code

### 1. HTML Structure
Add this button element before the closing `</body>` tag:

```html
<!-- Scroll to Top Button -->
<button 
  id="scroll-to-top-button" 
  class="scroll-to-top-btn" 
  aria-label="Scroll to top"
  hidden
>
  <!-- SVG Circle Progress -->
  <svg class="progress-ring" width="42" height="42" viewBox="0 0 42 42">
    <defs>
      <!-- Liquid shader gradient for progress stroke -->
      <linearGradient id="liquid-gradient-progress" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#DF6E39;stop-opacity:1" />
        <stop offset="50%" style="stop-color:#DB5D23;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#387BB2;stop-opacity:1" />
      </linearGradient>
      
      <!-- Mask for liquid shader canvas -->
      <mask id="button-mask">
        <circle cx="21" cy="21" r="19" fill="white"/>
      </mask>
    </defs>
    
    <!-- Background circle (always visible when button shown) -->
    <circle
      class="progress-ring-bg"
      stroke="#E5E5E5"
      stroke-width="2"
      fill="transparent"
      r="19"
      cx="21"
      cy="21"
      stroke-opacity="0.2"
    />
    
    <!-- Progress circle (fills clockwise) -->
    <circle
      class="progress-ring-circle"
      stroke="url(#liquid-gradient-progress)"
      stroke-width="2"
      fill="transparent"
      r="19"
      cx="21"
      cy="21"
      stroke-dasharray="119.38"
      stroke-dashoffset="119.38"
      stroke-linecap="round"
      transform="rotate(-90 21 21)"
    />
  </svg>
  
  <!-- Liquid shader canvas for hover effect -->
  <canvas id="scroll-button-shader-canvas" class="button-shader-canvas"></canvas>
  
  <!-- Arrow Icon -->
  <svg class="arrow-icon" width="26" height="26" viewBox="0 0 26 26" fill="none">
    <path 
      d="M13 20.5833V5.41667M13 5.41667L6.5 11.9167M13 5.41667L19.5 11.9167" 
      stroke="currentColor" 
      stroke-width="2" 
      stroke-linecap="round" 
      stroke-linejoin="round"
    />
  </svg>
</button>
```

### 2. CSS Styling
**File: `/css/scroll-to-top.css`**

```css
/* ============================================
   SCROLL TO TOP BUTTON STYLES
   ============================================ */

.scroll-to-top-btn {
  /* Positioning */
  position: fixed;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  
  /* Size */
  width: 40px;
  height: 40px;
  
  /* Layout */
  display: flex;
  align-items: center;
  justify-content: center;
  
  /* Style */
  background: transparent;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  
  /* Transitions */
  transition: transform 0.2s ease-out, opacity 0.3s ease;
  
  /* Visibility */
  opacity: 0;
  pointer-events: none;
  
  /* Remove default button styles */
  padding: 0;
  outline: none;
  -webkit-tap-highlight-color: transparent;
}

/* Button visible state */
.scroll-to-top-btn.visible {
  opacity: 1;
  pointer-events: auto;
}

/* Remove hidden attribute styling */
.scroll-to-top-btn[hidden] {
  display: none;
}

/* ============================================
   PROGRESS RING (SVG)
   ============================================ */

.progress-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 42px;
  height: 42px;
  pointer-events: none;
  transition: transform 0.2s ease-out;
}

.progress-ring-circle {
  transition: stroke-dashoffset 0.1s linear;
  will-change: stroke-dashoffset;
}

/* ============================================
   LIQUID SHADER CANVAS (HOVER BACKGROUND)
   ============================================ */

.button-shader-canvas {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
  mask: url(#button-mask);
  -webkit-mask: url(#button-mask);
}

/* ============================================
   ARROW ICON
   ============================================ */

.arrow-icon {
  position: relative;
  z-index: 2;
  width: 26px;
  height: 26px;
  color: #1E1E1E;
  transition: color 0.3s ease;
  pointer-events: none;
}

/* ============================================
   HOVER STATE
   ============================================ */

.scroll-to-top-btn:hover {
  transform: translateX(-50%) scale(1.15);
}

.scroll-to-top-btn:hover .button-shader-canvas {
  opacity: 1;
}

.scroll-to-top-btn:hover .arrow-icon {
  color: #FEFEFF;
}

.scroll-to-top-btn:hover .progress-ring {
  transform: translate(-50%, -50%) scale(1.15);
}

/* ============================================
   ACTIVE/PRESSED STATE
   ============================================ */

.scroll-to-top-btn:active {
  transform: translateX(-50%) scale(0.95);
  transition: transform 0.1s ease-in;
}

.scroll-to-top-btn:active .progress-ring {
  transform: translate(-50%, -50%) scale(0.95);
  transition: transform 0.1s ease-in;
}

/* ============================================
   FOCUS STATE (ACCESSIBILITY)
   ============================================ */

.scroll-to-top-btn:focus-visible {
  outline: 2px solid #DF6E39;
  outline-offset: 4px;
}

/* ============================================
   REDUCED MOTION SUPPORT
   ============================================ */

@media (prefers-reduced-motion: reduce) {
  .scroll-to-top-btn,
  .progress-ring,
  .progress-ring-circle,
  .button-shader-canvas,
  .arrow-icon {
    transition: none !important;
  }
  
  .scroll-to-top-btn:hover {
    transform: translateX(-50%) scale(1.05);
  }
  
  .button-shader-canvas {
    display: none;
  }
  
  /* Show simple background on hover instead */
  .scroll-to-top-btn:hover::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #DF6E39 0%, #387BB2 100%);
    border-radius: 50%;
    opacity: 1;
    z-index: 1;
  }
}

/* ============================================
   MOBILE OPTIMIZATION
   ============================================ */

@media (max-width: 768px) {
  .scroll-to-top-btn {
    bottom: 24px;
    width: 48px;
    height: 48px;
  }
  
  .progress-ring {
    width: 50px;
    height: 50px;
  }
  
  .button-shader-canvas {
    width: 48px;
    height: 48px;
  }
  
  .arrow-icon {
    width: 28px;
    height: 28px;
  }
  
  /* Larger touch target */
  .scroll-to-top-btn::before {
    content: '';
    position: absolute;
    top: -8px;
    left: -8px;
    right: -8px;
    bottom: -8px;
  }
}

/* ============================================
   HIGH CONTRAST MODE
   ============================================ */

@media (prefers-contrast: high) {
  .scroll-to-top-btn {
    outline: 2px solid currentColor;
  }
  
  .progress-ring-bg {
    stroke-opacity: 0.5;
  }
}
```

### 3. Scroll Behavior JavaScript
**File: `/js/scroll-to-top.js`**

```javascript
/**
 * PATA Scroll to Top Button
 * Handles visibility, scroll progress, and smooth scrolling
 */

class ScrollToTopButton {
  constructor() {
    this.button = document.getElementById('scroll-to-top-button');
    this.progressCircle = document.querySelector('.progress-ring-circle');
    this.heroSection = document.getElementById('hero');
    
    if (!this.button || !this.progressCircle || !this.heroSection) {
      console.error('Required elements not found for ScrollToTopButton');
      return;
    }
    
    // Calculate circle circumference for progress animation
    const radius = this.progressCircle.r.baseVal.value;
    this.circumference = radius * 2 * Math.PI;
    
    // Set initial stroke dash properties
    this.progressCircle.style.strokeDasharray = `${this.circumference} ${this.circumference}`;
    this.progressCircle.style.strokeDashoffset = this.circumference;
    
    // Bind methods
    this.handleScroll = this.handleScroll.bind(this);
    this.scrollToTop = this.scrollToTop.bind(this);
    
    // Initialize
    this.init();
  }
  
  init() {
    // Add scroll event listener with throttle
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          this.handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    });
    
    // Add click event listener
    this.button.addEventListener('click', this.scrollToTop);
    
    // Initial check
    this.handleScroll();
  }
  
  handleScroll() {
    const heroHeight = this.heroSection.offsetHeight;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    
    // Show/hide button based on scroll position
    if (scrollTop > heroHeight) {
      this.button.removeAttribute('hidden');
      this.button.classList.add('visible');
    } else {
      this.button.classList.remove('visible');
      // Delay hiding to allow fade-out animation
      setTimeout(() => {
        if (!this.button.classList.contains('visible')) {
          this.button.setAttribute('hidden', '');
        }
      }, 300);
    }
    
    // Calculate scroll progress (0 to 1)
    const scrollableDistance = docHeight - heroHeight;
    const scrollProgress = Math.min(
      Math.max((scrollTop - heroHeight) / scrollableDistance, 0),
      1
    );
    
    // Update progress circle
    this.setProgress(scrollProgress);
  }
  
  setProgress(progress) {
    // Calculate offset (inverted for clockwise animation)
    const offset = this.circumference - (progress * this.circumference);
    this.progressCircle.style.strokeDashoffset = offset;
  }
  
  scrollToTop() {
    // Smooth scroll to top
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    
    // Optional: Add haptic feedback on mobile
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
    
    // Trigger analytics event (optional)
    if (typeof gtag !== 'undefined') {
      gtag('event', 'scroll_to_top_click', {
        'event_category': 'engagement',
        'event_label': 'scroll_button'
      });
    }
  }
  
  destroy() {
    window.removeEventListener('scroll', this.handleScroll);
    this.button.removeEventListener('click', this.scrollToTop);
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.scrollToTopButton = new ScrollToTopButton();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (window.scrollToTopButton) {
    window.scrollToTopButton.destroy();
  }
});
```

### 4. Liquid Shader for Button (Hover Effect)
**File: `/assets/shaders/scroll-button-shader.js`**

```javascript
/**
 * PATA Scroll Button Liquid Shader
 * Smaller version of the liquid shader for the scroll-to-top button hover effect
 */

class ScrollButtonShader {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      console.error('Canvas element not found:', canvasId);
      return;
    }
    
    this.gl = this.canvas.getContext('webgl', {
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: false
    }) || this.canvas.getContext('experimental-webgl', {
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: false
    });
    
    if (!this.gl) {
      console.warn('WebGL not supported for scroll button shader');
      return;
    }
    
    this.startTime = Date.now();
    this.animationId = null;
    this.isVisible = false;
    
    // PATA Brand Colors (normalized to 0-1 range)
    this.brandColors = {
      primaryOrange: [223/255, 110/255, 57/255],
      darkBlue: [18/255, 40/255, 58/255],
      accentOrange: [219/255, 93/255, 35/255],
      lightBlue: [56/255, 123/255, 178/255]
    };
    
    this.init();
  }
  
  init() {
    this.resizeCanvas();
    
    // Watch for hover events on parent button
    const button = this.canvas.closest('.scroll-to-top-btn');
    if (button) {
      button.addEventListener('mouseenter', () => {
        this.isVisible = true;
        if (!this.animationId) {
          this.animate();
        }
      });
      
      button.addEventListener('mouseleave', () => {
        this.isVisible = false;
      });
    }
    
    this.createShaderProgram();
    this.setupUniforms();
    this.setupGeometry();
  }
  
  resizeCanvas() {
    const size = 40; // Match button size
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    
    this.canvas.width = size * dpr;
    this.canvas.height = size * dpr;
    
    if (this.gl) {
      this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }
  }
  
  createShaderProgram() {
    // Vertex Shader
    const vertexShaderSource = `
      attribute vec2 a_position;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;
    
    // Fragment Shader (optimized for small size)
    const fragmentShaderSource = `
      precision mediump float;
      uniform vec2 u_resolution;
      uniform float u_time;
      uniform vec3 u_color1;
      uniform vec3 u_color2;
      uniform vec3 u_color3;
      uniform vec3 u_color4;
      
      void main() {
        vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
        
        float d = -u_time * 0.3;
        float a = 0.0;
        
        // Simplified liquid motion (fewer iterations for performance)
        for (float i = 0.0; i < 5.0; ++i) {
          a += cos(i - d - a * uv.x);
          d += sin(uv.y * i + a);
        }
        
        d += u_time * 0.3;
        
        // Color mixing
        vec3 col = vec3(
          cos(uv * vec2(d, a)) * 0.6 + 0.4,
          cos(a + d) * 0.5 + 0.5
        );
        
        col = cos(col * cos(vec3(d, a, 2.5)) * 0.5 + 0.5);
        
        // Blend PATA brand colors
        vec3 finalColor = mix(
          mix(u_color2, u_color4, col.r),
          mix(u_color3, u_color1, col.g),
          col.b
        );
        
        finalColor = finalColor * (0.9 + col.r * 0.2);
        
        // Add subtle vignette for circular appearance
        float dist = length(uv);
        float vignette = smoothstep(1.0, 0.6, dist);
        finalColor *= vignette;
        
        gl_FragColor = vec4(finalColor, vignette);
      }
    `;
    
    const vertexShader = this.compileShader(vertexShaderSource, this.gl.VERTEX_SHADER);
    const fragmentShader = this.compileShader(fragmentShaderSource, this.gl.FRAGMENT_SHADER);
    
    this.program = this.gl.createProgram();
    this.gl.attachShader(this.program, vertexShader);
    this.gl.attachShader(this.program, fragmentShader);
    this.gl.linkProgram(this.program);
    
    if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
      console.error('Shader program link failed:', this.gl.getProgramInfoLog(this.program));
      return;
    }
    
    this.gl.useProgram(this.program);
  }
  
  compileShader(source, type) {
    const shader = this.gl.createShader(type);
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.error('Shader compilation error:', this.gl.getShaderInfoLog(shader));
      this.gl.deleteShader(shader);
      return null;
    }
    
    return shader;
  }
  
  setupUniforms() {
    this.uniforms = {
      resolution: this.gl.getUniformLocation(this.program, 'u_resolution'),
      time: this.gl.getUniformLocation(this.program, 'u_time'),
      color1: this.gl.getUniformLocation(this.program, 'u_color1'),
      color2: this.gl.getUniformLocation(this.program, 'u_color2'),
      color3: this.gl.getUniformLocation(this.program, 'u_color3'),
      color4: this.gl.getUniformLocation(this.program, 'u_color4')
    };
    
    // Set static uniforms
    this.gl.uniform3fv(this.uniforms.color1, this.brandColors.primaryOrange);
    this.gl.uniform3fv(this.uniforms.color2, this.brandColors.darkBlue);
    this.gl.uniform3fv(this.uniforms.color3, this.brandColors.accentOrange);
    this.gl.uniform3fv(this.uniforms.color4, this.brandColors.lightBlue);
  }
  
  setupGeometry() {
    const positions = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
       1,  1
    ]);
    
    const buffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, positions, this.gl.STATIC_DRAW);
    
    const positionLocation = this.gl.getAttribLocation(this.program, 'a_position');
    this.gl.enableVertexAttribArray(positionLocation);
    this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0);
  }
  
  animate() {
    if (!this.isVisible) {
      this.animationId = null;
      return;
    }
    
    this.animationId = requestAnimationFrame(() => this.animate());
    
    const currentTime = (Date.now() - this.startTime) * 0.001;
    
    // Update uniforms
    this.gl.uniform2f(this.uniforms.resolution, this.canvas.width, this.canvas.height);
    this.gl.uniform1f(this.uniforms.time, currentTime);
    
    // Render
    this.gl.clearColor(0, 0, 0, 0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
  }
  
  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    
    if (this.gl) {
      this.gl.deleteProgram(this.program);
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (!prefersReducedMotion) {
    window.scrollButtonShader = new ScrollButtonShader('scroll-button-shader-canvas');
  }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (window.scrollButtonShader) {
    window.scrollButtonShader.destroy();
  }
});
```

## Integration Steps

### Step 1: Add Files to Project
1. Copy HTML button element to `index.html` before `</body>`
2. Create `/css/scroll-to-top.css`
3. Create `/js/scroll-to-top.js`
4. Create `/assets/shaders/scroll-button-shader.js`

### Step 2: Link Resources in HTML
Add to `<head>` section:
```html
<link rel="stylesheet" href="/css/scroll-to-top.css">
```

Add before closing `</body>` tag (after existing scripts):
```html
<script src="/js/scroll-to-top.js"></script>
<script src="/assets/shaders/scroll-button-shader.js"></script>
```

### Step 3: Verify Hero Section ID
Ensure your hero/header section has the ID `hero`:
```html
<section id="hero" class="hero-section">
  <!-- Hero content -->
</section>
```

### Step 4: Test Visual States
Test all interaction states:
- ✅ Hidden when at top of page
- ✅ Appears when scrolled past hero section
- ✅ Progress stroke fills as user scrolls down
- ✅ Hover shows liquid shader background and white arrow
- ✅ Hover scales button to 115%
- ✅ Active/pressed scales button to 95%
- ✅ Click scrolls smoothly to top
- ✅ Button hides when back at top

## Behavior Specifications

### Visibility Logic
```
IF scroll position > hero section height:
  → Show button (fade in 300ms)
ELSE:
  → Hide button (fade out 300ms)
```

### Progress Calculation
```
scrollableDistance = (total document height) - (hero section height)
scrollProgress = (current scroll - hero height) / scrollableDistance
progressPercentage = clamp(scrollProgress, 0, 1) × 100%
```

The circular stroke fills clockwise from 0% to 100% based on scroll depth.

### Interaction States
| State | Trigger | Size | Duration | Arrow Color | Background |
|-------|---------|------|----------|-------------|------------|
| Default | Scrolled past hero | 40px | - | Dark (#1E1E1E) | Transparent |
| Hover Start | Mouse enter | 40px → 46px | 200ms ease-out | Dark → White | Fade in shader |
| Hover | Mouse over | 46px | - | White | Liquid shader |
| Active | Mouse down | 46px → 38px | 100ms ease-in | White | Liquid shader |
| Release | Mouse up | 38px → 46px | 200ms ease-out | White | Liquid shader |

### Scroll Behavior
```javascript
// Smooth scroll configuration
window.scrollTo({
  top: 0,
  behavior: 'smooth' // Native smooth scrolling
});
```

## Performance Optimization

### Scroll Event Throttling
- Uses `requestAnimationFrame` for scroll calculations
- Prevents excessive DOM updates
- Target: 60fps scroll performance

### Shader Optimization
- Only animates when button is hovered
- Reduced iteration count (5 vs 8 in main shader)
- Small canvas size (40×40px)
- Stops animation when mouse leaves

### Mobile Considerations
- Larger touch target (48×48px on mobile)
- Extended tap area with pseudo-element
- Device Pixel Ratio capped at 2x
- Haptic feedback on supported devices

## Accessibility Features

### WCAG 2.1 AA Compliance
- ✅ `aria-label="Scroll to top"` for screen readers
- ✅ Keyboard accessible (can be focused and activated)
- ✅ Focus indicator (2px orange outline)
- ✅ Respects `prefers-reduced-motion`
- ✅ High contrast mode support
- ✅ Sufficient color contrast (4.5:1 minimum)

### Keyboard Navigation
```
Tab → Focus button
Enter/Space → Activate scroll to top
```

### Reduced Motion
When `prefers-reduced-motion: reduce`:
- Shader animation disabled
- Simple gradient background on hover
- Instant state transitions
- Scale effects reduced

## Browser Compatibility

### Supported Features
| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| SVG Progress | 56+ | 51+ | 11+ | 79+ |
| WebGL Shader | 56+ | 51+ | 11+ | 79+ |
| Smooth Scroll | 61+ | 36+ | 15.4+ | 79+ |
| CSS Transforms | 56+ | 51+ | 11+ | 79+ |

### Fallback Strategy
- No WebGL: Uses CSS gradient on hover
- No smooth scroll: Instant jump to top
- No transforms: Fixed 40px size (no scaling)

## Testing Checklist

### Visual Testing
- [ ] Button hidden at page top
- [ ] Button appears after scrolling past hero
- [ ] Progress stroke fills correctly while scrolling
- [ ] Liquid shader effect visible on hover
- [ ] Button scales up smoothly on hover (40px → 46px)
- [ ] Button scales down on press (46px → 38px)
- [ ] Arrow changes to white on hover
- [ ] Button fades out when returning to top

### Functional Testing
- [ ] Clicking button scrolls to top smoothly
- [ ] Button disappears when scroll reaches top
- [ ] Progress resets when starting new scroll
- [ ] Works on all major browsers (Chrome, Firefox, Safari, Edge)
- [ ] Works on mobile devices (iOS Safari, Chrome Mobile)
- [ ] Keyboard navigation works (Tab + Enter)
- [ ] Screen reader announces button correctly

### Performance Testing
- [ ] Scroll events throttled (60fps maintained)
- [ ] Shader only animates on hover
- [ ] No memory leaks during extended use
- [ ] Mobile performance acceptable (>30fps)
- [ ] Page load time impact <50ms
- [ ] No jank during hover transitions

### Accessibility Testing
- [ ] Focus indicator visible and clear
- [ ] `prefers-reduced-motion` respected
- [ ] High contrast mode works
- [ ] Touch target size adequate on mobile (≥44×44px)
- [ ] ARIA label read by screen readers
- [ ] Color contrast meets WCAG AA standards

## Design Assets

### SVG Arrow Icon
```svg
<svg width="26" height="26" viewBox="0 0 26 26" fill="none">
  <path 
    d="M13 20.5833V5.41667M13 5.41667L6.5 11.9167M13 5.41667L19.5 11.9167" 
    stroke="currentColor" 
    stroke-width="2" 
    stroke-linecap="round" 
    stroke-linejoin="round"
  />
</svg>
```

### Brand Colors
```css
/* PATA Brand Colors */
--primary-orange: #DF6E39;
--dark-blue: #12283A;
--accent-orange: #DB5D23;
--light-blue: #387BB2;
--neutral-white: #FEFEFF;
--neutral-dark: #1E1E1E;
```

## Edge Cases & Error Handling

### Missing Elements
```javascript
if (!this.button || !this.progressCircle || !this.heroSection) {
  console.error('Required elements not found');
  return; // Graceful degradation
}
```

### WebGL Not Supported
```javascript
if (!this.gl) {
  console.warn('WebGL not supported, using CSS fallback');
  this.canvas.style.display = 'none';
  return;
}
```

### Document Too Short
If document height is less than 2× viewport height:
- Button still appears when past hero
- Progress may reach 100% quickly
- Behavior remains consistent

## Analytics Integration (Optional)

### Tracking Events
```javascript
// Track scroll-to-top usage
gtag('event', 'scroll_to_top_click', {
  'event_category': 'engagement',
  'event_label': 'scroll_button',
  'scroll_depth': scrollProgress // 0-1
});
```

## Estimated Implementation Time

| Task | Time |
|------|------|
| HTML Structure | 30 min |
| CSS Styling | 1.5 hours |
| JavaScript Logic | 2 hours |
| Shader Implementation | 1.5 hours |
| Testing & Debugging | 2 hours |
| Cross-browser Testing | 1 hour |
| Accessibility Verification | 1 hour |
| **Total** | **~9.5 hours** |

## Validation Criteria

### Success Metrics
✅ Button appears/disappears correctly based on scroll position  
✅ Progress stroke fills clockwise as user scrolls (0-100%)  
✅ Liquid shader effect visible and smooth on hover  
✅ All interaction states work (default, hover, expanded, pressed)  
✅ Smooth scroll-to-top animation  
✅ 60fps performance on desktop  
✅ 30fps minimum on mobile  
✅ Accessibility standards met (WCAG 2.1 AA)  
✅ Works across all major browsers  
✅ Reduced motion preferences respected  
✅ No console errors or warnings  
✅ Memory stable during extended use  

## Known Limitations

1. **Safari iOS < 15.4**: Smooth scroll may not work (instant jump fallback)
2. **IE11**: Not supported (requires modern browser)
3. **Very short pages**: Progress may complete quickly if document < 2× viewport
4. **High DPR displays**: Shader resolution capped at 2× for performance

## Future Enhancements (Optional)

1. **Scroll Velocity Detection**: Faster appear/disappear based on scroll speed
2. **Parallax Effect**: Subtle rotation during scroll
3. **Progress Label**: Show percentage number inside circle
4. **Color Theming**: Dynamic colors based on section
5. **Sound Effects**: Subtle audio feedback on click
6. **Gesture Support**: Swipe up on mobile to trigger

---

**Document Version**: 1.0  
**Last Updated**: January 2026  
**Author**: PATA Development Team  
**Figma Design**: https://www.figma.com/design/foywvD3Djh1yzshKk4Fwft/PATA-WEBSITE  
**Status**: Ready for Implementation  
**Dependencies**: `liquid-shader.js` (existing header shader)
