/**
 * PATA Website - Deferred JavaScript
 * Loads after idle - animations and below-the-fold functionality
 * Version: 1.0
 */

'use strict';

/* ============================================
   VIDEO LAZY LOADER
   ============================================ */

class VideoLazyLoader {
  constructor() {
    this.videos = document.querySelectorAll('video[data-lazy-video]');
    this.isMobile = window.innerWidth < 768 || !window.matchMedia('(hover: hover)').matches;
    if (this.videos.length > 0) {
      this.init();
    }
  }

  init() {
    if (this.isMobile) {
      // Mobile: remove source elements so only poster image is shown
      this.videos.forEach(video => {
        const sources = video.querySelectorAll('source');
        sources.forEach(source => source.remove());
        video.removeAttribute('data-lazy-video');
      });
      return;
    }

    // Desktop: lazy-load videos as before
    const options = { root: null, rootMargin: '200px', threshold: 0.1 };
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
    video.load();
    video.play();
    video.removeAttribute('data-lazy-video');
  }
}

/* ============================================
   DRAGGABLE ELEMENT
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
    this.element.addEventListener('mousedown', (e) => this.dragStart(e));
    document.addEventListener('mousemove', (e) => this.drag(e));
    document.addEventListener('mouseup', (e) => this.dragEnd(e));
    this.element.addEventListener('touchstart', (e) => this.dragStart(e));
    document.addEventListener('touchmove', (e) => this.drag(e));
    document.addEventListener('touchend', (e) => this.dragEnd(e));
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
   PROBLEM1 ANIMATIONS
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
    const options = { root: null, rootMargin: '0px', threshold: 0.2 };
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
    this.greyCard.classList.add('visible');
    this.orangeCard.classList.add('visible');
  }

  hideCards() {
    this.greyCard.classList.remove('visible');
    this.orangeCard.classList.remove('visible');
  }
}

/* ============================================
   PROBLEM2 ANIMATIONS
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
    const options = { root: null, rootMargin: '0px', threshold: 0.2 };
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
    if (this.content) this.content.classList.add('visible');
    if (this.animation) this.animation.classList.add('visible');
  }

  hideElements() {
    if (this.content) this.content.classList.remove('visible');
    if (this.animation) this.animation.classList.remove('visible');
  }
}

/* ============================================
   PROBLEM3 ANIMATIONS
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
    const options = { root: null, rootMargin: '0px', threshold: 0.2 };
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
    if (this.header) this.header.classList.add('visible');
    if (this.stats) this.stats.classList.add('visible');
  }

  hideElements() {
    if (this.header) this.header.classList.remove('visible');
    if (this.stats) this.stats.classList.remove('visible');
  }
}

/* ============================================
   PROBLEM4 ANIMATIONS
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
    const options = { root: null, rootMargin: '0px', threshold: 0.2 };
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
    this.stats.forEach(stat => stat.classList.add('visible'));
  }

  hideStats() {
    this.stats.forEach(stat => stat.classList.remove('visible'));
  }
}

/* ============================================
   PROBLEM5 ANIMATIONS
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
    const options = { root: null, rootMargin: '0px', threshold: 0.2 };
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
    this.testimonials.forEach(t => t.classList.add('visible'));
  }

  hideTestimonials() {
    this.testimonials.forEach(t => t.classList.remove('visible'));
  }
}

/* ============================================
   SOLUTION1 ANIMATIONS
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
    const options = { root: null, rootMargin: '0px', threshold: 0.2 };
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
    this.leftCard.classList.add('visible');
    this.rightCard.classList.add('visible');
  }

  hideCards() {
    this.leftCard.classList.remove('visible');
    this.rightCard.classList.remove('visible');
  }
}

/* ============================================
   SOLUTION2 ANIMATIONS
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
    const options = { root: null, rootMargin: '0px', threshold: 0.2 };
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
    if (this.table) this.table.classList.add('visible');
  }

  hideTable() {
    if (this.table) this.table.classList.remove('visible');
  }
}

/* ============================================
   SOLUTION3 ANIMATIONS
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
    const options = { root: null, rootMargin: '0px', threshold: 0.2 };
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
    this.cards.forEach(card => card.classList.add('visible'));
  }

  hideCards() {
    this.cards.forEach(card => card.classList.remove('visible'));
  }
}

/* ============================================
   SOLUTION4 ANIMATIONS
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
    const options = { root: null, rootMargin: '0px', threshold: 0.2 };
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
    if (this.mainCard) this.mainCard.classList.add('visible');
    this.bottomCards.forEach(card => card.classList.add('visible'));
  }

  hideCards() {
    if (this.mainCard) this.mainCard.classList.remove('visible');
    this.bottomCards.forEach(card => card.classList.remove('visible'));
  }
}

/* ============================================
   JOINUS1 ANIMATIONS
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
    const topCardsOptions = { root: null, rootMargin: '0px', threshold: 0.2 };
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

    const bottomCardsElement = document.querySelector('.joinus1-bottom-cards');
    if (bottomCardsElement) {
      const bottomCardsOptions = { root: null, rootMargin: '0px', threshold: 0.3 };
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
    if (this.card1) this.card1.classList.add('visible');
    if (this.card2) this.card2.classList.add('visible');
    if (this.card3) this.card3.classList.add('visible');
  }

  hideTopCards() {
    if (this.card1) this.card1.classList.remove('visible');
    if (this.card2) this.card2.classList.remove('visible');
    if (this.card3) this.card3.classList.remove('visible');
  }

  showBottomCards() {
    if (this.planCard1) this.planCard1.classList.add('visible');
    if (this.planCard2) this.planCard2.classList.add('visible');
    if (this.planCard3) this.planCard3.classList.add('visible');
  }

  hideBottomCards() {
    if (this.planCard1) this.planCard1.classList.remove('visible');
    if (this.planCard2) this.planCard2.classList.remove('visible');
    if (this.planCard3) this.planCard3.classList.remove('visible');
  }
}

/* ============================================
   JOINUS2 ANIMATIONS
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
    const options = { root: null, rootMargin: '0px', threshold: 0.2 };
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
    this.cards.forEach(card => card.classList.add('visible'));
    if (this.warningCard) this.warningCard.classList.add('visible');
  }

  hideCards() {
    this.cards.forEach(card => card.classList.remove('visible'));
    if (this.warningCard) this.warningCard.classList.remove('visible');
  }
}

/* ============================================
   JOINUS3 ANIMATIONS
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
    const options = { root: null, rootMargin: '0px', threshold: 0.2 };
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
    this.statCards.forEach(card => card.classList.add('visible'));
  }

  hideCards() {
    this.statCards.forEach(card => card.classList.remove('visible'));
  }
}

/* ============================================
   RESERVAR ANIMATIONS
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
    const options = { root: null, rootMargin: '0px', threshold: 0.2 };
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
    if (this.formCard) this.formCard.classList.add('visible');
    if (this.carousel) this.carousel.classList.add('visible');
    this.infoCards.forEach(card => card.classList.add('visible'));
  }

  hideElements() {
    if (this.formCard) this.formCard.classList.remove('visible');
    if (this.carousel) this.carousel.classList.remove('visible');
    this.infoCards.forEach(card => card.classList.remove('visible'));
  }
}

/* ============================================
   SCROLL TO TOP BUTTON
   ============================================ */

