/* ============================================
   SECTION 14: RESERVAR O LUGAR - JavaScript
   Form validation, submission, and image carousel
   ============================================ */

'use strict';

/* ============================================
   CONFIGURATION
   ============================================ */

const RESERVAR_CONFIG = {
  GOOGLE_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbxvyUT6Km7LqpxHlEHgPyP801gpjcowrXlN10uJv91MtMAbbP-ioJWhDFCmhrmu1M6E/exec',
  COUNT_ACTION_URL: 'https://script.google.com/macros/s/AKfycbxvyUT6Km7LqpxHlEHgPyP801gpjcowrXlN10uJv91MtMAbbP-ioJWhDFCmhrmu1M6E/exec',

  MAX_SPOTS: 500,
  CAROUSEL_INTERVAL: 5000, // 5 seconds
  DEBUG_MODE: false
};

/* ============================================
   IMAGE CAROUSEL
   ============================================ */

class ReservarCarousel {
  constructor() {
    this.images = document.querySelectorAll('.reservar-carousel-image');
    this.currentIndex = 0;
    this.intervalId = null;

    if (this.images.length > 0) {
      this.init();
    }
  }

  init() {
    // Start carousel
    this.intervalId = setInterval(() => this.nextImage(), RESERVAR_CONFIG.CAROUSEL_INTERVAL);
    console.log('🎠 Reservar carousel initialized');
  }

  nextImage() {
    // Remove active class from current image
    this.images[this.currentIndex].classList.remove('active');

    // Move to next image
    this.currentIndex = (this.currentIndex + 1) % this.images.length;

    // Add delay before showing next image for smooth transition
    setTimeout(() => {
      this.images[this.currentIndex].classList.add('active');
    }, 500);
  }

  destroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}

/* ============================================
   FORM VALIDATION
   ============================================ */

class ReservarFormValidator {
  constructor(formId) {
    this.form = document.getElementById(formId);
    if (!this.form) return;

    this.fields = {
      nome: document.getElementById('reservarNome'),
      email: document.getElementById('reservarEmail'),
      distrito: document.getElementById('reservarDistrito'),
      animal: document.getElementById('reservarAnimal'),
      privacy: document.getElementById('reservarPrivacy')
    };

    this.init();
  }

  init() {
    // Add blur validation
    Object.values(this.fields).forEach(field => {
      if (field) {
        field.addEventListener('blur', () => this.validateField(field));
        field.addEventListener('input', () => this.clearFieldError(field));
      }
    });

    console.log('✅ Reservar form validation initialized');
  }

  validateField(field) {
    const fieldId = field.id.replace('reservar', '').toLowerCase();
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';

    switch (fieldId) {
      case 'nome':
        if (!value) {
          isValid = false;
          errorMessage = 'Tem de inserir o nome.';
        }
        break;

      case 'email':
        if (!value || !this.isValidEmail(value)) {
          isValid = false;
          errorMessage = 'Email inválido.';
        }
        break;

      case 'distrito':
        if (!value) {
          isValid = false;
          errorMessage = 'Selecione um distrito.';
        }
        break;

      case 'animal':
        if (!value) {
          isValid = false;
          errorMessage = 'Selecione uma opção.';
        }
        break;

      case 'privacy':
        if (!field.checked) {
          isValid = false;
          errorMessage = 'Tem de aceitar a Política de Privacidade.';
        }
        break;
    }

    if (!isValid) {
      this.showFieldError(field, errorMessage);
    } else {
      this.clearFieldError(field);
    }

    return isValid;
  }

  validateForm() {
    let isValid = true;

    // Validate all required fields
    Object.values(this.fields).forEach(field => {
      if (field && !this.validateField(field)) {
        isValid = false;
      }
    });

    return isValid;
  }

  showFieldError(field, message) {
    field.classList.add('error');
    field.setAttribute('aria-invalid', 'true');

    const errorElement = document.getElementById(`${field.id}Error`);
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.classList.add('show');
    }
  }

  clearFieldError(field) {
    field.classList.remove('error');
    field.setAttribute('aria-invalid', 'false');

    const errorElement = document.getElementById(`${field.id}Error`);
    if (errorElement) {
      errorElement.classList.remove('show');
    }
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  resetForm() {
    this.form.reset();
    Object.values(this.fields).forEach(field => {
      if (field) this.clearFieldError(field);
    });
  }
}

