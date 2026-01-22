# 🎨 PATA WEBSITE - EFEITO MOUSE HIGHLIGHT NO HEADER

**Versão:** 1.0 - Feature Nova  
**Data:** 21 Janeiro 2026  
**Responsável:** CTO Claude  
**Executor:** Claude Code  
**Verificador:** Diogo (Humano)  
**Projeto:** Plataforma Veterinária PATA

---

## 🎯 OBJETIVO

Adicionar um efeito visual interativo no fundo do header que reage ao movimento do rato, criando um "spotlight" ou "highlight" que segue o cursor, dando sensação de profundidade e interatividade.

---

## 💡 CONCEITO DO EFEITO

### Tipo de Efeito: Radial Gradient Spotlight que Reage a MOVIMENTO

**🆕 Comportamento Principal - REAGE A MOVIMENTO:**
- Spotlight **APARECE** apenas quando o rato está **EM MOVIMENTO**
- Spotlight **DESAPARECE** quando o rato **PARA DE SE MOVER**
- Detecção inteligente: considera "parado" após 150ms sem movimento
- Fade in rápido (0.2s) quando começa a mover
- Fade out suave (0.4s) quando para de mover

**Fluxo de Interação:**
1. **Rato entra no header**: Nada acontece ainda (invisível)
2. **Rato começa a mover**: Spotlight aparece gradualmente (fade in 0.2s)
3. **Rato em movimento**: Spotlight segue o cursor em tempo real
4. **Rato para**: Spotlight desaparece gradualmente (fade out 0.4s)
5. **Rato volta a mover**: Spotlight reaparece instantaneamente

**Diferencial vs Hover Simples:**
- ❌ Hover simples: Efeito sempre visível enquanto mouse está dentro
- ✅ Movement detection: Efeito só aparece quando há **atividade real**

### Características Visuais

**Centro do Spotlight (onde está o cursor EM MOVIMENTO):**
- Color: `rgba(255, 180, 119, 0.25)` - Laranja translúcido brilhante
- Radius: 300px de raio máximo de brilho

**Bordas do Spotlight:**
- Color: `rgba(255, 148, 61, 0)` - Transparente total
- Transição suave com gradient

**Timing & Transições:**
- **Movimento detectado**: Fade in 200ms (rápido e responsivo)
- **Movimento parado**: Timeout 150ms → Fade out 400ms (suave)
- **Atualização posição**: 60fps via requestAnimationFrame

**Performance:**
- Usar `requestAnimationFrame` para animação GPU-accelerated
- `will-change: transform, opacity` para otimizar rendering
- Timer-based movement detection (150ms threshold)
- Auto-cleanup quando efeito não está ativo

---

## 📐 IMPLEMENTAÇÃO

### 1. Estrutura HTML

```html
<!-- ============================================
     HERO SECTION COM MOUSE HIGHLIGHT
     ============================================ -->
<section id="hero" class="header-section">
  
  <!-- Gradiente Líquido Animado (Background Original) -->
  <div class="liquid-gradient-bg" aria-hidden="true"></div>
  
  <!-- 🆕 NOVO: Mouse Highlight Layer -->
  <div class="mouse-highlight" aria-hidden="true"></div>
  
  <!-- Container Principal -->
  <div class="header-container">
    
    <!-- Conteúdo existente permanece igual -->
    <div class="header-content">
      <!-- ... título ... -->
    </div>
    
    <div class="header-visual-container">
      <!-- ... pills e mockup ... -->
    </div>
    
  </div>
  
</section>
```

**⚠️ IMPORTANTE:** 
- A div `.mouse-highlight` deve ser adicionada **DEPOIS** da `.liquid-gradient-bg`
- Isto garante que o highlight fica **acima** do gradiente líquido mas **abaixo** do conteúdo
- `aria-hidden="true"` porque é puramente decorativo

---

### 2. CSS do Efeito

