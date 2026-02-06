/* ============================================
   SECTION 14: RESERVAR O LUGAR - JavaScript
   Form validation, submission, and image carousel
   Version: 10.0 - FIX CORS 405 preflight
   ============================================ */

'use strict';

/* ============================================
   CONFIGURATION
   ============================================ */

const RESERVAR_CONFIG = {
  GOOGLE_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbzw_TQ0TFaHOzea7Ev4IL8Je6EjE4jH_w-brF6ssIQXzzfIQf6z8dKuUNLJv_huNDQ8/exec',
  COUNT_ACTION_URL: 'https://script.google.com/macros/s/AKfycbzw_TQ0TFaHOzea7Ev4IL8Je6EjE4jH_w-brF6ssIQXzzfIQf6z8dKuUNLJv_huNDQ8/exec',

  MAX_SPOTS: 500,
  CAROUSEL_INTERVAL: 5000,
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
    if (this.images.length > 0) this.init();
  }

  init() {
    this.intervalId = setInterval(() => this.nextImage(), RESERVAR_CONFIG.CAROUSEL_INTERVAL);
    console.log('🎠 Reservar carousel initialized');
  }

  nextImage() {
    this.images[this.currentIndex].classList.remove('active');
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
    setTimeout(() => {
      this.images[this.currentIndex].classList.add('active');
    }, 500);
  }

  destroy() {
    if (this.intervalId) clearInterval(this.intervalId);
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
        if (!value) { isValid = false; errorMessage = 'Tem de inserir o nome.'; }
        break;
      case 'email':
        if (!value || !this.isValidEmail(value)) { isValid = false; errorMessage = 'Email inválido.'; }
        break;
      case 'distrito':
        if (!value) { isValid = false; errorMessage = 'Selecione um distrito.'; }
        break;
      case 'animal':
        if (!value) { isValid = false; errorMessage = 'Selecione uma opção.'; }
        break;
      case 'privacy':
        if (!field.checked) { isValid = false; errorMessage = 'Tem de aceitar a Política de Privacidade.'; }
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
    Object.values(this.fields).forEach(field => {
      if (field && !this.validateField(field)) isValid = false;
    });
    return isValid;
  }

  showFieldError(field, message) {
    field.classList.add('error');
    field.setAttribute('aria-invalid', 'true');
    const el = document.getElementById(`${field.id}Error`);
    if (el) { el.textContent = message; el.classList.add('show'); }
  }

  clearFieldError(field) {
    field.classList.remove('error');
    field.setAttribute('aria-invalid', 'false');
    const el = document.getElementById(`${field.id}Error`);
    if (el) el.classList.remove('show');
  }

  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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
    const check = () => {
      if (typeof grecaptcha !== 'undefined' && grecaptcha.ready) {
        grecaptcha.ready(() => {
          this.recaptchaReady = true;
          console.log('✅ reCAPTCHA ready');
        });
      } else {
        setTimeout(check, 100);
      }
    };
    check();
  }

  init() {
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    console.log('✅ Reservar form submission initialized');
  }

  async handleSubmit(e) {
    e.preventDefault();
    if (!this.validator.validateForm()) return;

    if (!this.recaptchaReady) {
      alert('Por favor, aguarde enquanto o reCAPTCHA está a carregar...');
      return;
    }

    this.submitButton.disabled = true;
    this.submitButton.textContent = 'A enviar...';

    try {
      await new Promise((resolve) => grecaptcha.ready(resolve));

      const token = await grecaptcha.execute(
        '6Le6-2EsAAAAAC35zcOC3-2jVhmztQL_yMNh5YEb',
        { action: 'waitlist_signup' }
      );

      const formData = {
        nome: document.getElementById('reservarNome').value.trim(),
        email: document.getElementById('reservarEmail').value.trim(),
        distrito: document.getElementById('reservarDistrito').value,
        animal: document.getElementById('reservarAnimal').value,
        marketing: document.getElementById('reservarMarketing').checked ? 'Sim' : 'Não',
        timestamp: new Date().toISOString(),
        'g-recaptcha-response': token
      };

      const result = await this.submitToGoogleScript(formData);

      if (result.success) {
        this.showSuccessModal();
        this.validator.resetForm();
        setTimeout(() => loadRemainingSpots(), 1000);
      } else {
        alert(result.message || 'Ocorreu um erro. Por favor, tente novamente.');
        console.error('❌ Server error:', result.message);
      }
    } catch (error) {
      console.error('❌ Submission error:', error);
      alert('Ocorreu um erro ao enviar o formulário. Por favor, tente novamente.');
    } finally {
      this.submitButton.disabled = false;
      this.submitButton.textContent = 'Garantir Preço de Fundador (€7,99/mês)';
    }
  }

  /**
   * Submit to Google Apps Script.
   *
   * KEY INSIGHT: Google Apps Script does NOT handle CORS preflight (OPTIONS).
   * Sending Content-Type: application/json triggers a preflight → 405 error.
   *
   * SOLUTION: Send as Content-Type: text/plain.
   * - text/plain is a "simple" content type → NO preflight request
   * - The browser sends the POST directly
   * - Google Apps Script receives it and follows redirect to /echo
   * - We can read the JSON response from /echo
   *
   * The Apps Script doPost() needs to parse e.postData.contents as JSON
   * (it already does this when type !== 'application/json').
   */
  async submitToGoogleScript(formData) {
    const jsonString = JSON.stringify(formData);
    const scriptUrl = RESERVAR_CONFIG.GOOGLE_SCRIPT_URL;

    // ── ATTEMPT 1: fetch with text/plain (no preflight, CORS works) ──
    try {
      console.log('📨 Attempt 1: fetch with text/plain (no preflight)...');

      const response = await fetch(scriptUrl, {
        method: 'POST',
        body: jsonString,
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        redirect: 'follow'
      });

      if (response.ok) {
        const text = await response.text();
        console.log('📦 Raw response:', text);

        try {
          const result = JSON.parse(text);
          console.log('✅ Attempt 1 succeeded:', result);
          return result;
        } catch (parseErr) {
          console.warn('⚠️ Response not JSON, but request succeeded');
          return { success: true, message: 'Submissão enviada.' };
        }
      }

      console.warn('⚠️ Attempt 1 status:', response.status);
      // Fall through to attempt 2

    } catch (err) {
      console.warn('⚠️ Attempt 1 failed:', err.message);
      // Fall through to attempt 2
    }

    // ── ATTEMPT 2: no-cors POST + count verification via JSONP ──
    try {
      console.log('📨 Attempt 2: no-cors + JSONP verification...');

      // Get count BEFORE
      let countBefore = -1;
      try {
        const before = await this.getCountViaJSONP();
        countBefore = before.count;
        console.log('📊 Count before:', countBefore);
      } catch (e) {
        console.warn('⚠️ Pre-count failed');
      }

      // Fire the POST (no readable response)
      await fetch(scriptUrl, {
        method: 'POST',
        body: jsonString,
        mode: 'no-cors'
      });

      // Wait for GAS to process
      console.log('⏳ Waiting 4s for GAS...');
      await new Promise(r => setTimeout(r, 4000));

      // Get count AFTER
      try {
        const after = await this.getCountViaJSONP();
        const countAfter = after.count;
        console.log('📊 Count after:', countAfter);

        if (countBefore >= 0 && countAfter > countBefore) {
          console.log('✅ Verified: count went from', countBefore, 'to', countAfter);
          return { success: true, message: 'Submissão bem-sucedida!' };
        } else if (countBefore >= 0 && countAfter === countBefore) {
          return {
            success: false,
            message: 'O email já está na lista ou ocorreu um erro de validação. Tente com outro email.'
          };
        }
      } catch (e) {
        console.warn('⚠️ Post-count verification failed');
      }

      // Can't verify but POST was sent
      return { success: true, message: 'Submissão enviada.' };

    } catch (err) {
      console.error('❌ All attempts failed:', err);
      throw err;
    }
  }

  /**
   * Get waitlist count via JSONP (always works cross-origin).
   * Creates a <script> tag that loads the GET endpoint with a callback.
   */
  getCountViaJSONP() {
    return new Promise((resolve, reject) => {
      const cbName = '_pataCount_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
      const url = RESERVAR_CONFIG.COUNT_ACTION_URL +
        '?action=getCount&callback=' + cbName +
        '&_t=' + Date.now();

      // Safety check - URL must not be empty
      if (!url || url.indexOf('http') !== 0) {
        reject(new Error('Invalid JSONP URL'));
        return;
      }

      const timeout = setTimeout(() => {
        cleanup();
        reject(new Error('JSONP timeout'));
      }, 8000);

      function cleanup() {
        delete window[cbName];
        const el = document.getElementById(cbName);
        if (el && el.parentNode) el.parentNode.removeChild(el);
      }

      window[cbName] = function(response) {
        clearTimeout(timeout);
        cleanup();
        if (response && response.success) {
          resolve(response);
        } else {
          reject(new Error('JSONP response unsuccessful'));
        }
      };

      const script = document.createElement('script');
      script.id = cbName;
      script.src = url;
      script.onerror = () => {
        clearTimeout(timeout);
        cleanup();
        reject(new Error('JSONP script load error'));
      };
      document.head.appendChild(script);
    });
  }

  showSuccessModal() {
    const modal = document.getElementById('reservarSuccessModal');
    if (!modal) return;
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
    const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusable.length > 0) focusable[0].focus();
    setTimeout(() => this.closeModal(), 5000);
  }

  closeModal() {
    const modal = document.getElementById('reservarSuccessModal');
    if (!modal) return;
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
  }
}

