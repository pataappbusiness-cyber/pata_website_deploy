/**
 * PATA Website - Critical JavaScript
 * Loads immediately - essential for above-the-fold content
 * Version: 1.0
 */

'use strict';

/* ============================================
   PATA Liquid Shader with OffscreenCanvas Worker
   ============================================ */

function initShaderWorker(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return null;

  // Check OffscreenCanvas support (Chrome 69+, Firefox 105+, Safari 16.4+)
  if (!canvas.transferControlToOffscreen) {
    // Fallback: use main-thread LiquidShader
    console.log('OffscreenCanvas not supported, using main thread shader');
    return new LiquidShader(canvasId);
  }

  try {
    const offscreen = canvas.transferControlToOffscreen();
    const worker = new Worker('./src/js/liquid-shader-worker.min.js');

    const dpr = Math.min(window.devicePixelRatio || 1, 1);
    offscreen.width = canvas.clientWidth * dpr;
    offscreen.height = canvas.clientHeight * dpr;

    worker.postMessage({ type: 'init', canvas: offscreen }, [offscreen]);

    // Add shader-ready class when worker signals ready
    worker.addEventListener('message', (msg) => {
      if (msg.data.type === 'ready') {
        canvas.classList.add('shader-ready');
      }
    });

    // Forward mouse events
    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      worker.postMessage({
        type: 'mouse',
        x: (e.clientX - rect.left) / rect.width,
        y: 1 - (e.clientY - rect.top) / rect.height
      });
    });

    canvas.addEventListener('mouseleave', () => {
      worker.postMessage({ type: 'mouse', x: 0.5, y: 0.5 });
    });

    // Forward resize
    const ro = new ResizeObserver(() => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1);
      worker.postMessage({
        type: 'resize',
        width: canvas.clientWidth * dpr,
        height: canvas.clientHeight * dpr
      });
    });
    ro.observe(canvas);

    // Return worker wrapper with destroy method
    return {
      worker,
      resizeObserver: ro,
      destroy: function() {
        worker.postMessage({ type: 'destroy' });
        worker.terminate();
        ro.disconnect();
      }
    };
  } catch (e) {
    console.warn('OffscreenCanvas worker failed, falling back to main thread:', e);
    return new LiquidShader(canvasId);
  }
}

/* ============================================
   PATA Liquid Shader Background (Main Thread Fallback)
   ============================================ */

