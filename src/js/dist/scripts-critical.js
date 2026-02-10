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
    window.addEventListener('scroll', () => this.handleScroll(), { passive: true });
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
  // Initialize critical modules
  const smoothScroll = new SmoothScroll();
  new Navbar();
  new HeaderAnimations();
  new ContactButtons(smoothScroll);

  // Store for deferred script access
  window._pataInstances = {
    smoothScroll
  };
});