/* ============================================
   MODAL FUNCTIONS (Global)
   ============================================ */

function closeReservarModal() {
  const modal = document.getElementById('reservarSuccessModal');
  if (!modal) return;
  modal.classList.remove('show');
  modal.setAttribute('aria-hidden', 'true');
}

window.addEventListener('click', function(e) {
  const modal = document.getElementById('reservarSuccessModal');
  if (e.target === modal) closeReservarModal();
});

window.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeReservarModal();
});

/* ============================================
   REMAINING SPOTS COUNTER
   ============================================ */

async function loadRemainingSpots() {
  if (!RESERVAR_CONFIG.COUNT_ACTION_URL ||
      RESERVAR_CONFIG.COUNT_ACTION_URL.includes('YOUR_SCRIPT_URL_HERE')) {
    updateSpotCounter(RESERVAR_CONFIG.MAX_SPOTS);
    return;
  }

  try {
    const url = RESERVAR_CONFIG.COUNT_ACTION_URL +
      '?action=getCount&callback=handleReservarCountResponse&_t=' + Date.now();
    const script = document.createElement('script');
    script.src = url;

    const timeout = setTimeout(() => {
      updateSpotCounter(RESERVAR_CONFIG.MAX_SPOTS);
    }, 5000);

    window.handleReservarCountResponse = function(response) {
      clearTimeout(timeout);
      if (response.success) {
        const remaining = RESERVAR_CONFIG.MAX_SPOTS - response.count;
        updateSpotCounter(remaining);
        if (remaining <= 0 && !RESERVAR_CONFIG.DEBUG_MODE) showListaCheia();
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

function updateSpotCounter(count) {
  const el = document.getElementById('remainingSpots');
  if (el) el.textContent = count;
}

function showListaCheia() {
  const main = document.getElementById('reservarMainContent');
  const cheia = document.getElementById('reservarListaCheia');
  if (main) main.style.display = 'none';
  if (cheia) cheia.style.display = 'flex';
}

/* ============================================
   INITIALIZE
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  loadRemainingSpots();
  const carousel = new ReservarCarousel();
  const validator = new ReservarFormValidator('reservarForm');
  const submitter = new ReservarFormSubmitter('reservarForm', validator);
  console.log('🐾 Reservar section initialized');
  window.addEventListener('beforeunload', () => { if (carousel) carousel.destroy(); });
});