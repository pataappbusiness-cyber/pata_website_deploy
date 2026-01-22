# 🔧 PATA WEBSITE - CORREÇÕES HEADER & NAVBAR

**Versão:** 1.0 - Correções Críticas  
**Data:** 21 Janeiro 2026  
**Responsável:** CTO Claude  
**Executor:** Claude Code  
**Verificador:** Diogo (Humano)  
**Projeto:** Plataforma Veterinária PATA

---

## 📋 PROBLEMAS IDENTIFICADOS

### 1️⃣ Título do Header Mal Posicionado
**Problema:** Título está posicionado sobre as imagens em vez de estar no topo acima delas  
**Figma Referência:** https://www.figma.com/design/foywvD3Djh1yzshKk4Fwft/PATA-WEBSITE?node-id=296-2575&m=dev

### 2️⃣ Imagens Laterais Sem Pills
**Problema:** Imagens laterais não têm o fundo em formato "pill" (cápsula arredondada) conforme design  
**Figma Referências:**
- Pill Esquerda Superior: https://www.figma.com/design/foywvD3Djh1yzshKk4Fwft/PATA-WEBSITE?node-id=296-2581&m=dev
- Pill Esquerda Inferior: https://www.figma.com/design/foywvD3Djh1yzshKk4Fwft/PATA-WEBSITE?node-id=296-2580&m=dev
- Pill Direita Superior: https://www.figma.com/design/foywvD3Djh1yzshKk4Fwft/PATA-WEBSITE?node-id=296-2592&m=dev
- Pill Direita Inferior: https://www.figma.com/design/foywvD3Djh1yzshKk4Fwft/PATA-WEBSITE?node-id=296-2593&m=dev

### 3️⃣ Navbar com Fundo Incorreto
**Problema:** Navbar está com fundo preto, deve ter fundo gradiente/transparente como estava antes  
**Figma Referências:**
- Desktop: https://www.figma.com/design/foywvD3Djh1yzshKk4Fwft/PATA-WEBSITE?node-id=337-3516&m=dev
- Mobile: https://www.figma.com/design/foywvD3Djh1yzshKk4Fwft/PATA-WEBSITE?node-id=337-4725&m=dev

---

## 🎯 SOLUÇÃO 1: CORREÇÃO DO TÍTULO

### Análise do Código Atual vs Figma

**Código Fornecido (Estrutura Correta):**
```html
<div style="flex-direction: column; justify-content: center; align-items: center; gap: 32px;">
  <!-- 1. TÍTULO NO TOPO -->
  <div style="flex-direction: column; gap: 24px;">
    <div style="color: #FF943D; font-size: 24px; font-weight: 600;">
      Lançamento: 2026
    </div>
    <div style="text-align: center;">
      <span style="color: #FEFEFF; font-size: 48px; font-weight: 700;">
        São três da manhã. O seu patudo não está bem.<br/>
      </span>
      <span style="color: #FF943D; font-size: 48px; font-weight: 700;">
        E agora?
      </span>
    </div>
  </div>
  
  <!-- 2. IMAGENS E MOCKUP ABAIXO -->
  <div style="padding-left: 80px; padding-right: 80px;">
    <!-- Imagens laterais + Mockup -->
  </div>
</div>
```

### Especificações Figma Confirmadas

**Tipografia do Título:**
- Overline "Lançamento: 2026"
  - Font: Mona Sans SemiBold
  - Size: 24px
  - Weight: 600
  - Line-height: 28px
  - Color: #FF943D (laranja)

- H1 "São três da manhã..."
  - Font: Mona Sans Bold
  - Size: 48px
  - Weight: 700
  - Line-height: 40px (texto branco)
  - Line-height: 44px (texto laranja "E agora?")
  - Color branco: #FEFEFF
  - Color laranja: #FF943D

### CSS Corrigido

