# 🎯 PROBLEM 1 SECTION - ESPECIFICAÇÕES TÉCNICAS FIGMA

**Data:** 21 Janeiro 2025  
**Node ID:** 337:2936  
**Figma Link:** https://www.figma.com/design/foywvD3Djh1yzshKk4Fwft/PATA-WEBSITE?node-id=337-2936&m=dev

---

## 📸 DESIGN REFERENCE

![Problem 1 Section - Figma Screenshot](screenshot_reference.png)

**Visual Overview:**
- **Left Panel:** Pessoa preocupada com portátil (ambiente noturno/stressante) - Background escuro
- **Right Panel:** Gato laranja relaxado no sofá (ambiente acolhedor) - Background quente/laranja

---

## 🏗️ ESTRUTURA DO LAYOUT

### Container Principal
```jsx
<section className="problem1-section">
  // Dimensions: Full width, 800px+ height
  // Shadow: inset 0px -14px 52.9px rgba(0,0,0,0.25)
  // Display: flex (side-by-side panels)
  
  <LeftPanel />   // Flex: 1, Traditional Vet (Dark/Grey)
  <RightPanel />  // Flex: 1, PATA Solution (Orange/Warm)
</section>
```

### Layout Properties
```css
.problem1-section {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background: white;
  box-shadow: inset 0px -14px 52.9px 0px rgba(0, 0, 0, 0.25);
}
```

---

## 📦 LEFT PANEL - Traditional Vet (Grey/Dark)

### Panel Structure
```jsx
<div className="left-panel">
  {/* Background Video + Overlays */}
  <div className="background-container">
    <video /> {/* Pessoa com portátil em ambiente noturno */}
    <div className="overlay-saturation" />
    <div className="overlay-dark" />
  </div>
  
  {/* Price Card */}
  <div className="price-card-grey">
    <div className="card-content">
      <h3>Neste momento, uma urgência veterinária noturna custa:</h3>
      <div className="price">€70,90</div>
    </div>
    <div className="source">
      <p>Preço urgência noturna:</p>
      <a href="...">VetBizz Consulting / Veterinária Atual, 2024</a>
    </div>
  </div>
</div>
```

### Panel Styling
```css
.left-panel {
  flex: 1 0 0;
  align-self: stretch;
  height: 100%;
  padding: 40px 0;
  position: relative;
  
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 8px;
  
  min-height: 1px;
  min-width: 1px;
}
```

### Background Overlays
```css
.background-container {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.background-video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.overlay-saturation {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  mix-blend-mode: saturation;
}

.overlay-dark {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.25);
  mix-blend-mode: multiply;
}
```

### Price Card (Grey)
```css
.price-card-grey {
  /* Container */
  width: 100%;
  max-width: 400px;
  min-width: 280px;
  min-height: 142px;
  
  /* Styling */
  background: rgba(212, 212, 212, 0.9);
  border: 0.5px solid #D4D4D4;
  border-radius: 16px;
  box-shadow: 0px 4px 8px 0px rgba(0, 0, 0, 0.1);
  
  /* Layout */
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 16px 24px;
  
  /* Overflow */
  overflow: hidden;
  
  /* Position */
  position: relative;
  flex-shrink: 0;
}
```

### Typography - Left Panel

#### Main Heading (H3)
```css
.left-panel h3 {
  /* Font */
  font-family: 'Mona Sans', sans-serif;
  font-size: 32px;
  font-weight: 700; /* Bold */
  line-height: 36px;
  letter-spacing: 0;
  
  /* Color */
  color: #3D3D3D; /* color-neutral/100 */
  
  /* Layout */
  text-align: center;
  width: 100%;
  
  /* From Figma */
  white-space: pre-wrap;
}
```