```css
/* ============================================
   MOUSE HIGHLIGHT EFFECT - SPOTLIGHT INTERATIVO
   Reage ao MOVIMENTO - não apenas hover
   ============================================ */

.mouse-highlight {
  /* Positioning */
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none; /* Não bloqueia interações */
  z-index: 2; /* Acima do liquid-gradient (z-index: 1), abaixo do conteúdo (z-index: 10+) */
  
  /* 🆕 Initial state - SEMPRE invisível até começar movimento */
  opacity: 0;
  transition: opacity 0.4s ease-out; /* Fade out suave quando para */
  
  /* Gradiente radial que será movido via JavaScript */
  background: radial-gradient(
    circle 300px at 50% 50%, /* Initial position centro */
    rgba(255, 180, 119, 0.25) 0%,   /* Centro brilhante laranja */
    rgba(255, 148, 61, 0.15) 20%,   /* Transição 1 */
    rgba(255, 148, 61, 0.08) 40%,   /* Transição 2 */
    rgba(255, 148, 61, 0) 70%       /* Fade total */
  );
  
  /* Performance optimization */
  will-change: transform, opacity;
  
  /* Blend mode para integração suave com o gradiente líquido */
  mix-blend-mode: screen; /* Torna o efeito aditivo (mais luz) */
}

/* 🆕 REMOVIDO: .header-section:hover - Agora controlado por JavaScript baseado em movimento */

/* ============================================
   Z-INDEX HIERARCHY (para referência)
   ============================================ */
/*
  z-index: 0  → .header-section (base)
  z-index: 1  → .liquid-gradient-bg (gradiente animado)
  z-index: 2  → .mouse-highlight (spotlight que reage a movimento)
  z-index: 10 → .header-content (título)
  z-index: 10 → .header-visual-container (pills e mockup)
*/
```

---

### 3. JavaScript Implementação

```javascript
/* ============================================
   MOUSE HIGHLIGHT EFFECT - INTERATIVIDADE
   Reage ao MOVIMENTO - Para quando o rato para
   ============================================ */

class MouseHighlight {
  constructor() {
    this.header = document.querySelector('.header-section');
    this.highlight = document.querySelector('.mouse-highlight');
    
    // Performance optimization
    this.rafId = null;
    this.mouseX = 0;
    this.mouseY = 0;
    this.isActive = false;
    
    // 🆕 MOVIMENTO DETECTION
    this.isMoving = false;
    this.movementTimer = null;
    this.movementTimeout = 150; // ms sem movimento para considerar "parado"
    
    if (this.header && this.highlight) {
      this.init();
    }
  }
  
  init() {
    // Mouse enter - prepara para ativar
    this.header.addEventListener('mouseenter', () => {
      this.isActive = true;
    });
    
    // Mouse leave - desativa completamente
    this.header.addEventListener('mouseleave', () => {
      this.isActive = false;
      this.isMoving = false;
      this.fadeOut();
      
      // Limpa timers
      if (this.movementTimer) {
        clearTimeout(this.movementTimer);
        this.movementTimer = null;
      }
      if (this.rafId) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }
    });
    
    // 🆕 Mouse move - DETECTA MOVIMENTO
    this.header.addEventListener('mousemove', (e) => {
      // Atualiza posição
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
      
      // 🆕 Marca como "em movimento"
      if (!this.isMoving) {
        this.isMoving = true;
        this.fadeIn(); // Mostra o efeito
      }
      
      // 🆕 Reset timer de movimento
      if (this.movementTimer) {
        clearTimeout(this.movementTimer);
      }
      
      // 🆕 Timer para detectar quando PARA de se mover
      this.movementTimer = setTimeout(() => {
        this.isMoving = false;
        this.fadeOut(); // Esconde o efeito
      }, this.movementTimeout);
      
      // Usa requestAnimationFrame para performance
      if (!this.rafId && this.isActive && this.isMoving) {
        this.rafId = requestAnimationFrame(() => this.updatePosition());
      }
    });
  }
  
  // 🆕 Fade IN - Mostra efeito quando começa a mover
  fadeIn() {
    this.highlight.style.opacity = '1';
    this.highlight.style.transition = 'opacity 0.2s ease-in';
  }
  
  // 🆕 Fade OUT - Esconde efeito quando para de mover
  fadeOut() {
    this.highlight.style.opacity = '0';
    this.highlight.style.transition = 'opacity 0.4s ease-out';
  }
  
  updatePosition() {
    // Só atualiza se estiver em movimento
    if (!this.isMoving || !this.isActive) {
      this.rafId = null;
      return;
    }
    
    // Calcula posição relativa ao header
    const rect = this.header.getBoundingClientRect();
    const x = this.mouseX - rect.left;
    const y = this.mouseY - rect.top;
    
    // Converte para percentagem
    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;
    
    // Atualiza o gradiente para a nova posição
    this.highlight.style.background = `
      radial-gradient(
        circle 300px at ${xPercent}% ${yPercent}%,
        rgba(255, 180, 119, 0.25) 0%,
        rgba(255, 148, 61, 0.15) 20%,
        rgba(255, 148, 61, 0.08) 40%,
        rgba(255, 148, 61, 0) 70%
      )
    `;
    
    // 🆕 Continua animando apenas se ainda estiver em movimento
    if (this.isMoving && this.isActive) {
      this.rafId = requestAnimationFrame(() => this.updatePosition());
    } else {
      this.rafId = null;
    }
  }
  
  // Cleanup method
  destroy() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
    if (this.movementTimer) {
      clearTimeout(this.movementTimer);
    }
  }
}

// Inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  const mouseHighlight = new MouseHighlight();
  
  // Cleanup on page unload (boa prática)
  window.addEventListener('beforeunload', () => {
    mouseHighlight.destroy();
  });
});
```

