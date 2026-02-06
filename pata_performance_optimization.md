










# PATA.CARE — Guia de Otimização de Performance (67 → 90+)

**Data:** 2026-02-06 | **Score atual:** 67 (Mobile) | **Meta:** 90+

---

## RESUMO EXECUTIVO

Após análise completa do `index.html` (2569 linhas), `scripts.min.js` (2950 linhas) e `styles.min.css`, identifiquei **15 otimizações** organizadas por impacto. Os 3 maiores problemas são: TBT de 5.9s (causado por JS pesado + WebGL shaders), imagens PNG sem conversão WebP no hero, e CSS critico insuficiente com stylesheet async mal configurada.

---

## 🔴 IMPACTO ALTO (estimativa: +15-22 pontos)

### 1. WebGL Liquid Shader a correr no page load — MAIOR CULPADO DO TBT

**Problema:** O `LiquidShader` (linhas 1-270 do JS) inicializa **imediatamente** no `DOMContentLoaded`. Cria contexto WebGL, compila shaders GLSL, e inicia `requestAnimationFrame` loop infinito. São 8 iterações de cálculo por frame no fragment shader. O segundo canvas (`liquid-shader-canvas-joinus2`) também inicializa mesmo estando fora do viewport.

**Solução:** Lazy-load os shaders com Intersection Observer. Só inicializar quando a secção entra no viewport, e pausar quando sai.

```javascript
// ANTES (atual): Inicializa TUDO no DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  canvasIds.forEach((canvasId) => {
    if (document.getElementById(canvasId)) {
      window.liquidShaders[key] = new LiquidShader(canvasId);
    }
  });
});

// DEPOIS: Lazy initialization com IntersectionObserver
document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  window.liquidShaders = {};
  const canvasIds = [
    'liquid-shader-canvas',
    'liquid-shader-canvas-joinus2',
    'liquid-shader-canvas-joinus3'
  ];

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const canvasId = entry.target.id;
      const key = canvasId.replace('liquid-shader-canvas-', '').replace('liquid-shader-canvas', 'header');

      if (entry.isIntersecting) {
        if (!window.liquidShaders[key]) {
          window.liquidShaders[key] = new LiquidShader(canvasId);
        } else if (window.liquidShaders[key].animationId === null) {
          window.liquidShaders[key].animate(); // Resume
        }
      } else if (window.liquidShaders[key]) {
        cancelAnimationFrame(window.liquidShaders[key].animationId);
        window.liquidShaders[key].animationId = null; // Pause
      }
    });
  }, { threshold: 0.1 });

  canvasIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  });
});
```

**Impacto estimado:** -1.5 a 2.5s no TBT

---

### 2. Custom SmoothScroll hijacks wheel events — BLOQUEIA MAIN THREAD

**Problema:** A classe `SmoothScroll` (linhas 2660-2843 do JS) faz `e.preventDefault()` em TODOS os wheel events e corre `requestAnimationFrame` loop infinito com `window.scrollTo()` em cada frame. Isto:
- Bloqueia o scroll nativo (que é optimizado pelo browser compositor thread)
- Força repaints constantes no main thread
- Impede o browser de fazer scroll optimizado "off-main-thread"

**Solução:** Remove o custom smooth scroll. O CSS `scroll-behavior: smooth` já existe no browser nativo e é incomparavelmente mais eficiente. Para anchor links, usa `scrollIntoView({behavior: 'smooth'})`.

```javascript
// REMOVER toda a classe SmoothScroll

// SUBSTITUIR por anchor scroll nativo:
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});
```

Também atualiza o CSS:
```css
/* Em vez de scroll-behavior: auto, usa: */
html {
  scroll-behavior: smooth;
}
```

**Impacto estimado:** -1.0 a 2.0s no TBT

---

### 3. Imagens PNG no hero sem WebP — Elemento LCP afetado

**Problema:** As 4 imagens "pill" do hero são carregadas como PNG puro sem `<picture>` fallback:
- `cao_medico.png` — 203 kB
- `vet.png` — 470 kB  
- `cao.png` — 632 kB
- `gatinho.png` — 396 kB

Total: **~1.7 MB** só nas pills. O mockup central já usa `<picture>` com WebP (bom), mas estas 4 não.

**Solução:** Converte para WebP e adiciona `<picture>` elements:

```html
<!-- ANTES -->
<img src="./src/img/new_images/cao_medico.png" alt="..." loading="lazy">

<!-- DEPOIS -->
<picture>
  <source srcset="./src/img/new_images/cao_medico.webp" type="image/webp">
  <img src="./src/img/new_images/cao_medico.png" alt="..." loading="lazy"
       width="400" height="400">
</picture>
```

