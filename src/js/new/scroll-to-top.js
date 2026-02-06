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

    // Initialize
    this.init();
  }

  init() {
    // Add scroll event listener with throttle
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          this.handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    });

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
    // Get button position
    const buttonRect = this.button.getBoundingClientRect();
    const buttonCenterY = buttonRect.top + buttonRect.height / 2;

    // Find element at button position
    const elementBelow = document.elementFromPoint(
      buttonRect.left + buttonRect.width / 2,
      buttonCenterY + buttonRect.height
    );

    if (!elementBelow) return;

    // Find the closest section
    const section = elementBelow.closest('section, footer');

    if (section) {
      // Define sections where arrow should be white
      const whiteSections = [
        'problem4',
        'solution1',
        'solution3',
        'joinus2',
        'joinus3'
      ];

      const isWhiteSection = whiteSections.includes(section.id) ||
                            section.tagName.toLowerCase() === 'footer';

      // Add white-arrow class for specific sections
      if (isWhiteSection) {
        this.button.classList.add('white-arrow');
      } else {
        this.button.classList.remove('white-arrow');
      }
    }
  }

  scrollToTop() {
    console.log('📜 Scrolling to top...');

    // Use custom smooth scroll if available (same as navbar/footer)
    if (this.smoothScroll && typeof this.smoothScroll.scrollTo === 'function') {
      this.smoothScroll.scrollTo(0);
    } else {
      // Fallback to native smooth scroll
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }

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
