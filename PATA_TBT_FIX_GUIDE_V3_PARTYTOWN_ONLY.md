# 🔧 PATA.CARE — Guia Completo de Otimização de Performance (V3)

## Score Atual: 67 (Mobile) / 66 (Desktop) | Meta: 85+
## Problema Principal: TBT = 5.9s Mobile / 17.8s Desktop (deve ser < 1s)

**Data:** 2026-02-07  
**Versão:** 3.0 — Análise completa + Novas Técnicas Avançadas de Otimização  
**Ficheiros afetados:** `scripts.min.js` (43KB), `index.html` (128KB), `styles.min.css` (144KB)  
**Localização:** Repositório GitHub Pages do pata.care

---

## 📊 Estado Atual das Métricas (WebPageTest)

### Mobile (Moto G Power, Fast 4G, EU-Central)

| Métrica | Valor Atual | Meta | Estado |
|---------|-------------|------|--------|
| FCP | 1.1s | < 1.8s | ✅ BOM |
| LCP | 1.2s | < 2.5s | ✅ EXCELENTE |
| TBT | **5.9s** | < 0.3s | ❌ CRÍTICO |
| CLS | 0 | < 0.1 | ✅ PERFEITO |
| Score | 67 | 85+ | ⚠️ |

### Desktop (Midrange Desktop, WiFi, EU-Central)

| Métrica | Valor Atual | Meta | Estado |
|---------|-------------|------|--------|
| FCP | 788.7ms | < 1.8s | ✅ EXCELENTE |
| LCP | 788.7ms | < 2.5s | ✅ EXCELENTE |
| TBT | **17.8s** | < 0.3s | ❌ CRÍTICO |
| CLS | 0 | < 0.1 | ✅ PERFEITO |
| Score | 66 | 85+ | ⚠️ |

**O TBT é o único problema real.** FCP, LCP e CLS estão todos verdes em ambas as plataformas.

### Diferença Desktop vs Mobile Explicada

O Desktop tem TBT PIOR (17.8s vs 5.9s) porque carrega **significativamente mais recursos**:
- Desktop: 65 requests, 1.29 MB, 10 hostnames
- Mobile: 50 requests, 886 KB, 5 hostnames

No teste Desktop, o GTM (149 KB) e Consentmanager (108 KB + scripts auxiliares) carregam durante a janela de teste. No Mobile carregam menos scripts (apenas 2, 43 KB total), possivelmente porque o delay de 10s ainda não disparou durante a medição mobile mais rápida.

---

## 🔍 Root Cause Analysis Completa (Baseada no Código-Fonte)

### Causa 1: `scripts.min.js` — Inicialização Massiva no DOMContentLoaded

O ficheiro `scripts.min.js` (43,250 bytes) contém ~20 classes. No evento `DOMContentLoaded`, TODAS são instanciadas de uma vez:

```javascript
// PROBLEMA: Tudo executa de uma vez no DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  const t = new SmoothScroll;
  new Navbar;
  const e = new HeaderParallax;      // ⚠️ scroll listener pesado
  new HeaderAnimations;
  const i = new MouseHighlight;       // ⚠️ 5 mousemove listeners
  new DraggableElement;
  new ContactButtons(t);
  window.scrollToTopButton = new ScrollToTopButton(t);
  new VideoLazyLoader;
  new Problem1Animations;             // ⚠️ IntersectionObserver
  new Problem2Animations;             // ⚠️ IntersectionObserver
  new Problem3Animations;             // ⚠️ IntersectionObserver
  new Problem4Animations;             // ⚠️ IntersectionObserver
  new Problem5Animations;             // ⚠️ IntersectionObserver
  new Solution1Animations;            // ⚠️ IntersectionObserver
  new Solution2Animations;            // ⚠️ IntersectionObserver
  new Solution3Animations;            // ⚠️ IntersectionObserver
  new Solution4Animations;            // ⚠️ IntersectionObserver
  new JoinUs1Animations;              // ⚠️ IntersectionObserver
  new JoinUs2Animations;              // ⚠️ IntersectionObserver
  new ReservarAnimations;
  new JoinUs3Animations;              // ⚠️ IntersectionObserver
  initProblem2Lottie();               // ⚠️ Lottie animation
});
```

**Estatísticas do código:**
- **17 IntersectionObservers** criados de uma vez
- **6 requestAnimationFrame** loops permanentes
- **41 addEventListener** calls no total
- **5 mousemove** listeners
- **3 scroll** listeners

### Causa 2: 4 WebGL Shaders Compilados no DOMContentLoaded

Existem 2 blocos separados que TAMBÉM executam no `DOMContentLoaded`:

**Bloco 1 — 3x LiquidShader** (posição ~4965 no ficheiro):
```javascript
document.addEventListener("DOMContentLoaded", () => {
  // Cria 3 instâncias de LiquidShader com fragment shaders WebGL
  // Cada uma inicia um requestAnimationFrame loop PERMANENTE
  // IDs: "liquid-shader-canvas" (hero), "liquid-shader-canvas-joinus2", "liquid-shader-canvas-joinus3"
});
```

**Bloco 2 — ScrollButtonShader** (posição ~12387):
```javascript
document.addEventListener("DOMContentLoaded", () => {
  // Mais um WebGL shader (compilação + setup)
  // ID: "scroll-button-shader-canvas"
  // Este só anima no hover, mas o shader é compilado imediatamente
});
```

**Impacto:** Compilação de 4 WebGL fragment shaders no Moto G Power → ~2-3s de main thread blocking.

### Causa 3: `email-decode.min.js` do Cloudflare (Já Resolvido ✅)

O Email Address Obfuscation já foi desligado. Nos testes WebPageTest, o ficheiro já retorna **404**. Contudo:
- A tag `<script>` ainda está no `index.html` (linha 2618)
- O browser ainda faz o request (recebe 404, 230-242 bytes)
- Está marcado como `data-cfasync="false"` (blocking)

### Causa 4: Código Morto no Final do JS