#### Price Display (H1)
```css
.left-panel .price {
  /* Font */
  font-family: 'Mona Sans', sans-serif;
  font-size: 52px;
  font-weight: 700; /* Bold */
  line-height: 38px;
  letter-spacing: 0;
  
  /* Color */
  color: #272727; /* Darker grey for emphasis */
  
  /* Layout */
  text-align: center;
  width: 230px;
  
  /* Display */
  display: flex;
  flex-direction: column;
  justify-content: center;
}
```

#### Source Text (H6 + Link)
```css
.left-panel .source p {
  /* Font */
  font-family: 'Mona Sans', sans-serif;
  font-size: 18px;
  font-weight: 600; /* SemiBold */
  line-height: 20px;
  letter-spacing: 0;
  
  /* Color */
  color: #525252; /* color-neutral/200 */
  
  /* Layout */
  text-align: center;
  margin-bottom: 0;
}

.left-panel .source a {
  /* Font */
  font-family: 'Mona Sans', sans-serif;
  font-size: 14px;
  font-weight: 600; /* SemiBold */
  line-height: 16px;
  letter-spacing: 0;
  
  /* Color */
  color: #525252;
  
  /* Decoration */
  text-decoration: underline;
  text-decoration-skip-ink: none;
  
  /* Display */
  display: block;
  cursor: pointer;
}
```

---

## 🟠 RIGHT PANEL - PATA Solution (Orange/Warm)

### Panel Structure
```jsx
<div className="right-panel">
  {/* Background Video + Orange Overlay */}
  <div className="background-container">
    <video /> {/* Gato laranja relaxado no sofá */}
    <div className="overlay-orange" />
  </div>
  
  {/* Price Card */}
  <div className="price-card-orange">
    <div className="card-content">
      <h3>Com PATA</h3>
      <div className="price">€10,99</div>
    </div>
    
    <p className="benefits">
      Sem sair do sofá.<br/>
      Sem acordar a família.<br/>
      Sem filas de espera.<br/>
      Veterinário licenciado em videochamada.<br/>
      Em 60 segundos.
    </p>
    
    <div className="info-box">
      <h4>Porquê tão mais barato?</h4>
      <p>Sem instalações físicas. Sem rececionistas. Sem salas de espera. 
         Só pagamos veterinários — e eles recebem mais do que em clínica.</p>
    </div>
    
    {/* Inner Shadows */}
    <div className="inner-shadows" />
  </div>
</div>
```

### Panel Styling
```css
.right-panel {
  flex: 1 0 0;
  align-self: stretch;
  height: 100%;
  padding: 40px 0;
  position: relative;
  
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 8px;
  
  min-height: 1px;
  min-width: 1px;
}
```

### Background Overlay (Orange)
```css
.right-panel .overlay-orange {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    0deg,
    rgba(255, 148, 61, 0.15) 0%,
    rgba(255, 148, 61, 0.15) 100%
  );
  pointer-events: none;
}
```

### Price Card (Orange)
```css
.price-card-orange {
  /* Container */
  width: 100%;
  max-width: 443px;
  min-width: 440px;
  min-height: 142px;
  
  /* Complex Background Gradient */
  background-image: 
    linear-gradient(180deg, 
      rgba(255, 180, 119, 0.2) 0%, 
      rgba(255, 148, 61, 0.2) 100%),
    linear-gradient(90deg, 
      rgba(255, 210, 173, 0.9) 0%, 
      rgba(255, 210, 173, 0.9) 100%);
  
  /* Border */
  border-top: 1px solid rgba(254, 254, 255, 0.5);
  border-radius: 16px;
  
  /* Shadow */
  box-shadow: 0px 4px 8px 0px rgba(255, 180, 119, 0.15);
  
  /* Layout */
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 22px 24px;
  
  /* Overflow */
  overflow: hidden;
  
  /* Position */
  position: relative;
  flex-shrink: 0;
}

/* Inner Shadows (Button-Solid/Active Effect) */
.price-card-orange .inner-shadows {
  position: absolute;
  inset: 0;
  pointer-events: none;
  border-radius: inherit;
  
  box-shadow: 
    inset 0px -2px 4px 0px #FF9B4A,
    inset 0px 0px 2px 2px rgba(255, 213, 179, 0.6);
}
```