class LiquidShader {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      console.error('Canvas element not found:', canvasId);
      return;
    }

    // Mobile: don't initialize shader, use CSS fallback
    if (window.innerWidth < 768 && !window.matchMedia('(hover: hover)').matches) {
      this.canvas.style.display = 'none';
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
    this.isReady = false;
    this.isVisible = true;
    this.animating = false;
    this.frameCount = 0;

    this.brandColors = {
      blue: [44/255, 101/255, 147/255],
      darkOrange: [219/255, 93/255, 35/255],
      lightOrange: [255/255, 200/255, 129/255]
    };

    this.mouseX = 0.5;
    this.mouseY = 0.5;

    this.init();
  }

  init() {
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
    this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.canvas.addEventListener('mouseleave', () => this.handleMouseLeave());
    this.createShaderProgram();
    this.setupUniforms();
    this.setupGeometry();

    // Pause shader when canvas is out of viewport
    this.visibilityObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        this.isVisible = entry.isIntersecting;
        if (this.isVisible && !this.animating) {
          this.animating = true;
          this.animate();
        }
      });
    }, { threshold: 0.01 });
    this.visibilityObserver.observe(this.canvas);

    this.animating = true;
    this.animate();
  }

  handleMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    this.mouseX = (e.clientX - rect.left) / rect.width;
    this.mouseY = 1.0 - (e.clientY - rect.top) / rect.height;
  }

  handleMouseLeave() {
    this.mouseX = 0.5;
    this.mouseY = 0.5;
  }

  resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1);
    const displayWidth = this.canvas.clientWidth;
    const displayHeight = this.canvas.clientHeight;
    this.canvas.width = displayWidth * dpr;
    this.canvas.height = displayHeight * dpr;
    if (this.gl) {
      this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  createShaderProgram() {
    const vertexShaderSource = `
      attribute vec2 a_position;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fragmentShaderSource = `
      precision mediump float;
      uniform vec2 u_resolution;
      uniform float u_time;
      uniform vec2 u_mouse;
      uniform vec3 u_color1;
      uniform vec3 u_color2;
      uniform vec3 u_color3;

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        float mouseInfluence = distance(uv, u_mouse);
        mouseInfluence = 1.0 - smoothstep(0.0, 0.5, mouseInfluence);
        float d = -u_time * 0.5 + mouseInfluence * 2.0;
        float a = 0.0;
        for (float i = 0.0; i < 5.0; i += 1.0) {
          a += cos(i - d - a * uv.x + mouseInfluence);
          d += sin(uv.y * i + a);
        }
        d += u_time * 0.5;
        float mix1 = sin(d + a) * 0.5 + 0.5;
        float mix2 = cos(d - a) * 0.5 + 0.5;
        vec3 brightOrange1 = u_color2 * 1.3;
        vec3 brightOrange2 = u_color3 * 1.4;
        vec3 tempColor = mix(u_color1, brightOrange1, mix1 * 0.4);
        vec3 finalColor = mix(tempColor, brightOrange2, mix2 * 0.3);
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
      mouse: this.gl.getUniformLocation(this.program, 'u_mouse'),
      color1: this.gl.getUniformLocation(this.program, 'u_color1'),
      color2: this.gl.getUniformLocation(this.program, 'u_color2'),
      color3: this.gl.getUniformLocation(this.program, 'u_color3')
    };
    this.gl.uniform3fv(this.uniforms.color1, this.brandColors.blue);
    this.gl.uniform3fv(this.uniforms.color2, this.brandColors.darkOrange);
    this.gl.uniform3fv(this.uniforms.color3, this.brandColors.lightOrange);
  }

  setupGeometry() {
    const positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    const buffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, positions, this.gl.STATIC_DRAW);
    const positionLocation = this.gl.getAttribLocation(this.program, 'a_position');
    this.gl.enableVertexAttribArray(positionLocation);
    this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0);
  }

  animate() {
    if (!this.isVisible) {
      this.animating = false;
      return;
    }
    this.animationId = requestAnimationFrame(() => this.animate());
    const currentTime = (Date.now() - this.startTime) * 0.001;
    this.gl.uniform2f(this.uniforms.resolution, this.canvas.width, this.canvas.height);
    this.gl.uniform1f(this.uniforms.time, currentTime);
    this.gl.uniform2f(this.uniforms.mouse, this.mouseX, this.mouseY);
    this.gl.clearColor(0, 0, 0, 0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
    this.frameCount++;
    if (!this.isReady && this.frameCount >= 5) {
      this.signalReady();
    }
  }

  signalReady() {
    this.isReady = true;
    this.canvas.classList.add('shader-ready');
    const placeholder = document.querySelector('.shader-placeholder');
    if (placeholder) {
      placeholder.style.opacity = '0';
      setTimeout(() => placeholder.remove(), 1500);
    }
  }

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.visibilityObserver) {
      this.visibilityObserver.disconnect();
    }
    if (this.gl) {
      this.gl.deleteProgram(this.program);
    }
  }
}

/* ============================================
   NAVBAR
   ============================================ */

class Navbar {
  constructor() {
    this.navbar = document.querySelector('.navbar');
    this.navbarToggle = document.getElementById('navbarToggle');
    this.navbarLinks = document.getElementById('navbar-links');
    if (this.navbar) {
      this.init();
    }
  }