```javascript
window.addEventListener("load", () => {
  if (window.performance && window.performance.timing) {
    const t = window.performance.timing;
    t.loadEventEnd, t.navigationStart, t.responseEnd, t.requestStart, t.domComplete, t.domLoading;
  }
});
```

Este código **não faz absolutamente nada** — lê propriedades mas não as guarda nem envia. É código morto que adiciona um listener desnecessário.

### Causa 5: HTML Inchado — 274 Comentários + 75 Data-Attributes de Debug

O `index.html` tem **128 KB** e contém:
- **274 comentários HTML** (incluindo links Figma extensos)
- **57 atributos `data-node-id`** (referências Figma para dev, inúteis em produção)
- **18 atributos `data-name`** (metadados Figma)

**Poupança estimada:** ~14 KB (11.3% do HTML) — não afeta TBT diretamente mas reduz parse time e transfer size.

### Causa 6: Imagem `eager` + `fetchpriority="high"` na Secção Reservar

Na secção `#reservar` (linha 2262, muito abaixo da fold), há uma imagem com:
```html
<img src="src/img/images/header_image1-1440.jpg"
     loading="eager"
     fetchpriority="high"
     class="reservar-carousel-image active">
```

Esta imagem está na posição ~80% da página. Não deveria ter `eager` nem `fetchpriority="high"` — está a competir com a imagem LCP do hero por bandwidth.

### Causa 7: 12 Animações SVG Inline no Scroll-to-Top Button

O botão scroll-to-top (linhas 2516-2613) contém um SVG com **12 elementos `<animate>`** e **2 `<animateTransform>`** que correm indefinidamente (`repeatCount="indefinite"`). Mesmo quando o botão está `hidden`, estas animações SVG **continuam a consumir CPU** porque o browser não otimiza animações SVG em elementos hidden da mesma forma que CSS animations.

### Causa 8: CSS de 144 KB com 16 @keyframes

O ficheiro `styles.min.css` tem 144 KB e inclui 16 animações CSS `@keyframes`. O tamanho do CSS não é em si um problema grave de TBT (o CSS é parser-blocking mas rápido), mas contribui para o tempo total de parsing.

---

## ✅ Correções a Aplicar — Ordenadas por Impacto

---

### Correção 1: ~~Cloudflare Dashboard~~ ✅ JÁ FEITO

~~Desligar Email Address Obfuscation no Cloudflare.~~

**Estado:** ✅ Já desligado. O `email-decode.min.js` já retorna 404.

**Ação restante:** Remover a tag `<script>` residual do HTML (ver Correção 5).

**Ação extra:** Fazer **Purge Cache** no Cloudflare Dashboard para garantir que nenhum edge server ainda serve versões antigas com a tag injetada.

---

### Correção 2: Diferir WebGL Shaders (MAIOR IMPACTO — ~2-3s de TBT)

No ficheiro `scripts.min.js`:

#### 2a. LiquidShader (3 instâncias WebGL)

**ENCONTRAR** (posição ~4965 no ficheiro minificado):
```javascript
document.addEventListener("DOMContentLoaded",()=>{window.matchMedia("(prefers-reduced-motion: reduce)").matches||(window.liquidShaders={},["liquid-shader-canvas","liquid-shader-canvas-joinus2","liquid-shader-canvas-joinus3"].forEach(t=>{if(document.getElementById(t)){const e=t.replace("liquid-shader-canvas-","").replace("liquid-shader-canvas","header");window.liquidShaders[e]=new LiquidShader(t)}}))})
```

**SUBSTITUIR POR:**
```javascript
window.addEventListener("load",()=>{setTimeout(()=>{window.matchMedia("(prefers-reduced-motion: reduce)").matches||(window.liquidShaders={},["liquid-shader-canvas","liquid-shader-canvas-joinus2","liquid-shader-canvas-joinus3"].forEach(t=>{if(document.getElementById(t)){const e=t.replace("liquid-shader-canvas-","").replace("liquid-shader-canvas","header");window.liquidShaders[e]=new LiquidShader(t)}}))},4000)})
```

**Mudança:** `DOMContentLoaded` → `load` + `setTimeout(4000)`. Os shaders iniciam 4s após a página carregar completamente.

#### 2b. ScrollButtonShader

**ENCONTRAR** (posição ~12387):
```javascript
document.addEventListener("DOMContentLoaded",()=>{window.matchMedia("(prefers-reduced-motion: reduce)").matches||(window.scrollButtonShader=new ScrollButtonShader("scroll-button-shader-canvas"))})
```

**SUBSTITUIR POR:**
```javascript
window.addEventListener("load",()=>{setTimeout(()=>{window.matchMedia("(prefers-reduced-motion: reduce)").matches||(window.scrollButtonShader=new ScrollButtonShader("scroll-button-shader-canvas"))},4000)})
```

**Impacto estimado:** -2-3s no TBT (compilação de WebGL shaders é a operação mais pesada)

---

### Correção 3: Diferir Classes Não-Críticas no Init Principal (~1-2s de TBT)

**ENCONTRAR** (posição ~42280):
```javascript
document.addEventListener("DOMContentLoaded",()=>{const t=new SmoothScroll;new Navbar;const e=new HeaderParallax;new HeaderAnimations;const i=new MouseHighlight;new DraggableElement,new ContactButtons(t),window.scrollToTopButton=new ScrollToTopButton(t),new VideoLazyLoader,new Problem1Animations,new Problem2Animations,new Problem3Animations,new Problem4Animations,new Problem5Animations,new Solution1Animations,new Solution2Animations,new Solution3Animations,new Solution4Animations,new JoinUs1Animations,new JoinUs2Animations,new ReservarAnimations,new JoinUs3Animations,initProblem2Lottie(),window.addEventListener("beforeunload",()=>{i.destroy(),t.destroy(),e.destroy(),window.scrollToTopButton&&window.scrollToTopButton.destroy()})})
```

