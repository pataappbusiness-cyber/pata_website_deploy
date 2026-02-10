# PATA Website - Performance Optimization Plan

## Context

O site tem score 89 (mobile) e 85 (desktop) no Lighthouse. Os principais problemas:
- **Desktop CLS 0.272** - o `liquid-shader-canvas` causa 0.268 de layout shift (o canvas WebGL muda de dimensoes ao inicializar)
- **Mobile LCP 3.3s** - o mockup image tem 2,210ms de "element render delay" porque o main thread esta ocupado com shaders e animacoes
- **Desktop mais lento que mobile** - paradoxalmente, no mobile o shader ja esta desativado, mas no desktop o shader + parallax + highlight competem por recursos

O user quer: (1) Mobile completamente estatico (sem videos, sem shaders, sem animacoes), (2) Desktop sem parallax e sem mouse highlight, com shader simplificado.

---

## Fase 1: Corrigir CLS do Desktop (0.272 -> ~0.05)

O `liquid-shader-canvas` causa quase toda a CLS porque o canvas nao tem dimensoes iniciais e o WebGL reflow acontece apos o paint.

### 1.1 Adicionar `width`/`height` aos canvas elements
**Ficheiro:** `index.html` (linhas 628, 1796, 2303)
- Adicionar `width="1920" height="1080"` a cada `<canvas>` para dar dimensoes intrinsecas iniciais

### 1.2 Adicionar `contain: strict` ao CSS do canvas
**Ficheiros:** `src/css/new/sections.css`, `src/css/new/joinus2.css`, `src/css/new/joinus3.css` + CSS inline no `index.html`
- Adicionar `contain: strict;` ao `.liquid-shader-canvas` para isolar o canvas do layout

### 1.3 Ocultar canvas ate o shader estar pronto
**Ficheiro:** CSS inline no `index.html` + `src/js/dist/scripts-critical.js`
- Canvas comeca com `opacity: 0` e recebe classe `shader-ready` quando o WebGL esta pronto
- Previne flash visual durante compilacao do shader

---

## Fase 2: Remover HeaderParallax e MouseHighlight no Desktop

Estes dois efeitos adicionam um loop `requestAnimationFrame` continuo e recalculos por cada mousemove. Sao os mais pesados no header.

### 2.1 Remover inicializacao do HeaderParallax e MouseHighlight
**Ficheiro:** `src/js/dist/scripts-critical.js` (linhas ~623-646)
- Remover `new HeaderParallax()` e `new MouseHighlight()`
- Remover o IntersectionObserver que controla o parallax

### 2.2 Remover elemento `.mouse-highlight` do HTML
**Ficheiro:** `index.html` (linha 630)
- Remover `<div class="mouse-highlight" aria-hidden="true"></div>`

### 2.3 Remover atributos `data-parallax` dos elementos do header
**Ficheiro:** `index.html` (linhas 649, 664, 680, 698, 713)
- Remover `data-parallax="0.3"`, `data-parallax="0.5"`, `data-parallax="0.2"`, `data-parallax="0.4"`, `data-parallax="0.6"`

### 2.4 Limpar CSS relacionado
**Ficheiros:** `src/css/new/sections.css`, `src/css/new/global.css`
- Remover regras `.mouse-highlight` e `will-change: transform` em `[data-parallax]`

---

## Fase 3: Mobile - Desativar Todos os Videos

Os 6 videos continuam a carregar em mobile. Vamos mostrar apenas as poster images.

### 3.1 Modificar VideoLazyLoader para detetar mobile
**Ficheiro:** `src/js/dist/scripts-deferred.js` (linhas 13-39)
- Adicionar detecao mobile (`window.innerWidth < 768 || !matchMedia('(hover: hover)').matches`)
- No mobile: remover `<source>` elements dos videos para que apenas o `poster` seja mostrado
- No desktop: manter comportamento atual

---

## Fase 4: Mobile - Substituir Liquid Shaders por Gradiente Estatico

O shader ja esta escondido no mobile, mas nao ha fallback visual adequado.

### 4.1 Adicionar gradiente estatico para mobile no header
**Ficheiro:** `src/css/new/sections.css` (apos linha 109)
- Adicionar `@media (max-width: 768px)` com `::before` no `.header-section` usando gradiente estatico (sem animacao)
- Usar menos layers de radial-gradient (3 em vez de 7) para reduzir custo no GPU mobile

