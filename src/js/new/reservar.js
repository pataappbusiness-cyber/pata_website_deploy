/* ============================================
   SECTION 14: RESERVAR O LUGAR - JavaScript
   Form validation, submission, and image carousel
   Version: 15.0 - No-flicker counter
   
   CHANGES v15.0:
   ✅ Counter hidden until real value arrives (no 500→499 flicker)
   ✅ Smooth fade-in when real value loads
   ✅ fetch-based counter (JSONP removed — blocked by CSP)
   ✅ Post-submission updates from server response directly
   ============================================ */

'use strict';

/* ============================================
   CONFIGURATION
   ============================================ */

const RESERVAR_CONFIG = {
  GOOGLE_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbxKnC4L28gsXZUdb2f8UtZ581uLHKTdPtfHRc7vgtprxvTkw973EFxvR3WVAueuq0VT/exec',
  COUNT_ACTION_URL: 'https://script.google.com/macros/s/AKfycbxKnC4L28gsXZUdb2f8UtZ581uLHKTdPtfHRc7vgtprxvTkw973EFxvR3WVAueuq0VT/exec',

  MAX_SPOTS: 500,
  CAROUSEL_INTERVAL: 5000,
  DEBUG_MODE: false
};

/* ============================================
   COUNTER STATE
   ============================================ */

let _pataCounterLoaded = false;
let _pataCounterCache = null;

/* ============================================
   FETCH COUNTER FROM SERVER
   ============================================ */

function fetchCounterFromServer() {
  const url = RESERVAR_CONFIG.COUNT_ACTION_URL +
    '?action=getCount&_t=' + Date.now();

  return fetch(url, { redirect: 'follow' })
    .then(function(response) {
      if (!response.ok) throw new Error('HTTP ' + response.status);
      return response.text();
    })
    .then(function(text) {
      var jsonStr = text.trim();

      // Strip JSONP wrapper if present
      var jsonpMatch = jsonStr.match(/^[a-zA-Z_$][a-zA-Z0-9_$]*\s*\((.+)\)\s*;?\s*$/s);
      if (jsonpMatch) {
        jsonStr = jsonpMatch[1];
      }

      var data = JSON.parse(jsonStr);

      if (data && data.success) {
        var remaining = data.remaining !== undefined
          ? data.remaining
          : (RESERVAR_CONFIG.MAX_SPOTS - data.count);
        return remaining;
      }
      throw new Error('Server returned success:false');
    });
}

/* ============================================
   EARLY COUNTER PRELOAD
   ============================================ */

(function preloadCounter() {
  fetchCounterFromServer()
    .then(function(remaining) {
      _pataCounterCache = remaining;
      _pataCounterLoaded = true;
      applyCounterToDOM(remaining);
      console.log('📊 Preload counter loaded:', remaining);
      if (remaining <= 0 && !RESERVAR_CONFIG.DEBUG_MODE) showListaCheia();
    })
    .catch(function(err) {
      console.warn('⚠️ Preload counter failed:', err.message);
    });
})();

/* ============================================
   APPLY COUNTER TO DOM
   Sets value + reveals the counter line with fade-in
   ============================================ */

function applyCounterToDOM(count) {
  _pataCounterCache = count;
  _pataCounterLoaded = true;

  var el = document.getElementById('remainingSpots');
  if (!el) return;

  el.textContent = count;

  // Reveal the parent <p> counter line
  var counterLine = el.closest('.reservar-counter');
  if (counterLine) {
    counterLine.style.opacity = '1';
  }
}

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

        // Update counter immediately from server response
        if (result.remaining !== undefined) {
          applyCounterToDOM(result.remaining);
          console.log('📊 Counter updated from response:', result.remaining);
        } else {
          setTimeout(() => loadRemainingSpots(), 2000);
        }
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
   * Submit to Google Apps Script via text/plain fetch (no CORS preflight).
   */
  async submitToGoogleScript(formData) {
    const jsonString = JSON.stringify(formData);
    const scriptUrl = RESERVAR_CONFIG.GOOGLE_SCRIPT_URL;

    // ── ATTEMPT 1: fetch with text/plain ──
    try {
      console.log('📨 Attempt 1: fetch with text/plain (no preflight)...');

      const response = await fetch(scriptUrl, {
        method: 'POST',
        body: jsonString,
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
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

    } catch (err) {
      console.warn('⚠️ Attempt 1 failed:', err.message);
    }

    // ── ATTEMPT 2: no-cors POST + fetch count verification ──
    try {
      console.log('📨 Attempt 2: no-cors + fetch count verification...');

      let countBefore = -1;
      try {
        const remaining = await fetchCounterFromServer();
        countBefore = RESERVAR_CONFIG.MAX_SPOTS - remaining;
        console.log('📊 Count before:', countBefore);
      } catch (e) {
        console.warn('⚠️ Pre-count failed');
      }

      await fetch(scriptUrl, {
        method: 'POST',
        body: jsonString,
        mode: 'no-cors'
      });

      console.log('⏳ Waiting 4s for GAS...');
      await new Promise(r => setTimeout(r, 4000));

      try {
        const remainingAfter = await fetchCounterFromServer();
        const countAfter = RESERVAR_CONFIG.MAX_SPOTS - remainingAfter;
        console.log('📊 Count after:', countAfter);

        if (countBefore >= 0 && countAfter > countBefore) {
          console.log('✅ Verified: count went from', countBefore, 'to', countAfter);
          return {
            success: true,
            message: 'Submissão bem-sucedida!',
            remaining: remainingAfter
          };
        } else if (countBefore >= 0 && countAfter === countBefore) {
          return {
            success: false,
            message: 'O email já está na lista ou ocorreu um erro de validação. Tente com outro email.'
          };
        }
      } catch (e) {
        console.warn('⚠️ Post-count verification failed');
      }

      return { success: true, message: 'Submissão enviada.' };

    } catch (err) {
      console.error('❌ All attempts failed:', err);
      throw err;
    }
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

function loadRemainingSpots() {
  if (_pataCounterLoaded) return;

  fetchCounterFromServer()
    .then(function(remaining) {
      applyCounterToDOM(remaining);
      console.log('📊 Spots remaining (retry):', remaining);
      if (remaining <= 0 && !RESERVAR_CONFIG.DEBUG_MODE) showListaCheia();
    })
    .catch(function(err) {
      console.warn('⚠️ Counter retry failed:', err.message);
      // After 10s total, show 500 as final fallback
      setTimeout(function() {
        if (!_pataCounterLoaded) {
          applyCounterToDOM(RESERVAR_CONFIG.MAX_SPOTS);
          console.warn('⚠️ Using fallback: 500');
        }
      }, 7000);
    });
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
  // Hide counter line until real value arrives
  var counterLine = document.querySelector('.reservar-counter');
  if (counterLine && !_pataCounterLoaded) {
    counterLine.style.opacity = '0';
    counterLine.style.transition = 'opacity 0.4s ease';
  }

  // Apply cached value if preload already returned
  if (_pataCounterLoaded && _pataCounterCache !== null) {
    applyCounterToDOM(_pataCounterCache);
    console.log('📊 Counter from preload cache:', _pataCounterCache);
  } else {
    // Preload still pending — fire backup
    console.log('⏳ Preload not ready, firing backup fetch...');
    loadRemainingSpots();
  }

  const carousel = new ReservarCarousel();
  const validator = new ReservarFormValidator('reservarForm');
  const submitter = new ReservarFormSubmitter('reservarForm', validator);
  console.log('🐾 Reservar section initialized');
  window.addEventListener('beforeunload', () => { if (carousel) carousel.destroy(); });
});