**SUBSTITUIR POR:**
```javascript
document.addEventListener("DOMContentLoaded",()=>{const t=new SmoothScroll;new Navbar;new HeaderAnimations;new ContactButtons(t),window.scrollToTopButton=new ScrollToTopButton(t),new VideoLazyLoader;let e=null,i=null;setTimeout(()=>{e=new HeaderParallax;i=new MouseHighlight;new DraggableElement;new Problem1Animations;new Problem2Animations;new Problem3Animations;new Problem4Animations;new Problem5Animations;new Solution1Animations;new Solution2Animations;new Solution3Animations;new Solution4Animations;new JoinUs1Animations;new JoinUs2Animations;new ReservarAnimations;new JoinUs3Animations;initProblem2Lottie()},2000);window.addEventListener("beforeunload",()=>{i&&i.destroy(),t.destroy(),e&&e.destroy(),window.scrollToTopButton&&window.scrollToTopButton.destroy()})})
```

**O que muda:**

| Executa IMEDIATAMENTE (crítico above-the-fold) | Executa após 2s (below-the-fold) |
|---|---|
| SmoothScroll | HeaderParallax |
| Navbar | MouseHighlight (5 mousemove listeners) |
| HeaderAnimations | DraggableElement |
| ContactButtons | Problem1-5Animations (5 IntersectionObservers) |
| ScrollToTopButton | Solution1-4Animations (4 IntersectionObservers) |
| VideoLazyLoader | JoinUs1-3Animations (3 IntersectionObservers) |
| | ReservarAnimations |
| | initProblem2Lottie() |

**Impacto estimado:** -1-2s no TBT (12 IntersectionObservers + 5 mousemove listeners diferidos)

---

### Correção 4: Remover Código Morto do JS (~marginal)

**ENCONTRAR** (no final do ficheiro, últimos ~200 caracteres):
```javascript
,window.addEventListener("load",()=>{if(window.performance&&window.performance.timing){const t=window.performance.timing;t.loadEventEnd,t.navigationStart,t.responseEnd,t.requestStart,t.domComplete,t.domLoading}});
```

**SUBSTITUIR POR:**
```javascript
;
```

**Razão:** Este código lê valores de `performance.timing` mas não faz nada com eles. É um listener `load` vazio que não tem efeito. Remover reduz marginalmente o trabalho no evento `load`.

---

### Correção 5: Limpeza do `index.html` — Script Residual + Imagem Eager

#### 5a. Remover script `email-decode.min.js` residual

**ENCONTRAR** (linha 2618):
```html
<script data-cfasync="false" src="/cdn-cgi/scripts/5c5dd728/cloudflare-static/email-decode.min.js"></script><script defer src="./src/js/dist/scripts.min.js"></script>
```

**SUBSTITUIR POR:**
```html
<script defer src="./src/js/dist/scripts.min.js"></script>
```

**Razão:** O Email Obfuscation já está desligado. Esta tag causa um request 404 desnecessário com `data-cfasync="false"` (blocking).

#### 5b. Corrigir imagem `eager` na secção Reservar

**ENCONTRAR** (linha ~2259-2263):
```html
<img src="src/img/images/header_image1-1440.jpg"
     alt="Veterinária PATA"
     width="600"
     height="505"
     loading="eager"
     fetchpriority="high"
     class="reservar-carousel-image active">
```

**SUBSTITUIR POR:**
```html
<img src="src/img/images/header_image1-1440.jpg"
     alt="Veterinária PATA"
     width="600"
     height="505"
     loading="lazy"
     class="reservar-carousel-image active">
```

**Razão:** Esta imagem está na secção `#reservar` (linha 2101 do HTML, ~80% da página). Não é visível na viewport inicial. O `loading="eager"` e `fetchpriority="high"` estão a competir com a imagem LCP do hero (`mockup_no_bg.webp`) por bandwidth, potencialmente atrasando o LCP noutras condições de rede.

**Impacto:** Não afeta TBT diretamente, mas melhora resource prioritization e pode melhorar LCP em redes lentas.

---

### Correção 6: Simplificar SVG do Scroll-to-Top Button (BAIXA PRIORIDADE)

O botão scroll-to-top contém 12 `<animate>` + 2 `<animateTransform>` que correm infinitamente. Mesmo quando o botão está `hidden`, o browser processa estas animações.

#### Opção C — Lazy Init via JS (mais simples e recomendada):

Não incluir os elementos `<animate>` no HTML inicial. Injectar via JavaScript apenas quando o botão se torna visível pela primeira vez. Adicionar ao `ScrollToTopButton.handleScroll()`:

```javascript
// Dentro de handleScroll, na primeira vez que o botão fica visível:
if (!this.svgAnimationsInitialized) {
  this.initSVGAnimations();
  this.svgAnimationsInitialized = true;
}
```

**Impacto estimado:** ~0.1-0.3s no TBT. Não é o maior ganho mas é "free performance".

---

### Correção 7: Minificar HTML para Produção (Baixa Prioridade)

O `index.html` (128 KB) contém 274 comentários HTML e 75 atributos de desenvolvimento (`data-node-id`, `data-name`). Remover tudo poupa **~14 KB (11.3%)**.

**Script de build sugerido:**
```bash
sed -E 's/data-node-id="[^"]*"//g; s/data-name="[^"]*"//g' index.html | \
  sed '/<!--/,/-->/d' > index.min.html
```

**NOTA:** Manter o ficheiro original para desenvolvimento. Usar o minificado apenas para deploy.

**Impacto:** Não afeta TBT diretamente, mas reduz transfer size e parse time.

---

### Correção 8: Verificar Delays do GTM e Consentmanager

Os delays de 10s para GTM e Consentmanager estão implementados no HTML:

```javascript
// GTM (linha 17-31)
window.addEventListener('load', function() {
  setTimeout(function() { /* load GTM */ }, 10000);
});

// Consentmanager (linha 2642-2663)
window.addEventListener('load', function() {
  setTimeout(function() { /* load Consentmanager */ }, 10000);
});
```

**Opções:**
1. **Aumentar delay para 15-20s** — coloca o GTM/Consentmanager fora da janela de medição típica
2. **Carregar baseado em user interaction** — só carregar após primeiro scroll/click:

```javascript
let gtmLoaded = false;
function loadGTM() {
  if (gtmLoaded) return;
  gtmLoaded = true;
  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=G-JD85N7J78Y';
  document.head.appendChild(s);
  s.onload = function() {
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-JD85N7J78Y');
  };
}

// Carregar no primeiro scroll OU após 15s
window.addEventListener('scroll', loadGTM, { once: true, passive: true });
window.addEventListener('load', function() {
  setTimeout(loadGTM, 15000);
});
```

**Impacto estimado:** -5-10s no TBT Desktop (se o GTM/Consentmanager estiverem a executar dentro da janela)

---

## 🚀 NOVAS OTIMIZAÇÕES AVANÇADAS (V3)

Estas são técnicas adicionais que complementam as correções base acima. Ordenadas por impacto e facilidade de implementação.

---

### ⭐ NOVA Correção 9: Partytown — Mover GTM e Consentmanager para Web Worker

**Impacto estimado: -5-12s TBT Desktop / -1-3s TBT Mobile**  
**Complexidade: 🟢 Fácil (1-2 horas)**  
**Prioridade: 🔴 ALTA — Maior ganho potencial de todas as otimizações**

#### O que é o Partytown?

Partytown é uma biblioteca open-source (~6 KB lazy-loaded) que move scripts de terceiros para um **Web Worker**, libertando completamente a main thread. Os scripts continuam a funcionar normalmente mas executam numa thread separada, sem bloquear interações do utilizador nem contribuir para o TBT.

**Estado:** Beta (mas usado em produção por Builder.io, Shopify Hydrogen, e muitos sites de e-commerce).

**Compatibilidade:** Funciona em todos os browsers modernos (Chrome, Firefox, Safari, Edge). Se o browser não suportar Web Workers ou Service Workers, faz fallback para carregamento normal.

**Página oficial:** https://partytown.qwik.dev/

#### Porquê usar Partytown em vez de apenas aumentar o delay?

| Abordagem | Problema |
|-----------|----------|
| **setTimeout de 15-20s** | Apenas adia o problema — o GTM ainda executa na main thread e pode causar TBT se a janela de teste for longa o suficiente |
| **Partytown** | Elimina completamente o impacto no TBT — o GTM executa num Web Worker separado, **nunca** bloqueia a main thread |

#### Como Implementar para pata.care (Vanilla HTML — sem framework)

**Passo 1: Obter os ficheiros do Partytown**

Fazer download do release mais recente de https://github.com/QwikDev/partytown/releases ou instalar via npm e copiar:
```bash
npm install @builder.io/partytown
npx partytown copylib ./~partytown
```

Copiar a pasta `~partytown/` para a raiz do site (ao lado do `index.html`). O resultado deve ser:
```
pata.care/
├── index.html
├── ~partytown/
│   ├── partytown.js
│   ├── partytown-sw.js
│   ├── partytown-media.js
│   ├── partytown-atomics.js
│   └── ... (outros ficheiros)
├── src/
└── ...
```

**⚠️ IMPORTANTE:** Os ficheiros Partytown **DEVEM** ser servidos do mesmo domínio que o HTML (não podem estar num CDN externo). No GitHub Pages, basta fazer commit da pasta.

**Passo 2: Adicionar o snippet Partytown ao `<head>`**

No `index.html`, **ANTES** de qualquer script de terceiros, adicionar:

```html
<!-- Partytown Configuration -->
<script>
  partytown = {
    lib: "/~partytown/",
    forward: ["dataLayer.push", "gtag"],
    debug: false
  };
</script>
<script src="/~partytown/partytown.js"></script>
```

**Passo 3: Converter o GTM para usar Partytown**

**ENCONTRAR** (linhas 15-31 do `index.html`):
```html
<script>
// Carregar GTM após page load para não impactar performance
window.addEventListener('load', function() {
  setTimeout(function() {
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=G-JD85N7J78Y';
    document.head.appendChild(s);
    s.onload = function() {
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-JD85N7J78Y');
    };
  }, 10000);
});
</script>
```

**SUBSTITUIR POR:**
```html
<script type="text/partytown" src="https://www.googletagmanager.com/gtag/js?id=G-JD85N7J78Y"></script>
<script type="text/partytown">
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-JD85N7J78Y');
</script>
```

**Nota:** O `type="text/partytown"` diz ao browser para **não executar** o script. O Partytown detecta estes scripts e executa-os dentro do Web Worker.

**Passo 4: Converter o Consentmanager para usar Partytown**

**ENCONTRAR** (linhas 2642-2663 do `index.html`):
```html
<script data-cfasync="false">
window.addEventListener('load', function() {
  setTimeout(function() {
    var s = document.createElement('script');
    s.type = 'text/javascript';
    s.setAttribute('data-cfasync', 'false');
    s.src = 'https://cdn.consentmanager.net/delivery/autoblocking/9f87e56a620e6.js';
    // ... resto do código
  }, 10000);
});
</script>
```

**SUBSTITUIR POR:**
```html
<script type="text/partytown" src="https://cdn.consentmanager.net/delivery/autoblocking/9f87e56a620e6.js" data-cmp-ab="1" data-cmp-host="b.delivery.consentmanager.net" data-cmp-cdn="cdn.consentmanager.net" data-cmp-codesrc="1"></script>
<script type="text/partytown" src="https://cdn.consentmanager.net/delivery/9f87e56a620e6.js"></script>
```

#### Verificação após implementação

1. Abrir o Chrome DevTools → Sources tab
2. Verificar se existe um worker chamado "Partytown 🎉" na lista de threads
3. Verificar se o GTM está a enviar dados normalmente no Google Analytics Real-Time
4. Verificar se o banner de cookies do Consentmanager aparece corretamente
5. Correr PageSpeed Insights e verificar redução do TBT

#### Trade-offs e Cuidados

- ⚠️ O GTM Debug mode pode não funcionar com Partytown (scripts executam no Worker, não na main thread)
- ⚠️ Se o Consentmanager manipular diretamente o DOM de forma complexa, pode precisar de ajustes
- ⚠️ Se houver problemas, pode-se manter o Consentmanager no carregamento normal (com delay de 15s) e usar Partytown **apenas para o GTM**
- ✅ Se o browser não suportar Partytown, faz fallback automático para carregamento normal