### Typography - Right Panel

#### "Com PATA" Heading (H3)
```css
.right-panel h3 {
  /* Font */
  font-family: 'Mona Sans', sans-serif;
  font-size: 32px;
  font-weight: 700; /* Bold */
  line-height: 36px;
  letter-spacing: 0;
  
  /* Color */
  color: #3D3D3D; /* color-neutral/100 */
  
  /* Layout */
  text-align: center;
  width: 100%;
}
```

#### Price Display (H1)
```css
.right-panel .price {
  /* Font */
  font-family: 'Mona Sans', sans-serif;
  font-size: 52px;
  font-weight: 700; /* Bold */
  line-height: 38px;
  letter-spacing: 0;
  
  /* Color */
  color: #3D3D3D;
  
  /* Layout */
  text-align: center;
  width: 230px;
}
```

#### Benefits Text (H6)
```css
.right-panel .benefits {
  /* Font */
  font-family: 'Mona Sans', sans-serif;
  font-size: 18px;
  font-weight: 600; /* SemiBold */
  line-height: 20px;
  letter-spacing: 0;
  
  /* Color */
  color: #525252; /* color-neutral/200 */
  
  /* Layout */
  text-align: center;
  width: 100%;
  white-space: pre-wrap;
}
```

### Info Box (White Card Inside Orange Card)
```css
.info-box {
  /* Container */
  width: 100%;
  max-width: 400px;
  min-width: 280px;
  
  /* Styling */
  background: #FEFEFF; /* color-neutral/950 */
  border: 0.5px solid #D4D4D4;
  border-radius: 8px;
  
  /* Layout */
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 12px;
  
  /* Overflow */
  overflow: hidden;
  
  /* Position */
  position: relative;
  flex-shrink: 0;
}
```

#### Info Box Heading (H4)
```css
.info-box h4 {
  /* Font */
  font-family: 'Mona Sans', sans-serif;
  font-size: 24px;
  font-weight: 600; /* SemiBold */
  line-height: 28px;
  letter-spacing: 0;
  
  /* Color */
  color: var(--dark_orange, #FF943D);
  
  /* Layout */
  text-align: center;
  width: 100%;
  
  /* Display */
  display: flex;
  flex-direction: column;
  justify-content: center;
}
```

#### Info Box Text (Body)
```css
.info-box p {
  /* Font */
  font-family: 'Mona Sans', sans-serif;
  font-size: 14px;
  font-weight: 600; /* SemiBold */
  line-height: 16px;
  letter-spacing: 0;
  
  /* Color */
  color: #525252; /* color-neutral/200 */
  
  /* Layout */
  text-align: center;
  width: 100%;
  white-space: pre-wrap;
}
```

---

## 🎨 DESIGN TOKENS (From Figma)

### Colors
```css
:root {
  /* Neutrals */
  --color-neutral-100: #3D3D3D;
  --color-neutral-200: #525252;
  --color-neutral-800: #D4D4D4;
  --color-neutral-950: #FEFEFF;
  
  /* Accent */
  --dark-orange: #FF943D;
  
  /* Price Display */
  --price-dark-grey: #272727;
}
```

### Typography Tokens
```css
/* H1 - Price Display */
.h1 {
  font-family: 'Mona Sans', sans-serif;
  font-style: normal;
  font-weight: 700; /* Bold */
  font-size: 52px;
  line-height: 38px;
  letter-spacing: 0;
}

/* H3 - Section Heading */
.h3 {
  font-family: 'Mona Sans', sans-serif;
  font-style: normal;
  font-weight: 700; /* Bold */
  font-size: 32px;
  line-height: 36px;
  letter-spacing: 0;
}

/* H4 - Info Box Heading */
.h4 {
  font-family: 'Mona Sans', sans-serif;
  font-style: normal;
  font-weight: 600; /* SemiBold */
  font-size: 24px;
  line-height: 28px;
  letter-spacing: 0;
}

/* H6 - Body Text / Benefits */
.h6 {
  font-family: 'Mona Sans', sans-serif;
  font-style: normal;
  font-weight: 600; /* SemiBold */
  font-size: 18px;
  line-height: 20px;
  letter-spacing: 0;
}

/* Link / Small Text */
.link-text {
  font-family: 'Mona Sans', sans-serif;
  font-style: normal;
  font-weight: 600; /* SemiBold */
  font-size: 14px;
  line-height: 16px;
  letter-spacing: 0;
}
```

