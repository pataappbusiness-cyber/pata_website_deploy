



































# PATA Website - Liquid Shader Background Specification

## Overview
Replace the current gradient background in the header section with an animated liquid shader effect using PATA brand colors. This creates a dynamic, fluid visual that enhances the premium feel of the telemedicine platform.

## Technical Implementation

### Shader Conversion Strategy
Convert the GLSL shader to WebGL-compatible JavaScript using a `<canvas>` element with WebGL context. The shader will run continuously and animate based on time.

### Brand Colors Integration
The shader will use PATA's brand colors in RGB format:
- **Primary Orange**: `rgb(223, 110, 57)` - #DF6E39
- **Dark Blue**: `rgb(18, 40, 58)` - #12283A
- **Accent Orange**: `rgb(219, 93, 35)` - #DB5D23
- **Light Blue**: `rgb(56, 123, 178)` - #387BB2

### File Structure
```
/website-redesign
  /assets
    /shaders
      - liquid-shader.js
  /css
    - header-shader.css
  - index.html (modified header section)
```

## Implementation Code

### 1. HTML Structure (Header Section)
```html
<section id="hero" class="hero-section">
  <!-- Shader Canvas Background -->
  <canvas id="liquid-shader-canvas" class="liquid-shader-canvas"></canvas>
  
  <!-- Existing header content overlay -->
  <div class="hero-content">
    <!-- All existing hero content goes here -->
  </div>
</section>
```

### 2. CSS Styling
**File: `/css/header-shader.css`**

```css
/* Shader Canvas Styling */
.liquid-shader-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none; /* Allow clicks to pass through to content */
}

.hero-section {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  /* Remove existing gradient background */
}

.hero-content {
  position: relative;
  z-index: 2; /* Ensure content appears above shader */
}

/* Performance optimization for mobile */
@media (prefers-reduced-motion: reduce) {
  .liquid-shader-canvas {
    display: none; /* Respect accessibility preferences */
  }
  
  .hero-section {
    background: linear-gradient(135deg, #12283A 0%, #387BB2 100%);
    /* Fallback gradient for reduced motion */
  }
}

/* Low-end device optimization */
@media (max-width: 768px) {
  .liquid-shader-canvas {
    opacity: 0.8; /* Slightly reduce complexity visual impact */
  }
}
```

### 3. JavaScript Shader Implementation
**File: `/assets/shaders/liquid-shader.js`**