  init() {
    window.addEventListener('scroll', () => this.handleScroll());
    if (this.navbarToggle && this.navbarLinks) {
      this.navbarToggle.addEventListener('click', () => this.toggleMobileMenu());
    }
    const links = this.navbarLinks.querySelectorAll('.navbar-link');
    links.forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
          this.closeMobileMenu();
        }
      });
    });
  }

  handleScroll() {
    if (window.scrollY > 50) {
      this.navbar.classList.add('scrolled');
    } else {
      this.navbar.classList.remove('scrolled');
    }
  }

  toggleMobileMenu() {
    this.navbarToggle.classList.toggle('active');
    this.navbarLinks.classList.toggle('active');
    const isExpanded = this.navbarLinks.classList.contains('active');
    this.navbarToggle.setAttribute('aria-expanded', isExpanded);
    this.navbarToggle.setAttribute('aria-label', isExpanded ? 'Fechar menu de navegacao' : 'Abrir menu de navegacao');
    if (isExpanded) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  closeMobileMenu() {
    this.navbarToggle.classList.remove('active');
    this.navbarLinks.classList.remove('active');
    this.navbarToggle.setAttribute('aria-expanded', 'false');
    this.navbarToggle.setAttribute('aria-label', 'Abrir menu de navegacao');
    document.body.style.overflow = '';
  }
}

/* ============================================
   HEADER PARALLAX
   ============================================ */

class HeaderParallax {
  constructor() {
    this.header = document.querySelector('.header-section');
    this.parallaxElements = document.querySelectorAll('[data-parallax]');
    this.mouseX = 0;
    this.mouseY = 0;
    this.targetX = 0;
    this.targetY = 0;
    this.ease = 0.12;
    this.rafId = null;
    this.isActive = false;
    this.elementPositions = new Map();

    if (this.header && this.parallaxElements.length > 0) {
      this.init();
    }
  }

  init() {
    if (window.matchMedia('(pointer: fine)').matches) {
      this.parallaxElements.forEach(element => {
        this.elementPositions.set(element, { currentX: 0, currentY: 0, targetX: 0, targetY: 0 });
      });
      this.header.addEventListener('mousemove', (e) => this.handleMouseMove(e));
      this.header.addEventListener('mouseleave', () => this.resetPositions());
      this.isActive = true;
      this.animate();
    }
  }

  handleMouseMove(e) {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    this.targetX = (clientX / innerWidth - 0.5) * 2;
    this.targetY = (clientY / innerHeight - 0.5) * 2;
  }

  animate() {
    if (!this.isActive) return;
    this.mouseX += (this.targetX - this.mouseX) * this.ease;
    this.mouseY += (this.targetY - this.mouseY) * this.ease;

    this.parallaxElements.forEach(element => {
      const speed = parseFloat(element.dataset.parallax) || 0.3;
      const positions = this.elementPositions.get(element);
      positions.targetX = this.mouseX * 50 * speed;
      positions.targetY = this.mouseY * 50 * speed;
      positions.currentX += (positions.targetX - positions.currentX) * this.ease;
      positions.currentY += (positions.targetY - positions.currentY) * this.ease;
      element.style.transform = `translate(${positions.currentX}px, ${positions.currentY}px)`;
    });

    this.rafId = requestAnimationFrame(() => this.animate());
  }

  resetPositions() {
    this.targetX = 0;
    this.targetY = 0;
  }

  destroy() {
    this.isActive = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
  }
}

/* ============================================
   MOUSE HIGHLIGHT
   ============================================ */

class MouseHighlight {
  constructor() {
    this.header = document.querySelector('.header-section');
    this.highlight = document.querySelector('.mouse-highlight');
    this.rafId = null;
    this.mouseX = 0;
    this.mouseY = 0;
    this.isActive = false;
    this.throttleDelay = 16;
    this.lastUpdate = 0;

    if (this.header && this.highlight) {
      this.init();
    }
  }

  init() {
    this.header.addEventListener('mouseenter', () => {
      this.isActive = true;
      this.highlight.style.opacity = '1';
    });

    this.header.addEventListener('mouseleave', () => {
      this.isActive = false;
      this.highlight.style.opacity = '0';
      if (this.rafId) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }
    });