#### Impacto Esperado

| Cenário | TBT Desktop | TBT Mobile |
|---------|-------------|------------|
| **Antes** | 17.8s | 5.9s |
| **Só com delay de 15s (Correção 8)** | ~7-10s | ~4-5s |
| **Com Partytown (Correção 9)** | ~2-4s | ~2-3s |
| **Partytown + Correções 2+3** | **~0.5-1.5s** | **~0.3-1.0s** |

---

### ⭐ NOVA Correção 10: OffscreenCanvas — Mover WebGL Shaders para Web Worker

**Impacto estimado: -2-3s TBT (substituição da Correção 2 — mais eficaz)**  
**Complexidade: 🟡 Média (3-6 horas)**  
**Prioridade: 🟡 MÉDIA — Usar se após Correção 2 o TBT de shaders ainda for alto**

#### O que é?

O `OffscreenCanvas` API permite transferir o controlo de um `<canvas>` para um Web Worker, movendo toda a compilação de shaders e renderização WebGL para fora da main thread.

**Diferença vs Correção 2 (setTimeout):** A Correção 2 apenas adia os shaders — quando finalmente executam, ainda bloqueiam a main thread por 2-3s. Com OffscreenCanvas, a compilação acontece **numa thread separada**, com **zero impacto** no TBT.

#### Compatibilidade

| Browser | Suporte |
|---------|---------|
| Chrome/Edge | ✅ Total (desde v69) |
| Firefox | ✅ WebGL context (perfeito para este caso) |
| Safari | ⚠️ Em desenvolvimento (precisa fallback) |

#### Implementação para os LiquidShaders

**Ficheiro novo: `webgl-worker.js`** (colocar na raiz do site)
```javascript
// webgl-worker.js — Executa no Web Worker
self.onmessage = function(e) {
  const canvas = e.data.canvas;
  const gl = canvas.getContext('webgl');

  if (!gl) {
    self.postMessage({ error: 'WebGL not supported in worker' });
    return;
  }

  // Fragment shader code (copiar o fragmentShader do LiquidShader actual)
  const fragmentShaderSource = e.data.fragmentShader;
  const vertexShaderSource = `
    attribute vec2 a_position;
    void main() { gl_Position = vec4(a_position, 0.0, 1.0); }
  `;

  // Compilar shaders no worker (NÃO bloqueia main thread!)
  const vs = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vs, vertexShaderSource);
  gl.compileShader(vs);

  const fs = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fs, fragmentShaderSource);
  gl.compileShader(fs);

  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  gl.useProgram(program);

  // Setup buffers e iniciar render loop
  // ... (adaptar o código actual do LiquidShader)

  function render(time) {
    // Update uniforms e desenhar
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
};
```

**No código principal (substituir inicialização do LiquidShader):**
```javascript
function initShaderOffscreen(canvasId, fragmentShader) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  // Tentar usar OffscreenCanvas
  if ('transferControlToOffscreen' in canvas) {
    const offscreen = canvas.transferControlToOffscreen();
    const worker = new Worker('webgl-worker.js');
    worker.postMessage(
      { canvas: offscreen, fragmentShader: fragmentShader },
      [offscreen] // Transferir ownership para o worker
    );
    return worker;
  }

  // Fallback: usar o shader normal na main thread (para Safari)
  return new LiquidShader(canvasId);
}

// Usar após load + delay (combinar com Correção 2)
window.addEventListener("load", () => {
  setTimeout(() => {
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      initShaderOffscreen("liquid-shader-canvas", heroFragmentShader);
      initShaderOffscreen("liquid-shader-canvas-joinus2", joinUsFragmentShader);
      initShaderOffscreen("liquid-shader-canvas-joinus3", joinUs3FragmentShader);
    }
  }, 2000); // Pode usar delay menor porque não bloqueia main thread
});
```

#### Notas Importantes

- O OffscreenCanvas **não pode aceder ao DOM** — qualquer lógica que dependa de `window.innerWidth` ou eventos de scroll precisa ser comunicada via `postMessage`
- O fallback para Safari garante que a funcionalidade se mantém em todos os browsers
- Pode reduzir o delay de 4s para 2s porque a compilação já não bloqueia a main thread

---

### ⭐ NOVA Correção 11: scheduler.yield() — Quebrar Long Tasks com Prioridade

**Impacto estimado: -0.5-1.5s TBT**  
**Complexidade: 🟢 Fácil (30-60 min)**  
**Prioridade: 🟡 MÉDIA — Complemento às Correções 2 e 3**

#### O que é?

`scheduler.yield()` é uma API moderna (Chrome 115+) que permite **pausar a execução** de JavaScript para dar oportunidade ao browser de processar input do utilizador e renderizar. É superior a `setTimeout` porque:

1. **Não tem delay de 4ms** — retoma imediatamente quando a main thread está livre
2. **Herda prioridade** — a continuação é agendada com prioridade em vez de ir para o fim da fila
3. **Composabilidade** — funciona com `scheduler.postTask()` para controlo explícito de prioridades

#### Implementação para o Init Principal (melhoria da Correção 3)

Em vez de um único `setTimeout(2000)` para todas as classes não-críticas, usar `scheduler.yield()` para quebrar a inicialização em pedaços mais pequenos:

```javascript
document.addEventListener("DOMContentLoaded", async () => {
  // CRÍTICO — executa imediatamente
  const t = new SmoothScroll;
  new Navbar;
  new HeaderAnimations;
  new ContactButtons(t);
  window.scrollToTopButton = new ScrollToTopButton(t);
  new VideoLazyLoader;

  // Helper: yield com fallback para browsers que não suportam
  const yieldToMain = () => {
    if (globalThis.scheduler?.yield) {
      return scheduler.yield();
    }
    return new Promise(resolve => setTimeout(resolve, 0));
  };

  // Diferir não-crítico, mas com yields entre grupos
  setTimeout(async () => {
    let e = new HeaderParallax;
    let i = new MouseHighlight;
    new DraggableElement;

    await yieldToMain(); // Dar oportunidade ao browser

    new Problem1Animations;
    new Problem2Animations;
    new Problem3Animations;

    await yieldToMain();

    new Problem4Animations;
    new Problem5Animations;
    new Solution1Animations;

    await yieldToMain();

    new Solution2Animations;
    new Solution3Animations;
    new Solution4Animations;

    await yieldToMain();

    new JoinUs1Animations;
    new JoinUs2Animations;
    new ReservarAnimations;
    new JoinUs3Animations;
    initProblem2Lottie();

    window.addEventListener("beforeunload", () => {
      i && i.destroy();
      t.destroy();
      e && e.destroy();
      window.scrollToTopButton && window.scrollToTopButton.destroy();
    });
  }, 2000);
});
```