### Effects/Shadows
```css
/* Card Small Shadow */
.card-shadow-small {
  box-shadow: 0px 4px 8px 0px rgba(0, 0, 0, 0.1);
}

/* Button Solid Active (Orange Card Inner Shadows) */
.button-solid-active {
  box-shadow: 
    0px 4px 8px 0px rgba(255, 180, 119, 0.15),
    inset 0px -2px 4px 0px #FF9B4A,
    inset 0px 0px 2px 2px rgba(255, 213, 179, 0.6);
}

/* Section Inset Shadow */
.section-inset-shadow {
  box-shadow: inset 0px -14px 52.9px 0px rgba(0, 0, 0, 0.25);
}
```

---

## 📐 SPACING & DIMENSIONS

### Container Dimensions
```css
/* Main Section */
height: 800px; /* minimum */
min-height: 800px;

/* Panels */
padding-top: 40px;
padding-bottom: 40px;
gap: 8px; /* between card elements */
```

### Card Dimensions

#### Left Panel Card (Grey)
```css
max-width: 400px;
min-width: 280px;
min-height: 142px;
padding: 16px 24px;
gap: 20px; /* between sections */
border-radius: 16px;
```

#### Right Panel Card (Orange)
```css
max-width: 443px;
min-width: 440px;
min-height: 142px;
padding: 22px 24px; /* note: 22px vertical vs 16px on left */
gap: 20px;
border-radius: 16px;
```

#### Info Box (Inside Orange Card)
```css
max-width: 400px;
min-width: 280px;
padding: 16px 12px;
gap: 8px;
border-radius: 8px; /* smaller than main cards */
```

### Internal Gaps
```css
/* Card content sections */
gap: 16px; /* between heading and price */
gap: 20px; /* between main sections in card */
gap: 8px; /* in info box between elements */
```

---

## 🎥 VIDEO IMPLEMENTATION

### Video Requirements
```html
<!-- Left Panel Video -->
<video
  autoplay
  loop
  muted
  playsinline
  class="background-video"
>
  <source src="/videos/problem1-left.mp4" type="video/mp4" />
  <!-- Fallback: Pessoa preocupada com portátil em ambiente noturno -->
</video>

<!-- Right Panel Video -->
<video
  autoplay
  loop
  muted
  playsinline
  class="background-video"
>
  <source src="/videos/problem1-right.mp4" type="video/mp4" />
  <!-- Fallback: Gato laranja relaxado em sofá -->
</video>
```

### Video Lazy Loading Hook
```javascript
import { useEffect, useRef, useState } from 'react';

export const useVideoLazyLoad = () => {
  const videoRef = useRef(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          // Start playing video when in viewport
          if (videoRef.current) {
            videoRef.current.play().catch(err => {
              console.log('Video autoplay failed:', err);
            });
          }
        }
      },
      { 
        threshold: 0.25, // Trigger when 25% visible
        rootMargin: '50px' // Start loading slightly before entering viewport
      }
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => {
      if (videoRef.current) {
        observer.unobserve(videoRef.current);
      }
    };
  }, []);

  return { videoRef, isInView };
};
```

### Video Styling
```css
.background-video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
}

/* Ensure overlays are above video */
.overlay-saturation,
.overlay-dark,
.overlay-orange {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
}

/* Ensure card is above all backgrounds */
.price-card-grey,
.price-card-orange {
  position: relative;
  z-index: 2;
}
```