class ScrollToTopButton {
  constructor(smoothScroll) {
    this.button = document.getElementById('scroll-to-top-button');
    this.progressCircle = document.querySelector('.progress-ring-circle');
    this.heroSection = document.getElementById('hero');
    this.smoothScroll = smoothScroll;

    if (!this.button || !this.progressCircle || !this.heroSection) {
      return;
    }

    const radius = this.progressCircle.r.baseVal.value;
    this.circumference = radius * 2 * Math.PI;
    this.progressCircle.style.strokeDasharray = `${this.circumference} ${this.circumference}`;
    this.progressCircle.style.strokeDashoffset = this.circumference;

    this.handleScroll = this.handleScroll.bind(this);
    this.scrollToTop = this.scrollToTop.bind(this);

    // Pre-compute dark section offsets for arrow color
    this.darkSections = [];
    this.computeDarkSections();

    this.init();
  }

  computeDarkSections() {
    this.darkSections = [];
    const darkIds = ['hero', 'problem1', 'problem4', 'solution1', 'solution3', 'joinus2', 'joinus3'];
    darkIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        this.darkSections.push({
          top: el.offsetTop,
          bottom: el.offsetTop + el.offsetHeight
        });
      }
    });
    // Also include footer
    const footer = document.querySelector('footer');
    if (footer) {
      this.darkSections.push({
        top: footer.offsetTop,
        bottom: footer.offsetTop + footer.offsetHeight
      });
    }
  }

  init() {
    // Throttled scroll handler (100ms instead of per-frame)
    let scrollTimeout;
    window.addEventListener('scroll', () => {
      if (!scrollTimeout) {
        scrollTimeout = setTimeout(() => {
          this.handleScroll();
          scrollTimeout = null;
        }, 100);
      }
    }, { passive: true });

    // Re-compute dark sections on resize
    window.addEventListener('resize', () => this.computeDarkSections());

    this.button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.scrollToTop();
    });

    this.handleScroll();
  }

  handleScroll() {
    const heroHeight = this.heroSection.offsetHeight;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;

    if (scrollTop > heroHeight) {
      this.button.removeAttribute('hidden');
      this.button.classList.add('visible');
    } else {
      this.button.classList.remove('visible');
      setTimeout(() => {
        if (!this.button.classList.contains('visible')) {
          this.button.setAttribute('hidden', '');
        }
      }, 300);
    }

    const scrollableDistance = docHeight - heroHeight;
    const scrollProgress = Math.min(Math.max((scrollTop - heroHeight) / scrollableDistance, 0), 1);
    this.setProgress(scrollProgress);
    this.updateArrowColor();
  }

  setProgress(progress) {
    const offset = this.circumference - (progress * this.circumference);
    this.progressCircle.style.strokeDashoffset = offset;
  }

  updateArrowColor() {
    // Use pre-computed offsets instead of document.elementFromPoint (avoids forced reflow)
    const scrollY = window.scrollY + window.innerHeight - 60;
    const isDark = this.darkSections.some(s => scrollY >= s.top && scrollY <= s.bottom);

    if (isDark) {
      this.button.classList.add('white-arrow');
    } else {
      this.button.classList.remove('white-arrow');
    }
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  }

  destroy() {
    window.removeEventListener('scroll', this.handleScroll);
  }
}

