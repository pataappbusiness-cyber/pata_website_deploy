



# 🔧 PATA.care — Melhorias de Performance (Lighthouse)

**Score Atual:** 85/100  
**Data:** Fevereiro 2026  
**URL:** https://pata.care

---

## ✅ Já Implementado

- ~~Cache Lifetimes~~ — Resolvido via Cloudflare Worker (~560 KiB poupados)

---

## 📊 Melhorias Pendentes

| Categoria | Poupança Estimada | Prioridade |
|-----------|-------------------|------------|
| Image Delivery | ~78 KiB | 🔴 Alta |
| Layout Shift (CLS) | Score: 0.204 | 🔴 Alta |
| Unused JavaScript | ~57 KiB | 🟡 Média |
| Long Main-Thread Tasks | 2 tarefas longas | 🟡 Média |
| LCP Request Discovery | Chain 283ms | 🟡 Média |
| Forced Reflow | 32ms | 🟡 Média |
| Non-composited Animations | 72 elementos | 🟢 Baixa |
| DOM Size | 890 elementos | 🟢 Baixa |

---

## 🔴 1. Image Delivery — Poupança ~78 KiB

**Problema:** Algumas imagens estão sobredimensionadas e os video posters usam formato JPG em vez de WebP/AVIF.

### Assets Afetados

| Asset | Tamanho | Poupança | Problema |
|-------|---------|----------|----------|
| `PATA_APP.webp` | 68.5 KiB | 44.3 KiB | Servida a 1031×861 mas exibida a 613×511 |
| `6865078-hd_1366_720_25fps_poster.jpg` | 27.6 KiB | 14.9 KiB | Formato JPG, converter para WebP |
| `3939111-hd_1280_720_24fps_poster.jpg` | 38.8 KiB | 9.2 KiB | Formato JPG, converter para WebP |
| `2849936-hd_1280_720_24fps_poster.jpg` | 20.7 KiB | 9.2 KiB | Formato JPG, converter para WebP |

### ✅ Solução

**Para `PATA_APP.webp`:**
- Usar `srcset` com tamanhos responsivos:
```html
<img 
  src="images/PATA_APP-613.webp" 
  srcset="images/PATA_APP-613.webp 613w, images/PATA_APP-1031.webp 1031w"
  sizes="(max-width: 768px) 100vw, 613px"
  alt="PATA App" 
  width="613" 
  height="511" 
  loading="lazy"
>
```

**Para video posters:**
- Converter os 3 JPGs para WebP (usar ferramenta como Squoosh, cwebp, ou editor de imagem)

> ⏸️ **PAUSA AQUI:** Depois de converter os posters JPG para WebP, envia os novos links/URLs dos ficheiros WebP para que o CTO possa gerar o HTML atualizado com os caminhos corretos dos novos posters.

---

## 🔴 2. Layout Shift (CLS) — Score: 0.204

**Problema:** O score CLS total é **0.204** (deveria ser < 0.1). Os principais culpados são:

### Culpados Identificados

| Elemento | CLS Score | Causa |
|----------|-----------|-------|
| `<section id="hero" class="header-section">` | 0.198 | Texto "Lançamento: 2026..." desloca conteúdo |
| `<video class="background-video">` (problem1) | — | Elemento de imagem sem dimensões |
| `<video class="background-video">` (left-panel) | 0.006 | Elemento de imagem sem dimensões |

### ✅ Solução

**Para a hero section (maior impacto — 0.198):**
- Definir dimensões fixas no hero:
```css
.header-section {
  min-height: 600px; /* ou a altura real */
  contain: layout;
}
```
- Pré-carregar a fonte Mona Sans para evitar FOIT/FOUT:
```html
<link rel="preload" href="fonts/mona-sans-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="fonts/mona-sans-latin-600-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="fonts/mona-sans-latin-700-normal.woff2" as="font" type="font/woff2" crossorigin>
```

**Para os vídeos background:**
- Adicionar `width` e `height` explícitos ou usar `aspect-ratio`:
```css
.background-video {
  aspect-ratio: 16 / 9;
  width: 100%;
  height: auto;
}
```

---

## 🟡 3. Unused JavaScript — Poupança ~57 KiB

**Problema:** O Google Tag Manager carrega **143.1 KiB** de JavaScript, dos quais **57 KiB** não são utilizados no carregamento inicial.

### Asset Afetado

| URL | Transfer Size | Poupança |
|-----|--------------|----------|
| `/gtag/js?id=G-JDB5N7J78Y` (Google Tag Manager) | 143.1 KiB | 57.0 KiB |

### ✅ Solução