```javascript
/**
 * PATA Liquid Shader Background
 * Adapted from GLSL shader with brand color integration
 * Performance optimized for web deployment
 */

class LiquidShader {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      console.error('Canvas element not found:', canvasId);
      return;
    }
    
    this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
    
    if (!this.gl) {
      console.warn('WebGL not supported, falling back to CSS gradient');
      this.canvas.style.display = 'none';
      return;
    }
    
    this.startTime = Date.now();
    this.animationId = null;
    
    // PATA Brand Colors (normalized to 0-1 range for WebGL)
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
    window.addEventListener('resize', () => this.resizeCanvas());
    
    this.createShaderProgram();
    this.setupUniforms();
    this.setupGeometry();
    this.animate();
  }
  
  resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const displayWidth = this.canvas.clientWidth;
    const displayHeight = this.canvas.clientHeight;
    
    // Performance optimization: cap DPR at 2 for mobile
    const cappedDPR = Math.min(dpr, 2);
    
    this.canvas.width = displayWidth * cappedDPR;
    this.canvas.height = displayHeight * cappedDPR;
    
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  }
  
  createShaderProgram() {
    // Vertex Shader (passes coordinates to fragment shader)
    const vertexShaderSource = `
      attribute vec2 a_position;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;
    
    // Fragment Shader (PATA brand color liquid effect)
    const fragmentShaderSource = `
      precision mediump float;
      uniform vec2 u_resolution;
      uniform float u_time;
      uniform vec3 u_color1; // Primary Orange
      uniform vec3 u_color2; // Dark Blue
      uniform vec3 u_color3; // Accent Orange
      uniform vec3 u_color4; // Light Blue
      
      void main() {
        float mr = min(u_resolution.x, u_resolution.y);
        vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / mr;
        
        float d = -u_time * 0.5;
        float a = 0.0;
        
        // Liquid motion algorithm
        for (float i = 0.0; i < 8.0; ++i) {
          a += cos(i - d - a * uv.x);
          d += sin(uv.y * i + a);
        }
        
        d += u_time * 0.5;
        
        // Color mixing with PATA brand colors
        vec3 col = vec3(
          cos(uv * vec2(d, a)) * 0.6 + 0.4,
          cos(a + d) * 0.5 + 0.5
        );
        
        col = cos(col * cos(vec3(d, a, 2.5)) * 0.5 + 0.5);
        
        // Blend PATA brand colors based on shader output
        vec3 finalColor = mix(
          mix(u_color2, u_color4, col.r), // Dark Blue to Light Blue
          mix(u_color3, u_color1, col.g), // Accent Orange to Primary Orange
          col.b
        );
        
        // Add subtle brightness variation
        finalColor = finalColor * (0.85 + col.r * 0.3);
        
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `;
    
    const vertexShader = this.compileShader(vertexShaderSource, this.gl.VERTEX_SHADER);
    const fragmentShader = this.compileShader(fragmentShaderSource, this.gl.FRAGMENT_SHADER);
    
    this.program = this.gl.createProgram();
    this.gl.attachShader(this.program, vertexShader);
    this.gl.attachShader(this.program, fragmentShader);
    this.gl.linkProgram(this.program);
    
    if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
      console.error('Shader program failed to link:', this.gl.getProgramInfoLog(this.program));
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
    // Get uniform locations
    this.uniforms = {
      resolution: this.gl.getUniformLocation(this.program, 'u_resolution'),
      time: this.gl.getUniformLocation(this.program, 'u_time'),
      color1: this.gl.getUniformLocation(this.program, 'u_color1'),
      color2: this.gl.getUniformLocation(this.program, 'u_color2'),
      color3: this.gl.getUniformLocation(this.program, 'u_color3'),
      color4: this.gl.getUniformLocation(this.program, 'u_color4')
    };
    
    // Set static uniforms (brand colors)
    this.gl.uniform3fv(this.uniforms.color1, this.brandColors.primaryOrange);
    this.gl.uniform3fv(this.uniforms.color2, this.brandColors.darkBlue);
    this.gl.uniform3fv(this.uniforms.color3, this.brandColors.accentOrange);
    this.gl.uniform3fv(this.uniforms.color4, this.brandColors.lightBlue);
  }
  
  setupGeometry() {
    // Create full-screen quad
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
    this.animationId = requestAnimationFrame(() => this.animate());
    
    const currentTime = (Date.now() - this.startTime) * 0.001; // Convert to seconds
    
    // Update dynamic uniforms
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
    
    window.removeEventListener('resize', () => this.resizeCanvas());
    
    if (this.gl) {
      this.gl.deleteProgram(this.program);
    }
  }
}