/* ============================================
   FORM SUBMISSION
   ============================================ */

class ReservarFormSubmitter {
  constructor(formId, validator) {
    this.form = document.getElementById(formId);
    this.validator = validator;
    this.submitButton = document.getElementById('reservarSubmitBtn');
    this.recaptchaReady = false;

    if (!this.form) return;

    this.init();
    this.initRecaptcha();
  }

  initRecaptcha() {
    // Wait for reCAPTCHA to be ready
    const checkRecaptcha = () => {
      if (typeof grecaptcha !== 'undefined' && grecaptcha.ready) {
        grecaptcha.ready(() => {
          this.recaptchaReady = true;
          console.log('✅ reCAPTCHA ready');
        });
      } else {
        // Retry after 100ms if not ready yet
        setTimeout(checkRecaptcha, 100);
      }
    };
    checkRecaptcha();
  }

  init() {
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    console.log('✅ Reservar form submission initialized');
  }

  async handleSubmit(e) {
    e.preventDefault();

    // Validate form
    if (!this.validator.validateForm()) {
      return;
    }

    // Check if reCAPTCHA is ready
    if (!this.recaptchaReady) {
      alert('Por favor, aguarde enquanto o reCAPTCHA está a carregar...');
      return;
    }

    // Disable submit button
    this.submitButton.disabled = true;
    this.submitButton.textContent = 'A enviar...';

    // Get reCAPTCHA v3 token and submit
    if (typeof grecaptcha !== 'undefined' && grecaptcha.ready) {
      try {
        await new Promise((resolve) => grecaptcha.ready(resolve));

        const token = await grecaptcha.execute('6Le6-2EsAAAAAC35zcOC3-2jVhmztQL_yMNh5YEb', { action: 'waitlist_signup' });

        // Get form data
        const formData = {
          nome: document.getElementById('reservarNome').value.trim(),
          email: document.getElementById('reservarEmail').value.trim(),
          distrito: document.getElementById('reservarDistrito').value,
          animal: document.getElementById('reservarAnimal').value,
          marketing: document.getElementById('reservarMarketing').checked ? 'Sim' : 'Não',
          timestamp: new Date().toISOString(),
          'g-recaptcha-response': token
        };

        try {
          await this.submitViaIframe(formData);
          this.showSuccessModal();
          this.validator.resetForm();

          // Reload remaining spots after submission
          setTimeout(() => {
            loadRemainingSpots();
          }, 1000);

          // Log success
          if (RESERVAR_CONFIG.DEBUG_MODE) {
            console.log('✅ Form submitted successfully:', formData);
          }
        } catch (error) {
          alert('Ocorreu um erro ao enviar o formulário. Por favor, tente novamente.');
          console.error('❌ Form submission error:', error);
        } finally {
          this.submitButton.disabled = false;
          this.submitButton.textContent = 'Garantir Preço de Fundador (€7,99/mês)';
        }
      } catch (error) {
        console.error('❌ reCAPTCHA error:', error);
        alert('Erro ao verificar reCAPTCHA. Por favor, tente novamente.');
        this.submitButton.disabled = false;
        this.submitButton.textContent = 'Garantir Preço de Fundador (€7,99/mês)';
      }
    } else {
      // Fallback if grecaptcha is not loaded
      alert('Erro ao carregar reCAPTCHA. Por favor, recarregue a página.');
      this.submitButton.disabled = false;
      this.submitButton.textContent = 'Garantir Preço de Fundador (€7,99/mês)';
    }
  }

