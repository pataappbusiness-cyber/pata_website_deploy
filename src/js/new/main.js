/* ============================================
   PATA WEBSITE - MAIN JAVASCRIPT
   Version: 4.0 (PREVC)
   ============================================ */

'use strict';

/* ============================================
   NAVBAR - SCROLL & MOBILE TOGGLE
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
    // Scroll effect
    window.addEventListener('scroll', () => this.handleScroll());

    // Mobile toggle
    if (this.navbarToggle && this.navbarLinks) {
      this.navbarToggle.addEventListener('click', () => this.toggleMobileMenu());
    }

    // Close menu on link click (mobile)
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

    // Prevent body scroll when menu is open
    if (this.navbarLinks.classList.contains('active')) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  closeMobileMenu() {
    this.navbarToggle.classList.remove('active');
    this.navbarLinks.classList.remove('active');
    document.body.style.overflow = '';
  }
}

/* ============================================
   SECTION 1: HEADER - Parallax Mouse Effect
   Figma: https://www.figma.com/design/foywvD3Djh1yzshKk4Fwft/PATA-WEBSITE?node-id=337-2915
   ============================================ */

class HeaderParallax {
  constructor() {
    this.header = document.querySelector('.header-section');
    this.parallaxElements = document.querySelectorAll('[data-parallax]');

    if (this.header && this.parallaxElements.length > 0) {
      this.init();
    }
  }

  init() {
    // Only enable parallax on devices with pointer (not touch)
    if (window.matchMedia('(pointer: fine)').matches) {
      this.header.addEventListener('mousemove', (e) => this.handleMouseMove(e));

      // Reset position when mouse leaves
      this.header.addEventListener('mouseleave', () => this.resetPositions());
    }
  }

  handleMouseMove(e) {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;

    // Calculate mouse position relative to center (-1 to 1)
    const x = (clientX / innerWidth - 0.5) * 2;
    const y = (clientY / innerHeight - 0.5) * 2;

    this.parallaxElements.forEach(element => {
      const speed = parseFloat(element.dataset.parallax) || 0.3;

      // Apply transformation based on mouse movement
      const moveX = x * 50 * speed;
      const moveY = y * 50 * speed;

      element.style.transform = `translate(${moveX}px, ${moveY}px)`;
    });
  }

  resetPositions() {
    this.parallaxElements.forEach(element => {
      element.style.transform = 'translate(0, 0)';
    });
  }
}

/* ============================================
   MOUSE HIGHLIGHT EFFECT - INTERATIVIDADE
   ============================================ */

class MouseHighlight {
  constructor() {
    this.header = document.querySelector('.header-section');
    this.highlight = document.querySelector('.mouse-highlight');

    // Performance optimization
    this.rafId = null;
    this.mouseX = 0;
    this.mouseY = 0;
    this.isActive = false;
    this.throttleDelay = 16; // ~60fps
    this.lastUpdate = 0;

    if (this.header && this.highlight) {
      this.init();
    }
  }

  init() {
    // Mouse enter - ativa o efeito
    this.header.addEventListener('mouseenter', () => {
      this.isActive = true;
      this.highlight.style.opacity = '1';
    });

    // Mouse leave - desativa o efeito
    this.header.addEventListener('mouseleave', () => {
      this.isActive = false;
      this.highlight.style.opacity = '0';
      if (this.rafId) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }
    });

    // Mouse move - atualiza posição com throttling
    this.header.addEventListener('mousemove', (e) => {
      const now = Date.now();
      if (now - this.lastUpdate < this.throttleDelay) {
        return; // Skip se muito rápido
      }

      this.lastUpdate = now;
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;

      // Usa requestAnimationFrame para performance
      if (!this.rafId && this.isActive) {
        this.rafId = requestAnimationFrame(() => this.updatePosition());
      }
    });
  }

  updatePosition() {
    // Calcula posição relativa ao header
    const rect = this.header.getBoundingClientRect();
    const x = this.mouseX - rect.left;
    const y = this.mouseY - rect.top;

    // Converte para percentagem
    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;

    // Atualiza CSS variables (melhor performance)
    this.highlight.style.setProperty('--mouse-x', `${xPercent}%`);
    this.highlight.style.setProperty('--mouse-y', `${yPercent}%`);

    // Reset RAF id
    this.rafId = null;
  }

  // Cleanup method
  destroy() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
  }
}

/* ============================================
   DRAGGABLE ELEMENT - Interactive Bone
   ============================================ */

class DraggableElement {
  constructor() {
    this.element = document.getElementById('draggableElement');
    if (!this.element) return;

    this.isDragging = false;
    this.currentX = 0;
    this.currentY = 0;
    this.initialX = 0;
    this.initialY = 0;
    this.xOffset = 0;
    this.yOffset = 0;

    this.init();
  }

  init() {
    // Mouse events
    this.element.addEventListener('mousedown', (e) => this.dragStart(e));
    document.addEventListener('mousemove', (e) => this.drag(e));
    document.addEventListener('mouseup', (e) => this.dragEnd(e));

    // Touch events
    this.element.addEventListener('touchstart', (e) => this.dragStart(e));
    document.addEventListener('touchmove', (e) => this.drag(e));
    document.addEventListener('touchend', (e) => this.dragEnd(e));

    console.log('🦴 Draggable element initialized');
  }

