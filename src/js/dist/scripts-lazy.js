/**
 * PATA Website - Lazy JavaScript
 * Loads on-demand when reservar section approaches
 * Version: 1.0
 */

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
  const url = RESERVAR_CONFIG.COUNT_ACTION_URL + '?action=getCount&_t=' + Date.now();

  return fetch(url, { redirect: 'follow' })
    .then(function(response) {
      if (!response.ok) throw new Error('HTTP ' + response.status);
      return response.text();
    })
    .then(function(text) {
      var jsonStr = text.trim();
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
   APPLY COUNTER TO DOM
   ============================================ */

function applyCounterToDOM(count) {
  _pataCounterCache = count;
  _pataCounterLoaded = true;

  var el = document.getElementById('remainingSpots');
  if (!el) return;

  el.textContent = count;

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
        });
      } else {
        setTimeout(check, 100);
      }
    };
    check();
  }

  init() {
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
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
        '6LdhUGksAAAAAGo00t0qqOVlMKO9qWahRmuto9jX',
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
        if (result.remaining !== undefined) {
          applyCounterToDOM(result.remaining);
        } else {
          setTimeout(() => loadRemainingSpots(), 2000);
        }
      } else {
        alert(result.message || 'Ocorreu um erro. Por favor, tente novamente.');
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('Ocorreu um erro ao enviar o formulário. Por favor, tente novamente.');
    } finally {
      this.submitButton.disabled = false;
      this.submitButton.textContent = 'Garantir Preço de Fundador (€7,99/mês)';
    }
  }

  async submitToGoogleScript(formData) {
    const jsonString = JSON.stringify(formData);
    const scriptUrl = RESERVAR_CONFIG.GOOGLE_SCRIPT_URL;

    try {
      const response = await fetch(scriptUrl, {
        method: 'POST',
        body: jsonString,
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        redirect: 'follow'
      });

      if (response.ok) {
        const text = await response.text();
        try {
          return JSON.parse(text);
        } catch (parseErr) {
          return { success: true, message: 'Submissão enviada.' };
        }
      }
    } catch (err) {
      console.warn('Attempt 1 failed:', err.message);
    }

    try {
      let countBefore = -1;
      try {
        const remaining = await fetchCounterFromServer();
        countBefore = RESERVAR_CONFIG.MAX_SPOTS - remaining;
      } catch (e) {}

      await fetch(scriptUrl, {
        method: 'POST',
        body: jsonString,
        mode: 'no-cors'
      });

      await new Promise(r => setTimeout(r, 4000));

      try {
        const remainingAfter = await fetchCounterFromServer();
        const countAfter = RESERVAR_CONFIG.MAX_SPOTS - remainingAfter;

        if (countBefore >= 0 && countAfter > countBefore) {
          return { success: true, message: 'Submissão bem-sucedida!', remaining: remainingAfter };
        } else if (countBefore >= 0 && countAfter === countBefore) {
          return { success: false, message: 'O email já está na lista ou ocorreu um erro de validação. Tente com outro email.' };
        }
      } catch (e) {}

      return { success: true, message: 'Submissão enviada.' };
    } catch (err) {
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
   MODAL FUNCTIONS
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
      if (remaining <= 0 && !RESERVAR_CONFIG.DEBUG_MODE) showListaCheia();
    })
    .catch(function(err) {
      setTimeout(function() {
        if (!_pataCounterLoaded) {
          applyCounterToDOM(RESERVAR_CONFIG.MAX_SPOTS);
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
   INITIALIZE LAZY MODULES
   ============================================ */

(function initLazyModules() {
  // Hide counter until loaded
  var counterLine = document.querySelector('.reservar-counter');
  if (counterLine && !_pataCounterLoaded) {
    counterLine.style.opacity = '0';
    counterLine.style.transition = 'opacity 0.4s ease';
  }

  // Load counter
  fetchCounterFromServer()
    .then(function(remaining) {
      applyCounterToDOM(remaining);
      if (remaining <= 0 && !RESERVAR_CONFIG.DEBUG_MODE) showListaCheia();
    })
    .catch(function(err) {
      loadRemainingSpots();
    });

  // Initialize form components
  const carousel = new ReservarCarousel();
  const validator = new ReservarFormValidator('reservarForm');
  const submitter = new ReservarFormSubmitter('reservarForm', validator);

  console.log('🐾 PATA Lazy JS loaded (Reservar section)');

  window.addEventListener('beforeunload', () => {
    if (carousel) carousel.destroy();
  });
})();

// Make closeReservarModal available globally
window.closeReservarModal = closeReservarModal;