```css
/* ============================================
   HEADER SECTION - TÍTULO NO TOPO
   Figma: 337-2915
   ============================================ */

.header-section {
  position: relative;
  height: 100vh;
  min-height: 928px;
  width: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding-top: 120px; /* Espaço para navbar */
  padding-bottom: 60px;
}

.header-container {
  align-self: stretch;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 32px;
}

/* TÍTULO - SEMPRE NO TOPO */
.header-content {
  align-self: stretch;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 24px;
  z-index: 10;
}

.header-launch {
  display: flex;
  justify-content: center;
  flex-direction: column;
  color: #FF943D; /* Orange text */
  font-size: 24px;
  font-family: 'Mona Sans', sans-serif;
  font-weight: 600;
  line-height: 28px;
  text-align: center;
}

.header-title {
  align-self: stretch;
  text-align: center;
  display: flex;
  justify-content: center;
  flex-direction: column;
  margin: 0;
}

.header-title-white {
  color: #FEFEFF;
  font-size: 48px;
  font-family: 'Mona Sans', sans-serif;
  font-weight: 700;
  line-height: 40px;
}

.header-title-orange {
  color: #FF943D;
  font-size: 48px;
  font-family: 'Mona Sans', sans-serif;
  font-weight: 700;
  line-height: 44px;
}

/* VISUAL CONTAINER - ABAIXO DO TÍTULO */
.header-visual-container {
  align-self: stretch;
  padding-left: 80px;
  padding-right: 80px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 12px;
}
```

### HTML Corrigido

```html
<!-- ============================================
     HERO SECTION - LAYOUT CORRIGIDO
     ============================================ -->
<section id="hero" class="header-section">
  
  <!-- Gradiente Líquido Animado (Background) -->
  <div class="liquid-gradient-bg" aria-hidden="true"></div>
  
  <!-- Container Principal -->
  <div class="header-container">
    
    <!-- 1. TÍTULO NO TOPO (Primeiro Elemento) -->
    <div class="header-content">
      <div class="header-launch">Lançamento: 2026</div>
      <h1 class="header-title">
        <span class="header-title-white">
          São três da manhã.<br>
          O seu patudo não está bem.<br>
        </span>
        <span class="header-title-orange">E agora?</span>
      </h1>
    </div>
    
    <!-- 2. VISUAL CONTAINER (Segundo Elemento) -->
    <div class="header-visual-container">
      
      <!-- Pills Esquerda -->
      <div class="visual-pills-left">
        <!-- Pill 1 - Superior Esquerda (Cão pequeno) -->
        <div class="image-pill pill-left-top">
          <img 
            src="./src/img/new_images/cao_pequeno.png" 
            alt="Cão pequeno" 
            class="pill-image">
          <div class="pill-inner-shadow"></div>
        </div>
        
        <!-- Pill 2 - Inferior Esquerda (Veterinário com cão) -->
        <div class="image-pill pill-left-bottom">
          <img 
            src="./src/img/new_images/vet_cao.png" 
            alt="Veterinário com cão" 
            class="pill-image">
          <div class="pill-inner-shadow"></div>
        </div>
      </div>
      
      <!-- Mockup Central -->
      <div class="mockup-center">
        <div class="mockup-glow"></div>
        <img 
          src="./src/img/new_images/mockup.png" 
          alt="PATA App" 
          class="mockup-image">
      </div>
      
      <!-- Pills Direita -->
      <div class="visual-pills-right">
        <!-- Pill 3 - Superior Direita -->
        <div class="image-pill pill-right-top">
          <img 
            src="./src/img/new_images/cao.png" 
            alt="Cão feliz" 
            class="pill-image">
        </div>
        
        <!-- Pill 4 - Inferior Direita -->
        <div class="image-pill pill-right-bottom">
          <img 
            src="./src/img/new_images/pessoa_gato.png" 
            alt="Pessoa com gato" 
            class="pill-image">
        </div>
      </div>
      
    </div>
    
  </div>
  
</section>
```

---