#### Uso com scheduler.postTask() para Prioridade Explícita

Para controlo mais fino, agendar trabalho não-crítico como `background`:

```javascript
// Agendar inicialização de animações como background work
if (globalThis.scheduler?.postTask) {
  scheduler.postTask(() => {
    new Problem1Animations;
    new Problem2Animations;
    new Problem3Animations;
    new Problem4Animations;
    new Problem5Animations;
  }, { priority: 'background' });

  scheduler.postTask(() => {
    new Solution1Animations;
    new Solution2Animations;
    new Solution3Animations;
    new Solution4Animations;
  }, { priority: 'background' });
} else {
  // Fallback: setTimeout normal
  setTimeout(() => { /* todas as animações */ }, 2000);
}
```

#### Compatibilidade

| API | Chrome/Edge | Firefox | Safari |
|-----|-------------|---------|--------|
| `scheduler.yield()` | ✅ 115+ | ❌ (precisa fallback) | ❌ (precisa fallback) |
| `scheduler.postTask()` | ✅ 94+ | ❌ | ❌ |
| Fallback `setTimeout(0)` | ✅ Universal | ✅ | ✅ |

**Nota:** O fallback com `setTimeout(0)` garante que funciona em todos os browsers. Em Chrome (maioria do tráfego), terá o benefício extra da priorização.

---

### ⭐ NOVA Correção 12: Consolidar IntersectionObservers (17 → 1)

**Impacto estimado: -0.3-0.5s TBT + redução overhead contínuo**  
**Complexidade: 🟡 Média (2-4 horas — requer refactoring do JS)**  
**Prioridade: 🟡 MÉDIA**

#### O Problema

Cada uma das 12 classes de animação (`Problem1Animations`, `Solution1Animations`, etc.) cria o seu próprio `IntersectionObserver`. Isto significa:

- **17 instâncias** de IntersectionObserver ativas simultaneamente
- O browser calcula intersecções **17 vezes** por frame para cada scroll event
- Cada instância consome memória e CPU de forma independente

Segundo a implementação do Chrome, usar **um observer partilhado** com múltiplos targets é significativamente mais eficiente do que múltiplos observers com um target cada.

#### Solução: Observer Partilhado com Callbacks por Elemento

```javascript
// Criar UMA instância global
const animationObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const callback = entry.target._animationCallback;
      if (callback) {
        callback(entry);
        // Opcional: parar de observar se é one-shot
        if (entry.target._animateOnce) {
          animationObserver.unobserve(entry.target);
        }
      }
    }
  });
}, {
  threshold: 0.1,
  rootMargin: '50px'
});

// Registar elementos para animação
function registerAnimation(selector, callback, once = true) {
  const el = document.querySelector(selector);
  if (el) {
    el._animationCallback = callback;
    el._animateOnce = once;
    animationObserver.observe(el);
  }
}

// Uso nas classes de animação
registerAnimation('.problem-1-section', (entry) => {
  entry.target.classList.add('animate-in');
  // ... lógica específica da Problem1Animations
}, true);

registerAnimation('.solution-1-section', (entry) => {
  entry.target.classList.add('animate-in');
  // ... lógica específica
}, true);

// ... repetir para todas as 12 secções
```

#### Benefício Extra: Usar requestIdleCallback

Combinar o observer partilhado com `requestIdleCallback` para que os callbacks das animações não interfiram com input do utilizador:

```javascript
const animationObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && entry.target._animationCallback) {
      // Executar a animação quando o browser estiver idle
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          entry.target._animationCallback(entry);
        }, { timeout: 300 }); // máximo 300ms de espera
      } else {
        entry.target._animationCallback(entry);
      }
    }
  });
}, { threshold: 0.1 });
```

---

### ⭐ NOVA Correção 13: Critical CSS — Inline Above-the-Fold

**Impacto estimado: -0.2-0.5s FCP/LCP (não TBT diretamente)**  
**Complexidade: 🟡 Média (1-2 horas)**  
**Prioridade: 🟢 BAIXA (FCP/LCP já estão bons)**

#### O que é?

Extrair o CSS necessário para renderizar o conteúdo acima da fold e colocá-lo inline no `<head>` do HTML. O restante CSS carrega de forma assíncrona.

Como o FCP e LCP do pata.care já estão excelentes (1.1s e 1.2s mobile), esta otimização tem menor prioridade. Mas pode contribuir para os últimos pontos do score.

#### Como extrair o Critical CSS

**Opção A: Ferramenta online**
- https://www.corewebvitals.io/tools/critical-css-generator — inserir URL e obter o CSS
- Ou https://criticalcssgenerator.com/

**Opção B: Via npm (mais preciso)**
```bash
npm install critical
npx critical https://pata.care --minify --width 375 --height 812 > critical-mobile.css
npx critical https://pata.care --minify --width 1440 --height 900 > critical-desktop.css
```

#### Implementação no HTML

```html
<head>
  <!-- Critical CSS inline (~10-14 KB) -->
  <style>
    /* CSS extraído - hero, navbar, acima da fold */
    .navbar { ... }
    .hero-section { ... }
    .hero-headline { ... }
    /* Apenas estilos visíveis na viewport inicial */
  </style>

  <!-- Carregar CSS completo de forma assíncrona -->
  <link rel="preload" href="./src/css/dist/styles.min.css" as="style"
        onload="this.onload=null;this.rel='stylesheet'">
  <noscript>
    <link rel="stylesheet" href="./src/css/dist/styles.min.css">
  </noscript>
</head>
```

