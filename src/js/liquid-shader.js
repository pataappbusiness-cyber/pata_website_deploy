

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
      blue: [44/255, 101/255, 147/255],        // #2C6593 - Blue (most prominent)
      darkOrange: [219/255, 93/255, 35/255],   // #DB5D23 - Dark Orange
      lightOrange: [255/255, 200/255, 129/255] // #FFC881 - Light Orange
    };

    this.mouseX = 0.5;
    this.mouseY = 0.5;

    this.init();
  }

  init() {
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    // Add mouse tracking
    this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.canvas.addEventListener('mouseleave', () => this.handleMouseLeave());

    this.createShaderProgram();
    this.setupUniforms();
    this.setupGeometry();
    this.animate();
  }

  handleMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    this.mouseX = (e.clientX - rect.left) / rect.width;
    this.mouseY = 1.0 - (e.clientY - rect.top) / rect.height; // Invert Y for WebGL
  }

  handleMouseLeave() {
    // Smoothly return to center when mouse leaves
    this.mouseX = 0.5;
    this.mouseY = 0.5;
  }

  resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const displayWidth = this.canvas.clientWidth;
    const displayHeight = this.canvas.clientHeight;

    // Use full device pixel ratio for crisp rendering
    this.canvas.width = displayWidth * dpr;
    this.canvas.height = displayHeight * dpr;

    if (this.gl) {
      this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }
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
      uniform vec2 u_mouse;
      uniform vec3 u_color1; // #2C6593 - Blue
      uniform vec3 u_color2; // #DB5D23 - Dark Orange
      uniform vec3 u_color3; // #FFC881 - Light Orange

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution.xy;

        // Calculate distance from mouse for interaction
        float mouseInfluence = distance(uv, u_mouse);
        mouseInfluence = 1.0 - smoothstep(0.0, 0.5, mouseInfluence);

        float d = -u_time * 0.5 + mouseInfluence * 2.0;
        float a = 0.0;

        // Simplified liquid motion with mouse influence
        for (float i = 0.0; i < 8.0; i += 1.0) {
          a += cos(i - d - a * uv.x + mouseInfluence);
          d += sin(uv.y * i + a);
        }

        d += u_time * 0.5;

        // Create mixing values
        float mix1 = sin(d + a) * 0.5 + 0.5;
        float mix2 = cos(d - a) * 0.5 + 0.5;

        // Brighten the orange colors
        vec3 brightOrange1 = u_color2 * 1.3;
        vec3 brightOrange2 = u_color3 * 1.4;

        // Blend the three colors with brighter oranges
        vec3 tempColor = mix(u_color1, brightOrange1, mix1 * 0.4);
        vec3 finalColor = mix(tempColor, brightOrange2, mix2 * 0.3);

        // Apply 25% black overlay to darken
        finalColor = finalColor * 0.75;

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

    console.log('Shader program linked successfully');
    this.gl.useProgram(this.program);
  }

  compileShader(source, type) {
    const shader = this.gl.createShader(type);
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.error('Shader compilation error:', this.gl.getShaderInfoLog(shader));
      console.error('Shader source:', source);
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
      mouse: this.gl.getUniformLocation(this.program, 'u_mouse'),
      color1: this.gl.getUniformLocation(this.program, 'u_color1'),
      color2: this.gl.getUniformLocation(this.program, 'u_color2'),
      color3: this.gl.getUniformLocation(this.program, 'u_color3')
    };

    // Set static uniforms (brand colors)
    this.gl.uniform3fv(this.uniforms.color1, this.brandColors.blue);
    this.gl.uniform3fv(this.uniforms.color2, this.brandColors.darkOrange);
    this.gl.uniform3fv(this.uniforms.color3, this.brandColors.lightOrange);
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
    this.gl.uniform2f(this.uniforms.mouse, this.mouseX, this.mouseY);

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
    this.canvas.removeEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.canvas.removeEventListener('mouseleave', () => this.handleMouseLeave());

    if (this.gl) {
      this.gl.deleteProgram(this.program);
    }
  }
}

// Initialize shaders when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!prefersReducedMotion) {
    // Initialize shader instances only for canvases that exist on the page
    window.liquidShaders = {};

    const canvasIds = [
      'liquid-shader-canvas',
      'liquid-shader-canvas-joinus2',
      'liquid-shader-canvas-joinus3'
    ];

    canvasIds.forEach((canvasId) => {
      if (document.getElementById(canvasId)) {
        const key = canvasId.replace('liquid-shader-canvas-', '').replace('liquid-shader-canvas', 'header');
        window.liquidShaders[key] = new LiquidShader(canvasId);
      }
    });
  }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (window.liquidShaders) {
    Object.values(window.liquidShaders).forEach(shader => {
      if (shader) {
        shader.destroy();
      }
    });
  }
});
