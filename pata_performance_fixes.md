
# PATA.care — Guia de Otimização de Performance
## De Score 48 → 85+ (Objetivo)

---

## RESUMO DOS PROBLEMAS ENCONTRADOS

| Métrica | Atual | Objetivo | Impacto |
|---------|-------|----------|---------|
| TBT | 8.1s | <200ms | 🔴 CRÍTICO |
| CLS | 0.337 | <0.1 | 🔴 CRÍTICO |
| LCP | 1.2s | <2.5s | 🟢 OK |
| FCP | 664ms | <1.8s | 🟢 OK |
| Score | 48 | 85+ | — |

---

## FIX 1: Consentmanager — O maior culpado do TBT (8.1s)

### Problema
O consentmanager carrega com delay de 1.5s mas depois injeta **7 scripts** que bloqueiam o main thread. O Rocket Loader do Cloudflare pode estar a conflitar com o delay manual, causando double-loading ou execução não otimizada.

### Solução
Aumentar o delay para **5 segundos** e desativar Rocket Loader para este script:

**No `index.html`, substituir o bloco do consentmanager (linhas 2616-2622+) por:**

```html
<!-- Consent Manager - Delayed Loading (5s after page load) -->
<script data-cfasync="false">
// data-cfasync="false" impede Rocket Loader de interferir
window.addEventListener('load', function() {
  setTimeout(function() {
    var s = document.createElement('script');
    s.type = 'text/javascript';
    s.setAttribute('data-cfasync', 'false');
    s.src = 'https://cdn.consentmanager.net/delivery/autoblocking/XXXXXX.js'; // teu ID
    s.setAttribute('data-cmp-ab', '1');
    document.body.appendChild(s); // body em vez de head
  }, 5000); // 5s em vez de 1.5s
});
</script>
```

### ⚠️ Rocket Loader
O Rocket Loader está ENABLED no teu Cloudflare. Isto é provavelmente o motivo do TBT ter piorado. O Rocket Loader re-processa e atrasa scripts "defer", mas pode estar a causar cascading de scripts. 

**RECOMENDAÇÃO: Desativa o Rocket Loader no Cloudflare** (`Speed > Optimization > Rocket Loader → OFF`). O teu JS já está minificado e usa defer corretamente. O Rocket Loader está a piorar as coisas neste caso.

---

## FIX 2: CLS 0.337 — Imagens sem dimensões

### Problema
33 imagens no HTML não têm `width` e `height` explícitos. Quando carregam, empurram o conteúdo causando layout shifts. O mockup (LCP element) é o pior caso — 130kB com `loading="eager"` mas sem dimensões no `<img>`.

### Correções no `index.html`

**Hero Mockup (linha ~535) — Mais importante:**
```html
<!-- ANTES -->
<img
    src="./src/img/new_images/mockup.png"
    alt="PATA App"
    class="mockup-image"
    loading="eager">

<!-- DEPOIS -->
<img
    src="./src/img/new_images/mockup.png"
    alt="PATA App"
    class="mockup-image"
    loading="eager"
    width="476"
    height="952"
    fetchpriority="high">
```

**Hero Pills — cao_medico (linha ~508):**
```html
<img
    src="./src/img/new_images/cao_medico.png"
    alt="Cão com médico veterinário"
    class="pill-image"
    loading="lazy"
    width="300"
    height="400">
```

**Hero Pills — vet (linha ~521):**
```html
<img
    src="./src/img/new_images/vet.png"
    alt="Veterinário profissional"
    class="pill-image"
    loading="lazy"
    width="300"
    height="400">
```

**Hero Pills — cao (linha ~549):**
```html
<img
    src="./src/img/new_images/cao.png"
    alt="Cão feliz"
    class="pill-image"
    loading="lazy"
    width="300"
    height="400">
```

**Hero Pills — gatinho (linha ~562):**
```html
<img
    src="./src/img/new_images/gatinho.png"
    alt="Gatinho adorável"
    class="pill-image"
    loading="lazy"
    width="300"
    height="400">
```

**Navbar logo (linha 439):**
```html
<img src="src/img/icons/logo_signature.svg" alt="PATA Logo" class="navbar-logo" width="95" height="32">
```

**Todos os ícones SVG pequenos — adicionar width/height:**
```html
<!-- Padrão para ícones SVG inline que faltam -->
<img src="./src/img/icons/AI.svg" alt="AI" width="54" height="54">
<img src="./src/img/icons/24_7.svg" alt="24/7" width="54" height="54">
<img src="./src/img/icons/farmacia.svg" alt="Farmacia" width="54" height="54">
<img src="./src/img/icons/marketplace.svg" alt="Marketplace" width="54" height="54">
<img src="./src/img/icons/noturna.svg" alt="Noturna" width="54" height="54">
```

### CSS adicional para prevenir CLS:
Adicionar ao critical CSS inline no `<head>`:
```css
img, video {
    max-width: 100%;
    height: auto;
}

.pill-image {
    aspect-ratio: 3/4;
}

.mockup-image {
    aspect-ratio: 476/952;
}
```

---

## FIX 3: Vídeos — 3.2MB a carregar no page load

### Problema
6 vídeos com `autoplay` mas com `preload="none"` e `data-lazy-video`. O VideoLazyLoader no JS parece estar implementado, MAS os vídeos têm `autoplay` que pode triggerar o download antes do IntersectionObserver atuar.

### Solução
Remover `autoplay` do HTML e deixar o JS controlar:

