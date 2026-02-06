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

    // Smooth animation properties
    this.mouseX = 0;
    this.mouseY = 0;
    this.targetX = 0;
    this.targetY = 0;
    this.ease = 0.12; // Lower = smoother (0.05-0.15 range)
    this.rafId = null;
    this.isActive = false;

    // Store current positions for each element
    this.elementPositions = new Map();

    if (this.header && this.parallaxElements.length > 0) {
      this.init();
    }
  }

  init() {
    // Only enable parallax on devices with pointer (not touch)
    if (window.matchMedia('(pointer: fine)').matches) {
      // Initialize element positions
      this.parallaxElements.forEach(element => {
        this.elementPositions.set(element, { currentX: 0, currentY: 0, targetX: 0, targetY: 0 });
      });

      this.header.addEventListener('mousemove', (e) => this.handleMouseMove(e));

      // Reset position when mouse leaves
      this.header.addEventListener('mouseleave', () => this.resetPositions());

      // Start animation loop
      this.isActive = true;
      this.animate();
    }
  }

  handleMouseMove(e) {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;

    // Calculate mouse position relative to center (-1 to 1)
    this.targetX = (clientX / innerWidth - 0.5) * 2;
    this.targetY = (clientY / innerHeight - 0.5) * 2;
  }

  animate() {
    if (!this.isActive) return;

    // Smoothly interpolate mouse position
    this.mouseX += (this.targetX - this.mouseX) * this.ease;
    this.mouseY += (this.targetY - this.mouseY) * this.ease;

    // Update each parallax element
    this.parallaxElements.forEach(element => {
      const speed = parseFloat(element.dataset.parallax) || 0.3;
      const positions = this.elementPositions.get(element);

      // Calculate target positions
      positions.targetX = this.mouseX * 50 * speed;
      positions.targetY = this.mouseY * 50 * speed;

      // Smoothly interpolate element position
      positions.currentX += (positions.targetX - positions.currentX) * this.ease;
      positions.currentY += (positions.targetY - positions.currentY) * this.ease;

      // Apply transformation
      element.style.transform = `translate(${positions.currentX}px, ${positions.currentY}px)`;
    });

    // Continue animation loop
    this.rafId = requestAnimationFrame(() => this.animate());
  }

  resetPositions() {
    // Smoothly return to center
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

    // Use native smooth scroll (from CSS scroll-behavior: smooth)
    contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
   SECTION 2: PROBLEM1 - CARD SCROLL ANIMATIONS
   ============================================ */

class Problem1Animations {
  constructor() {
    this.section = document.querySelector('.problem1-section');
    this.greyCard = document.querySelector('.price-card-grey');
    this.orangeCard = document.querySelector('.price-card-orange');
    this.isVisible = false;

    if (this.section && this.greyCard && this.orangeCard) {
      this.init();
    }
  }

  init() {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.2
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.isVisible) {
          this.showCards();
          this.isVisible = true;
        } else if (!entry.isIntersecting && this.isVisible) {
          this.hideCards();
          this.isVisible = false;
        }
      });
    }, options);

    observer.observe(this.section);
  }

  showCards() {
    // Show both cards at the same time
    this.greyCard.classList.add('visible');
    this.orangeCard.classList.add('visible');
  }

  hideCards() {
    // Hide both cards
    this.greyCard.classList.remove('visible');
    this.orangeCard.classList.remove('visible');
  }
}

/* ============================================
   SECTION 7: SOLUTION1 - CARD SCROLL ANIMATIONS
   ============================================ */

class Solution1Animations {
  constructor() {
    this.section = document.querySelector('.solution1-section');
    this.leftCard = document.querySelector('.solution1-card-left .card-content');
    this.rightCard = document.querySelector('.solution1-card-right .card-content');
    this.isVisible = false;

    if (this.section && this.leftCard && this.rightCard) {
      this.init();
    }
  }

