/**
 * PATA Website - Critical JavaScript
 * Loads immediately - essential for above-the-fold content
 * Version: 1.0
 */

'use strict';



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
    this._scrollTicking = false;
    window.addEventListener('scroll', () => {
      if (!this._scrollTicking) {
        this._scrollTicking = true;
        requestAnimationFrame(() => {
          this.handleScroll();
          this._scrollTicking = false;
        });
      }
    }, { passive: true });
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



/* Header animations now handled by CSS @keyframes (excluded from CLS) */

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
   HEADER PARALLAX
   ============================================ */

class HeaderParallax {
  constructor() {
    this.header = document.querySelector('.header-section');
    this.parallaxElements = document.querySelectorAll('[data-parallax]');

    this.targetX = 0;
    this.targetY = 0;
    this.ease = 0.12;
    this.rafId = null;

    this.elementPositions = new Map();

    if (this.header && this.parallaxElements.length > 0) {
      this.init();
    }
  }

  init() {
    if (window.matchMedia('(pointer: fine)').matches) {
      this.parallaxElements.forEach(element => {
        this.elementPositions.set(element, { currentX: 0, currentY: 0 });
      });

      this.header.addEventListener('mousemove', (e) => this.handleMouseMove(e));
      this.header.addEventListener('mouseleave', () => this.resetPositions());
    }
  }

  handleMouseMove(e) {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;

    this.targetX = (clientX / innerWidth - 0.5) * 2;
    this.targetY = (clientY / innerHeight - 0.5) * 2;

    if (!this.rafId) {
      this.rafId = requestAnimationFrame(() => this.animate());
    }
  }

  animate() {
    let allSettled = true;

    this.parallaxElements.forEach(element => {
      const speed = parseFloat(element.dataset.parallax) || 0.3;
      const pos = this.elementPositions.get(element);

      const goalX = this.targetX * 50 * speed;
      const goalY = this.targetY * 50 * speed;

      pos.currentX += (goalX - pos.currentX) * this.ease;
      pos.currentY += (goalY - pos.currentY) * this.ease;

      if (Math.abs(goalX - pos.currentX) > 0.1 || Math.abs(goalY - pos.currentY) > 0.1) {
        allSettled = false;
      }

      element.style.transform = `translate3d(${pos.currentX}px, ${pos.currentY}px, 0)`;
    });

    if (allSettled) {
      this.parallaxElements.forEach(element => {
        const speed = parseFloat(element.dataset.parallax) || 0.3;
        const pos = this.elementPositions.get(element);
        pos.currentX = this.targetX * 50 * speed;
        pos.currentY = this.targetY * 50 * speed;
        element.style.transform = `translate3d(${pos.currentX}px, ${pos.currentY}px, 0)`;
      });
      this.rafId = null;
    } else {
      this.rafId = requestAnimationFrame(() => this.animate());
    }
  }

  resetPositions() {
    this.targetX = 0;
    this.targetY = 0;

    if (!this.rafId) {
      this.rafId = requestAnimationFrame(() => this.animate());
    }
  }

  destroy() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }
}

/* ============================================
   INITIALIZE CRITICAL MODULES
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize critical modules
  const smoothScroll = new SmoothScroll();
  new Navbar();
  new ContactButtons(smoothScroll);

  // Initialize Header Parallax (skip if reduced motion)
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReducedMotion) {
    new HeaderParallax();
  }

  // Store for deferred script access
  window._pataInstances = {
    smoothScroll
  };
});