- Carregar o GTM de forma assíncrona e diferida:
```html
<!-- Mover para depois do conteúdo principal -->
<script async defer src="https://www.googletagmanager.com/gtag/js?id=G-JDB5N7J78Y"></script>
```
- Ou usar `requestIdleCallback` para atrasar o carregamento:
```javascript
if ('requestIdleCallback' in window) {
  requestIdleCallback(() => {
    const script = document.createElement('script');
    script.src = 'https://www.googletagmanager.com/gtag/js?id=G-JDB5N7J78Y';
    document.head.appendChild(script);
  });
}
```
- Considerar [Partytown](https://partytown.builder.io/) para mover analytics para um Web Worker.

---

## 🟡 4. Long Main-Thread Tasks — 2 Tarefas Longas

**Problema:** Foram detetadas 2 long tasks que bloqueiam o main thread:

| Recurso | Start Time | Duração |
|---------|------------|---------|
| Google Tag Manager | 6,180 ms | 125 ms |
| `https://pata.care` (1st party) | 993 ms | 53 ms |

### ✅ Solução

- O GTM é o principal culpado (125ms). A solução do ponto 3 (carregar GTM de forma diferida) resolve este problema também.
- Os 53ms do 1st party são aceitáveis, mas podem ser otimizados com code splitting se necessário.

---

## 🟡 5. LCP Request Discovery — Chain de 283ms

**Problema:** O caminho crítico para o LCP tem uma latência máxima de **283ms** com uma chain de dependências:

```
https://pata.care — 73ms, 20.46 KiB
  └── scripts-critical.min.js — 283ms, 4.41 KiB
```

Também: **nenhuma origem foi pre-connected**.

### ✅ Solução

- Adicionar preconnect para origens externas:
```html
<link rel="preconnect" href="https://media.pata.care">
<link rel="preconnect" href="https://fonts.bunny.net">
<link rel="preconnect" href="https://www.googletagmanager.com">
```
- Inline o CSS crítico e usar `<link rel="preload">` para o script crítico:
```html
<link rel="preload" href="dist/scripts-critical.min.js" as="script">
```

---

## 🟡 6. Forced Reflow — 32ms

**Problema:** JavaScript faz queries a propriedades geométricas (como `offsetWidth`) após mudanças de estilo, causando **32ms de forced reflow**.

| Source | Total Reflow Time |
|--------|-------------------|
| [unattributed] | 32 ms |
| Google Tag Manager | 0 ms |

### ✅ Solução

- Auditar o JavaScript para batch reads/writes DOM:
```javascript
// ❌ Causa forced reflow
element.style.width = '100px';
const width = element.offsetWidth; // REFLOW!

// ✅ Ler primeiro, escrever depois
const width = element.offsetWidth;
element.style.width = '100px';
```
- Usar `requestAnimationFrame` para agrupar mudanças visuais.

---

## 🟢 7. Non-composited Animations — 72 Elementos

**Problema:** 72 elementos animados não estão a usar composição GPU, o que pode causar jank visual.

### ✅ Solução

- Adicionar `will-change` ou `transform: translateZ(0)` aos elementos animados:
```css
.animated-element {
  will-change: transform, opacity;
}
```
- Preferir animar apenas `transform` e `opacity` (propriedades compositor-friendly).
- Evitar animar `width`, `height`, `top`, `left`, `margin`, `padding`.

---

## 🟢 8. DOM Size — 890 Elementos

**Problema:** O DOM tem **890 elementos** com profundidade máxima de **11 níveis** e máximo de **21 filhos** num único elemento (o select de distritos).

**Nota:** 890 elementos está dentro do aceitável (< 1500), mas pode ser otimizado.

### ✅ Solução

- Para o select de distritos (21 opções): considerar lazy loading ou usar um componente custom.
- Usar `content-visibility: auto` para secções abaixo do fold:
```css
section:not(:first-child) {
  content-visibility: auto;
  contain-intrinsic-size: auto 500px;
}
```

---

## 📋 Plano de Ação por Prioridade

### Sprint 1 — Redução de CLS (1 dia)
1. ✏️ Fixar dimensões da hero section
2. ✏️ Adicionar dimensões explícitas aos vídeos background
3. ✏️ Preload das fontes Mona Sans

### Sprint 2 — Otimização de Assets (1 dia)
4. ✏️ Redimensionar `PATA_APP.webp` com srcset responsivo
5. ✏️ Converter video posters de JPG para WebP → ⏸️ **PAUSAR e enviar novos links WebP ao CTO**
6. ✏️ Adicionar `preconnect` hints para origens externas
7. ✏️ Preload do script crítico

### Sprint 3 — JavaScript Performance (meio dia)
8. ✏️ Diferir carregamento do Google Tag Manager
9. ✏️ Auditar e corrigir forced reflows

### Sprint 4 — Polish (opcional)
10. ✏️ Adicionar `will-change` a elementos animados
11. ✏️ Aplicar `content-visibility` a secções off-screen

---

**🎯 Meta:** Atingir score **95+** no Lighthouse após implementar todas as melhorias.
