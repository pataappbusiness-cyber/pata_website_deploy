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
   INITIALIZE CRITICAL MODULES
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize critical modules
  const smoothScroll = new SmoothScroll();
  new Navbar();
  new ContactButtons(smoothScroll);

  // Store for deferred script access
  window._pataInstances = {
    smoothScroll
  };
});