---

## 🎨 VARIAÇÕES DO EFEITO (OPCIONAIS)

### Variação A: Spotlight Mais Intenso

Para um efeito mais dramático:

```css
.mouse-highlight {
  background: radial-gradient(
    circle 400px at 50% 50%, /* Raio maior */
    rgba(255, 180, 119, 0.40) 0%,   /* Mais brilho */
    rgba(255, 148, 61, 0.25) 20%,
    rgba(255, 148, 61, 0.12) 40%,
    rgba(255, 148, 61, 0) 70%
  );
}
```

### Variação B: Multiple Spotlights (Efeito Trail)

Para criar um "rastro" do movimento:

```css
.mouse-highlight {
  background: 
    radial-gradient(
      circle 200px at var(--mouse-x, 50%) var(--mouse-y, 50%),
      rgba(255, 180, 119, 0.25) 0%,
      rgba(255, 148, 61, 0) 70%
    ),
    radial-gradient(
      circle 300px at var(--mouse-x-delayed, 50%) var(--mouse-y-delayed, 50%),
      rgba(255, 148, 61, 0.15) 0%,
      rgba(255, 148, 61, 0) 70%
    );
}
```

### Variação C: Efeito Glow com Box Shadow

Alternativa usando box-shadow (mais performático):

```css
.mouse-highlight::before {
  content: '';
  position: absolute;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  background: transparent;
  box-shadow: 
    0 0 200px 100px rgba(255, 180, 119, 0.3),
    0 0 400px 200px rgba(255, 148, 61, 0.15);
  pointer-events: none;
  transform: translate(-50%, -50%);
  left: var(--mouse-x, 50%);
  top: var(--mouse-y, 50%);
  transition: left 0.15s ease, top 0.15s ease;
}
```

---

## 📱 COMPORTAMENTO RESPONSIVO

### Desktop (>1024px)
✅ Efeito totalmente ativo

### Tablet (768px - 1024px)
✅ Efeito ativo com raio reduzido (200px)

### Mobile (<768px)
❌ Efeito desativado (sem hover em touch devices)

```css
/* Responsivo - Tablet */
@media (max-width: 1024px) {
  .mouse-highlight {
    background: radial-gradient(
      circle 200px at 50% 50%, /* Raio menor */
      rgba(255, 180, 119, 0.20) 0%,
      rgba(255, 148, 61, 0.10) 20%,
      rgba(255, 148, 61, 0) 70%
    );
  }
}

/* Responsivo - Mobile (DESATIVAR) */
@media (max-width: 768px) {
  .mouse-highlight {
    display: none; /* Remove em mobile */
  }
}

/* Alternativa: Detecção de hover capability */
@media (hover: none) {
  .mouse-highlight {
    display: none; /* Remove em dispositivos sem hover */
  }
}
```