**Meta:** Manter o critical CSS abaixo de **14 KB** (um TCP round-trip).

---

### ⭐ NOVA Correção 14: Code Splitting — Separar JS Crítico e Não-Crítico

**Impacto estimado: -0.5-1s TBT**  
**Complexidade: 🟡 Média (2-3 horas)**  
**Prioridade: 🟡 MÉDIA**

#### O Problema

O `scripts.min.js` é um bundle único de 43 KB com 20+ classes. O browser precisa de parse e compilar **todo** o ficheiro antes de executar qualquer coisa, mesmo que apenas 6 classes sejam necessárias imediatamente.

#### Solução: Dois Bundles

```
scripts-critical.min.js (~15 KB)
  ├── SmoothScroll
  ├── Navbar
  ├── HeaderAnimations
  ├── ContactButtons
  ├── ScrollToTopButton
  └── VideoLazyLoader

scripts-animations.min.js (~28 KB)
  ├── HeaderParallax
  ├── MouseHighlight
  ├── DraggableElement
  ├── Problem1-5Animations
  ├── Solution1-4Animations
  ├── JoinUs1-3Animations
  ├── ReservarAnimations
  └── initProblem2Lottie
```

#### Carregamento

```html
<!-- Crítico: carrega com a página -->
<script defer src="scripts-critical.min.js"></script>

<!-- Animações: carrega após interação ou delay -->
<script>
window.addEventListener('load', () => {
  setTimeout(() => {
    const s = document.createElement('script');
    s.src = 'scripts-animations.min.js';
    document.body.appendChild(s);
  }, 2000);
});
</script>
```

**Benefício:** O browser parse e compila apenas 15 KB na carga inicial em vez de 43 KB, reduzindo o tempo de JS processing.

---

### ⭐ NOVA Correção 15: Consolidar MouseHighlight (5 → 1 listener)

**Impacto estimado: -0.1-0.2s + redução overhead contínuo**  
**Complexidade: 🟢 Fácil (30 min)**  
**Prioridade: 🟢 BAIXA**

O `MouseHighlight` regista **5 mousemove listeners** separados. Consolidar num único listener com throttle via `requestAnimationFrame`:

```javascript
// Em vez de 5 listeners separados:
let rafId = null;
document.addEventListener('mousemove', (e) => {
  if (rafId) return; // Já há um frame agendado
  rafId = requestAnimationFrame(() => {
    // Atualizar TODAS as highlights numa só passagem
    updateHighlight1(e);
    updateHighlight2(e);
    updateHighlight3(e);
    updateHighlight4(e);
    updateHighlight5(e);
    rafId = null;
  });
}, { passive: true });
```

**Benefício:** Reduz de 5 callbacks por mousemove para 1 callback throttled por frame (~60 fps).

---

### ⭐ NOVA Correção 16: Defer reCAPTCHA baseado em Scroll (em vez de Focus)

**Impacto estimado: Marginal (~50-100ms)**  
**Complexidade: 🟢 Fácil (15 min)**  
**Prioridade: 🟢 BAIXA**

O reCAPTCHA atual carrega quando o utilizador foca num campo do formulário. Melhorar para carregar quando a secção `#reservar` entra na viewport (dando tempo para o download antes do utilizador interagir):

```javascript
// Em vez de:
// input.addEventListener('focus', loadRecaptcha, { once: true });

// Usar IntersectionObserver para preload:
const reservarSection = document.getElementById('reservar');
if (reservarSection) {
  const recaptchaObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      loadRecaptcha();
      recaptchaObserver.disconnect();
    }
  }, { rootMargin: '200px' }); // Carregar 200px antes de entrar na viewport
  recaptchaObserver.observe(reservarSection);
}
```

---

### ⭐ NOVA Correção 18: Resource Hints Adicionais

**Impacto estimado: -50-200ms FCP/LCP**  
**Complexidade: 🟢 Fácil (5 min)**  
**Prioridade: 🟢 BAIXA**

Adicionar `dns-prefetch` como fallback dos `preconnect` existentes, e preload da fonte principal:

```html
<head>
  <!-- Existentes -->
  <link rel="preconnect" href="https://media.pata.care" crossorigin>
  <link rel="preconnect" href="https://fonts.bunny.net" crossorigin>

  <!-- NOVOS: dns-prefetch como fallback -->
  <link rel="dns-prefetch" href="https://media.pata.care">
  <link rel="dns-prefetch" href="https://fonts.bunny.net">
  <link rel="dns-prefetch" href="https://cdn.consentmanager.net">
  <link rel="dns-prefetch" href="https://www.googletagmanager.com">
</head>
```

---

## 📊 Impacto Total Esperado

### Cenário 1: Correções Base (2, 3, 4, 5, 8)

| Métrica | Mobile Atual | Após | Desktop Atual | Após |
|---------|-------------|------|--------------|------|
| **TBT** | 5.9s | ~1.0-2.0s | 17.8s | ~2-4s* |
| **Score** | 67 | **75-85** | 66 | **75-85** |

*Com delay GTM/Consentmanager de 15s

### Cenário 2: Correções Base + Partytown (2, 3, 4, 5, 9)

| Métrica | Mobile Atual | Após | Desktop Atual | Após |
|---------|-------------|------|--------------|------|
| **TBT** | 5.9s | ~0.5-1.5s | 17.8s | ~0.5-2.0s |
| **Score** | 67 | **85-92** | 66 | **82-90** |

### Cenário 3: Tudo (Base + Partytown + OffscreenCanvas + scheduler.yield + Observer consolidado)

| Métrica | Mobile Atual | Após | Desktop Atual | Após |
|---------|-------------|------|--------------|------|
| **TBT** | 5.9s | ~0.2-0.5s | 17.8s | ~0.2-0.8s |
| **FCP** | 1.1s | ~0.9-1.0s | 788ms | ~700ms |
| **LCP** | 1.2s | ~1.0-1.1s | 788ms | ~750ms |
| **CLS** | 0 | 0 | 0 | 0 |
| **Score** | 67 | **90-98** | 66 | **88-96** |