  init() {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.2
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.isVisible) {
          this.showCards();
          this.isVisible = true;
        } else if (!entry.isIntersecting && this.isVisible) {
          this.hideCards();
          this.isVisible = false;
        }
      });
    }, options);

    observer.observe(this.section);
  }

  showCards() {
    // Show both cards at the same time
    this.leftCard.classList.add('visible');
    this.rightCard.classList.add('visible');
  }

  hideCards() {
    // Hide both cards
    this.leftCard.classList.remove('visible');
    this.rightCard.classList.remove('visible');
  }
}

/* ============================================
   SECTION 9: SOLUTION3 - CARD SCROLL ANIMATIONS
   ============================================ */

class Solution3Animations {
  constructor() {
    this.section = document.querySelector('.solution3-section');
    this.cards = document.querySelectorAll('.solution3-card');
    this.isVisible = false;

    if (this.section && this.cards.length > 0) {
      this.init();
    }
  }

  init() {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.2
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.isVisible) {
          this.showCards();
          this.isVisible = true;
        } else if (!entry.isIntersecting && this.isVisible) {
          this.hideCards();
          this.isVisible = false;
        }
      });
    }, options);

    observer.observe(this.section);
  }

  showCards() {
    // Show all cards at the same time
    this.cards.forEach(card => {
      card.classList.add('visible');
    });
  }

  hideCards() {
    // Hide all cards
    this.cards.forEach(card => {
      card.classList.remove('visible');
    });
  }
}

/* ============================================
   SECTION 10: SOLUTION4 - CARD SCROLL ANIMATIONS
   ============================================ */

class Solution4Animations {
  constructor() {
    this.section = document.querySelector('.solution4-section');
    this.mainCard = document.querySelector('.solution4-main-card');
    this.bottomCards = document.querySelectorAll('.bottom-card');
    this.isVisible = false;

    if (this.section && (this.mainCard || this.bottomCards.length > 0)) {
      this.init();
    }
  }

  init() {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.2
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.isVisible) {
          this.showCards();
          this.isVisible = true;
        } else if (!entry.isIntersecting && this.isVisible) {
          this.hideCards();
          this.isVisible = false;
        }
      });
    }, options);

    observer.observe(this.section);
  }

  showCards() {
    // Show main card and bottom cards
    if (this.mainCard) {
      this.mainCard.classList.add('visible');
    }
    this.bottomCards.forEach(card => {
      card.classList.add('visible');
    });
  }

  hideCards() {
    // Hide main card and bottom cards
    if (this.mainCard) {
      this.mainCard.classList.remove('visible');
    }
    this.bottomCards.forEach(card => {
      card.classList.remove('visible');
    });
  }
}

/* ============================================
   SECTION 11: JOINUS1 - CARD SCROLL ANIMATIONS
   ============================================ */

class JoinUs1Animations {
  constructor() {
    this.section = document.querySelector('.joinus1-section');
    this.card1 = document.querySelector('.joinus1-card-1');
    this.card2 = document.querySelector('.joinus1-card-2');
    this.card3 = document.querySelector('.joinus1-card-3');
    this.planCard1 = document.querySelector('.bottom-plan-card-1');
    this.planCard2 = document.querySelector('.bottom-plan-card-2');
    this.planCard3 = document.querySelector('.bottom-plan-card-3');
    this.topCardsVisible = false;
    this.bottomCardsVisible = false;

    if (this.section) {
      this.init();
    }
  }

  init() {
    // Observer for top cards
    const topCardsOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.2
    };

