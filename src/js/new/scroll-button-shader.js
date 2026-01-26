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
    console.log('🎨 Scroll button shader initialized');
  }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (window.scrollButtonShader) {
    window.scrollButtonShader.destroy();
  }
});