## 🎯 SOLUÇÃO 2: PILLS DAS IMAGENS LATERAIS

### Especificações do Figma (Análise do Código Fornecido)

Cada pill tem uma combinação complexa de gradientes e estilos:

```css
/* ============================================
   IMAGE PILLS - CAPSULAS ARREDONDADAS
   ============================================ */

/* Container das Pills */
.visual-pills-left,
.visual-pills-right {
  align-self: stretch;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12px;
}

.visual-pills-left {
  align-items: flex-end;
}

.visual-pills-right {
  align-items: flex-start;
}

/* Base Pill Styling */
.image-pill {
  width: 151px;
  position: relative;
  border-radius: 550px; /* Super arredondado para efeito capsule */
  box-shadow: 0px 0px 12px rgba(255, 148.18, 61.30, 0.40);
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}

.pill-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: relative;
  z-index: 2;
}

/* ============================================
   PILL 1 - ESQUERDA SUPERIOR (Cão pequeno)
   Figma: 296-2581
   ============================================ */
.pill-left-top {
  height: 200px;
  max-height: 200px;
  flex: 1 1 0;
  position: relative;
  border-radius: 550px;
  border-top: 1px solid rgba(254, 254, 255, 0.85);
  overflow: hidden;
  
  /* Drop shadows (outer) */
  box-shadow: 
    0px 0px 20px -4px #FFDEB3,
    0px 0px 12px 0px rgba(255, 148, 61, 0.4);
}

.pill-left-top::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 550px;
  background: linear-gradient(180deg, #FFC392 0%, #FFB477 100%);
  z-index: 1;
}

.pill-left-top::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 550px;
  background: 
    linear-gradient(180deg, rgba(255, 148, 61, 0) 0%, rgba(255, 148, 61, 0.2) 49.08%, rgba(255, 148, 61, 0.2) 100%);
  mix-blend-mode: overlay;
  z-index: 2;
}

.pill-left-top img {
  position: relative;
  z-index: 3;
}

/* Inner shadows */
.pill-left-top .pill-inner-shadow {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  box-shadow: 
    inset 0px 0px 15px 0px rgba(255, 244, 230, 0.4),
    inset 0px -2px 4px 0px #FF9B4A,
    inset 0px 0px 2px 2px rgba(255, 213, 179, 0.6);
  pointer-events: none;
  z-index: 10;
}

/* ============================================
   PILL 2 - ESQUERDA INFERIOR (Médico veterinário)
   Figma: 296-2580
   ============================================ */
.pill-left-bottom {
  height: 326px;
  flex: 1 1 0;
  position: relative;
  border-radius: 550px;
  border: 2px solid #FF943D;
  overflow: hidden;
  
  /* Drop shadows (outer) */
  box-shadow: 
    0px 0px 20px -4px #FFDEB3,
    0px 0px 12px 0px rgba(255, 148, 61, 0.4);
}

.pill-left-bottom::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 550px;
  background: linear-gradient(180deg, #FFC392 0%, #FFB477 100%);
  z-index: 1;
}

.pill-left-bottom::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 550px;
  background: 
    linear-gradient(180deg, rgba(255, 148, 61, 0) 0%, rgba(255, 148, 61, 0.34) 55.25%, rgba(255, 148, 61, 0.34) 100%);
  mix-blend-mode: overlay;
  z-index: 2;
}

.pill-left-bottom img {
  position: relative;
  z-index: 3;
}

/* Inner shadows */
.pill-left-bottom .pill-inner-shadow {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  box-shadow: 
    inset 0px 0px 15px 0px rgba(255, 244, 230, 0.4),
    inset 0px -2px 4px 0px #FF9B4A,
    inset 0px 0px 2px 2px rgba(255, 213, 179, 0.6);
  pointer-events: none;
  z-index: 10;
}

/* ============================================
   PILL 3 - DIREITA SUPERIOR
   Figma: 296-2592
   ============================================ */
.pill-right-top {
  height: 346px;
  flex: 1 1 0;
  background: 
    linear-gradient(0deg, rgba(255, 148.18, 61.30, 0.08) 0%, rgba(255, 148.18, 61.30, 0.08) 100%),
    linear-gradient(180deg, rgba(255, 148, 61, 0) 0%, rgba(255, 148, 61, 0.20) 100%),
    rgba(219, 93, 35, 0.20),
    radial-gradient(ellipse 50.00% 50.00% at 50.00% 50.00%, rgba(179, 80, 0, 0.30) 0%, rgba(255, 245, 238, 0.30) 100%),
    linear-gradient(180deg, #FFC392 0%, #FFB477 100%);
  background-blend-mode: overlay, overlay, normal, normal, normal, normal;
  border-top: 1px solid rgba(254, 254, 255, 0.80);
}

/* ============================================
   PILL 4 - DIREITA INFERIOR
   Figma: 296-2593
   ============================================ */
.pill-right-bottom {
  height: 180px;
  max-height: 180px;
  flex: 1 1 0;
  background: 
    linear-gradient(0deg, rgba(255, 148.18, 61.30, 0.08) 0%, rgba(255, 148.18, 61.30, 0.08) 100%),
    linear-gradient(180deg, rgba(255, 148, 61, 0) 0%, rgba(255, 148, 61, 0.20) 100%),
    radial-gradient(ellipse 50.00% 50.00% at 50.00% 50.00%, rgba(179, 80, 0, 0.20) 0%, rgba(255, 245, 238, 0.20) 100%),
    linear-gradient(180deg, #FFC392 0%, #FFB477 100%);
  background-blend-mode: overlay, normal, normal, normal, normal;
  border-top: 1px solid rgba(254, 254, 255, 0.80);
}
```