    const topCardsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.topCardsVisible) {
          this.showTopCards();
          this.topCardsVisible = true;
        } else if (!entry.isIntersecting && this.topCardsVisible) {
          this.hideTopCards();
          this.topCardsVisible = false;
        }
      });
    }, topCardsOptions);

    if (this.card1 || this.card2 || this.card3) {
      topCardsObserver.observe(this.section);
    }

    // Observer for bottom plan cards
    const bottomCardsElement = document.querySelector('.joinus1-bottom-cards');
    if (bottomCardsElement) {
      const bottomCardsOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.3
      };

      const bottomCardsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !this.bottomCardsVisible) {
            this.showBottomCards();
            this.bottomCardsVisible = true;
          } else if (!entry.isIntersecting && this.bottomCardsVisible) {
            this.hideBottomCards();
            this.bottomCardsVisible = false;
          }
        });
      }, bottomCardsOptions);

      bottomCardsObserver.observe(bottomCardsElement);
    }
  }

  showTopCards() {
    // Show top three cards
    if (this.card1) {
      this.card1.classList.add('visible');
    }
    if (this.card2) {
      this.card2.classList.add('visible');
    }
    if (this.card3) {
      this.card3.classList.add('visible');
    }
  }

  hideTopCards() {
    // Hide top three cards
    if (this.card1) {
      this.card1.classList.remove('visible');
    }
    if (this.card2) {
      this.card2.classList.remove('visible');
    }
    if (this.card3) {
      this.card3.classList.remove('visible');
    }
  }

  showBottomCards() {
    // Show bottom plan cards
    if (this.planCard1) {
      this.planCard1.classList.add('visible');
    }
    if (this.planCard2) {
      this.planCard2.classList.add('visible');
    }
    if (this.planCard3) {
      this.planCard3.classList.add('visible');
    }
  }

  hideBottomCards() {
    // Hide bottom plan cards
    if (this.planCard1) {
      this.planCard1.classList.remove('visible');
    }
    if (this.planCard2) {
      this.planCard2.classList.remove('visible');
    }
    if (this.planCard3) {
      this.planCard3.classList.remove('visible');
    }
  }
}

/* ============================================
   SECTION 12: JOINUS2 - CARD SCROLL ANIMATIONS
   ============================================ */

class JoinUs2Animations {
  constructor() {
    this.section = document.querySelector('.joinus2-section');
    this.cards = document.querySelectorAll('.joinus2-cards-grid .benefit-card');
    this.warningCard = document.querySelector('.joinus2-warning-card');
    this.isVisible = false;

    if (this.section && this.cards.length > 0) {
      this.init();
    }
  }

  init() {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.2
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.isVisible) {
          this.showCards();
          this.isVisible = true;
        } else if (!entry.isIntersecting && this.isVisible) {
          this.hideCards();
          this.isVisible = false;
        }
      });
    }, options);

    observer.observe(this.section);
  }

  showCards() {
    // Show all 4 cards (first two from left, last two from right)
    this.cards.forEach(card => {
      card.classList.add('visible');
    });

    // Show warning card
    if (this.warningCard) {
      this.warningCard.classList.add('visible');
    }
  }

  hideCards() {
    // Hide all 4 cards
    this.cards.forEach(card => {
      card.classList.remove('visible');
    });

    // Hide warning card
    if (this.warningCard) {
      this.warningCard.classList.remove('visible');
    }
  }
}

/* ============================================
   SECTION 14: RESERVAR - REVEAL ANIMATIONS
   ============================================ */

class ReservarAnimations {
  constructor() {
    this.section = document.querySelector('.reservar-section');
    this.formCard = document.querySelector('.reservar-form-card');
    this.carousel = document.querySelector('.reservar-image-carousel');
    this.infoCards = document.querySelectorAll('.reservar-info-card');
    this.isVisible = false;

    if (this.section) {
      this.init();
    }
  }

  init() {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.2
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.isVisible) {
          this.showElements();
          this.isVisible = true;
        } else if (!entry.isIntersecting && this.isVisible) {
          this.hideElements();
          this.isVisible = false;
        }
      });
    }, options);

    observer.observe(this.section);
  }

  showElements() {
    // Show form card from left
    if (this.formCard) {
      this.formCard.classList.add('visible');
    }

    // Show carousel from right
    if (this.carousel) {
      this.carousel.classList.add('visible');
    }

    // Show info cards from bottom
    this.infoCards.forEach(card => {
      card.classList.add('visible');
    });
  }

  hideElements() {
    // Hide form card
    if (this.formCard) {
      this.formCard.classList.remove('visible');
    }

    // Hide carousel
    if (this.carousel) {
      this.carousel.classList.remove('visible');
    }

    // Hide info cards
    this.infoCards.forEach(card => {
      card.classList.remove('visible');
    });
  }
}