---

## ⚡ OTIMIZAÇÕES DE PERFORMANCE

### 1. Throttling do MouseMove

Para reduzir cálculos, adicionar throttling:

```javascript
// Adicionar ao construtor
this.throttleDelay = 16; // ~60fps
this.lastUpdate = 0;

// Modificar mousemove handler
this.header.addEventListener('mousemove', (e) => {
  const now = Date.now();
  if (now - this.lastUpdate < this.throttleDelay) {
    return; // Skip se muito rápido
  }
  
  this.lastUpdate = now;
  this.mouseX = e.clientX;
  this.mouseY = e.clientY;
  
  if (!this.rafId && this.isActive) {
    this.rafId = requestAnimationFrame(() => this.updatePosition());
  }
});
```

### 2. CSS Custom Properties (Alternativa)

Usar CSS variables para performance:

```javascript
updatePosition() {
  const rect = this.header.getBoundingClientRect();
  const xPercent = ((this.mouseX - rect.left) / rect.width) * 100;
  const yPercent = ((this.mouseY - rect.top) / rect.height) * 100;
  
  // Set CSS variables
  this.highlight.style.setProperty('--mouse-x', `${xPercent}%`);
  this.highlight.style.setProperty('--mouse-y', `${yPercent}%`);
  
  this.rafId = null;
}
```

```css
.mouse-highlight {
  background: radial-gradient(
    circle 300px at var(--mouse-x, 50%) var(--mouse-y, 50%),
    rgba(255, 180, 119, 0.25) 0%,
    rgba(255, 148, 61, 0) 70%
  );
}
```

### 3. GPU Acceleration

Forçar GPU rendering:

```css
.mouse-highlight {
  transform: translateZ(0); /* Force GPU layer */
  backface-visibility: hidden;
}
```

---

## 🎮 OPÇÕES DE PERSONALIZAÇÃO

### Parâmetros Configuráveis

```javascript
class MouseHighlight {
  constructor(options = {}) {
    // Valores padrão
    this.config = {
      radius: options.radius || 300,              // Tamanho do spotlight
      intensity: options.intensity || 0.25,       // Opacidade centro
      fadeStart: options.fadeStart || 20,         // % onde começa fade
      fadeEnd: options.fadeEnd || 70,             // % onde termina fade
      smoothness: options.smoothness || 0.15,     // Velocidade transição (s)
      color: options.color || '255, 180, 119',    // RGB do highlight
      blendMode: options.blendMode || 'screen',   // Mix blend mode
      
      // 🆕 MOVIMENTO DETECTION
      movementTimeout: options.movementTimeout || 150,  // ms sem movimento = "parado"
      fadeInDuration: options.fadeInDuration || 0.2,    // Velocidade fade in (s)
      fadeOutDuration: options.fadeOutDuration || 0.4   // Velocidade fade out (s)
    };
    
    this.header = document.querySelector('.header-section');
    this.highlight = document.querySelector('.mouse-highlight');
    this.rafId = null;
    this.mouseX = 0;
    this.mouseY = 0;
    this.isActive = false;
    this.isMoving = false;
    this.movementTimer = null;
    
    if (this.header && this.highlight) {
      this.init();
    }
  }
  
  init() {
    this.header.addEventListener('mouseenter', () => {
      this.isActive = true;
    });
    
    this.header.addEventListener('mouseleave', () => {
      this.isActive = false;
      this.isMoving = false;
      this.fadeOut();
      
      if (this.movementTimer) {
        clearTimeout(this.movementTimer);
        this.movementTimer = null;
      }
      if (this.rafId) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }
    });
    
    this.header.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
      
      if (!this.isMoving) {
        this.isMoving = true;
        this.fadeIn();
      }
      
      if (this.movementTimer) {
        clearTimeout(this.movementTimer);
      }
      
      this.movementTimer = setTimeout(() => {
        this.isMoving = false;
        this.fadeOut();
      }, this.config.movementTimeout);
      
      if (!this.rafId && this.isActive && this.isMoving) {
        this.rafId = requestAnimationFrame(() => this.updatePosition());
      }
    });
  }
  
  fadeIn() {
    this.highlight.style.opacity = '1';
    this.highlight.style.transition = `opacity ${this.config.fadeInDuration}s ease-in`;
  }
  
  fadeOut() {
    this.highlight.style.opacity = '0';
    this.highlight.style.transition = `opacity ${this.config.fadeOutDuration}s ease-out`;
  }
  
  updatePosition() {
    if (!this.isMoving || !this.isActive) {
      this.rafId = null;
      return;
    }
    
    const rect = this.header.getBoundingClientRect();
    const xPercent = ((this.mouseX - rect.left) / rect.width) * 100;
    const yPercent = ((this.mouseY - rect.top) / rect.height) * 100;
    
    const { radius, intensity, fadeStart, fadeEnd, color } = this.config;
    
    this.highlight.style.background = `
      radial-gradient(
        circle ${radius}px at ${xPercent}% ${yPercent}%,
        rgba(${color}, ${intensity}) 0%,
        rgba(${color}, ${intensity * 0.6}) ${fadeStart}%,
        rgba(${color}, ${intensity * 0.3}) ${fadeEnd - 30}%,
        rgba(${color}, 0) ${fadeEnd}%
      )
    `;
    
    if (this.isMoving && this.isActive) {
      this.rafId = requestAnimationFrame(() => this.updatePosition());
    } else {
      this.rafId = null;
    }
  }
  
  destroy() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
    if (this.movementTimer) {
      clearTimeout(this.movementTimer);
    }
  }
}

// Uso com configurações personalizadas
const mouseHighlight = new MouseHighlight({
  radius: 400,
  intensity: 0.35,
  color: '255, 148, 61',        // Laranja mais saturado
  movementTimeout: 200,          // 🆕 Mais tolerante (espera 200ms)
  fadeInDuration: 0.15,          // 🆕 Fade in mais rápido
  fadeOutDuration: 0.5           // 🆕 Fade out mais lento
});
```