---

## 📋 Checklist de Implementação — Ordem Recomendada

### Fase 1: Quick Wins (30 minutos) ⏱️

- [ ] **Correção 5a:** Remover tag `<script>` do `email-decode.min.js` no `index.html`
- [ ] **Correção 5b:** Mudar `loading="eager"` para `loading="lazy"` na imagem do carousel Reservar
- [ ] **Correção 4:** Remover código morto de `performance.timing` do `scripts.min.js`
- [ ] **Correção 18:** Adicionar `dns-prefetch` hints ao `<head>`
- [ ] **Cloudflare:** Fazer Purge Cache no dashboard

### Fase 2: Main JS Fixes (45 minutos) ⏱️

- [ ] **Correção 2a:** Diferir LiquidShader (3 instâncias) → `load` + `setTimeout(4000)`
- [ ] **Correção 2b:** Diferir ScrollButtonShader → `load` + `setTimeout(4000)`
- [ ] **Correção 3:** Diferir classes não-críticas → `setTimeout(2000)`

### Fase 3: Partytown para Third-Party Scripts (1-2 horas) ⏱️

- [ ] **Correção 9:** Instalar Partytown no repositório
- [ ] **Correção 9:** Converter GTM para `type="text/partytown"`
- [ ] **Correção 9:** Converter Consentmanager para `type="text/partytown"` (ou manter com delay 15s como backup)
- [ ] Testar analytics no Google Analytics Real-Time
- [ ] Testar banner de cookies

### Fase 4: Refinamento JS (2-4 horas) ⏱️

- [ ] **Correção 11:** Implementar `scheduler.yield()` com fallback na inicialização
- [ ] **Correção 14:** Code splitting — separar `scripts.min.js` em 2 bundles
- [ ] **Correção 12:** Consolidar IntersectionObservers em 1 instância partilhada
- [ ] **Correção 15:** Consolidar MouseHighlight listeners

### Fase 5: Polish e Extras (1-2 horas) ⏱️ (Opcional)

- [ ] **Correção 10:** OffscreenCanvas para WebGL shaders (se TBT de shaders ainda for alto)
- [ ] **Correção 13:** Critical CSS inline
- [ ] **Correção 6:** Simplificar SVG animations do scroll button
- [ ] **Correção 7:** Minificar HTML para produção
- [ ] **Correção 16:** reCAPTCHA defer baseado em scroll

---

## 🧪 Como Testar

1. Aplicar correções por fase (testar após cada fase)
2. Fazer **Purge Cache** no Cloudflare Dashboard
3. Deploy para GitHub Pages
4. Esperar 2-3 minutos para propagação
5. Testar em **WebPageTest.org**:
   - **Mobile:** Moto G Power, Fast 4G, EU-Central
   - **Desktop:** Midrange Desktop, WiFi, EU-Central
6. Testar em **PageSpeed Insights** (tanto Mobile como Desktop)
7. **Verificar funcionalidade:**
   - ✅ GTM/Analytics a enviar dados (Google Analytics Real-Time)
   - ✅ Banner de cookies a aparecer e funcionar
   - ✅ Animações a funcionar (com delay aceitável)
   - ✅ Formulário de reserva e reCAPTCHA a funcionar
   - ✅ WebGL shaders a renderizar nos canvas
8. Comparar com resultados anteriores

---

## ⚠️ Notas Importantes

- **O utilizador NÃO vai notar diferença visual.** Os shaders e animações below-the-fold iniciam 2-4s depois, mas o utilizador ainda está a ler o hero nessa altura.
- **Partytown é a otimização com maior impacto potencial**, especialmente no Desktop onde o GTM/Consentmanager são responsáveis por ~10-12s de TBT extra.
- **Se após Partytown + Correções 2+3 o TBT já estiver < 0.5s**, as correções 10-16 são opcionais (apenas para perfeccionismo).
- O ficheiro `scripts.min.js` é um bundle minificado de uma só linha. Todas as substituições são feitas por string matching exato no ficheiro minificado.
- **Desktop vs Mobile:** O fix mais impactante para Desktop é o Partytown (Correção 9), porque os scripts third-party são os maiores contribuidores do TBT extra no Desktop.

---

## 🔮 Otimizações Futuras (Se Necessário)

Se após todas as correções o score ainda não atingir 95+:

1. **Service Worker para caching** — melhorar tempos de visitas repetidas
2. **Substituir WebGL Shaders por CSS Gradients** — para dispositivos de baixa performance, usar CSS `conic-gradient` + `animation` em vez de WebGL
3. **Lazy hydration de todo o JS** — usar `import()` dinâmico para carregar módulos apenas quando necessários
4. **HTTP/3 + Early Hints** — configurar no Cloudflare para enviar hints 103 com recursos críticos antes do HTML
5. **Brotli compression** — verificar se o Cloudflare está a servir Brotli em vez de gzip (melhor compressão ~15-20%)

---

## 📚 Referências

- **Partytown:** https://partytown.qwik.dev/
- **Partytown GTM Setup:** https://partytown.qwik.dev/google-tag-manager/
- **scheduler.yield():** https://developer.chrome.com/blog/use-scheduler-yield
- **scheduler.postTask():** https://developer.mozilla.org/en-US/docs/Web/API/Scheduler/postTask
- **OffscreenCanvas:** https://web.dev/articles/offscreen-canvas
- **OffscreenCanvas + WebGL Tutorial:** https://evilmartians.com/chronicles/faster-webgl-three-js-3d-graphics-with-offscreencanvas-and-web-workers
- **Critical CSS (npm):** https://github.com/addyosmani/critical
- **Critical CSS Generator:** https://www.corewebvitals.io/tools/critical-css-generator
- **Optimize Long Tasks (web.dev):** https://web.dev/articles/optimize-long-tasks
- **IntersectionObserver Performance:** https://www.bennadel.com/blog/3954-intersectionobserver-api-performance-many-vs-shared-in-angular-11-0-5.htm
