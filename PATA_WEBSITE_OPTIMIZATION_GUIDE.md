# 🚀 PATA Website — Guia Completo de Otimização de Performance

> ⚠️ **Nota:** Todas as referências a Lottie foram removidas deste guia. O Lottie já não é utilizado no projeto PATA — remove qualquer código, imports, ou ficheiros relacionados com Lottie que ainda existam no codebase (incluindo `PATA.json`, imports do `lottie-web`, e qualquer `<lottie-player>` no HTML).

## 📊 Estado Atual (Diagnóstico)

| Recurso | Tamanho | Problema |
|---|---|---|
| `scripts.min.js` | 43 KB | Monolítico — tudo carrega de uma vez |
| `styles.min.css` | 140 KB | Monolítico — 85% é CSS below-the-fold |
| WebGL Shaders (×3) | GPU-bound | Correm na main thread |
| Animações (×15 classes) | CPU-bound | 27 classes todas no mesmo ficheiro |
| Google Scripts fetch | Network | Corre imediatamente no parse, bloqueia |
| reCAPTCHA | ~150 KB externo | Carrega sempre, mesmo se user nunca submete |

---

## 🏆 TÉCNICAS POR ORDEM DE IMPACTO

---

### 1. ⚡ Critical CSS Inlining + Async Load (IMPACTO ALTO)

O teu CSS tem **140 KB** mas o user só vê navbar + hero na primeira frame. O browser bloqueia o render até fazer download e parse dos 140 KB inteiros.

**Solução: Separar CSS em critical (inline) e non-critical (async)**

#### Passo 1: Extrair o Critical CSS