  dragStart(e) {
    if (e.type === 'touchstart') {
      this.initialX = e.touches[0].clientX - this.xOffset;
      this.initialY = e.touches[0].clientY - this.yOffset;
    } else {
      this.initialX = e.clientX - this.xOffset;
      this.initialY = e.clientY - this.yOffset;
    }

    if (e.target === this.element || this.element.contains(e.target)) {
      this.isDragging = true;
    }
  }

  drag(e) {
    if (this.isDragging) {
      e.preventDefault();

      if (e.type === 'touchmove') {
        this.currentX = e.touches[0].clientX - this.initialX;
        this.currentY = e.touches[0].clientY - this.initialY;
      } else {
        this.currentX = e.clientX - this.initialX;
        this.currentY = e.clientY - this.initialY;
      }

      this.xOffset = this.currentX;
      this.yOffset = this.currentY;

      this.setTranslate(this.currentX, this.currentY);
    }
  }

  dragEnd(e) {
    this.initialX = this.currentX;
    this.initialY = this.currentY;
    this.isDragging = false;
  }

  setTranslate(xPos, yPos) {
    this.element.style.transform = `translate(${xPos}px, ${yPos}px)`;
  }
}

/* ============================================
   CONTACT BUTTON - Scroll to Contact Section
   ============================================ */

class ContactButtons {
  constructor() {
    this.ctaButtons = document.querySelectorAll('.navbar-cta-button');

    if (this.ctaButtons.length > 0) {
      this.init();
    }
  }

  init() {
    this.ctaButtons.forEach(button => {
      button.addEventListener('click', () => this.scrollToContact());
    });
  }

  scrollToContact() {
    const contactSection = document.querySelector('#contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'auto' }); // No smooth scroll as per spec
    }
  }
}

/* ============================================
   SECTION 2: PROBLEM1 - LAZY LOADING VÍDEOS
   Figma: https://www.figma.com/design/foywvD3Djh1yzshKk4Fwft/PATA-WEBSITE?node-id=337-2938&m=dev
   ============================================ */

class VideoLazyLoader {
  constructor() {
    this.videos = document.querySelectorAll('video[data-lazy-video]');

    if (this.videos.length > 0) {
      this.init();
    }
  }

  init() {
    // Intersection Observer para carregar vídeos quando visíveis
    const options = {
      root: null,
      rootMargin: '200px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadVideo(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, options);

    this.videos.forEach(video => observer.observe(video));
  }

  loadVideo(video) {
    const sources = video.querySelectorAll('source[data-src]');

    sources.forEach(source => {
      source.src = source.dataset.src;
    });

    video.load();
    video.play();

    // Remove atributo data-lazy-video após carregar
    video.removeAttribute('data-lazy-video');
  }
}

/* ============================================
   SECTION 3: PROBLEM2 - LOTTIE ANIMATION
   ============================================ */

// Inicializar animação Lottie quando o DOM estiver pronto
function initProblem2Lottie() {
    const container = document.getElementById('problem2-lottie');

    if (!container) {
        console.warn('Problem2 Lottie container não encontrado');
        return;
    }

    // Verificar se Lottie está carregado
    if (typeof lottie === 'undefined') {
        console.error('Lottie library não está carregada');
        return;
    }

    try {
        // Configuração da animação Lottie usando lottie-web
        const animation = lottie.loadAnimation({
            container: container,
            renderer: 'svg', // Use SVG renderer for better quality
            loop: true,
            autoplay: true,
            path: './PATA.json' // Path to your PATA.json file
        });

        // Optional: Add intersection observer for performance
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animation.play();
                } else {
                    animation.pause();
                }
            });
        }, {
            threshold: 0.1
        });

        observer.observe(container);

        console.log('✅ Problem2 Lottie animation loaded successfully');
        return animation;
    } catch (error) {
        console.error('❌ Error loading Problem2 Lottie animation:', error);
    }
}

/* ============================================
   INITIALIZE ALL MODULES
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Navbar
  new Navbar();

  // Initialize Header Parallax
  new HeaderParallax();

  // Initialize Mouse Highlight
  const mouseHighlight = new MouseHighlight();

  // Initialize Draggable Element
  new DraggableElement();

  // Initialize Contact Buttons
  new ContactButtons();

  // Initialize Video Lazy Loader
  new VideoLazyLoader();

  // Initialize Problem2 Lottie Animation
  initProblem2Lottie();

  // Cleanup on page unload (boa prática)
  window.addEventListener('beforeunload', () => {
    mouseHighlight.destroy();
  });

  console.log('🐾 PATA Website - All modules initialized');
});

/* ============================================
   PERFORMANCE MONITORING
   ============================================ */

// Log performance metrics
window.addEventListener('load', () => {
  if (window.performance && window.performance.timing) {
    const perfData = window.performance.timing;
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
    const connectTime = perfData.responseEnd - perfData.requestStart;
    const renderTime = perfData.domComplete - perfData.domLoading;

    console.log('⚡ Performance Metrics:');
    console.log(`  Page Load: ${pageLoadTime}ms`);
    console.log(`  Connect: ${connectTime}ms`);
    console.log(`  Render: ${renderTime}ms`);
  }
});