Para converter:
```bash
# Instalar cwebp (se não tiver)
# brew install webp  ou  apt install webp

cwebp -q 80 cao_medico.png -o cao_medico.webp
cwebp -q 80 vet.png -o vet.webp
cwebp -q 80 cao.png -o cao.webp
cwebp -q 80 gatinho.png -o gatinho.webp
```

**Redução esperada:** ~1.7 MB → ~400 kB (75% redução)

---

### 4. LCP element (mockup_no_bg.webp) sem preload adequado

**Problema:** O mockup central é o **Largest Contentful Paint** element (130 kB). Embora esteja com `loading="eager"`, não tem preload no `<head>`. O browser só descobre esta imagem quando processa o HTML do body, o que atrasa o LCP.

**Solução:** Adiciona preload no `<head>` (logo após os preconnects):

```html
<!-- Adicionar no <head>, antes do CSS -->
<link rel="preload" href="./src/img/new_images/mockup_no_bg.webp" as="image" type="image/webp">
```

Além disso, redimensiona o mockup. A 130 kB para mobile é demasiado. Cria uma versão mobile mais pequena:

```html
<picture>
  <source media="(max-width: 768px)" 
          srcset="./src/img/new_images/mockup_no_bg_mobile.webp" type="image/webp">
  <source srcset="./src/img/new_images/mockup_no_bg.webp" type="image/webp">
  <img src="./src/img/new_images/mockup.png" alt="PATA App" class="mockup-image" loading="eager">
</picture>
```

**Impacto estimado:** -200ms a -500ms no LCP

---

### 5. CSS async loading quebra render — Critical CSS insuficiente

**Problema:** O stylesheet principal é carregado com este pattern:
```html
<link rel="preload" href="./src/css/dist/styles.min.css" as="style" 
      onload="this.onload=null;this.rel='stylesheet'">
```

Isto é bom em teoria, mas o teu **critical CSS inline** só cobre a navbar (~250 linhas). Tudo o resto (hero section, tipografia, body styles) fica sem estilo até o CSS carregar, causando **layout shifts** e atraso no FCP.

**Solução:** Adiciona o CSS crítico do hero section ao inline `<style>`:

```html
<style>
  /* Navbar Critical CSS (já tens) */
  /* ... */

  /* ADICIONAR: Hero Critical CSS */
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
    padding-top: 120px;
    padding-bottom: 60px;
    background: #000;
  }

  .header-content {
    position: relative;
    z-index: 2;
    text-align: center;
  }

  .header-title {
    font-family: 'Mona Sans', sans-serif;
    font-size: 72px;
    font-weight: 800;
    line-height: 1.1;
  }

  .header-title-white { color: #FEFEFF; }
  .header-title-orange { color: #FF943D; }

  body {
    font-family: 'Mona Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    background: #fff8f2;
    margin: 0;
  }

  @media (max-width: 768px) {
    .header-title { font-size: 40px; }
    .header-section { min-height: auto; padding-top: 80px; }
  }
</style>
```

**Impacto estimado:** -100ms no FCP, melhoria no CLS

---

## 🟡 IMPACTO MÉDIO (estimativa: +5-10 pontos)

### 6. Consentmanager script com `defer` mas ainda bloqueia

**Problema:** Linha 5 — o script do consentmanager usa `defer`, o que é melhor que nada, mas o `cmp_final.js` (107 kB) ainda executa antes do `DOMContentLoaded` event fire. Os scripts que ele puxa (c.delivery.consentmanager.net) adicionam mais ~20 kB.

**Solução:** Carrega-o depois do page load, como já fazes com o GTM:

```html
<!-- REMOVER da linha 5 -->
<!-- <script defer src="https://cdn.consentmanager.net/delivery/autoblocking/9f87e56a620e6.js" ...> -->

<!-- ADICIONAR no final do body, carregamento atrasado -->
<script>
window.addEventListener('load', function() {
  setTimeout(function() {
    var s = document.createElement('script');
    s.src = 'https://cdn.consentmanager.net/delivery/autoblocking/9f87e56a620e6.js';
    s.setAttribute('data-cmp-ab', '1');
    s.setAttribute('data-cmp-host', 'c.delivery.consentmanager.net');
    s.setAttribute('data-cmp-cdn', 'cdn.consentmanager.net');
    s.setAttribute('data-cmp-codesrc', '16');
    document.head.appendChild(s);
  }, 1500); // 1.5s após load
});
</script>
```