/* ============================================
   SECTION 1: HEADER - REVEAL ANIMATIONS
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
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

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
    // Show header content
    if (this.headerContent) {
      this.headerContent.classList.add('visible');
    }

    // Show left pills
    if (this.pillLeftTop) {
      this.pillLeftTop.classList.add('visible');
    }
    if (this.pillLeftBottom) {
      this.pillLeftBottom.classList.add('visible');
    }

    // Show right pills
    if (this.pillRightTop) {
      this.pillRightTop.classList.add('visible');
    }
    if (this.pillRightBottom) {
      this.pillRightBottom.classList.add('visible');
    }

    // Show center mockup
    if (this.mockupCenter) {
      this.mockupCenter.classList.add('visible');
    }
  }
}

/* ============================================
   SECTION 15: JOINUS3 - STAT CARDS REVEAL ANIMATIONS
   ============================================ */

class JoinUs3Animations {
  constructor() {
    this.section = document.querySelector('.joinus3-section');
    this.statCards = document.querySelectorAll('.joinus3-stat-card');
    this.isVisible = false;

    if (this.section && this.statCards.length > 0) {
      this.init();
    }
  }

  init() {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.2
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.isVisible) {
          this.showCards();
          this.isVisible = true;
        } else if (!entry.isIntersecting && this.isVisible) {
          this.hideCards();
          this.isVisible = false;
        }
      });
    }, options);

    observer.observe(this.section);
  }

  showCards() {
    this.statCards.forEach(card => {
      card.classList.add('visible');
    });
  }

  hideCards() {
    this.statCards.forEach(card => {
      card.classList.remove('visible');
    });
  }
}

/* ============================================
   SECTION 3: PROBLEM2 - CARD SCROLL ANIMATIONS
   ============================================ */

class Problem2Animations {
  constructor() {
    this.section = document.querySelector('#problem2');
    this.content = document.querySelector('.problem2-content');
    this.animation = document.querySelector('.problem2-animation');
    this.isVisible = false;

    if (this.section && (this.content || this.animation)) {
      this.init();
    }
  }

  init() {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.2
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.isVisible) {
          this.showElements();
          this.isVisible = true;
        } else if (!entry.isIntersecting && this.isVisible) {
          this.hideElements();
          this.isVisible = false;
        }
      });
    }, options);

    observer.observe(this.section);
  }

  showElements() {
    if (this.content) {
      this.content.classList.add('visible');
    }
    if (this.animation) {
      this.animation.classList.add('visible');
    }
  }

  hideElements() {
    if (this.content) {
      this.content.classList.remove('visible');
    }
    if (this.animation) {
      this.animation.classList.remove('visible');
    }
  }
}

/* ============================================
   SECTION 4: PROBLEM3 - CARD SCROLL ANIMATIONS
   ============================================ */

class Problem3Animations {
  constructor() {
    this.section = document.querySelector('#problem3');
    this.header = document.querySelector('.problem3-header');
    this.stats = document.querySelector('.problem3-stats');
    this.isVisible = false;

    if (this.section && (this.header || this.stats)) {
      this.init();
    }
  }

  init() {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.2
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.isVisible) {
          this.showElements();
          this.isVisible = true;
        } else if (!entry.isIntersecting && this.isVisible) {
          this.hideElements();
          this.isVisible = false;
        }
      });
    }, options);

    observer.observe(this.section);
  }

  showElements() {
    if (this.header) {
      this.header.classList.add('visible');
    }
    if (this.stats) {
      this.stats.classList.add('visible');
    }
  }

  hideElements() {
    if (this.header) {
      this.header.classList.remove('visible');
    }
    if (this.stats) {
      this.stats.classList.remove('visible');
    }
  }
}

/* ============================================
   SECTION 6: PROBLEM5 - TESTIMONIALS SCROLL ANIMATIONS
   ============================================ */

class Problem5Animations {
  constructor() {
    this.section = document.querySelector('.problem5-section');
    this.testimonials = document.querySelectorAll('.testimonial-item');
    this.isVisible = false;

    if (this.section && this.testimonials.length > 0) {
      this.init();
    }
  }