---

## 🧪 TESTES & VALIDAÇÃO

### Checklist de Teste

**Funcionalidade - Detecção de Movimento:**
- [ ] Spotlight **NÃO aparece** ao entrar no header (rato parado)
- [ ] Spotlight **aparece** imediatamente quando começa a mover
- [ ] Spotlight **segue** o cursor suavemente durante movimento
- [ ] Spotlight **desaparece** após 150ms sem movimento
- [ ] Spotlight **reaparece** instantaneamente ao voltar a mover
- [ ] Transição fade in é rápida e responsiva (0.2s)
- [ ] Transição fade out é suave (0.4s)
- [ ] Não há flickering durante movimentos lentos
- [ ] Efeito desaparece completamente ao sair do header

**Performance:**
- [ ] FPS mantém >55fps durante movimento ativo
- [ ] Sem memory leaks após uso prolongado
- [ ] CPU usage aceitável (<10% idle, <30% em movimento)
- [ ] GPU acceleration está ativa (verificar DevTools)
- [ ] Timer cleanup funciona corretamente
- [ ] RequestAnimationFrame para apenas quando necessário

**Visual:**
- [ ] Cor do spotlight combina com paleta laranja
- [ ] Intensidade não ofusca o conteúdo
- [ ] Blend mode integra bem com gradiente líquido
- [ ] Z-index correto (abaixo conteúdo, acima background)
- [ ] Fade out suave sem "saltos" visuais

**Responsivo:**
- [ ] Desktop: Funcional e suave
- [ ] Tablet: Funcional com ajustes
- [ ] Mobile: Desativado (sem hover)
- [ ] Touch devices: Não interfere com scroll

**Edge Cases:**
- [ ] Movimento muito rápido não quebra efeito
- [ ] Movimento muito lento não causa flickering
- [ ] Parar e mover rapidamente funciona bem
- [ ] Múltiplos enters/leaves seguidos não causam bugs
- [ ] Window resize não quebra posicionamento

**Browser Compatibility:**
- [ ] Chrome/Edge (Chromium): ✅
- [ ] Firefox: ✅
- [ ] Safari: ✅ (testar -webkit-backdrop-filter)
- [ ] Mobile Safari: ✅ (deve estar desativado)

---