⚠️ **Nota:** Testa bem isto. O consentmanager pode precisar de estar presente antes de certos scripts para compliance GDPR. Se o blur overlay depende dele, pode precisar de um placeholder CSS enquanto carrega.

**Impacto estimado:** -0.5 a 1.5s no TBT

---

### 7. `scripts.min.js` NÃO está minificado — 2950 linhas com comentários

**Problema:** O ficheiro chama-se "scripts.min.js" mas tem:
- Comentários completos (`// ===`, `/** */`, `console.log()`)
- Nomes de variáveis completos (não minificados)
- 37+ `console.log/warn/error` statements
- Whitespace e indentação preservados
- Classes completas sem tree-shaking

O ficheiro tem provavelmente ~80-100 kB quando poderia ter ~25-35 kB realmente minificado.

**Solução:**

```bash
# Instalar terser
npm install -g terser

# Minificar de verdade
terser scripts.min.js -o scripts.min.js \
  --compress drop_console=true,dead_code=true,passes=2 \
  --mangle \
  --toplevel
```

Ou com esbuild (mais rápido):
```bash
npx esbuild scripts.min.js --minify --bundle --outfile=scripts.min.js
```

**Impacto estimado:** -30 a 50 kB no transfer size, -200ms no parse time

---

### 8. 20+ classes de animação inicializadas no DOMContentLoaded

**Problema:** Linhas 2849-2927 do JS — **TODAS** as animation classes são instanciadas de uma vez:

```javascript
document.addEventListener('DOMContentLoaded', () => {
  new SmoothScroll();
  new Navbar();
  new HeaderParallax();
  new HeaderAnimations();
  new MouseHighlight();
  new DraggableElement();
  new ContactButtons(smoothScroll);
  new ScrollToTopButton(smoothScroll);
  new VideoLazyLoader();
  new Problem1Animations();
  new Problem2Animations();
  new Problem3Animations();
  new Problem4Animations();
  new Problem5Animations();
  new Solution1Animations();
  new Solution2Animations();
  new Solution3Animations();
  new Solution4Animations();
  new JoinUs1Animations();
  new JoinUs2Animations();
  new ReservarAnimations();
  new JoinUs3Animations();
});
```

Isto são **22 classes** a construir observers, bind event listeners, e setup DOM queries tudo de uma vez. Mesmo que cada uma demore 20ms, são 440ms bloqueando o main thread.

**Solução:** Divide em crítico (above-the-fold) e não-crítico:

```javascript
document.addEventListener('DOMContentLoaded', () => {
  // CRÍTICO — above the fold
  new Navbar();
  new HeaderParallax();
  new HeaderAnimations();

  // DIFERIDO — após o primeiro render
  requestIdleCallback(() => {
    new MouseHighlight();
    new DraggableElement();
    new ContactButtons();
    new ScrollToTopButton();
    new VideoLazyLoader();
  });

  // LAZY — só quando secções entram no viewport
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        switch(id) {
          case 'problem1': new Problem1Animations(); break;
          case 'problem2': new Problem2Animations(); break;
          // ... etc
        }
        sectionObserver.unobserve(entry.target);
      }
    });
  }, { rootMargin: '200px' });

  document.querySelectorAll('section').forEach(s => sectionObserver.observe(s));
});
```

**Impacto estimado:** -300 a 800ms no TBT

---

### 9. Custom cursors no CSS — 7 SVGs diferentes carregados

**Problema:** O CSS tem cursores personalizados que requerem download de 7 SVGs diferentes:
- `rato_pata.svg`
- `rato_pata_hover.svg`
- `rato_pata_branco.svg`
- `rato_pata_branco_hover.svg`

Estes são aplicados com `!important` em dezenas de selectores, e cada mudança de hover requer o browser carregar e renderizar o cursor SVG. Pior, são aplicados a **TODOS** os elementos em certas secções (`#hero *`, `#problem1 *`, etc).

**Solução para mobile (onde não faz sentido):**

```css
/* Desativa cursores custom em mobile/touch */
@media (hover: none), (pointer: coarse) {
  *, *::before, *::after {
    cursor: auto !important;
  }
}
```

Isto remove completamente o overhead dos cursores em dispositivos touch, que é o que o Lighthouse testa (mobile).

**Impacto estimado:** -4 requests + melhor CSS parsing

---

### 10. Falta cache headers nas imagens de media.pata.care

**Problema:** No waterfall, todas as imagens de `media.pata.care` mostram "Cache: No". Isto significa que em visitas repetidas, tudo é re-downloaded.