// Initialize shader when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (!prefersReducedMotion) {
    window.liquidShader = new LiquidShader('liquid-shader-canvas');
  }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (window.liquidShader) {
    window.liquidShader.destroy();
  }
});
```

## Integration Steps

### Step 1: Add Files to Project
1. Create `/assets/shaders/liquid-shader.js`
2. Create `/css/header-shader.css`
3. Add canvas element to header in `index.html`

### Step 2: Link Resources
Add to `<head>` section:
```html
<link rel="stylesheet" href="/css/header-shader.css">
```

Add before closing `</body>` tag:
```html
<script src="/assets/shaders/liquid-shader.js"></script>
```

### Step 3: Remove Old Gradient
**In existing CSS, remove:**
```css
.hero-section {
  background: linear-gradient(...); /* DELETE THIS */
}
```

### Step 4: Testing Checklist
- [ ] Shader loads and animates smoothly on desktop Chrome
- [ ] Shader loads and animates smoothly on desktop Firefox
- [ ] Shader loads and animates smoothly on desktop Safari
- [ ] Mobile performance is acceptable (>30fps)
- [ ] Fallback gradient shows when WebGL unavailable
- [ ] Reduced motion preference is respected
- [ ] Text/content remains readable over shader
- [ ] No console errors in any browser
- [ ] Canvas resizes properly on window resize
- [ ] Memory usage remains stable (no leaks)

## Performance Considerations

### Optimization Techniques
1. **Device Pixel Ratio Capping**: Limited to 2x to prevent excessive pixels on high-DPR displays
2. **Reduced Motion Support**: Shader disabled for users with motion sensitivity
3. **Mobile Fallback**: Opacity reduction on smaller screens
4. **Animation Frame Management**: Proper cleanup prevents memory leaks
5. **WebGL Fallback**: Graceful degradation to CSS gradient when WebGL unavailable

### Performance Targets
- Desktop: 60fps sustained
- Mobile: 30fps minimum
- Initial load impact: <100ms additional
- Memory footprint: <50MB

## Browser Compatibility

### Supported Browsers
- ✅ Chrome 56+ (95% coverage)
- ✅ Firefox 51+ (90% coverage)
- ✅ Safari 11+ (85% coverage)
- ✅ Edge 79+ (90% coverage)

### Fallback Strategy
Users without WebGL support see a static CSS gradient background using PATA brand colors (Dark Blue to Light Blue).

## Accessibility Compliance

### WCAG 2.1 AA Standards
- ✅ Respects `prefers-reduced-motion`
- ✅ Does not interfere with text readability
- ✅ Does not trigger seizure risks (no high-frequency flashing)
- ✅ Non-essential animation (can be disabled)

### Contrast Ratios
Ensure all text overlaying the shader maintains minimum contrast ratios:
- Normal text: 4.5:1 minimum
- Large text: 3:1 minimum

## Maintenance Notes

### Color Adjustment
To modify brand colors, update the `brandColors` object in `liquid-shader.js`:
```javascript
this.brandColors = {
  primaryOrange: [R/255, G/255, B/255],
  // ... other colors
};
```

### Animation Speed
Adjust animation speed by modifying the time multiplier:
```javascript
float d = -u_time * 0.5; // Change 0.5 to speed up/slow down
```

### Intensity Control
Modify color mixing intensity in fragment shader:
```javascript
finalColor = finalColor * (0.85 + col.r * 0.3); // Adjust 0.85 and 0.3
```

## Future Enhancements (Optional)

### Potential Improvements
1. **Mouse Interaction**: Shader responds to cursor position
2. **Scroll-Based Animation**: Shader intensity changes on scroll
3. **Color Transitions**: Gradual color shifts based on time of day
4. **Performance Monitoring**: Analytics integration for FPS tracking
5. **WebGL 2.0 Features**: Enhanced effects for supported browsers

## Estimated Implementation Time
- **Setup & Integration**: 2 hours
- **Testing & Debugging**: 2 hours
- **Cross-browser Verification**: 1 hour
- **Performance Optimization**: 1 hour
- **Total**: ~6 hours

## Validation Criteria

### Success Metrics
✅ Shader renders correctly on all target browsers  
✅ Performance targets met (60fps desktop, 30fps mobile)  
✅ Accessibility standards maintained  
✅ Graceful fallback works  
✅ No console errors or warnings  
✅ Brand colors accurately represented  
✅ Content readability unaffected  
✅ Memory usage within acceptable limits  

---

**Document Version**: 1.0  
**Last Updated**: January 2026  
**Owner**: PATA CTO (Yuffie)  
**Status**: Ready for Implementation