---

## 🎯 SOLUÇÃO 3: MOCKUP CENTRAL COM GLOW

### CSS do Mockup

```css
/* ============================================
   MOCKUP CENTRAL - COM GLOW EFFECTS
   ============================================ */

.mockup-center {
  width: 499px;
  height: 538px;
  max-width: 720px;
  min-width: 499px;
  padding: 40px 83px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

/* Mockup Phone Container */
.mockup-phone {
  width: 360.81px;
  height: 458px;
  position: relative;
  z-index: 5;
}

/* Glow Effect Behind Phone */
.mockup-glow {
  width: 361.95px;
  height: 456px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  background: 
    linear-gradient(0deg, rgba(255, 148.18, 61.30, 0.05) 0%, rgba(255, 148.18, 61.30, 0.05) 100%),
    linear-gradient(180deg, rgba(255, 148, 61, 0) 0%, rgba(255, 148.18, 61.30, 0.20) 100%),
    radial-gradient(ellipse 50.00% 50.00% at 50.00% 50.00%, rgba(179, 80, 0, 0.30) 0%, rgba(255, 245, 238, 0.30) 100%),
    linear-gradient(180deg, #FFC392 0%, #FFB477 100%);
  background-blend-mode: overlay, overlay, lighten, normal;
  box-shadow: 20px 20px 20px rgba(0, 0, 0, 0.25);
  outline: 5px solid #FFC881;
  outline-offset: -2.5px;
  filter: blur(10px);
  z-index: 1;
}

.mockup-image {
  width: 360.81px;
  height: 458px;
  object-fit: contain;
  position: relative;
  z-index: 5;
}

/* Background Pills Behind Mockup */
.mockup-bg-pill-top {
  width: 437.63px;
  height: 339.93px;
  position: absolute;
  left: 0;
  top: 115.62px;
  background: 
    linear-gradient(0deg, rgba(255, 148.18, 61.30, 0.05) 0%, rgba(255, 148.18, 61.30, 0.05) 100%),
    linear-gradient(180deg, rgba(255, 148, 61, 0) 0%, rgba(255, 148.18, 61.30, 0.20) 100%),
    radial-gradient(ellipse 50.00% 50.00% at 50.00% 50.00%, rgba(179, 80, 0, 0.30) 0%, rgba(255, 245, 238, 0.30) 100%),
    linear-gradient(180deg, #FFC392 0%, #FFB477 100%);
  background-blend-mode: overlay, overlay, lighten, normal;
  box-shadow: 0px 0px 12px rgba(255, 148.18, 61.30, 0.40);
  border: 1px solid rgba(255, 180, 119, 0.50);
  z-index: 0;
}

.mockup-bg-pill-right {
  width: 240.50px;
  height: 273px;
  position: absolute;
  right: 0;
  top: 97.50px;
  background: 
    linear-gradient(0deg, rgba(255, 148.18, 61.30, 0.05) 0%, rgba(255, 148.18, 61.30, 0.05) 100%),
    linear-gradient(180deg, rgba(255, 148, 61, 0) 0%, rgba(255, 148.18, 61.30, 0.20) 100%),
    radial-gradient(ellipse 50.00% 50.00% at 50.00% 50.00%, rgba(179, 80, 0, 0.30) 0%, rgba(255, 245, 238, 0.30) 100%),
    linear-gradient(180deg, #FFC392 0%, #FFB477 100%);
  background-blend-mode: overlay, overlay, lighten, normal;
  z-index: 0;
}
```