/* ============================================
   FAQ ACCORDION
   ============================================ */

(function() {
  'use strict';

  function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    if (!faqItems || faqItems.length === 0) return;

    faqItems.forEach((item, index) => {
      const button = item.querySelector('.faq-question-button');
      const answer = item.querySelector('.faq-answer');
      if (!button || !answer) return;

      const buttonId = `faq-button-${index}`;
      const answerId = `faq-answer-${index}`;

      button.setAttribute('id', buttonId);
      button.setAttribute('aria-expanded', 'false');
      button.setAttribute('aria-controls', answerId);
      answer.setAttribute('id', answerId);
      answer.setAttribute('role', 'region');
      answer.setAttribute('aria-labelledby', buttonId);

      button.addEventListener('click', function() {
        toggleFAQItem(item);
      });

      button.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleFAQItem(item);
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          focusNextFAQ(index, faqItems);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          focusPreviousFAQ(index, faqItems);
        } else if (e.key === 'Home') {
          e.preventDefault();
          faqItems[0].querySelector('.faq-question-button').focus();
        } else if (e.key === 'End') {
          e.preventDefault();
          faqItems[faqItems.length - 1].querySelector('.faq-question-button').focus();
        }
      });
    });
  }

  function toggleFAQItem(item) {
    const isActive = item.classList.contains('active');
    if (isActive) {
      closeFAQItem(item);
    } else {
      openFAQItem(item);
    }
  }

  function openFAQItem(item) {
    const button = item.querySelector('.faq-question-button');
    const answer = item.querySelector('.faq-answer');
    item.classList.add('active');
    button.setAttribute('aria-expanded', 'true');
    answer.style.maxHeight = '800px';
  }

  function closeFAQItem(item) {
    const button = item.querySelector('.faq-question-button');
    const answer = item.querySelector('.faq-answer');
    item.classList.remove('active');
    button.setAttribute('aria-expanded', 'false');
    answer.style.maxHeight = '0';
  }

  function focusNextFAQ(currentIndex, faqItems) {
    const nextIndex = (currentIndex + 1) % faqItems.length;
    faqItems[nextIndex].querySelector('.faq-question-button').focus();
  }

  function focusPreviousFAQ(currentIndex, faqItems) {
    const prevIndex = (currentIndex - 1 + faqItems.length) % faqItems.length;
    faqItems[prevIndex].querySelector('.faq-question-button').focus();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFAQ);
  } else {
    initFAQ();
  }

  let resizeTimer;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
      const activeItems = document.querySelectorAll('.faq-item.active');
      activeItems.forEach(item => {
        const answer = item.querySelector('.faq-answer');
        if (answer) answer.style.maxHeight = '800px';
      });
    }, 250);
  });
})();

/* ============================================
   INITIALIZE DEFERRED MODULES
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  // Get smoothScroll from critical script
  const smoothScroll = window._pataInstances ? window._pataInstances.smoothScroll : null;

  // Initialize all animation modules
  new VideoLazyLoader();
  new DraggableElement();
  new Problem1Animations();
  new Problem2Animations();
  new Problem3Animations();
  new Problem4Animations();
  new Problem5Animations();
  new Solution1Animations();
  new Solution2Animations();
  new Solution3Animations();
  new Solution4Animations();
  new JoinUs1Animations();
  new JoinUs2Animations();
  new JoinUs3Animations();
  new ReservarAnimations();

  // Initialize scroll to top button
  window.scrollToTopButton = new ScrollToTopButton(smoothScroll);

  console.log('🐾 PATA Deferred JS loaded');

  // Cleanup
  window.addEventListener('beforeunload', () => {
    if (window.scrollToTopButton) {
      window.scrollToTopButton.destroy();
    }
  });
});

// Performance monitoring
window.addEventListener('load', () => {
  // Use setTimeout to ensure loadEventEnd is populated
  setTimeout(() => {
    if (window.performance) {
      // Use modern Performance API if available
      const entries = performance.getEntriesByType('navigation');
      if (entries.length > 0) {
        const navEntry = entries[0];
        console.log(`⚡ Page Load: ${Math.round(navEntry.loadEventEnd)}ms`);
      } else if (window.performance.timing) {
        // Fallback to deprecated API
        const perfData = window.performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        if (pageLoadTime > 0) {
          console.log(`⚡ Page Load: ${pageLoadTime}ms`);
        }
      }
    }
  }, 0);
});
