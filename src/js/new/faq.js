/* ============================================
   FAQ ACCORDION - JAVASCRIPT
   Figma: https://www.figma.com/design/foywvD3Djh1yzshKk4Fwft/PATA-WEBSITE?node-id=337-3380&m=dev
   ============================================ */

(function() {
  'use strict';

  // Wait for DOM to be fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFAQ);
  } else {
    initFAQ();
  }

  function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');

    if (!faqItems || faqItems.length === 0) {
      console.warn('FAQ: No FAQ items found');
      return;
    }

    faqItems.forEach((item, index) => {
      const button = item.querySelector('.faq-question-button');
      const answer = item.querySelector('.faq-answer');

      if (!button || !answer) {
        console.warn(`FAQ: Missing button or answer in item ${index}`);
        return;
      }

      // Set up ARIA attributes
      const itemId = `faq-item-${index}`;
      const buttonId = `faq-button-${index}`;
      const answerId = `faq-answer-${index}`;

      button.setAttribute('id', buttonId);
      button.setAttribute('aria-expanded', 'false');
      button.setAttribute('aria-controls', answerId);

      answer.setAttribute('id', answerId);
      answer.setAttribute('role', 'region');
      answer.setAttribute('aria-labelledby', buttonId);

      // Click event
      button.addEventListener('click', function() {
        toggleFAQItem(item);
      });

      // Keyboard navigation
      button.addEventListener('keydown', function(e) {
        // Enter or Space to toggle
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleFAQItem(item);
        }
        // Arrow Down - Move to next FAQ
        else if (e.key === 'ArrowDown') {
          e.preventDefault();
          focusNextFAQ(index, faqItems);
        }
        // Arrow Up - Move to previous FAQ
        else if (e.key === 'ArrowUp') {
          e.preventDefault();
          focusPreviousFAQ(index, faqItems);
        }
        // Home - Move to first FAQ
        else if (e.key === 'Home') {
          e.preventDefault();
          faqItems[0].querySelector('.faq-question-button').focus();
        }
        // End - Move to last FAQ
        else if (e.key === 'End') {
          e.preventDefault();
          faqItems[faqItems.length - 1].querySelector('.faq-question-button').focus();
        }
      });
    });

    console.log('FAQ: Initialized successfully with', faqItems.length, 'items');
  }

  /**
   * Toggle FAQ item open/close
   */
  function toggleFAQItem(item) {
    const button = item.querySelector('.faq-question-button');
    const answer = item.querySelector('.faq-answer');
    const isActive = item.classList.contains('active');

    if (isActive) {
      // Close the item
      closeFAQItem(item);
    } else {
      // Optional: Close all other items (uncomment to enable one-at-a-time behavior)
      // closeAllFAQItems();

      // Open the item
      openFAQItem(item);
    }
  }

  /**
   * Open a specific FAQ item
   */
  function openFAQItem(item) {
    const button = item.querySelector('.faq-question-button');
    const answer = item.querySelector('.faq-answer');

    item.classList.add('active');
    button.setAttribute('aria-expanded', 'true');

    // Set a generous max-height that will fit any answer
    answer.style.maxHeight = '800px';
  }

  /**
   * Close a specific FAQ item
   */
  function closeFAQItem(item) {
    const button = item.querySelector('.faq-question-button');
    const answer = item.querySelector('.faq-answer');

    item.classList.remove('active');
    button.setAttribute('aria-expanded', 'false');
    answer.style.maxHeight = '0';
  }

  /**
   * Close all FAQ items
   */
  function closeAllFAQItems() {
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
      closeFAQItem(item);
    });
  }

  /**
   * Focus next FAQ item
   */
  function focusNextFAQ(currentIndex, faqItems) {
    const nextIndex = (currentIndex + 1) % faqItems.length;
    faqItems[nextIndex].querySelector('.faq-question-button').focus();
  }

  /**
   * Focus previous FAQ item
   */
  function focusPreviousFAQ(currentIndex, faqItems) {
    const prevIndex = (currentIndex - 1 + faqItems.length) % faqItems.length;
    faqItems[prevIndex].querySelector('.faq-question-button').focus();
  }

  // Recalculate max-height on window resize for active items
  let resizeTimer;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
      const activeItems = document.querySelectorAll('.faq-item.active');
      activeItems.forEach(item => {
        const answer = item.querySelector('.faq-answer');
        if (answer) {
          answer.style.maxHeight = '800px';
        }
      });
    }, 250);
  });

})();