---

## 🎯 SOLUÇÃO 4: NAVBAR - FUNDO TRANSPARENTE/GRADIENTE

### Problema Atual
Navbar está com `background: black` quando deveria ter fundo transparente ou gradiente sutil.

### CSS Corrigido da Navbar (do Projeto Velho)

```css
/* ============================================
   NAVBAR - FUNDO TRANSPARENTE COM BACKDROP
   Figma Desktop: 337-3516
   Figma Mobile: 337-4725
   ============================================ */

.navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: var(--z-sticky, 1000);
  padding: 24px 84px;
  
  /* SEM FUNDO - Container interno tem o fundo */
  background: transparent;
  
  transition: all 0.3s ease;
}

/* Container interno da navbar com glassmorphism */
.navbar-menu-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 12px 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 1px;
  
  /* FUNDO GLASSMORPHISM conforme Figma */
  background: rgba(254, 254, 255, 0.9); /* Branco 90% opacidade */
  backdrop-filter: blur(35px) saturate(180%);
  -webkit-backdrop-filter: blur(35px) saturate(180%);
  
  border: 0.25px solid #F2EFF2;
  border-radius: 16px;
  
  box-shadow: 0px 0px 15px 0px rgba(255, 155, 74, 0.1);
}

/* Logo */
.navbar-logo-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  z-index: 1001;
}

.navbar-logo {
  width: 95px;
  height: 32px;
  object-fit: contain;
}

/* Navigation Links */
.navbar-links {
  display: flex;
  align-items: center;
  gap: 16px;
}

.navbar-link {
  font-family: 'Mona Sans', sans-serif;
  font-size: 14px;
  font-weight: 600; /* SemiBold */
  line-height: 16px;
  color: #3D3D3D; /* Texto escuro conforme Figma */
  text-decoration: none;
  transition: color 0.2s ease;
  position: relative;
}

.navbar-link:hover {
  color: #FF943D; /* Orange hover */
}

.navbar-link::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 0;
  height: 2px;
  background: #FF943D;
  transition: width 0.3s ease;
}

.navbar-link:hover::after {
  width: 100%;
}

/* CTA Button */
.navbar-buttons {
  display: flex;
  align-items: center;
  gap: 4px;
}

.navbar-cta-button {
  background: #FFB477; /* Cor sólida laranja */
  border: 0.5px solid #FFA45B; /* Stroke laranja mais escuro */
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0 12px;
  height: 40px;
  overflow: hidden;
  position: relative;
  
  /* Drop shadow + Inner shadows conforme Figma */
  box-shadow: 
    0px 4px 8px 0px rgba(255, 180, 119, 0.15);
}

/* Inner shadows overlay */
.navbar-cta-button::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  box-shadow: 
    inset 0px -2px 4px 0px #FF9B4A,
    inset 0px 0px 2px 2px rgba(255, 213, 179, 0.6);
  pointer-events: none;
}

.navbar-cta-button:hover {
  transform: translateY(-2px);
  box-shadow: 
    0px 6px 12px 0px rgba(255, 180, 119, 0.25);
}

.navbar-cta-button span {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-weight: 600;
  font-size: 16px;
  line-height: 1.1;
  color: #272727; /* Texto escuro */
  font-family: 'Mona Sans', sans-serif;
  position: relative;
  z-index: 1;
}

/* Mobile CTA - Hidden on desktop */
.navbar-cta-mobile {
  display: none;
}

/* Mobile Toggle */
.navbar-toggle {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 8px;
  z-index: 1001;
}

.navbar-toggle span {
  width: 24px;
  height: 2px;
  background: rgba(255, 255, 255, 0.90);
  border-radius: 2px;
  transition: all 0.3s ease;
}

/* ============================================
   RESPONSIVO - TABLET
   ============================================ */
@media (max-width: 1024px) {
  .navbar-menu-container {
    padding: 0 32px;
  }
  
  .navbar-links {
    gap: 24px;
  }
  
  .navbar-link {
    font-size: 15px;
  }
}

/* ============================================
   RESPONSIVO - MOBILE
   Figma: 337-4725
   ============================================ */
@media (max-width: 768px) {
  .navbar {
    padding: 12px 0;
  }
  
  .navbar-menu-container {
    padding: 0 24px;
  }
  
  /* Hide desktop nav */
  .navbar-links {
    position: fixed;
    top: 0;
    right: -100%;
    width: 280px;
    height: 100vh;
    background: rgba(0, 0, 0, 0.95);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    padding: 80px 40px;
    gap: 32px;
    transition: right 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    border-left: 1px solid rgba(255, 255, 255, 0.10);
  }
  
  .navbar-links.active {
    right: 0;
  }
  
  .navbar-link {
    font-size: 18px;
    width: 100%;
  }
  
  /* Show mobile CTA inside menu */
  .navbar-cta-mobile {
    display: flex;
    width: 100%;
    margin-top: 24px;
  }
  
  /* Hide desktop CTA */
  .navbar-buttons {
    display: none;
  }
  
  /* Show hamburger */
  .navbar-toggle {
    display: flex;
  }
  
  /* Hamburger animation when active */
  .navbar-toggle.active span:nth-child(1) {
    transform: rotate(45deg) translate(6px, 6px);
  }
  
  .navbar-toggle.active span:nth-child(2) {
    opacity: 0;
  }
  
  .navbar-toggle.active span:nth-child(3) {
    transform: rotate(-45deg) translate(6px, -6px);
  }
}
```