    this.header.addEventListener('mousemove', (e) => {
      const now = Date.now();
      if (now - this.lastUpdate < this.throttleDelay) return;
      this.lastUpdate = now;
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
      if (!this.rafId && this.isActive) {
        this.rafId = requestAnimationFrame(() => this.updatePosition());
      }
    });
  }

  updatePosition() {
    const rect = this.header.getBoundingClientRect();
    const x = this.mouseX - rect.left;
    const y = this.mouseY - rect.top;
    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;
    this.highlight.style.setProperty('--mouse-x', `${xPercent}%`);
    this.highlight.style.setProperty('--mouse-y', `${yPercent}%`);
    this.rafId = null;
  }

  destroy() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
  }
}

/* ============================================
   HEADER ANIMATIONS
   ============================================ */

class HeaderAnimations {
  constructor() {
    this.section = document.querySelector('.header-section');
    this.headerContent = document.querySelector('.header-content');
    this.pillLeftTop = document.querySelector('.pill-left-top');
    this.pillLeftBottom = document.querySelector('.pill-left-bottom');
    this.pillRightTop = document.querySelector('.pill-right-top');
    this.pillRightBottom = document.querySelector('.pill-right-bottom');
    this.mockupCenter = document.querySelector('.mockup-center');
    this.isVisible = false;

    if (this.section) {
      this.init();
    }
  }

  init() {
    const options = { root: null, rootMargin: '0px', threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.isVisible) {
          this.showElements();
          this.isVisible = true;
        }
      });
    }, options);
    observer.observe(this.section);
  }

  showElements() {
    if (this.headerContent) this.headerContent.classList.add('visible');
    if (this.pillLeftTop) this.pillLeftTop.classList.add('visible');
    if (this.pillLeftBottom) this.pillLeftBottom.classList.add('visible');
    if (this.pillRightTop) this.pillRightTop.classList.add('visible');
    if (this.pillRightBottom) this.pillRightBottom.classList.add('visible');
    if (this.mockupCenter) this.mockupCenter.classList.add('visible');
  }
}

/* ============================================
   CONTACT BUTTONS
   ============================================ */

class ContactButtons {
  constructor(smoothScroll) {
    this.ctaButtons = document.querySelectorAll('.navbar-cta-button');
    this.smoothScroll = smoothScroll;
    if (this.ctaButtons.length > 0) {
      this.init();
    }
  }

  init() {
    this.ctaButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        this.scrollToContact();
      });
    });
  }

  scrollToContact() {
    const contactSection = document.querySelector('#reservar');
    if (!contactSection) return;
    contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

/* ============================================
   SMOOTH SCROLL
   ============================================ */

class SmoothScroll {
  constructor() {
    this.init();
  }

  init() {
    this.setupAnchorLinks();
  }

  setupAnchorLinks() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href === '#' || href === '') return;
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  destroy() {}
}

/* ============================================
   INITIALIZE CRITICAL MODULES
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize shader only for canvases that exist
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReducedMotion) {
    window.liquidShaders = {};
    const canvasIds = ['liquid-shader-canvas', 'liquid-shader-canvas-joinus2', 'liquid-shader-canvas-joinus3'];
    canvasIds.forEach((canvasId) => {
      if (document.getElementById(canvasId)) {
        const key = canvasId.replace('liquid-shader-canvas-', '').replace('liquid-shader-canvas', 'header');
        // Try OffscreenCanvas worker first, fall back to main thread
        window.liquidShaders[key] = initShaderWorker(canvasId);
      }
    });
  }

  // Initialize critical modules
  const smoothScroll = new SmoothScroll();
  new Navbar();
  new HeaderAnimations();
  new ContactButtons(smoothScroll);

  // Store for deferred script access
  window._pataInstances = {
    smoothScroll
  };

  console.log('🐾 PATA Critical JS loaded');
});

// Cleanup
window.addEventListener('beforeunload', () => {
  if (window.liquidShaders) {
    Object.values(window.liquidShaders).forEach(shader => {
      if (shader) shader.destroy();
    });
  }
});