---

## 📱 RESPONSIVE BEHAVIOR

### Breakpoints
```css
/* Desktop: Side-by-side */
@media (min-width: 768px) {
  .problem1-section {
    flex-direction: row;
  }
  
  .left-panel,
  .right-panel {
    flex: 1 0 0;
  }
}

/* Mobile: Stacked */
@media (max-width: 767px) {
  .problem1-section {
    flex-direction: column;
    min-height: 1600px; /* 800px x 2 panels */
  }
  
  .left-panel,
  .right-panel {
    flex: none;
    width: 100%;
    min-height: 800px;
  }
  
  /* Adjust card widths for mobile */
  .price-card-grey,
  .price-card-orange {
    max-width: 90%;
    min-width: 280px;
  }
  
  /* Allow orange card to be flexible on mobile */
  .price-card-orange {
    min-width: 280px; /* Override 440px desktop min-width */
  }
}
```

### Typography Responsive
```css
/* Tablet adjustments */
@media (max-width: 1024px) {
  .h3 {
    font-size: 28px;
    line-height: 32px;
  }
  
  .h1 {
    font-size: 48px;
    line-height: 36px;
  }
}

/* Mobile adjustments */
@media (max-width: 767px) {
  .h3 {
    font-size: 24px;
    line-height: 28px;
  }
  
  .h1 {
    font-size: 42px;
    line-height: 32px;
  }
  
  .h6 {
    font-size: 16px;
    line-height: 18px;
  }
  
  .h4 {
    font-size: 20px;
    line-height: 24px;
  }
}
```

---

## 🔧 IMPLEMENTATION CHECKLIST

### Phase 1: Structure (30 min)
- [ ] Create main section container
- [ ] Setup left panel with background container
- [ ] Setup right panel with background container
- [ ] Add price card components to both panels
- [ ] Verify flex layout working correctly