### JavaScript da Navbar (Adicionar ao function.js)

```javascript
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

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  new Navbar();
});
```

---

## 📱 RESPONSIVO - MOBILE & TABLET

### Mobile (≤768px)

```css
@media (max-width: 768px) {
  /* Header Section */
  .header-section {
    min-height: 100vh;
    padding-top: 80px;
    padding-bottom: 40px;
  }
  
  /* Título */
  .header-launch {
    font-size: 18px;
    line-height: 24px;
  }
  
  .header-title-white,
  .header-title-orange {
    font-size: 32px;
    line-height: 36px;
  }
  
  /* Visual Container */
  .header-visual-container {
    flex-direction: column;
    padding-left: 24px;
    padding-right: 24px;
    gap: 24px;
  }
  
  /* Pills - Stack verticalmente */
  .visual-pills-left,
  .visual-pills-right {
    flex-direction: row;
    justify-content: center;
    gap: 12px;
    width: 100%;
  }
  
  .image-pill {
    width: 120px;
  }
  
  .pill-left-top,
  .pill-right-bottom {
    height: 150px;
    max-height: 150px;
  }
  
  .pill-left-bottom,
  .pill-right-top {
    height: 200px;
  }
  
  /* Mockup */
  .mockup-center {
    width: 100%;
    min-width: auto;
    height: auto;
    padding: 20px;
  }
  
  .mockup-image {
    width: 280px;
    height: auto;
  }
}
```