Usa o [Critical](https://github.com/addyosmanian/critical) ou o site [https://www.codebeautify.org/critical-css-generator](https://www.codebeautify.org/critical-css-generator) para extrair automaticamente o CSS above-the-fold.

Manualmente, o teu critical CSS inclui:
- `:root` variables
- `body`, `html` resets
- `@font-face` declarations
- `.navbar` e tudo dentro
- `.header-section`, `.header-content`, `.hero`
- `.pill-*`, `.mockup-center`
- `.mouse-highlight`

#### Passo 2: Implementar no HTML

```html
<head>
    <!-- Critical CSS inline — renders instantly -->
    <style>
        /* :root, body, navbar, header-section, hero, pills, mockup */
        /* ~15-20 KB de CSS critical */
    </style>
    
    <!-- Non-critical CSS — loads async, doesn't block render -->
    <link rel="preload" href="./src/css/dist/styles.min.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
    <noscript><link rel="stylesheet" href="./src/css/dist/styles.min.css"></noscript>
</head>
```

**Resultado esperado:** FCP melhora 300-800ms porque o browser não espera pelo download de 140 KB.

---

### 2. 📦 Code Splitting do JavaScript (IMPACTO ALTO)

O teu `scripts.min.js` tem **27 classes** num único ficheiro. O browser precisa de fazer parse de 43 KB de JS antes de executar qualquer coisa.

**Solução: Dividir em 3 ficheiros por prioridade**

#### `scripts-critical.js` (~8 KB) — Carrega imediatamente
```
- Navbar
- SmoothScroll
- HeaderAnimations
- ContactButtons
- HeaderParallax
- MouseHighlight
```

#### `scripts-deferred.js` (~20 KB) — Carrega após idle
```
- Todas as *Animations classes (Problem1-5, Solution1-4, JoinUs1-3, Reservar)
- VideoLazyLoader
- DraggableElement
- ScrollToTopButton
```

#### `scripts-lazy.js` (~15 KB) — Carrega on-demand
```
- LiquidShader (só quando canvas visível)
- ScrollButtonShader
- ReservarCarousel, ReservarFormValidator, ReservarFormSubmitter
```

#### Implementação no HTML:

```html
<!-- Critical — loads and executes immediately -->
<script src="./src/js/dist/scripts-critical.min.js"></script>

<!-- Deferred — downloads in parallel, executes after HTML parsed -->
<script defer src="./src/js/dist/scripts-deferred.min.js"></script>

<!-- Lazy — only loads when needed -->
<script>
    // Load form scripts only when reservar section is near
    const reservarObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const s = document.createElement('script');
                s.src = './src/js/dist/scripts-lazy.min.js';
                document.body.appendChild(s);
                reservarObserver.disconnect();
            }
        });
    }, { rootMargin: '500px' });
    
    const reservarEl = document.querySelector('.reservar-section') || document.querySelector('#reservar');
    if (reservarEl) reservarObserver.observe(reservarEl);
</script>
```

---

### 3. 🧵 OffscreenCanvas Web Worker para WebGL Shaders (IMPACTO MÉDIO-ALTO)

Os teus **3 LiquidShaders** e o **ScrollButtonShader** usam WebGL com `requestAnimationFrame`. Isto corre tudo na main thread e compete com DOM updates, scroll handlers, e input events.

**Solução: Mover os shaders para um Web Worker usando `OffscreenCanvas`**

#### `liquid-shader-worker.js`:
```javascript
// Este ficheiro corre num Web Worker — zero impacto na main thread

let gl, program, uniforms, startTime, mouseX = 0.5, mouseY = 0.5;
let animationId = null;

const brandColors = {
    blue: [44/255, 101/255, 147/255],
    darkOrange: [219/255, 93/255, 35/255],
    lightOrange: [1, 200/255, 129/255]
};

self.onmessage = function(e) {
    const { type, canvas, width, height, x, y } = e.data;
    
    switch(type) {
        case 'init':
            initShader(canvas);
            break;
        case 'resize':
            resizeCanvas(width, height);
            break;
        case 'mouse':
            mouseX = x;
            mouseY = y;
            break;
        case 'destroy':
            if (animationId) cancelAnimationFrame(animationId);
            break;
    }
};

function initShader(canvas) {
    gl = canvas.getContext('webgl');
    if (!gl) return;
    
    startTime = Date.now();
    createShaderProgram();
    setupUniforms();
    setupGeometry();
    animate();
}

function createShaderProgram() {
    const vertSrc = `
        attribute vec2 a_position;
        void main() { gl_Position = vec4(a_position, 0.0, 1.0); }
    `;
    
    const fragSrc = `
        precision mediump float;
        uniform vec2 u_resolution;
        uniform float u_time;
        uniform vec2 u_mouse;
        uniform vec3 u_color1, u_color2, u_color3;

        void main() {
            vec2 uv = gl_FragCoord.xy / u_resolution.xy;
            float mouseInfluence = distance(uv, u_mouse);
            mouseInfluence = 1.0 - smoothstep(0.0, 0.5, mouseInfluence);
            float d = -u_time * 0.5 + mouseInfluence * 2.0;
            float a = 0.0;
            for (float i = 0.0; i < 8.0; i += 1.0) {
                a += cos(i - d - a * uv.x + mouseInfluence);
                d += sin(uv.y * i + a);
            }
            d += u_time * 0.5;
            float mix1 = sin(d + a) * 0.5 + 0.5;
            float mix2 = cos(d - a) * 0.5 + 0.5;
            vec3 brightOrange1 = u_color2 * 1.3;
            vec3 brightOrange2 = u_color3 * 1.4;
            vec3 tempColor = mix(u_color1, brightOrange1, mix1 * 0.4);
            vec3 finalColor = mix(tempColor, brightOrange2, mix2 * 0.3);
            finalColor = finalColor * 0.75;
            gl_FragColor = vec4(finalColor, 1.0);
        }
    `;
    
    const vert = compileShader(vertSrc, gl.VERTEX_SHADER);
    const frag = compileShader(fragSrc, gl.FRAGMENT_SHADER);
    program = gl.createProgram();
    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.linkProgram(program);
    gl.useProgram(program);
}

function compileShader(src, type) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
}

function setupUniforms() {
    uniforms = {
        resolution: gl.getUniformLocation(program, 'u_resolution'),
        time: gl.getUniformLocation(program, 'u_time'),
        mouse: gl.getUniformLocation(program, 'u_mouse'),
        color1: gl.getUniformLocation(program, 'u_color1'),
        color2: gl.getUniformLocation(program, 'u_color2'),
        color3: gl.getUniformLocation(program, 'u_color3')
    };
    gl.uniform3fv(uniforms.color1, brandColors.blue);
    gl.uniform3fv(uniforms.color2, brandColors.darkOrange);
    gl.uniform3fv(uniforms.color3, brandColors.lightOrange);
}

function setupGeometry() {
    const verts = new Float32Array([-1,-1, 1,-1, -1,1, 1,1]);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
    const pos = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
}

function resizeCanvas(w, h) {
    if (gl) gl.viewport(0, 0, w, h);
}

function animate() {
    animationId = requestAnimationFrame(animate);
    const t = 0.001 * (Date.now() - startTime);
    gl.uniform2f(uniforms.resolution, gl.canvas.width, gl.canvas.height);
    gl.uniform1f(uniforms.time, t);
    gl.uniform2f(uniforms.mouse, mouseX, mouseY);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}
```

#### Na main thread (inicialização):
```javascript
function initShaderWorker(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;
    
    // Check OffscreenCanvas support (Chrome 69+, Firefox 105+, Safari 16.4+)
    if (!canvas.transferControlToOffscreen) {
        // Fallback: use original main-thread LiquidShader
        return new LiquidShader(canvasId);
    }
    
    const offscreen = canvas.transferControlToOffscreen();
    const worker = new Worker('./src/js/liquid-shader-worker.js');
    
    worker.postMessage({ type: 'init', canvas: offscreen }, [offscreen]);
    
    // Forward mouse events
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        worker.postMessage({
            type: 'mouse',
            x: (e.clientX - rect.left) / rect.width,
            y: 1 - (e.clientY - rect.top) / rect.height
        });
    });
    
    canvas.addEventListener('mouseleave', () => {
        worker.postMessage({ type: 'mouse', x: 0.5, y: 0.5 });
    });
    
    // Forward resize
    const ro = new ResizeObserver(() => {
        const dpr = window.devicePixelRatio || 1;
        worker.postMessage({
            type: 'resize',
            width: canvas.clientWidth * dpr,
            height: canvas.clientHeight * dpr
        });
    });
    ro.observe(canvas);
    
    return worker;
}
```

**Resultado:** Os shaders WebGL correm num thread separado. A main thread fica 100% livre para scroll, clicks, e animações CSS. Isto é especialmente importante em mobile onde a main thread é mais limitada.

**Suporte:** Chrome 69+, Firefox 105+, Safari 16.4+ (~92% dos browsers). Fallback automático para main thread nos restantes.

---

### 4. 🎯 Lazy Load do reCAPTCHA (IMPACTO MÉDIO)

O reCAPTCHA v3 carrega **~150 KB** de JavaScript do Google sempre que a página abre, mas só é preciso quando o user chega à secção de Reservar e tenta submeter o form.

**Antes (atual):**
```html
<script src="https://www.google.com/recaptcha/api.js?render=YOUR_KEY"></script>
```

**Depois:**
```javascript
// Só carrega o reCAPTCHA quando a secção reservar fica visível
let recaptchaLoaded = false;

function loadRecaptcha() {
    if (recaptchaLoaded) return;
    recaptchaLoaded = true;
    
    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js?render=6Le6-2EsAAAAAC35zcOC3-2jVhmztQL_yMNh5YEb';
    script.async = true;
    document.head.appendChild(script);
}

// Trigger: quando reservar section está a 800px de distância
const recaptchaObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
        loadRecaptcha();
        recaptchaObserver.disconnect();
    }
}, { rootMargin: '800px' });

const reservar = document.querySelector('.reservar-section');
if (reservar) recaptchaObserver.observe(reservar);
```

**Resultado:** -150 KB no initial load, reCAPTCHA só carrega quando o user realmente precisa.

---

### 5. 🌐 Cloudflare — Configurações Avançadas (IMPACTO MÉDIO)

#### No Cloudflare Dashboard:

**Speed → Optimization → Content Optimization:**
- ✅ **Auto Minify** — JS, CSS, HTML
- ✅ **Brotli** — compressão superior ao gzip (~15-20% menor)
- ✅ **Early Hints (103)** — pré-conecta aos teus recursos antes do HTML chegar
- ✅ **HTTP/2 Server Push** — se disponível no teu plano

**Speed → Optimization → Image Optimization:**
- ✅ **Polish** — otimiza imagens automaticamente
- ✅ **WebP** — serve WebP quando suportado

**Caching → Configuration:**
```
Browser Cache TTL: 1 year (para assets com hash no nome)
Edge Cache TTL: 1 month
```

**Rules → Page Rules:**
```
*pata.care/src/css/* → Cache Level: Cache Everything, Edge TTL: 1 month
*pata.care/src/js/*  → Cache Level: Cache Everything, Edge TTL: 1 month
*pata.care/src/img/* → Cache Level: Cache Everything, Edge TTL: 1 year
```

#### Cloudflare Workers (opcional, avançado):

```javascript
// Worker para injetar Critical CSS e Resource Hints
addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
    const response = await fetch(request);
    
    if (request.url.endsWith('/') || request.url.endsWith('.html')) {
        // Add preload headers
        const newResponse = new Response(response.body, response);
        newResponse.headers.append('Link', 
            '<./src/css/dist/styles.min.css>; rel=preload; as=style, ' +
            '<./src/js/dist/scripts-critical.min.js>; rel=preload; as=script, ' +
            '<https://fonts.bunny.net/mona-sans/files/mona-sans-latin-400-normal.woff2>; rel=preload; as=font; crossorigin'
        );
        return newResponse;
    }
    
    return response;
}
```

---

### 6. 🖼️ Resource Hints no HTML (IMPACTO BAIXO-MÉDIO)

Já tens `preconnect` e `dns-prefetch`, mas podes adicionar:

```html
<head>
    <!-- Já tens estes ✅ -->
    <link rel="preconnect" href="https://media.pata.care" crossorigin>
    <link rel="preconnect" href="https://fonts.bunny.net" crossorigin>
    
    <!-- Adicionar estes ⬇️ -->
    <!-- Prefetch do CSS non-critical enquanto o browser está idle -->
    <link rel="prefetch" href="./src/js/dist/scripts-deferred.min.js" as="script">
    
    <!-- Preload do hero image / mockup se existir -->
    <link rel="preload" href="./src/img/hero-mockup.webp" as="image" type="image/webp">
    
    <!-- DNS prefetch para Google (reCAPTCHA, Google Scripts) -->
    <link rel="dns-prefetch" href="https://www.google.com">
    <link rel="dns-prefetch" href="https://script.google.com">
</head>
```

---

### 7. 🔤 Font Loading Optimization (IMPACTO BAIXO)

Já usas `font-display: swap` ✅, mas podes melhorar:

```html
<!-- Preload APENAS o weight mais usado (400) — já fazes isto ✅ -->
<link rel="preload" href="https://fonts.bunny.net/mona-sans/files/mona-sans-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>

<!-- Os weights 600 e 700 podem carregar async — não são critical -->
<!-- Remove os @font-face do 600/700 do critical CSS e coloca-os no styles.min.css -->
```

---

### 8. 🎨 Partytown — Quando Usar e Quando NÃO Usar

O Partytown move scripts de terceiros para um Web Worker. É excelente para:
- ✅ Google Analytics / gtag
- ✅ Facebook Pixel
- ✅ Hotjar, Mixpanel, etc.

**NÃO é bom para:**
- ❌ O teu `scripts.min.js` — precisa de acesso DOM direto (classList, IntersectionObserver, WebGL canvas)
- ❌ reCAPTCHA — precisa de DOM para injection de tokens

**Implementação para o gtag:**
```html
<script>
    partytown = {
        forward: ['dataLayer.push', 'gtag'],
        resolveUrl: (url) => {
            if (url.hostname === 'www.googletagmanager.com') {
                return url; // Allow through proxy
            }
            return url;
        }
    };
</script>
<script src="./partytown/partytown.js"></script>

<!-- Move gtag to worker -->
<script type="text/partytown">
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-XXXXXXXXXX');
</script>
<script type="text/partytown" src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
```

---

## 📋 RESUMO — CHECKLIST DE IMPLEMENTAÇÃO

| # | Técnica | Impacto | Dificuldade | Tempo |
|---|---|---|---|---|
| 1 | Critical CSS inline + async load | 🟢🟢🟢 Alto | Médio | 2-3h |
| 2 | Code splitting JS (3 ficheiros) | 🟢🟢🟢 Alto | Médio | 3-4h |
| 3 | OffscreenCanvas Workers para shaders | 🟢🟢 Médio-Alto | Alto | 4-5h |
| 4 | Lazy load reCAPTCHA | 🟢🟢 Médio | Baixo | 30min |
| 5 | Cloudflare config avançada | 🟢🟢 Médio | Baixo | 1h |
| 6 | Resource hints adicionais | 🟡 Baixo-Médio | Baixo | 15min |
| 7 | Font loading optimization | 🟡 Baixo | Baixo | 15min |
| 8 | Partytown para analytics | 🟡 Baixo | Médio | 1h |

**Ordem recomendada:** 4 → 6 → 1 → 2 → 5 → 7 → 8 → 3

(começa pelos quick wins, depois os high-impact, e por último o mais complexo)

---

## ⚡ Ganhos Esperados (Combinados)

| Métrica | Antes | Depois (estimado) |
|---|---|---|
| **FCP** | ~1.5-2.5s | ~0.8-1.2s |
| **LCP** | ~2-3.5s | ~1.2-2s |
| **TBT** | ~200-400ms | ~50-100ms |
| **Initial JS parsed** | 43 KB | ~8 KB (critical only) |
| **Initial CSS parsed** | 140 KB | ~15-20 KB (critical only) |
| **Perceived load** | 4s delay nos efeitos | <500ms para efeitos |
| **Main thread work** | WebGL + animations + DOM | Só DOM (WebGL no worker) |