```html
<!-- ANTES (em todos os 6 vídeos) -->
<video
    class="background-video"
    autoplay
    loop
    muted
    playsinline
    preload="none"
    poster="https://media.pata.care/videos/..."
    data-lazy-video>
    <source src="https://media.pata.care/videos/..." data-src="..." type="video/mp4">
</video>

<!-- DEPOIS -->
<video
    class="background-video"
    loop
    muted
    playsinline
    preload="none"
    poster="https://media.pata.care/videos/..."
    data-lazy-video>
    <source data-src="https://media.pata.care/videos/..." type="video/mp4">
</video>
```

**Mudanças chave:**
1. **Remover `autoplay`** — o JS deve chamar `.play()` via IntersectionObserver
2. **Remover `src` do `<source>`** — manter APENAS `data-src` para que o browser não comece a descarregar
3. O VideoLazyLoader no teu JS já deve tratar de copiar `data-src` → `src` e chamar `.play()`

Isto deve remover ~3MB do initial load.

---

## FIX 4: CSS Loading — FOUC Risk

### Problema
O CSS está a carregar via preload pattern assíncrono:
```html
<link rel="preload" href="./src/css/dist/styles.min.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
```
Isto causa Flash Of Unstyled Content e pode contribuir para CLS.

### Solução
Como o CSS é apenas ~19kB comprimido, carregá-lo de forma síncrona é melhor:

```html
<!-- ANTES -->
<link rel="preload" href="./src/css/dist/styles.min.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="./src/css/dist/styles.min.css"></noscript>

<!-- DEPOIS -->
<link rel="stylesheet" href="./src/css/dist/styles.min.css">
```

O CSS é render-blocking por natureza, e com 19kB é rápido. Torná-lo assíncrono causa mais problemas de CLS do que ganha em FCP.

---

## FIX 5: Preconnects desnecessários

### Problema
Tens preconnects para consentmanager que só carrega 5s depois:
```html
<link rel="preconnect" href="https://cdn.consentmanager.net" crossorigin>
<link rel="preconnect" href="https://c.delivery.consentmanager.net" crossorigin>
```

### Solução
Remover estes dois. Preconnects ocupam recursos de rede para algo que carrega 5s depois. Manter apenas:
```html
<link rel="preconnect" href="https://media.pata.care" crossorigin>
<link rel="preconnect" href="https://fonts.bunny.net" crossorigin>
```

Também remover:
```html
<!-- Remover estes — não carregas nada destes CDNs -->
<link rel="dns-prefetch" href="https://cdnjs.cloudflare.com">
<link rel="dns-prefetch" href="https://unpkg.com">
```

---

## FIX 6: Cloudflare Email Decode Script

### Problema
```html
<script data-cfasync="false" src="/cdn-cgi/scripts/5c5dd728/cloudflare-static/email-decode.min.js"></script>
```
Este script é injetado automaticamente pelo Cloudflare para proteger emails. Se não tens emails expostos no HTML (verificar se `ola@pata.care` está visível), podes desativar.

### Solução
No Cloudflare dashboard: `Scrape Shield > Email Address Obfuscation → OFF`

Se precisares manter o email protegido, não há muito a fazer aqui.

---

## FIX 7: Font Preloading — Só preload o que usas above-the-fold

### Problema
Preloads o font weight 400, mas o hero usa weight 800 (que nem declaras no @font-face).

### Solução
O browser vai usar 700 como fallback para 800. Mantém o preload do 400 mas verifica se realmente precisas das 3 variantes carregando todas upfront.

---

## FIX 8: Cloudflare Settings Recomendados

Dado que o Auto Minify e Brotli já não estão visíveis (foram descontinuados do dashboard novo), aqui está o que verificar:

1. **Speed > Optimization > Content Optimization:**
   - Early Hints: ON
   - HTTP/2 Prioritization: ON (se disponível no teu plano)
   
2. **Speed > Optimization > Rocket Loader: OFF** ← IMPORTANTE

3. **Caching > Configuration:**
   - Browser Cache TTL: 1 month (para assets estáticos)
   
4. **Rules > Page Rules** (cria uma para assets):
   - `pata.care/src/*` → Cache Level: Cache Everything, Edge TTL: 1 month

5. **Nota:** Brotli está ativado por defeito em todos os planos Cloudflare desde 2023. Não precisas ativá-lo manualmente.

---

## RESUMO DE AÇÕES — Checklist

### Prioridade 1 (Maior impacto — faz HOJE):
- [ ] **Desativar Rocket Loader** no Cloudflare
- [ ] **Aumentar delay** do consentmanager para 5s com `data-cfasync="false"`
- [ ] **Remover `autoplay` e `src`** dos 6 `<video>` (manter só `data-src`)

### Prioridade 2 (CLS fixes — faz HOJE):
- [ ] **Adicionar `width`/`height`** às 33 imagens sem dimensões
- [ ] **Adicionar `fetchpriority="high"`** ao mockup LCP image
- [ ] **Mudar CSS de async para sync** (remover preload pattern)

### Prioridade 3 (Nice-to-have):
- [ ] Remover preconnects desnecessários (consentmanager, cdnjs, unpkg)
- [ ] Configurar Page Rules no Cloudflare para cache de assets
- [ ] Considerar desativar Email Obfuscation no Cloudflare
- [ ] Ativar Early Hints no Cloudflare

### Impacto esperado:
- **TBT:** 8.1s → <1s (Rocket Loader OFF + consent delay)
- **CLS:** 0.337 → <0.1 (width/height + sync CSS)
- **Transfer:** 4.38MB → ~1.2MB (vídeos lazy corretos)
- **Score:** 48 → **75-90** estimado