### Phase 2: Styling - Left Panel (45 min)
- [ ] Apply grey card background `rgba(212, 212, 212, 0.9)`
- [ ] Add card border `0.5px solid #D4D4D4`
- [ ] Apply border-radius `16px`
- [ ] Add box-shadow `0px 4px 8px rgba(0,0,0,0.1)`
- [ ] Set padding `16px 24px`
- [ ] Add gap `20px` between sections
- [ ] Style heading H3 (32px, 700, #3D3D3D)
- [ ] Style price H1 (52px, 700, #272727)
- [ ] Style source text (18px, 600, #525252)
- [ ] Style link (14px, 600, underline)
- [ ] Add background overlays (saturation + multiply)

### Phase 3: Styling - Right Panel (45 min)
- [ ] Apply orange gradient background
- [ ] Add border-top `1px solid rgba(254,254,255,0.5)`
- [ ] Apply border-radius `16px`
- [ ] Add box-shadow `0px 4px 8px rgba(255,180,119,0.15)`
- [ ] Set padding `22px 24px`
- [ ] Add inner shadows (button-solid-active effect)
- [ ] Style "Com PATA" heading (32px, 700, #3D3D3D)
- [ ] Style price (52px, 700, #3D3D3D)
- [ ] Style benefits text (18px, 600, #525252)
- [ ] Create info box component
- [ ] Style info box heading (24px, 600, #FF943D)
- [ ] Style info box text (14px, 600, #525252)
- [ ] Add orange overlay to background

### Phase 4: Videos (30 min)
- [ ] Implement video lazy loading hook
- [ ] Add left panel video with correct attributes
- [ ] Add right panel video with correct attributes
- [ ] Test autoplay in Chrome, Firefox, Safari
- [ ] Verify muted + playsinline working
- [ ] Test video positioning (object-fit: cover)
- [ ] Ensure overlays render above videos
- [ ] Test performance on mobile devices

### Phase 5: Section Effects (15 min)
- [ ] Add main section inset shadow
- [ ] Verify all z-index layers correct
- [ ] Test pointer-events on overlays

### Phase 6: Responsive (45 min)
- [ ] Test desktop layout (side-by-side)
- [ ] Test tablet layout (adjust sizes)
- [ ] Test mobile layout (stacked vertical)
- [ ] Verify card widths at all breakpoints
- [ ] Test typography scaling
- [ ] Verify videos cover properly at all sizes
- [ ] Check gaps and padding at breakpoints

### Phase 7: Testing & Polish (30 min)
- [ ] Pixel-perfect comparison with Figma
- [ ] Test in Chrome DevTools device emulation
- [ ] Test on real mobile devices
- [ ] Verify all colors match exactly
- [ ] Check typography weights and sizes
- [ ] Test link hover states
- [ ] Performance audit (Lighthouse)
- [ ] Accessibility check (contrast, focus states)

---

## 🎯 ACCEPTANCE CRITERIA

### Visual Fidelity
- ✅ Colors match Figma exactly (use eyedropper to verify)
- ✅ Typography sizes, weights, line-heights correct
- ✅ Spacing (padding, gaps, margins) pixel-perfect
- ✅ Border radius values correct (16px cards, 8px info box)
- ✅ Shadows match Figma (card shadows + inner shadows)
- ✅ Card dimensions within min/max constraints
- ✅ Background overlays correctly applied

### Functionality
- ✅ Videos load and autoplay when in viewport
- ✅ Videos loop continuously
- ✅ Lazy loading working (no immediate load)
- ✅ No layout shift during video load
- ✅ Link clickable and styled correctly
- ✅ Responsive behavior correct at all breakpoints

### Performance
- ✅ Lighthouse performance score > 90
- ✅ Videos optimized (< 5MB each recommended)
- ✅ No console errors
- ✅ Fast interaction to next paint (INP)
- ✅ Cumulative layout shift (CLS) < 0.1

### Accessibility
- ✅ Semantic HTML (section, h3, p, a tags)
- ✅ Sufficient color contrast (WCAG AA)
- ✅ Video has aria-hidden or appropriate label
- ✅ Link has understandable text
- ✅ Focus states visible for interactive elements

---

## 🚨 COMMON PITFALLS

### 1. Video Autoplay Issues
**Problem:** Videos não fazem autoplay  
**Solution:** 
- SEMPRE incluir `muted` attribute
- SEMPRE incluir `playsinline` para iOS
- Use JavaScript `.play()` com error handling
- Consider user gesture requirement on some browsers

### 2. Gradient Background Complexity
**Problem:** Orange card gradient não aparece correctamente  
**Solution:**
```css
background-image: 
  linear-gradient(180deg, rgba(255, 180, 119, 0.2) 0%, rgba(255, 148, 61, 0.2) 100%),
  linear-gradient(90deg, rgba(255, 210, 173, 0.9) 0%, rgba(255, 210, 173, 0.9) 100%);
```
São DOIS gradients sobrepostos!

### 3. Inner Shadows on Orange Card
**Problem:** Sombras interiores não aparecem  
**Solution:**
- Criar div separado com `position: absolute; inset: 0`
- Aplicar `border-radius: inherit`
- Usar `pointer-events: none`
- Box-shadow com INSET keyword

### 4. Typography Weight
**Problem:** Texto parece diferente do Figma  
**Solution:**
- Verificar se Mona Sans está carregada correctamente
- Confirmar weights: 600 = SemiBold, 700 = Bold
- Line-height é CRÍTICO para espaçamento vertical
- Letter-spacing deve ser 0 em todos

### 5. Card Width Constraints
**Problem:** Cards não respeitam min/max widths  
**Solution:**
```css
width: 100%;
max-width: 400px; /* ou 443px */
min-width: 280px; /* ou 440px */
```
Todos os 3 são necessários!

### 6. Z-Index Layers
**Problem:** Overlays ou cards aparecem em ordem errada  
**Solution:**
```
z-index: 0 → Video background
z-index: 1 → Overlays
z-index: 2 → Price cards
```

### 7. Mix Blend Modes
**Problem:** Overlays do painel esquerdo não funcionam  
**Solution:**
```css
.overlay-saturation {
  mix-blend-mode: saturation;
}
.overlay-dark {
  mix-blend-mode: multiply;
}
```
São blend modes DIFERENTES!

---

## 📊 PERFORMANCE OPTIMIZATION

### Video Optimization
```bash
# Compress videos using FFmpeg
ffmpeg -i problem1-left.mp4 -vcodec h264 -crf 28 -preset slow problem1-left-optimized.mp4
ffmpeg -i problem1-right.mp4 -vcodec h264 -crf 28 -preset slow problem1-right-optimized.mp4

# Target file sizes:
# - Desktop: < 5MB per video
# - Mobile: < 2MB per video (create separate versions)
```

### Lazy Loading Strategy
```javascript
// Load videos only when section is 50px from viewport
const observerOptions = {
  threshold: 0,
  rootMargin: '50px'
};

// Unload videos when out of viewport to save memory
if (!entry.isIntersecting && videoRef.current) {
  videoRef.current.pause();
  videoRef.current.currentTime = 0;
}
```

### Font Loading
```css
/* Preload Mona Sans font */
<link rel="preload" href="/fonts/MonaSans-Bold.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/MonaSans-SemiBold.woff2" as="font" type="font/woff2" crossorigin>
```

---

## 🧪 TESTING SCENARIOS

### Desktop (1920x1080)
- [ ] Both panels visible side-by-side
- [ ] Videos autoplay simultaneously
- [ ] Cards centered in panels
- [ ] All text readable and correctly sized
- [ ] Hover states work on link

### Tablet (768x1024)
- [ ] Layout still side-by-side
- [ ] Cards adjust width appropriately
- [ ] Typography scales down slightly
- [ ] Videos still cover full panel

### Mobile (375x667)
- [ ] Panels stacked vertically
- [ ] Each panel 800px height minimum
- [ ] Cards width adjusts to 90% with min 280px
- [ ] Typography scales for readability
- [ ] Videos cover full panel width
- [ ] Touch targets adequate size (min 44x44px)

### Cross-Browser
- [ ] Chrome: Full compatibility
- [ ] Firefox: Video formats supported
- [ ] Safari: Autoplay with playsInline works
- [ ] Edge: Gradient rendering correct
- [ ] iOS Safari: Videos work on mobile
- [ ] Android Chrome: Performance acceptable

---

## 💬 QUESTIONS & SUPPORT

**Hugo, se tiveres dúvidas:**

### Sobre Videos
❓ Videos não aparecem?
→ Verifica console, path correcto, formatos suportados

❓ Autoplay não funciona?
→ Confirma `muted` e `playsinline`, testa com click primeiro

### Sobre Design
❓ Cores não parecem certas?
→ Usa Figma inspector, copia valores RGB exactos

❓ Gradientes complexos?
→ São múltiplos gradients, ordem importa!

### Sobre Layout
❓ Cards não centram?
→ Confirma `justify-content: center; align-items: center` no painel

❓ Responsive quebra?
→ Revê min/max widths, testa cada breakpoint

---

## 📞 NEXT STEPS

1. **Read this spec completely** ✅
2. **Access Figma design** para visual reference ✅
3. **Prepare video assets** (ou placeholders temporários)
4. **Implement Phase 1-7** seguindo checklist
5. **Test thoroughly** em todos os devices/browsers
6. **Report progress** após cada fase ao CTO Claude

---

## 🚀 READY TO CODE!

**CTO Claude está disponível para:**
- Code review a qualquer fase
- Debugging de problemas específicos
- Explicações técnicas sobre implementação
- Optimizações de performance

**Bora fazer este design pixel-perfect! 💪🎨**