### 4.2 Aplicar o mesmo fallback ao joinus2 e joinus3
**Ficheiros:** `src/css/new/joinus2.css`, `src/css/new/joinus3.css`
- Mesmo padrao de gradiente estatico via `::before` em mobile

---

## Fase 5: Mobile - Desativar Animated Gradients CSS

8 secoes usam `.animated-gradient` com animacao infinita de 10s.

### 5.1 Parar animacao em mobile
**Ficheiro:** `src/css/new/animated-gradient.css`
- Adicionar `@media (max-width: 767px)` com `animation: none !important; background-position: 50% 50% !important;`

---

## Fase 6: Otimizar Shader no Desktop

### 6.1 Reduzir iteracoes do shader de 8 para 5
**Ficheiros:** `src/js/dist/scripts-critical.js`, `src/js/liquid-shader.js`, `src/js/liquid-shader-worker.js`
- Mudar o loop `for (float i = 0.0; i < 8.0; ...)` para `i < 5.0`
- O blur de 80-125px no CSS mascara a diferenca visual

### 6.2 Limitar devicePixelRatio a 1x
**Ficheiros:** `src/js/dist/scripts-critical.js`, `src/js/liquid-shader.js`, `src/js/liquid-shader-worker.js`
- Cap DPR a 1: `const dpr = Math.min(window.devicePixelRatio || 1, 1)`
- Renderizar a 1x em vez de 2x (Retina) reduz 4x os pixels processados pelo GPU

---

## Fase 7: Desktop - Simplificar Animated Gradients

### 7.1 Abrandar animacao de gradiente
**Ficheiro:** `src/css/new/animated-gradient.css`
- Mudar duracao de 10s para 20s

---

## Fase 8: Corrigir Tamanhos de Imagem (Lighthouse Flag)

### 8.1 Ajustar `sizes` da imagem PATA_APP
**Ficheiro:** `index.html` (linhas 841-857)
- Atualizar o atributo `sizes` para corresponder ao tamanho real de display em cada breakpoint

---

## Fase 9: Build e Minificacao

### 9.1 Rebuild CSS
- Regenerar `src/css/dist/styles.min.css`

### 9.2 Minificar JS
- `scripts-critical.js` -> `scripts-critical.min.js` (terser)
- `scripts-deferred.js` -> `scripts-deferred.min.js` (terser)
- `liquid-shader-worker.js` -> `liquid-shader-worker.min.js` (terser)

---

## Verificacao e Testes

### Como testar as mudancas:
1. **Lighthouse** - Chrome DevTools > Lighthouse para mobile (Moto G Power) e desktop
   - Target: Desktop CLS < 0.1, Mobile LCP < 2.5s
2. **Layout Shift** - DevTools > Performance tab > marcar "Layout Shift Regions" > gravar page load
3. **Network** - Verificar que em mobile nao ha requests `.mp4` (apenas poster images)
4. **Performance Profile** - DevTools > Performance > verificar que nao ha RAF loops continuos no desktop

### Ferramentas de teste recomendadas:
- **WebPageTest** (webpagetest.org) - Testar com dispositivos reais emulados
- **PageSpeed Insights** (pagespeed.web.dev) - Dados reais do Chrome UX Report
- **Chrome DevTools** - Device emulation com throttling
- **BrowserStack** ou **LambdaTest** - Testar em dispositivos reais remotos

### Impacto esperado:

| Metrica | Atual | Esperado | Causa |
|---------|-------|----------|-------|
| Desktop CLS | 0.272 | < 0.05 | contain: strict + opacity transition |
| Mobile LCP | 3.3s | ~1.5-2.0s | Sem shader/parallax no main thread |
| Desktop Score | 85 | 92-96 | CLS fix e principal contributor |
| Mobile Score | 89 | 94-97 | Sem videos + sem animacoes |

### Ficheiros criticos a modificar:
- `index.html` - Canvas attributes, inline CSS, HTML cleanup
- `src/js/dist/scripts-critical.js` - Remover parallax/highlight, otimizar shader
- `src/js/dist/scripts-deferred.js` - Mobile video handling
- `src/js/liquid-shader.js` e `liquid-shader-worker.js` - Shader optimizations
- `src/css/new/sections.css` - CLS fixes, mobile gradient fallback
- `src/css/new/animated-gradient.css` - Mobile disable
- `src/css/new/joinus2.css` e `joinus3.css` - Mobile gradient fallback