## 🎨 AJUSTES FINAIS & POLISH

### Fine-Tuning da Intensidade

Se o efeito ficar muito forte ou fraco, ajustar:

```css
/* Mais subtil */
.mouse-highlight {
  opacity: 0.7; /* Reduz intensidade global */
}

/* Mais intenso */
.mouse-highlight {
  mix-blend-mode: soft-light; /* Blend mode alternativo */
}
```

### Suavização Extra

Para movimento ultra-suave:

```javascript
// Adicionar easing customizado
updatePosition() {
  const rect = this.header.getBoundingClientRect();
  
  // Current position
  const targetX = ((this.mouseX - rect.left) / rect.width) * 100;
  const targetY = ((this.mouseY - rect.top) / rect.height) * 100;
  
  // Smooth interpolation (lerp)
  if (!this.currentX) this.currentX = targetX;
  if (!this.currentY) this.currentY = targetY;
  
  this.currentX += (targetX - this.currentX) * 0.15; // Easing factor
  this.currentY += (targetY - this.currentY) * 0.15;
  
  this.highlight.style.background = `
    radial-gradient(
      circle 300px at ${this.currentX}% ${this.currentY}%,
      rgba(255, 180, 119, 0.25) 0%,
      rgba(255, 148, 61, 0) 70%
    )
  `;
  
  // Continue animating se ainda houver diferença
  if (Math.abs(targetX - this.currentX) > 0.1 || 
      Math.abs(targetY - this.currentY) > 0.1) {
    this.rafId = requestAnimationFrame(() => this.updatePosition());
  } else {
    this.rafId = null;
  }
}
```

---

## 📊 MÉTRICAS DE SUCESSO

✅ **Efeito reage a MOVIMENTO** - Aparece só quando rato se move, não em hover estático  
✅ **Timing preciso** - Desaparece após 150ms sem movimento  
✅ **Transições suaves** - Fade in 0.2s rápido, fade out 0.4s suave  
✅ **Performance >55fps** - Animação fluida durante movimento ativo  
✅ **Sem impacto na usabilidade** - Não distrai do conteúdo  
✅ **Integração visual perfeita** - Complementa gradiente líquido  
✅ **Responsivo apropriado** - Adaptado por device type  
✅ **Cleanup automático** - Timers e RAF cancelados corretamente

---

## 🔧 TROUBLESHOOTING

### Problema: Efeito não aparece
**Solução:** Verificar z-index, opacity inicial, e que `isMoving` está sendo setado corretamente

### Problema: Efeito fica visível mesmo quando rato parado
**Solução:** Verificar se `movementTimer` está a funcionar e `fadeOut()` está a ser chamado

### Problema: Efeito desaparece muito rápido
**Solução:** Aumentar `movementTimeout` de 150ms para 250-300ms

### Problema: Efeito demora a aparecer
**Solução:** Reduzir `fadeInDuration` para 0.1s ou 0.15s

### Problema: Flickering ao mover devagar
**Solução:** 
- Aumentar `movementTimeout` para 200-250ms
- Garantir que `clearTimeout` está a funcionar
- Verificar se não há múltiplos timers ativos

### Problema: Performance ruim (baixo FPS)
**Solução:** 
- Verificar se RAF está a ser cancelado quando `isMoving = false`
- Implementar throttling mais agressivo
- Usar CSS variables em vez de reconstruir gradient string

### Problema: Efeito muito forte
**Solução:** Reduzir opacity global ou ajustar intensidade das cores

### Problema: Conflito com gradiente líquido
**Solução:** Ajustar mix-blend-mode (tentar overlay, soft-light, ou lighten)

### Problema: Timers não são limpos (memory leak)
**Solução:** 
- Verificar `destroy()` method
- Garantir que `clearTimeout` e `cancelAnimationFrame` são chamados em `mouseleave`

---

**FIM DA ESPECIFICAÇÃO - READY PARA IMPLEMENTAÇÃO** 🎨✨

**Próximos Passos:**
1. Claude Code implementa HTML + CSS + JS
2. Diogo testa funcionalidade e performance
3. Ajustes de intensidade conforme feedback
4. Validação final em múltiplos browsers