  submitViaIframe(formData) {
    return new Promise((resolve, reject) => {
      // Create hidden iframe
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.name = 'pata-reservar-submit-frame';
      document.body.appendChild(iframe);

      // Create form
      const form = document.createElement('form');
      form.target = 'pata-reservar-submit-frame';
      form.method = 'POST';
      form.action = RESERVAR_CONFIG.GOOGLE_SCRIPT_URL;

      // Add form data as hidden inputs
      Object.keys(formData).forEach(key => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = formData[key];
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();

      // Clean up after 2 seconds
      setTimeout(() => {
        document.body.removeChild(form);
        document.body.removeChild(iframe);
        resolve();
      }, 2000);
    });
  }

  showSuccessModal() {
    const modal = document.getElementById('reservarSuccessModal');
    if (!modal) return;

    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');

    // Focus management
    const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    // Auto-close after 5 seconds
    setTimeout(() => {
      this.closeModal();
    }, 5000);
  }

  closeModal() {
    const modal = document.getElementById('reservarSuccessModal');
    if (!modal) return;

    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
  }
}

/* ============================================
   MODAL FUNCTIONS (Global for onclick)
   ============================================ */

function closeReservarModal() {
  const modal = document.getElementById('reservarSuccessModal');
  if (!modal) return;

  modal.classList.remove('show');
  modal.setAttribute('aria-hidden', 'true');
}

// Close modal on overlay click
window.addEventListener('click', function(e) {
  const modal = document.getElementById('reservarSuccessModal');
  if (e.target === modal) {
    closeReservarModal();
  }
});

// Close modal on Escape key
window.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closeReservarModal();
  }
});

/* ============================================
   REMAINING SPOTS COUNTER
   ============================================ */

/**
 * Load and update the remaining spots counter from Google Sheets
 */
async function loadRemainingSpots() {
  // Check if URL is configured
  if (!RESERVAR_CONFIG.COUNT_ACTION_URL ||
      RESERVAR_CONFIG.COUNT_ACTION_URL.includes('YOUR_SCRIPT_URL_HERE')) {
    updateSpotCounter(RESERVAR_CONFIG.MAX_SPOTS);
    return;
  }

  try {
    // Use JSONP to avoid CORS issues
    const url = `${RESERVAR_CONFIG.COUNT_ACTION_URL}?action=getCount&callback=handleReservarCountResponse`;
    const script = document.createElement('script');
    script.src = url;

    // Timeout fallback in case the request fails
    const timeout = setTimeout(() => {
      updateSpotCounter(RESERVAR_CONFIG.MAX_SPOTS);
    }, 5000);

    // Global callback function for JSONP response
    window.handleReservarCountResponse = function(response) {
      clearTimeout(timeout);

      if (response.success) {
        const remaining = RESERVAR_CONFIG.MAX_SPOTS - response.count;
        updateSpotCounter(remaining);

        // Show "lista cheia" state if no spots left
        if (remaining <= 0 && !RESERVAR_CONFIG.DEBUG_MODE) {
          showListaCheia();
        }
      } else {
        updateSpotCounter(RESERVAR_CONFIG.MAX_SPOTS);
      }
    };

    document.head.appendChild(script);
  } catch (error) {
    console.error('Error loading remaining spots:', error);
    updateSpotCounter(RESERVAR_CONFIG.MAX_SPOTS);
  }
}

/**
 * Update the spot counter in the UI
 */
function updateSpotCounter(count) {
  const spotElement = document.getElementById('remainingSpots');
  if (spotElement) {
    spotElement.textContent = count;
  }
}

/**
 * Show the "lista cheia" state when no spots are available
 */
function showListaCheia() {
  const mainContent = document.getElementById('reservarMainContent');
  const listaCheia = document.getElementById('reservarListaCheia');

  if (mainContent) {
    mainContent.style.display = 'none';
  }

  if (listaCheia) {
    listaCheia.style.display = 'flex';
  }
}

/* ============================================
   INITIALIZE ON DOM READY
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  // Load and update remaining spots counter
  loadRemainingSpots();

  // Initialize carousel
  const carousel = new ReservarCarousel();

  // Initialize form validator
  const validator = new ReservarFormValidator('reservarForm');

  // Initialize form submitter
  const submitter = new ReservarFormSubmitter('reservarForm', validator);

  console.log('🐾 Reservar section initialized');

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    if (carousel) {
      carousel.destroy();
    }
  });
});
