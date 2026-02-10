/**
 * PATA Scroll to Top Button
 * Handles visibility, scroll progress, and smooth scrolling
 */

class ScrollToTopButton {
  constructor(smoothScroll) {
    this.button = document.getElementById('scroll-to-top-button');
    this.progressCircle = document.querySelector('.progress-ring-circle');
    this.heroSection = document.getElementById('hero');
    this.smoothScroll = smoothScroll;

    if (!this.button || !this.progressCircle || !this.heroSection) {
      console.error('Required elements not found for ScrollToTopButton');
      return;
    }

    // Calculate circle circumference for progress animation
    const radius = this.progressCircle.r.baseVal.value;
    this.circumference = radius * 2 * Math.PI;

    // Set initial stroke dash properties
    this.progressCircle.style.strokeDasharray = `${this.circumference} ${this.circumference}`;
    this.progressCircle.style.strokeDashoffset = this.circumference;

    // Bind methods
    this.handleScroll = this.handleScroll.bind(this);
    this.scrollToTop = this.scrollToTop.bind(this);

    // Pre-compute dark section offsets for arrow color
    this.darkSections = [];
    this.computeDarkSections();

    // Initialize
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

    // Add click event listener
    this.button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('🔝 Scroll to top button clicked');
      this.scrollToTop();
    });

    // Initial check
    this.handleScroll();

    console.log('✅ Scroll to top button initialized successfully');
  }

  handleScroll() {
    const heroHeight = this.heroSection.offsetHeight;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;

    // Show/hide button based on scroll position
    if (scrollTop > heroHeight) {
      this.button.removeAttribute('hidden');
      this.button.classList.add('visible');
    } else {
      this.button.classList.remove('visible');
      // Delay hiding to allow fade-out animation
      setTimeout(() => {
        if (!this.button.classList.contains('visible')) {
          this.button.setAttribute('hidden', '');
        }
      }, 300);
    }

    // Calculate scroll progress (0 to 1)
    const scrollableDistance = docHeight - heroHeight;
    const scrollProgress = Math.min(
      Math.max((scrollTop - heroHeight) / scrollableDistance, 0),
      1
    );

    // Update progress circle
    this.setProgress(scrollProgress);

    // Update arrow color based on section below button
    this.updateArrowColor();
  }

  setProgress(progress) {
    // Calculate offset (inverted for clockwise animation)
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
    console.log('📜 Scrolling to top...');

    // Use native smooth scroll (from CSS scroll-behavior: smooth)
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

    // Optional: Add haptic feedback on mobile
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }

    // Trigger analytics event (optional)
    if (typeof gtag !== 'undefined') {
      gtag('event', 'scroll_to_top_click', {
        'event_category': 'engagement',
        'event_label': 'scroll_button'
      });
    }
  }

  destroy() {
    window.removeEventListener('scroll', this.handleScroll);
    this.button.removeEventListener('click', this.scrollToTop);
  }
}

// Initialize when DOM is ready
// Note: This is now initialized from main.js with smoothScroll instance
// Export for use in main.js (browser global)
window.ScrollToTopButton = ScrollToTopButton;

// Export for Node.js (if needed)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ScrollToTopButton;
}