  init() {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.2
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.isVisible) {
          this.showTestimonials();
          this.isVisible = true;
        } else if (!entry.isIntersecting && this.isVisible) {
          this.hideTestimonials();
          this.isVisible = false;
        }
      });
    }, options);

    observer.observe(this.section);
  }

  showTestimonials() {
    this.testimonials.forEach(testimonial => {
      testimonial.classList.add('visible');
    });
  }

  hideTestimonials() {
    this.testimonials.forEach(testimonial => {
      testimonial.classList.remove('visible');
    });
  }
}

/* ============================================
   SECTION 5: PROBLEM4 - VALIDATION STATS SCROLL ANIMATIONS
   ============================================ */

class Problem4Animations {
  constructor() {
    this.section = document.querySelector('.problem4-section');
    this.stats = document.querySelectorAll('.validation-stat');
    this.isVisible = false;

    if (this.section && this.stats.length > 0) {
      this.init();
    }
  }

  init() {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.2
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.isVisible) {
          this.showStats();
          this.isVisible = true;
        } else if (!entry.isIntersecting && this.isVisible) {
          this.hideStats();
          this.isVisible = false;
        }
      });
    }, options);

    observer.observe(this.section);
  }

  showStats() {
    this.stats.forEach(stat => {
      stat.classList.add('visible');
    });
  }

  hideStats() {
    this.stats.forEach(stat => {
      stat.classList.remove('visible');
    });
  }
}

/* ============================================
   SECTION 8: SOLUTION2 - COMPARISON TABLE SCROLL ANIMATIONS
   ============================================ */

class Solution2Animations {
  constructor() {
    this.section = document.querySelector('.solution2-section');
    this.table = document.querySelector('.comparison-table');
    this.isVisible = false;

    if (this.section && this.table) {
      this.init();
    }
  }