**Solução:** Configura no Cloudflare uma Page Rule ou Cache Rule para `media.pata.care/*`:

```
Cache-Control: public, max-age=31536000, immutable
```

No painel Cloudflare:
1. Rules → Page Rules
2. URL: `media.pata.care/*`
3. Cache Level: Cache Everything
4. Edge Cache TTL: 1 month
5. Browser Cache TTL: 1 year

**Impacto:** Não afeta first load mas melhora drasticamente revisitas.

---

## 🟢 IMPACTO BAIXO mas boas práticas (+2-5 pontos)

### 11. Font preload da fonte principal

Adiciona preload para a fonte weight 400 (mais usada):

```html
<link rel="preload" 
      href="https://fonts.bunny.net/mona-sans/files/mona-sans-latin-400-normal.woff2" 
      as="font" type="font/woff2" crossorigin>
```

### 12. Preconnects duplicados — limpar

Tens preconnects duplicados no `<head>`:
- `cdn.consentmanager.net` aparece como preconnect E dns-prefetch
- `fonts.bunny.net` aparece 2 vezes
- `googletagmanager.com` tem preconnect mas o GTM só carrega 3s depois (desperdício)

Remove os preconnects para domínios que não são usados no critical path.

### 13. SVG inline para ícones FAQ repetidos

O ícone arrow do FAQ é repetido 9 vezes no HTML. Usa um `<symbol>` + `<use>`:

```html
<!-- No topo do body -->
<svg style="display:none">
  <symbol id="faq-arrow" viewBox="0 0 16 16" fill="none">
    <path d="M6 12L10 8L6 4" stroke="#FFB477" stroke-width="2" 
          stroke-linecap="round" stroke-linejoin="round"/>
  </symbol>
</svg>

<!-- Em cada FAQ item -->
<svg class="faq-arrow-icon"><use href="#faq-arrow"/></svg>
```

### 14. Structured Data tem URLs errados

```json
"url": "https://pata.pt",          // ERRADO - deveria ser pata.care
"logo": "https://pata.pt/src/...", // ERRADO
"email": "ola@pata.pt",            // ERRADO - deveria ser ola@pata.care
```

### 15. width/height em falta em várias imagens

Imagens sem `width` e `height` explícitos causam layout shift (CLS). Exemplos:
- Linha 677: `gato_animado1.svg` — sem width/height
- Linha 731: `custo medio de uma consulta veterinaria 1.svg` — tem mas nome com espaços
- Linha 1411: `hospital 1.svg` — sem width/height

---

## 📋 CHECKLIST DE IMPLEMENTAÇÃO (por ordem de prioridade)

| # | Tarefa | Impacto | Dificuldade | Tempo |
|---|--------|---------|-------------|-------|
| 1 | Lazy-load WebGL shaders com IntersectionObserver | Alto | Média | 1h |
| 2 | Remover custom SmoothScroll, usar nativo | Alto | Baixa | 30min |
| 3 | Converter 4 PNGs hero para WebP com `<picture>` | Alto | Baixa | 30min |
| 4 | Preload do LCP element + versão mobile | Alto | Baixa | 20min |
| 5 | Expandir Critical CSS inline (hero section) | Alto | Média | 45min |
| 6 | Delay consentmanager para pós-load | Médio | Baixa | 15min |
| 7 | Minificar JS de verdade (terser/esbuild) | Médio | Baixa | 10min |
| 8 | Lazy-init animation classes por secção | Médio | Média | 1.5h |
| 9 | Desativar cursores custom em mobile | Médio | Baixa | 5min |
| 10 | Cache headers no media.pata.care | Médio | Baixa | 10min |
| 11 | Font preload weight 400 | Baixo | Baixa | 2min |
| 12 | Limpar preconnects duplicados | Baixo | Baixa | 5min |
| 13 | SVG symbols para FAQ icons | Baixo | Baixa | 15min |
| 14 | Corrigir URLs no Structured Data | Baixo | Baixa | 5min |
| 15 | Adicionar width/height em falta | Baixo | Baixa | 15min |

**Tempo total estimado:** ~5-6 horas

---

## ⚡ QUICK WINS — Faz HOJE (30 min, +8-12 pontos)

Se só puderes fazer 4 coisas agora:

1. **Preload do mockup LCP** — 2 min, melhora LCP
2. **Desativar cursores em mobile** — 5 min, reduz CSS
3. **Delay consentmanager** — 15 min, reduz TBT
4. **Remover SmoothScroll** — 10 min, grande redução TBT

Estas 4 mudanças sozinhas podem levar o score de 67 para 75-80.