### Tablet (769px - 1024px)

```css
@media (min-width: 769px) and (max-width: 1024px) {
  /* Header */
  .header-visual-container {
    padding-left: 40px;
    padding-right: 40px;
  }
  
  /* Pills */
  .image-pill {
    width: 130px;
  }
  
  /* Mockup */
  .mockup-center {
    width: 420px;
    min-width: 420px;
  }
  
  .mockup-image {
    width: 300px;
    height: auto;
  }
}
```

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

### Parte 1: Título do Header
- [ ] Mover título para o topo do container (antes das imagens)
- [ ] Aplicar estilos corretos (font-size, line-height, cores)
- [ ] Separar texto branco e laranja em spans diferentes
- [ ] Verificar alinhamento centralizado
- [ ] Testar responsivo mobile/tablet

### Parte 2: Pills das Imagens
- [ ] Criar `.image-pill` containers para cada imagem lateral
- [ ] Aplicar gradientes complexos conforme Figma:
  - [ ] Pill esquerda superior (296-2581)
  - [ ] Pill esquerda inferior (296-2580)
  - [ ] Pill direita superior (296-2592)
  - [ ] Pill direita inferior (296-2593)
- [ ] Configurar border-radius: 550px
- [ ] Adicionar box-shadow laranja
- [ ] Adicionar border-top translúcido
- [ ] Testar em diferentes resoluções

### Parte 3: Mockup Central
- [ ] Adicionar `.mockup-glow` com blur effect
- [ ] Configurar background pills atrás do mockup
- [ ] Ajustar z-index para camadas corretas
- [ ] Verificar dimensões do mockup

### Parte 4: Navbar
- [ ] Remover background preto
- [ ] Aplicar background transparente com backdrop-filter
- [ ] Configurar estado `.scrolled` com fundo mais escuro
- [ ] Ajustar cores dos links (branco translúcido)
- [ ] Configurar hover states
- [ ] Implementar toggle mobile
- [ ] Testar menu mobile (slide from right)
- [ ] Verificar animação hamburger
- [ ] Testar scroll behavior

### Parte 5: Testes Finais
- [ ] Desktop (1920px+): Layout 3 colunas
- [ ] Tablet (768px-1024px): Layout compacto
- [ ] Mobile (≤768px): Layout vertical
- [ ] Testar scroll suave entre secções
- [ ] Verificar performance (Lighthouse)
- [ ] Validar acessibilidade (ARIA labels)

---

## 🚀 ORDEM DE IMPLEMENTAÇÃO RECOMENDADA

1. **Primeiro:** Corrigir estrutura HTML (título no topo)
2. **Segundo:** Implementar pills das imagens laterais
3. **Terceiro:** Configurar mockup central com glow
4. **Quarto:** Corrigir navbar (fundo + mobile menu)
5. **Quinto:** Ajustar responsivo mobile/tablet
6. **Sexto:** Testes e refinamentos finais

---

## 📊 MÉTRICAS DE SUCESSO

✅ Título visível no topo antes das imagens  
✅ Pills arredondadas com gradientes laranja conforme Figma  
✅ Navbar transparente com backdrop blur  
✅ Menu mobile funcional com animação suave  
✅ Layout responsivo perfeito em todas as resoluções  
✅ Performance > 90 no Lighthouse

---

**FIM DA ESPECIFICAÇÃO - READY PARA IMPLEMENTAÇÃO** 🚀