  init() {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.2
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.isVisible) {
          this.showTable();
          this.isVisible = true;
        } else if (!entry.isIntersecting && this.isVisible) {
          this.hideTable();
          this.isVisible = false;
        }
      });
    }, options);

    observer.observe(this.section);
  }

  showTable() {
    if (this.table) {
      this.table.classList.add('visible');
    }
  }

  hideTable() {
    if (this.table) {
      this.table.classList.remove('visible');
    }
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
   SMOOTH SCROLL - CUSTOM IMPLEMENTATION
   ============================================ */

class SmoothScroll {
  constructor() {
    this.scrollTarget = 0;
    this.scrollCurrent = 0;
    this.ease = 0.1;
    this.rafId = null;
    this.isRunning = false;
    this.isScrolling = false;
    this.scrollTimeout = null;
    this.init();
  }

  init() {
    try {
      // Only handle anchor links - let browser handle normal scrolling
      this.setupAnchorLinks();

      console.log('✨ Smooth scroll initialized (anchor links only)');
    } catch (error) {
      console.error('❌ Error initializing smooth scroll:', error);
    }
  }

  handleWheel(e) {
    e.preventDefault();
    this.isScrolling = true;
    this.scrollTarget += e.deltaY;

    // Clamp scroll target to valid range
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    this.scrollTarget = Math.max(0, Math.min(this.scrollTarget, maxScroll));

    // Reset scrolling flag after a delay
    clearTimeout(this.scrollTimeout);
    this.scrollTimeout = setTimeout(() => {
      this.isScrolling = false;
    }, 100);
  }

  handleKeyboard(e) {
    // Don't handle keyboard scrolling if user is typing in a form field
    const activeElement = document.activeElement;
    const isFormElement = activeElement && (
      activeElement.tagName === 'INPUT' ||
      activeElement.tagName === 'TEXTAREA' ||
      activeElement.tagName === 'SELECT' ||
      activeElement.isContentEditable
    );

    if (isFormElement) {
      return; // Allow default behavior for form inputs
    }

    // Handle arrow keys and page navigation
    const keyActions = {
      'ArrowDown': 100,
      'ArrowUp': -100,
      'PageDown': window.innerHeight * 0.8,
      'PageUp': -window.innerHeight * 0.8,
      'Home': -this.scrollTarget,
      'End': document.documentElement.scrollHeight - window.innerHeight - this.scrollTarget,
      ' ': window.innerHeight * 0.8 // Space bar
    };

    if (keyActions[e.key] !== undefined) {
      e.preventDefault();
      this.isScrolling = true;
      this.scrollTarget += keyActions[e.key];

      // Clamp scroll target to valid range
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      this.scrollTarget = Math.max(0, Math.min(this.scrollTarget, maxScroll));

      // Reset scrolling flag
      clearTimeout(this.scrollTimeout);
      this.scrollTimeout = setTimeout(() => {
        this.isScrolling = false;
      }, 100);
    }
  }

  handleScroll(e) {
    // Handle scrollbar dragging - update target to match actual scroll
    if (!this.isScrolling) {
      const currentScroll = window.pageYOffset;
      // Only update if there's a significant difference (user is dragging scrollbar)
      if (Math.abs(currentScroll - this.scrollCurrent) > 5) {
        this.scrollTarget = currentScroll;
        this.scrollCurrent = currentScroll;
      }
    }
  }

  setupAnchorLinks() {
    // Get all anchor links that point to sections on this page
    const anchorLinks = document.querySelectorAll('a[href^="#"]');

    anchorLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');

        // Skip empty or just # links
        if (href === '#' || href === '') return;

        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          // Use native smooth scroll (from CSS scroll-behavior: smooth)
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  scrollTo(targetPosition) {
    this.isScrolling = true;
    this.scrollTarget = targetPosition;

    clearTimeout(this.scrollTimeout);
    this.scrollTimeout = setTimeout(() => {
      this.isScrolling = false;
    }, 100);
  }

  raf() {
    if (!this.isRunning) return;

    // Lerp (linear interpolation) for smooth scrolling
    this.scrollCurrent += (this.scrollTarget - this.scrollCurrent) * this.ease;

    // Round to avoid sub-pixel rendering issues
    const rounded = Math.round(this.scrollCurrent * 100) / 100;

    // Apply scroll
    window.scrollTo(0, rounded);

    // Continue animation loop
    this.rafId = requestAnimationFrame(() => this.raf());
  }

  destroy() {
    // Cleanup (no event listeners to remove since we only handle anchor links)
    clearTimeout(this.scrollTimeout);
  }
}

/* ============================================
   INITIALIZE ALL MODULES
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Smooth Scroll
  const smoothScroll = new SmoothScroll();

  // Initialize Navbar
  new Navbar();

  // Initialize Header Parallax
  const headerParallax = new HeaderParallax();

  // Initialize Header Reveal Animations
  new HeaderAnimations();

  // Initialize Mouse Highlight
  const mouseHighlight = new MouseHighlight();

  // Initialize Draggable Element
  new DraggableElement();

  // Initialize Contact Buttons (pass smooth scroll instance)
  new ContactButtons(smoothScroll);

  // Initialize Scroll to Top Button (pass smooth scroll instance)
  window.scrollToTopButton = new ScrollToTopButton(smoothScroll);

  // Initialize Video Lazy Loader
  new VideoLazyLoader();

  // Initialize Problem1 Card Animations
  new Problem1Animations();

  // Initialize Problem2 Card Animations
  new Problem2Animations();

  // Initialize Problem3 Card Animations
  new Problem3Animations();

  // Initialize Problem4 Validation Stats Animations
  new Problem4Animations();

  // Initialize Problem5 Testimonials Animations
  new Problem5Animations();

  // Initialize Solution1 Card Animations
  new Solution1Animations();

  // Initialize Solution2 Table Animations
  new Solution2Animations();

  // Initialize Solution3 Card Animations
  new Solution3Animations();

  // Initialize Solution4 Card Animations
  new Solution4Animations();

  // Initialize JoinUs1 Card Animations
  new JoinUs1Animations();

  // Initialize JoinUs2 Card Animations
  new JoinUs2Animations();

  // Initialize Reservar Reveal Animations
  new ReservarAnimations();

  // Initialize JoinUs3 Stat Cards Animations
  new JoinUs3Animations();

  // Initialize Problem2 Lottie Animation
  initProblem2Lottie();

  // Cleanup on page unload (boa prática)
  window.addEventListener('beforeunload', () => {
    mouseHighlight.destroy();
    smoothScroll.destroy();
    headerParallax.destroy();
    if (window.scrollToTopButton) {
      window.scrollToTopButton.destroy();
    }
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
