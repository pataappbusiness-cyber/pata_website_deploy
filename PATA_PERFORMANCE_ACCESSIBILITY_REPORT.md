
























# 🚀 PATA.CARE — Relatório de Otimização de Performance & Acessibilidade

**Score Atual Performance:** 75/100 (PageSpeed Insights)
**Objetivo Performance:** 90+/100
**Data:** 9 de Fevereiro de 2026
**Website:** https://pata.care

---

# 📊 PARTE 1: PERFORMANCE

## Resumo dos Problemas de Performance

| Problema | Poupança Estimada | Impacto | Prioridade |
|----------|-------------------|---------|------------|
| Cache lifetimes ineficientes | ~559 KiB | LCP, FCP | 🔴 Alta |
| Imagens não otimizadas | ~194 KiB | LCP, FCP | 🔴 Alta |
| JavaScript não utilizado (GTM) | ~57 KiB | LCP, FCP | 🟡 Média |
| Network dependency tree (fonts) | 670ms latência | LCP | 🔴 Alta |
| Forced reflow (JS) | 112ms | Unscored | 🟡 Média |
| LCP fetchpriority não aplicado | — | LCP | 🟡 Média |
| 72 animações não-composited | — | Unscored | 🟢 Baixa |
| 5 long main-thread tasks | — | Unscored | 🟢 Baixa |

---

## 🔴 PRIORIDADE 1: Cache Lifetimes (Poupança ~559 KiB)

### Problema
Todos os assets estáticos de `pata.care` têm Cache TTL de apenas **10 minutos**. Imagens, SVGs, CSS e JS minificados raramente mudam e devem ter cache muito mais longo. Os assets de `media.pata.care` (vídeos/posters) têm 4h, mas também podem ser melhorados.

### Solução — Configuração de Cache Headers

**Prompt para Claude Code:**

```
Preciso de configurar cache headers adequados para o website pata.care.

Contexto:
- O site está servido por [INDICAR: Netlify/Vercel/Nginx/Apache/Cloudflare]
- Os assets estáticos (imagens, SVGs, CSS, JS) têm cache TTL de apenas 10 minutos
- Os vídeos/posters em media.pata.care têm cache de 4 horas

Objetivos:
1. Assets estáticos imutáveis (com hash no filename): Cache-Control: public, max-age=31536000, immutable
2. Imagens/SVGs sem hash: Cache-Control: public, max-age=2592000 (30 dias)
3. CSS/JS minificados: Cache-Control: public, max-age=2592000 (30 dias)
4. Vídeos e posters: Cache-Control: public, max-age=604800 (7 dias)
5. HTML: Cache-Control: public, max-age=3600, must-revalidate (1 hora)

Ficheiros afetados e TTL recomendado:
- /src/img/icons/*.svg → 30 dias
- /src/img/new_images/*.webp → 30 dias
- /src/img/images/*.webp → 30 dias
- /dist/styles.min.css → 30 dias (ou 1 ano se tiver hash)
- /dist/scripts-critical.min.js → 30 dias (ou 1 ano se tiver hash)
- /dist/scripts-deferred.min.js → 30 dias (ou 1 ano se tiver hash)
- /videos/*.mp4, *.jpg → 7 dias

Cria a configuração necessária para o meu servidor/plataforma de hosting.
Se possível, implementa cache-busting com hashes nos filenames dos CSS/JS.
```

---

## 🔴 PRIORIDADE 2: Otimização de Imagens (Poupança ~194 KiB)

### Problema
As imagens são servidas em tamanhos maiores do que os necessários para a sua área de exibição:

| Imagem | Tamanho Real | Tamanho Exibido | Poupança |
|--------|-------------|-----------------|----------|
| mockup_no_bg.webp | 928×1000 | 400×431 | 79.6 KiB |
| PATA_APP.webp | 1031×861 | 350×292 | 60.6 KiB |
| problem1_video2_poster.jpg | 720×861 | 412×732 | 20.1 KiB |
| Video posters (JPG) | Vários | Vários | ~18.4 KiB |

Além disso, os video posters estão em **JPG** quando deviam ser **WebP/AVIF**.

### Solução — Responsive Images + Formato Moderno

**Prompt para Claude Code:**

```
Preciso de otimizar as imagens do website pata.care para performance.

Tarefas:

1. RESPONSIVE IMAGES - Gerar múltiplos tamanhos com srcset:

Para mockup_no_bg.webp (hero image, atualmente 928x1000, exibida a 400x431):
- Gerar versões: 400w, 600w, 800w, 1000w
- Implementar <img srcset="..."> com sizes attribute adequado
- Manter loading="eager" e fetchpriority="high" (é LCP element)

Para PATA_APP.webp (atualmente 1031x861, exibida a 350x292):
- Gerar versões: 350w, 500w, 700w, 1031w
- Implementar com loading="lazy" (não é above-the-fold)

2. CONVERTER VIDEO POSTERS de JPG para WebP:
Ficheiros a converter:
- /videos/problem1_video2_poster.jpg
- /videos/3939111-hd_1280_720_24fps_poster.jpg
- /videos/1851002-hd_1280_720_24fps_poster.jpg
- /videos/2849936-hd_1280_720_24fps_poster.jpg
- /videos/6865078-hd_1366_720_25fps_poster.jpg
- /videos/problem1_video1_poster.jpg

Usar qualidade 80 para WebP. Atualizar todas as referências no HTML.

3. Usar <picture> element com AVIF fallback para WebP:
<picture>
  <source srcset="image.avif" type="image/avif">
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" alt="...">
</picture>

4. Gerar script de build que automatize a criação de responsive images
   (pode ser um script Node.js com sharp ou um script bash com imagemagick)
```

---

## 🔴 PRIORIDADE 3: Network Dependency Tree — Fonts (670ms latência)

### Problema
O critical path mostra:
```
pata.care (194ms) 
  → mona-sans-latin-600-normal.woff2 (668ms) 
  → mona-sans-latin-700-normal.woff2 (670ms) 
  → scripts-critical.min.js (428ms)
```

As fonts Mona Sans estão hospedadas em `fonts.bunny.net` sem preconnect, causando 670ms de latência no critical path. Não há preconnected origins configurados.

### Solução — Preload Fonts + Self-Hosting

**Prompt para Claude Code:**

```
Preciso de otimizar o carregamento das fonts Mona Sans no pata.care.

Problema atual:
- Fonts carregam de fonts.bunny.net com ~670ms de latência
- Sem preconnect headers configurados
- Bloqueia o LCP (Largest Contentful Paint)

Soluções a implementar (por ordem de preferência):

OPÇÃO A — Self-host das fonts (RECOMENDADO):
1. Descarregar mona-sans-latin-600-normal.woff2 e mona-sans-latin-700-normal.woff2
2. Colocá-las em /fonts/ no próprio servidor
3. Criar @font-face com font-display: swap
4. Remover referência a fonts.bunny.net
5. Adicionar preload no <head>:
   <link rel="preload" href="/fonts/mona-sans-latin-600-normal.woff2" as="font" type="font/woff2" crossorigin>
   <link rel="preload" href="/fonts/mona-sans-latin-700-normal.woff2" as="font" type="font/woff2" crossorigin>

OPÇÃO B — Se self-host não for possível:
1. Adicionar preconnect no <head> ANTES de qualquer outro recurso:
   <link rel="preconnect" href="https://fonts.bunny.net" crossorigin>
   <link rel="dns-prefetch" href="https://fonts.bunny.net">
2. Adicionar preload das fonts específicas

Em ambos os casos, garantir font-display: swap no @font-face para evitar FOIT.
```

---

## 🟡 PRIORIDADE 4: LCP Image — fetchpriority

### Problema
A imagem LCP (mockup_no_bg.webp) já tem `loading="eager"` mas falta `fetchpriority="high"`.

### Solução

**Prompt para Claude Code:**

```
Na imagem hero do pata.care (mockup_no_bg.webp), adicionar fetchpriority="high":

Código atual:
<img src="https://pata.care/src/img/new_images/mockup_no_bg.webp" 
     alt="PATA App" class="mockup-image" 
     loading="eager" width="476" height="952">

Código corrigido:
<img src="https://pata.care/src/img/new_images/mockup_no_bg.webp" 
     alt="PATA App" class="mockup-image" 
     loading="eager" width="476" height="952" 
     fetchpriority="high">

Isto já aparece no audit como parcialmente implementado mas precisa confirmação.
Verificar se o atributo está presente no HTML final servido.
```

---

## 🟡 PRIORIDADE 5: Reduzir JavaScript Não Utilizado (Poupança ~57 KiB)

### Problema
O Google Tag Manager (143.1 KiB transferido) tem ~57 KiB de código não utilizado. Também causa forced reflows (76ms do gtag, 111ms total do scripts-critical.min.js).

### Solução

**Prompt para Claude Code:**

```
Otimizar o carregamento do Google Tag Manager no pata.care.

Problemas:
- GTM (143.1 KiB) tem ~57 KiB de JS não utilizado
- Causa forced reflows de 76ms
- ID do GTM: G-JD85N7J78Y

Soluções a implementar:

1. DEFER GTM - Carregar após o conteúdo principal:
   Mover o script GTM para carregar depois do evento load:
   
   <script>
   window.addEventListener('load', function() {
     setTimeout(function() {
       var script = document.createElement('script');
       script.src = 'https://www.googletagmanager.com/gtag/js?id=G-JD85N7J78Y';
       script.async = true;
       document.head.appendChild(script);
       script.onload = function() {
         window.dataLayer = window.dataLayer || [];
         function gtag(){dataLayer.push(arguments);}
         gtag('js', new Date());
         gtag('config', 'G-JD85N7J78Y');
       };
     }, 2000); // 2s delay para não impactar métricas
   });
   </script>

2. ALTERNATIVA — Usar Partytown para mover GTM para web worker:
   Se o site usar framework, considerar Partytown para isolar third-party scripts.

3. Verificar se todos os tags no GTM container são necessários.
   Remover tags e triggers não utilizados no painel GTM.
```

---

## 🟡 PRIORIDADE 6: Forced Reflows (112ms total)

### Problema
JavaScript força reflows ao consultar propriedades geométricas (offsetWidth, etc.) após mudar estilos:

| Fonte | Tempo de Reflow |
|-------|----------------|
| gtag (Google Tag Manager) | 76ms |
| scripts-critical.min.js:1:240 | 45ms |
| scripts-critical.min.js:1:361 | 66ms |
| [unattributed] | 31ms |

### Solução

**Prompt para Claude Code:**

```
Investigar e corrigir forced reflows no pata.care.

O ficheiro scripts-critical.min.js causa 111ms de forced reflows 
nas linhas 240 e 361 (minificado).

Tarefas:
1. Deminificar scripts-critical.min.js para identificar o código que causa reflows
2. Procurar padrões de leitura após escrita do DOM, como:
   - element.offsetWidth/offsetHeight após mudar style
   - getBoundingClientRect() dentro de loops
   - Leitura de scroll position após mudanças de layout
3. Aplicar padrão read-then-write: agrupar todas as leituras antes das escritas
4. Usar requestAnimationFrame() para batch de mudanças visuais
5. Considerar usar transform/opacity em vez de propriedades que causam layout
6. Re-minificar após correções
```

---

## 🟢 PRIORIDADE 7: Animações Não-Composited (72 encontradas)

### Problema
72 elementos animados não estão a usar propriedades composited (transform, opacity), forçando o browser a fazer repaint/reflow em cada frame.

### Solução

**Prompt para Claude Code:**

```
Otimizar as 72 animações não-composited no pata.care.

Regras para animações performantes:
1. Usar APENAS transform e opacity para animações (propriedades composited)
2. Evitar animar: width, height, top, left, margin, padding, border
3. Adicionar will-change: transform em elementos que vão ser animados
4. Usar contain: layout em containers de animação

Exemplos de substituição:
- Em vez de: animation: fadeIn { from { display: none } to { display: block } }
  Usar: animation: fadeIn { from { opacity: 0 } to { opacity: 1 } }

- Em vez de: animation: slideIn { from { left: -100px } to { left: 0 } }
  Usar: animation: slideIn { from { transform: translateX(-100px) } to { transform: translateX(0) } }

Analisar styles.min.css e identificar todas as animações que usam 
propriedades não-composited. Refatorar para usar transform/opacity.
```

---
---

# ♿ PARTE 2: ACESSIBILIDADE

## Resumo dos Problemas de Acessibilidade

| Problema | Categoria | Impacto | Prioridade |
|----------|-----------|---------|------------|
| Botões sem nome acessível | Names & Labels | Screen readers não conseguem ler | 🔴 Alta |
| Contraste insuficiente (múltiplos elementos) | Contrast | Texto ilegível para baixa visão | 🔴 Alta |
| Headings fora de ordem sequencial | Navigation | Estrutura semântica quebrada | 🔴 Alta |
| Vídeos sem legendas/captions | Audio & Video | Inacessível para surdos | 🟡 Média |
| Itens unscored a verificar manualmente | Various | Potenciais melhorias | 🟢 Baixa |

---

## 🔴 A11Y-1: Botões Sem Nome Acessível (Names & Labels)

### Problema
O botão de toggle da navbar (`button#navbarToggle` com class `navbar-toggle`) não tem um nome acessível. Screen readers anunciam-no apenas como "button", tornando-o inutilizável para utilizadores de tecnologias assistivas.

Elemento afetado:
```
body > header.navbar > div.navbar-menu-container > button#navbarToggle
<button class="navbar-toggle" id="navbarToggle">
```

### Solução

**Prompt para Claude Code:**

```
Corrigir acessibilidade do botão de menu mobile no pata.care.

Problema:
- O botão navbar-toggle (button#navbarToggle) não tem nome acessível
- Screen readers anunciam apenas "button" sem contexto

Correções a aplicar:

1. Adicionar aria-label ao botão de toggle:
   
   Código atual:
   <button class="navbar-toggle" id="navbarToggle">
     <!-- ícone hamburger -->
   </button>
   
   Código corrigido:
   <button class="navbar-toggle" id="navbarToggle" 
           aria-label="Abrir menu de navegação" 
           aria-expanded="false"
           aria-controls="navbarMenu">
     <!-- ícone hamburger -->
   </button>

2. Adicionar toggle do aria-expanded via JavaScript:
   Quando o menu abre: aria-expanded="true"
   Quando o menu fecha: aria-expanded="false"
   
   Exemplo JS:
   const toggle = document.getElementById('navbarToggle');
   toggle.addEventListener('click', function() {
     const expanded = this.getAttribute('aria-expanded') === 'true';
     this.setAttribute('aria-expanded', !expanded);
     this.setAttribute('aria-label', expanded ? 'Abrir menu de navegação' : 'Fechar menu de navegação');
   });

3. Verificar se existem OUTROS botões sem nome acessível no site.
   Procurar por todos os <button> e <a role="button"> sem:
   - Texto visível dentro do elemento
   - aria-label
   - aria-labelledby
   - title attribute
```

---

## 🔴 A11Y-2: Contraste Insuficiente (Contrast)

### Problema
Múltiplos elementos de texto não têm ratio de contraste suficiente entre foreground e background. Texto com baixo contraste é difícil ou impossível de ler para muitos utilizadores. O ratio mínimo WCAG AA é 4.5:1 para texto normal e 3:1 para texto grande.

Elementos afetados (identificados no audit):

| Elemento | Class | Secção |
|----------|-------|--------|
| "Imagine isto:" | `h4.problem2-title` | section#problem2 |
| "São 3h da manhã..." (parágrafo) | `p.problem2-story` | section#problem2 |
| "Volta a dormir..." | `h3.problem2-conclusion` | section#problem2 |
| "Custo total:" | `h4.problem2-cost-label` | section#problem2 |
| "€187" | `h2.problem2-cost-value` | section#problem2 |
| "€187" (box) | `div.problem2-cost-box` | section#problem2 |
| "Faça as contas" | `h1.solution1-title` | section#solution1 |
| "Solução" | `h6.solution4-label` | section#solution4 |

### Solução

**Prompt para Claude Code:**

```
Corrigir problemas de contraste de cor no pata.care para cumprir WCAG AA.

Problema:
- Múltiplos elementos de texto falham o ratio de contraste mínimo WCAG AA (4.5:1)
- Afeta principalmente a secção "problem2" e secções de soluções

Requisitos WCAG AA:
- Texto normal (<18px ou <14px bold): ratio mínimo 4.5:1
- Texto grande (≥18px ou ≥14px bold): ratio mínimo 3:1

Elementos a corrigir (verificar e ajustar cores):

1. SECÇÃO PROBLEM2 (section#problem2, class="section-wrapper"):
   - h4.problem2-title ("Imagine isto:")
   - p.problem2-story ("São 3h da manhã...")
   - h3.problem2-conclusion ("Volta a dormir...")
   - h4.problem2-cost-label ("Custo total:")
   - h2.problem2-cost-value ("€187")
   - div.problem2-cost-box ("€187")

2. SECÇÃO SOLUTION1:
   - h1.solution1-title ("Faça as contas")

3. SECÇÃO SOLUTION4:
   - h6.solution4-label ("Solução")

Tarefas:
1. Identificar as cores atuais (foreground e background) de cada elemento afetado
2. Usar uma ferramenta de contraste (ex: https://webaim.org/resources/contrastchecker/) 
   para calcular o ratio atual
3. Ajustar as cores mantendo a identidade visual PATA:
   - Opção A: Escurecer o texto (aumentar foreground contrast)
   - Opção B: Clarear/escurecer o background
   - Opção C: Adicionar text-shadow ou background overlay para melhorar legibilidade
4. Garantir ratio mínimo 4.5:1 para todo o texto normal
5. Testar com Chrome DevTools > Rendering > "Emulate vision deficiencies"

IMPORTANTE: Manter a identidade visual da marca PATA (laranja #FF943D, teal #4ECDC4)
mas ajustar tonalidades onde necessário para cumprir WCAG AA.
Texto branco sobre fundos claros é o problema mais comum — considerar 
fundos mais escuros ou texto mais escuro.
```

---

## 🔴 A11Y-3: Headings Fora de Ordem Sequencial (Navigation)

### Problema
Os heading elements (h1-h6) não seguem uma ordem sequencial descendente. Headings que saltam níveis (ex: h2 → h4 → h6) quebram a estrutura semântica da página, dificultando a navegação por tecnologias assistivas.

Elementos identificados com ordem incorreta:

| Texto | Tag Atual | Class | Problema |
|-------|-----------|-------|----------|
| "Neste momento, uma urgência veterinária noturna custa:" | h3 | — | Salto de nível |
| "da consulta." | h4 | problem2-cost-label | Salto de nível |
| "Mas amar não paga consultas..." | h4 | problem3-subtitle | — |
| "Custo médio de urgência veterinária noturna" | h6 | problem3-stat-label | Salto h4→h6 |
| "Custo médio de um caso de emergência completo" | h6 | problem3-stat-label | Salto h4→h6 |
| "Dos lares portugueses têm animais — 6,7 milhões de patudos" | h6 | problem3-stat-label | — |
| "Tutores portugueses inquiridos" | h4 | validation-label | — |
| "Usariam videoconsulta veterinária" | h4 | validation-label | — |
| "Já adiaram consulta por causa do custo" | h4 | validation-label | — |
| """ (quote mark) | h5 | testimonial-quote-mark | Decorativo, não deveria ser heading |
| "Sem PATA" / "Com PATA Premium Anual" | h4 | solution1-card-label | — |
| "Poupança anual mínima:" | h4 | — | — |
| "Cada solução tem o seu lugar..." | h4 | solution2-subtitle | — |
| "Disponibilidade" | h6 | — | Salto h4→h6 |
| "Se não precisar, não perde." | h4 | solution3-card-title | — |
| "Passou 6 meses sem realizar consultas?" | h6 | solution3-text-regular | Salto |
| "para a loja PATA." | h4 | solution3-credit-outro | — |
| "Clínica PATA" | h4 | clinica-title | — |
| "Não são clientes. São co-criadores." | h4 | joinus1-subtitle | — |
| "Uma única urgência veterinária noturna" | h6 | card-label | Salto |
| "Com PATA, esse valor paga" | h6 | card-label | Salto |
| "meses de subscrição" | h6 | price-subtitle | Salto |
| "/mês" (múltiplos) | h6 | price-suffix | Decorativo, não deveria ser heading |
| "imediatamente" | h5 | plan-title | — |
| "Subscrição Anual" | h6 | plan-badge-text | Decorativo |
| "€95,88/ano = €7,99/mês para sempre" | h5 | plan-title | — |
| "consulta" | h5 | plan-title | — |
| "Se esperar:" | h6 | warning-card-title | — |
| "O que acontece depois:" | h4 | reservar-card-title | — |

### Solução

**Prompt para Claude Code:**

```
Corrigir a hierarquia de headings no pata.care para cumprir WCAG.

Problema:
- Headings saltam níveis (ex: h2 → h4 → h6, sem h3 ou h5 intermédios)
- Elementos decorativos usam tags de heading quando deviam usar <span> ou <p>
- A estrutura semântica da página está quebrada para screen readers

Regras WCAG para headings:
- Headings devem seguir ordem sequencial: h1 → h2 → h3 → h4 → h5 → h6
- Nunca saltar níveis (ex: h2 → h4 é inválido, deve ter h3 entre eles)
- Elementos decorativos/visuais NÃO devem usar tags de heading
- Cada página deve ter exatamente um h1

Correções necessárias:

1. ELEMENTOS DECORATIVOS — Mudar de heading para <span> ou <p>:
   - h5.testimonial-quote-mark (""") → <span class="testimonial-quote-mark" aria-hidden="true">"</span>
   - h6.price-suffix ("/mês") → <span class="price-suffix">/mês</span>
   - h6.plan-badge-text ("Subscrição Anual") → <span class="plan-badge-text">Subscrição Anual</span>

2. REESTRUTURAR HIERARQUIA — Definir estrutura semântica correcta:
   
   Estrutura proposta para a página:
   
   h1: Título principal da página (hero section)
   ├── h2: Secção Problem (problema veterinário)
   │   ├── h3: "Imagine isto:" (problem2-title, atualmente h4)
   │   ├── h3: "Neste momento, uma urgência veterinária noturna custa:" (atualmente h3 ✓)
   │   └── h3: "Mas amar não paga consultas..." (problem3-subtitle, atualmente h4)
   │       ├── h4: Stats labels (problem3-stat-label, atualmente h6)
   │       └── h4: Validation labels (validation-label, atualmente h4)
   ├── h2: Secção Solutions
   │   ├── h3: "Faça as contas" (solution1-title, atualmente h1 — MOVER para h3)
   │   │   └── h4: Card labels (solution1-card-label)
   │   ├── h3: "Cada solução tem o seu lugar..." (solution2-subtitle, atualmente h4)
   │   │   └── h4: Feature labels
   │   └── h3: "Se não precisar, não perde." (solution3-card-title, atualmente h4)
   ├── h2: Secção Clínica
   │   └── h3: "Clínica PATA" (clinica-title, atualmente h4)
   ├── h2: Secção Pricing
   │   ├── h3: Plan titles (plan-title, atualmente h5)
   │   └── h3: Card labels (card-label, atualmente h6)
   └── h2: Secção CTA / Join Us
       └── h3: "Não são clientes. São co-criadores." (joinus1-subtitle, atualmente h4)

3. MANTER ESTILOS VISUAIS — Ao mudar tags de heading, manter o CSS:
   - Usar classes CSS para manter o aspeto visual
   - Exemplo: h6.problem3-stat-label → h4.problem3-stat-label (atualizar CSS se necessário)
   - Os estilos devem ser baseados em classes, não em tags HTML

4. VERIFICAÇÃO:
   - Instalar extensão HeadingsMap ou similar
   - Verificar que a árvore de headings faz sentido como outline da página
   - Testar com screen reader (NVDA/VoiceOver) para confirmar navegação

NOTA: O h1.solution1-title ("Faça as contas") é problemático — uma página 
deve ter apenas UM h1. Se o hero section já tem h1, este deve ser h2 ou h3.
Verificar quantos h1 existem na página e manter apenas um.
```

---

## 🟡 A11Y-4: Vídeos Sem Legendas/Captions (Audio & Video)

### Problema
Os elementos `<video>` não contêm um elemento `<track>` com `kind="captions"`. Vídeos sem legendas são inacessíveis para utilizadores surdos ou com dificuldades auditivas.

Elemento identificado:
```
section#problem1 > div.left-panel > div.background-container > video.background-video
<video class="background-video" loop="" muted="" playsinline="" 
       preload="none" poster="https://media.pata.care/videos/problem1_video1_poster.jpg">
```

### Solução

**Prompt para Claude Code:**

```
Adicionar suporte a legendas/captions nos vídeos do pata.care.

Problema:
- Elementos <video> não têm <track kind="captions">
- Falha WCAG para acessibilidade de conteúdo audiovisual

Elementos afetados:
- video.background-video em section#problem1 (e possivelmente outros vídeos na página)

Soluções por tipo de vídeo:

1. VÍDEOS DECORATIVOS/BACKGROUND (sem áudio significativo):
   Se os vídeos são puramente decorativos (background ambiance), adicionar:
   
   <video class="background-video" loop muted playsinline preload="none" 
          poster="https://media.pata.care/videos/problem1_video1_poster.jpg"
          aria-hidden="true"
          role="presentation">
     <source src="video.mp4" type="video/mp4">
     <!-- Track vazio para satisfazer audit -->
     <track kind="captions" src="" label="Sem legendas (vídeo decorativo)" default>
   </video>

   Nota: aria-hidden="true" e role="presentation" indicam que o vídeo 
   é decorativo e pode ser ignorado por screen readers.

2. VÍDEOS COM CONTEÚDO INFORMATIVO:
   Se algum vídeo contém informação importante:
   
   a) Criar ficheiro .vtt com legendas:
      Ficheiro: /captions/problem1_video_pt.vtt
      
      WEBVTT
      
      00:00:00.000 --> 00:00:05.000
      [Texto da legenda em português]
   
   b) Adicionar track ao video:
      <track kind="captions" src="/captions/problem1_video_pt.vtt" 
             srclang="pt" label="Português" default>

3. VERIFICAÇÃO:
   - Listar TODOS os elementos <video> na página
   - Classificar cada um como decorativo ou informativo
   - Aplicar a solução adequada a cada um
   - Para vídeos decorativos: aria-hidden + track vazio
   - Para vídeos informativos: criar legendas .vtt reais
```

---

## 🟢 A11Y-5: Itens Manuais a Verificar (Unscored)

### Problema
O audit de acessibilidade identificou vários itens que passaram nos testes automáticos mas requerem verificação manual. Estes itens estão marcados como "Unscored" e são oportunidades de melhoria.

Itens que passaram (verificar manualmente):

| Item | Status | Descrição |
|------|--------|-----------|
| Interactive controls are keyboard focusable | ✓ Unscored | Controlos interativos recebem foco por teclado |
| Interactive elements indicate purpose and state | ✓ Unscored | Links e botões devem ter affordance hints |
| The page has a logical tab order | ✓ Unscored | Tab order segue layout visual |
| Visual order matches DOM order | ✓ Unscored | Ordem visual = ordem no DOM |
| User focus is not accidentally trapped | ✓ Unscored | Foco não fica preso em regiões |
| User focus is directed to new content | ✓ Unscored | Novo conteúdo (modais) recebe foco |
| HTML5 landmark elements improve navigation | ✓ Unscored | Usar main, nav, etc. |
| Offscreen content is hidden from assistive tech | ✓ Unscored | Conteúdo offscreen com display:none ou aria-hidden |
| Custom controls have associated labels | ✓ Unscored | Controlos custom têm labels |
| Custom controls have ARIA roles | ✓ Unscored | Controlos custom têm roles adequados |

### Solução

**Prompt para Claude Code:**

```
Fazer audit manual de acessibilidade ao pata.care nos seguintes pontos.

Para cada item, verificar e corrigir se necessário:

1. LANDMARK ELEMENTS — Verificar que a página usa landmarks HTML5:
   - <header> para o cabeçalho
   - <nav> para navegação principal
   - <main> para conteúdo principal (APENAS UM por página)
   - <footer> para rodapé
   - <section> com aria-label para cada secção principal
   - <aside> para conteúdo lateral (se aplicável)
   
   Verificar: document.querySelectorAll('main').length === 1

2. KEYBOARD NAVIGATION — Testar tab order:
   - Percorrer a página inteira com Tab
   - Verificar que todos os elementos interativos recebem foco
   - Verificar que a ordem faz sentido visual
   - Verificar que nenhum foco fica "preso" (focus trap)
   - Verificar que elementos offscreen não recebem foco

3. FOCUS INDICATORS — Verificar visibilidade do foco:
   - Todos os elementos focáveis devem ter :focus-visible styling
   - Não usar outline: none sem alternativa visível
   - Adicionar se necessário:
     :focus-visible {
       outline: 2px solid #FF943D;
       outline-offset: 2px;
     }

4. SKIP NAVIGATION — Adicionar se não existir:
   <a href="#main-content" class="skip-link">Saltar para conteúdo principal</a>
   
   CSS:
   .skip-link {
     position: absolute;
     top: -40px;
     left: 0;
     background: #FF943D;
     color: white;
     padding: 8px 16px;
     z-index: 100;
     transition: top 0.3s;
   }
   .skip-link:focus {
     top: 0;
   }

5. OFFSCREEN CONTENT — Verificar que conteúdo escondido tem:
   - display: none; OU
   - visibility: hidden; OU  
   - aria-hidden="true"
   Conteúdo posicionado offscreen com transform/left/-9999px 
   DEVE ter aria-hidden se não for relevante.
```

---
---

# 🛡️ PARTE 3: BEST PRACTICES

**Score Atual Best Practices:** 81/100 (Lighthouse)
**Objetivo Best Practices:** 95+/100

## Resumo dos Problemas de Best Practices

| Problema | Categoria | Severidade | Prioridade |
|----------|-----------|------------|------------|
| API deprecated (GTM H1UserAgentFontSizeInSection) | General | Warning | 🟡 Média |
| Sem CSP (Content Security Policy) | Trust & Safety | High | 🔴 Alta |
| Sem HSTS header | Trust & Safety | High | 🔴 Alta |
| Sem COOP header | Trust & Safety | High | 🔴 Alta |
| Sem X-Frame-Options / frame-ancestors | Trust & Safety | High | 🔴 Alta |
| Sem Trusted Types para XSS | Trust & Safety | High | 🟡 Média |

---

## 🔴 BP-1: Content Security Policy (CSP) — Sem Proteção XSS

### Problema
Não foi encontrada nenhuma CSP em modo enforcement. Uma CSP forte reduz significativamente o risco de ataques XSS (Cross-Site Scripting). Severidade: **High**.

### Solução

**Prompt para Claude Code:**

```
Implementar Content Security Policy (CSP) no website pata.care.

Problema:
- Não existe CSP configurada (nem header, nem meta tag)
- O site está vulnerável a ataques XSS
- Lighthouse reporta severidade HIGH

Contexto do site (recursos externos utilizados):
- Google Tag Manager: www.googletagmanager.com, www.google-analytics.com
- Fonts: fonts.bunny.net (ou self-hosted se já migrado)
- Media: media.pata.care
- Imagens: pata.care/src/img/
- Scripts: pata.care/dist/
- Vídeos: media.pata.care/videos/

Tarefas:

1. FASE 1 — CSP em Report-Only (testar sem bloquear):
   Adicionar header HTTP:
   
   Content-Security-Policy-Report-Only: 
     default-src 'self';
     script-src 'self' https://www.googletagmanager.com https://www.google-analytics.com;
     style-src 'self' 'unsafe-inline' https://fonts.bunny.net;
     img-src 'self' https://media.pata.care data:;
     font-src 'self' https://fonts.bunny.net;
     media-src 'self' https://media.pata.care;
     connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com;
     frame-ancestors 'none';
     base-uri 'self';
     form-action 'self';
     report-uri /csp-report;
   
   NOTA: Se o GTM injetar scripts inline, pode ser necessário adicionar 
   'unsafe-inline' ou usar nonces em script-src. Preferir nonces:
   script-src 'self' 'nonce-{RANDOM}' https://www.googletagmanager.com;

2. FASE 2 — Monitorizar Reports:
   - Configurar endpoint /csp-report para receber violações
   - Monitorizar durante 1-2 semanas
   - Ajustar policy baseado nos reports

3. FASE 3 — Ativar Enforcement:
   - Mudar de Content-Security-Policy-Report-Only para Content-Security-Policy
   - Manter report-uri para monitorização contínua

4. IMPLEMENTAÇÃO POR PLATAFORMA:
   
   Se Netlify (_headers ou netlify.toml):
   [[headers]]
     for = "/*"
     [headers.values]
       Content-Security-Policy = "default-src 'self'; script-src 'self' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.bunny.net; img-src 'self' https://media.pata.care data:; font-src 'self' https://fonts.bunny.net; media-src 'self' https://media.pata.care; connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
   
   Se Vercel (vercel.json):
   {
     "headers": [{
       "source": "/(.*)",
       "headers": [{
         "key": "Content-Security-Policy",
         "value": "default-src 'self'; script-src 'self' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.bunny.net; img-src 'self' https://media.pata.care data:; font-src 'self' https://fonts.bunny.net; media-src 'self' https://media.pata.care; connect-src 'self' https://www.google-analytics.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
       }]
     }]
   }
   
   Se Nginx:
   add_header Content-Security-Policy "default-src 'self'; script-src 'self' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.bunny.net; img-src 'self' https://media.pata.care data:; font-src 'self' https://fonts.bunny.net; media-src 'self' https://media.pata.care; connect-src 'self' https://www.google-analytics.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'" always;

   Se Cloudflare (Transform Rules ou Workers):
   Configurar via dashboard ou worker script.

5. VERIFICAÇÃO:
   - Abrir DevTools > Console e verificar que não há CSP violations
   - Testar todas as páginas do site (homepage, about, etc.)
   - Verificar que GTM continua a funcionar
   - Verificar que fonts carregam correctamente
   - Verificar que vídeos e imagens aparecem
   - Re-executar Lighthouse e confirmar que CSP passa
```

---

## 🔴 BP-2: HSTS Header — Sem Proteção de Downgrade HTTP

### Problema
Não foi encontrado header HSTS (HTTP Strict Transport Security). O HSTS reduz significativamente o risco de downgrade de HTTPS para HTTP e eavesdropping. Severidade: **High**.

### Solução

**Prompt para Claude Code:**

```
Implementar HSTS (HTTP Strict Transport Security) no pata.care.

Problema:
- Não existe header HSTS configurado
- Utilizadores podem ser vítimas de ataques man-in-the-middle via HTTP downgrade
- Lighthouse reporta severidade HIGH

Tarefas:

1. FASE 1 — HSTS com max-age baixo (testar):
   Adicionar header:
   Strict-Transport-Security: max-age=86400
   
   (1 dia — para testar que tudo funciona via HTTPS)

2. FASE 2 — Aumentar max-age gradualmente:
   Strict-Transport-Security: max-age=604800
   (1 semana)
   
   Depois:
   Strict-Transport-Security: max-age=2592000
   (30 dias)

3. FASE 3 — HSTS completo com subdomínios e preload:
   Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
   
   (1 ano, inclui subdomínios como media.pata.care)

4. FASE 4 — Submeter ao HSTS Preload List:
   - Verificar pré-requisitos em https://hstspreload.org
   - Submeter pata.care para inclusão nos browsers
   - Isto garante HTTPS forçado mesmo na primeira visita

5. IMPLEMENTAÇÃO POR PLATAFORMA:
   
   Se Netlify:
   [[headers]]
     for = "/*"
     [headers.values]
       Strict-Transport-Security = "max-age=31536000; includeSubDomains; preload"
   
   Se Vercel:
   (HSTS já é incluído por defeito no Vercel, verificar se está ativo)
   
   Se Nginx:
   add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
   
   Se Cloudflare:
   Ativar em SSL/TLS > Edge Certificates > Enable HSTS

6. PRÉ-REQUISITOS:
   - CONFIRMAR que todo o site funciona em HTTPS (incluindo media.pata.care)
   - CONFIRMAR que há redirect de HTTP → HTTPS configurado
   - CONFIRMAR que nenhum recurso é carregado via HTTP (mixed content)
   - Usar DevTools > Security tab para verificar

AVISO: Não ativar includeSubDomains sem garantir que TODOS os subdomínios 
suportam HTTPS. Se media.pata.care não tiver SSL, NÃO usar includeSubDomains 
até resolver.
```

---

## 🔴 BP-3: COOP Header — Sem Isolamento de Origem

### Problema
Não foi encontrado header COOP (Cross-Origin-Opener-Policy). O COOP isola a janela de topo de outros documentos como pop-ups, prevenindo ataques cross-origin. Severidade: **High**.

### Solução

**Prompt para Claude Code:**

```
Implementar COOP (Cross-Origin-Opener-Policy) no pata.care.

Problema:
- Não existe header COOP configurado
- A janela do site pode ser manipulada por documentos cross-origin (pop-ups)
- Lighthouse reporta severidade HIGH

Tarefas:

1. Adicionar header COOP:
   Cross-Origin-Opener-Policy: same-origin
   
   Isto impede que documentos de outras origens abram uma referência 
   à janela do pata.care via window.opener.

2. CONSIDERAÇÕES IMPORTANTES:
   - Se o site abre pop-ups para login (Google OAuth, etc.), verificar 
     que o fluxo de autenticação continua a funcionar
   - Se necessário manter compatibilidade com pop-ups, usar:
     Cross-Origin-Opener-Policy: same-origin-allow-popups
   - Se o site usa window.open() para links externos, testar o comportamento

3. IMPLEMENTAÇÃO POR PLATAFORMA:
   
   Se Netlify:
   [[headers]]
     for = "/*"
     [headers.values]
       Cross-Origin-Opener-Policy = "same-origin"
   
   Se Vercel:
   {
     "headers": [{
       "source": "/(.*)",
       "headers": [{
         "key": "Cross-Origin-Opener-Policy",
         "value": "same-origin"
       }]
     }]
   }
   
   Se Nginx:
   add_header Cross-Origin-Opener-Policy "same-origin" always;

4. TESTAR:
   - Abrir DevTools > Network > verificar que o header aparece nas responses
   - Testar navegação normal do site
   - Testar se links externos continuam a funcionar
   - Testar fluxos de login/OAuth se existirem
```

---

## 🔴 BP-4: X-Frame-Options / frame-ancestors — Sem Proteção Clickjacking

### Problema
Não existe política de controlo de frame. Sem X-Frame-Options ou CSP frame-ancestors, o site pode ser embutido em iframes de outros sites, possibilitando ataques de clickjacking. Severidade: **High**.

### Solução

**Prompt para Claude Code:**

```
Implementar proteção contra clickjacking no pata.care.

Problema:
- Não existe X-Frame-Options header
- Não existe CSP frame-ancestors directive
- O site pode ser embutido em iframes maliciosos para ataques de clickjacking
- Lighthouse reporta severidade HIGH

Tarefas:

1. Adicionar AMBOS os headers (para compatibilidade máxima):
   
   X-Frame-Options: DENY
   Content-Security-Policy: frame-ancestors 'none';
   
   NOTA: Se a CSP já foi adicionada na tarefa BP-1, garantir que 
   frame-ancestors 'none' está incluído. Não duplicar o header CSP.
   
   Se o site precisar ser embutido em iframe nalgum contexto específico 
   (ex: widget de chat, preview), usar:
   X-Frame-Options: SAMEORIGIN
   Content-Security-Policy: frame-ancestors 'self';

2. IMPLEMENTAÇÃO POR PLATAFORMA:
   
   Se Netlify:
   [[headers]]
     for = "/*"
     [headers.values]
       X-Frame-Options = "DENY"
   
   Se Vercel:
   {
     "headers": [{
       "source": "/(.*)",
       "headers": [{
         "key": "X-Frame-Options",
         "value": "DENY"
       }]
     }]
   }
   
   Se Nginx:
   add_header X-Frame-Options "DENY" always;

3. VERIFICAÇÃO:
   - Tentar abrir pata.care num iframe de outra página — deve ser bloqueado
   - Verificar no DevTools > Network que o header aparece
```

---

## 🟡 BP-5: Trusted Types — Sem Proteção DOM XSS

### Problema
Não existe header CSP com directive `require-trusted-types-for` para controlar dados passados a funções sink do DOM (innerHTML, etc.). Isto permite potenciais ataques DOM-based XSS. Severidade: **High** (mas classifico como média porque requer mais trabalho de implementação).

### Solução

**Prompt para Claude Code:**

```
Implementar Trusted Types no pata.care para mitigar DOM XSS.

Problema:
- Não existe directive 'require-trusted-types-for' no CSP
- Funções DOM como innerHTML podem ser exploradas para XSS
- Lighthouse reporta severidade HIGH

AVISO: Trusted Types é uma feature mais avançada e pode quebrar scripts 
de terceiros (GTM, analytics). Implementar com cuidado.

Tarefas:

1. FASE 1 — Audit (apenas report, sem bloquear):
   Adicionar à CSP existente:
   Content-Security-Policy-Report-Only: require-trusted-types-for 'script'; trusted-types default;
   
   Isto vai reportar (sem bloquear) qualquer uso inseguro de DOM sinks.

2. FASE 2 — Criar default policy:
   Adicionar script antes de qualquer outro JavaScript:
   
   <script>
   if (window.trustedTypes && trustedTypes.createPolicy) {
     trustedTypes.createPolicy('default', {
       createHTML: (string) => {
         // Sanitizar HTML — usar DOMPurify se disponível
         return string;
       },
       createScriptURL: (string) => {
         // Permitir apenas URLs de scripts confiáveis
         const allowedHosts = [
           'pata.care',
           'www.googletagmanager.com',
           'www.google-analytics.com'
         ];
         const url = new URL(string, document.baseURI);
         if (allowedHosts.includes(url.host)) {
           return string;
         }
         throw new TypeError('URL de script não permitida: ' + string);
       },
       createScript: (string) => {
         return string;
       }
     });
   }
   </script>

3. FASE 3 — Monitorizar reports:
   - Verificar se GTM ou outros scripts causam violations
   - Ajustar a default policy conforme necessário
   - Só ativar enforcement quando tudo estiver estável

4. FASE 4 — Ativar enforcement:
   Mover de Report-Only para enforcement:
   Content-Security-Policy: require-trusted-types-for 'script'; trusted-types default;
   
   Adicionar à CSP existente (não criar header CSP separado).

5. NOTA SOBRE GTM:
   O Google Tag Manager pode não ser compatível com Trusted Types por defeito.
   Se causar problemas:
   - Adicionar 'goog#html' às trusted-types: trusted-types default goog#html;
   - Ou manter Trusted Types apenas em Report-Only até GTM suportar
```

---

## 🟡 BP-6: API Deprecated — Google Tag Manager

### Problema
O Google Tag Manager utiliza uma API deprecated (`H1UserAgentFontSizeInSection`). APIs deprecated serão eventualmente removidas dos browsers. Isto é um warning (não erro) e a correção depende da Google atualizar o GTM.

### Solução

**Prompt para Claude Code:**

```
Verificar e mitigar o uso de APIs deprecated pelo Google Tag Manager no pata.care.

Problema:
- GTM (G-JD85N7J78Y) usa API deprecated: H1UserAgentFontSizeInSection
- Fonte: /gtag/js?id=G-JD85N7J78Y (www.googletagmanager.com)
- Lighthouse mostra 1 warning em "Uses deprecated APIs"

Tarefas:

1. VERIFICAR versão do GTM:
   - Aceder ao Google Tag Manager (tagmanager.google.com)
   - Verificar se há atualizações pendentes no container
   - Publicar nova versão do container se possível

2. VERIFICAR snippet de instalação:
   - Comparar o snippet atual com o recomendado pela Google:
     https://developers.google.com/tag-platform/tag-manager/web
   - Atualizar se estiver desatualizado

3. ALTERNATIVA — Migrar para gtag.js direto:
   Se o GTM é usado apenas para Google Analytics, considerar remover 
   o GTM e usar gtag.js diretamente:
   
   <script async src="https://www.googletagmanager.com/gtag/js?id=G-JD85N7J78Y"></script>
   <script>
     window.dataLayer = window.dataLayer || [];
     function gtag(){dataLayer.push(arguments);}
     gtag('js', new Date());
     gtag('config', 'G-JD85N7J78Y');
   </script>
   
   Nota: Isto só faz sentido se não houver outros tags no GTM container.

4. MONITORIZAR:
   - Esta deprecation é controlada pela Google, não pelo nosso código
   - Verificar periodicamente se o GTM foi atualizado
   - Manter o snippet de GTM sempre na versão mais recente

NOTA: Este problema tem impacto limitado no score (é apenas 1 warning).
A Google provavelmente vai corrigir nas próximas versões do GTM.
Prioridade baixa comparada com os security headers.
```

---

## 🔴 BP-BONUS: Consolidação de Security Headers

### Problema
Todos os problemas de Trust & Safety (BP-1 a BP-5) podem ser resolvidos de forma consolidada numa única configuração de headers.

### Solução — Configuração Consolidada

**Prompt para Claude Code:**

```
Configurar TODOS os security headers necessários para pata.care de uma vez.

Problema:
- Faltam múltiplos security headers: CSP, HSTS, COOP, X-Frame-Options, Trusted Types
- Lighthouse Best Practices score: 81/100
- Objectivo: 95+/100

HEADERS A CONFIGURAR (todos numa única configuração):

1. Content-Security-Policy
2. Strict-Transport-Security
3. Cross-Origin-Opener-Policy  
4. X-Frame-Options
5. X-Content-Type-Options (bonus, previne MIME sniffing)
6. Referrer-Policy (bonus, protege privacidade)
7. Permissions-Policy (bonus, controla APIs do browser)

CONFIGURAÇÃO COMPLETA POR PLATAFORMA:

--- NETLIFY (netlify.toml) ---

[[headers]]
  for = "/*"
  [headers.values]
    Content-Security-Policy = "default-src 'self'; script-src 'self' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.bunny.net; img-src 'self' https://media.pata.care data:; font-src 'self' https://fonts.bunny.net; media-src 'self' https://media.pata.care; connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
    Strict-Transport-Security = "max-age=31536000; includeSubDomains; preload"
    Cross-Origin-Opener-Policy = "same-origin"
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=(), payment=()"

--- VERCEL (vercel.json) ---

{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Content-Security-Policy", "value": "default-src 'self'; script-src 'self' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.bunny.net; img-src 'self' https://media.pata.care data:; font-src 'self' https://fonts.bunny.net; media-src 'self' https://media.pata.care; connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'" },
        { "key": "Strict-Transport-Security", "value": "max-age=31536000; includeSubDomains; preload" },
        { "key": "Cross-Origin-Opener-Policy", "value": "same-origin" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=(), payment=()" }
      ]
    }
  ]
}

--- NGINX ---

# Security Headers - pata.care
add_header Content-Security-Policy "default-src 'self'; script-src 'self' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.bunny.net; img-src 'self' https://media.pata.care data:; font-src 'self' https://fonts.bunny.net; media-src 'self' https://media.pata.care; connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
add_header Cross-Origin-Opener-Policy "same-origin" always;
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=()" always;

--- APACHE (.htaccess) ---

Header always set Content-Security-Policy "default-src 'self'; script-src 'self' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.bunny.net; img-src 'self' https://media.pata.care data:; font-src 'self' https://fonts.bunny.net; media-src 'self' https://media.pata.care; connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
Header always set Cross-Origin-Opener-Policy "same-origin"
Header always set X-Frame-Options "DENY"
Header always set X-Content-Type-Options "nosniff"
Header always set Referrer-Policy "strict-origin-when-cross-origin"
Header always set Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=()"

VERIFICAÇÃO APÓS IMPLEMENTAÇÃO:
1. Verificar headers em https://securityheaders.com/?q=pata.care
2. Verificar CSP em https://csp-evaluator.withgoogle.com/
3. Re-executar Lighthouse Best Practices audit
4. Testar TODA a funcionalidade do site (GTM, fonts, vídeos, imagens)
5. Verificar que não há erros na Console do DevTools

NOTA: Ajustar a CSP conforme necessário se fonts já estiverem self-hosted
(remover fonts.bunny.net e adicionar path local).
```

---

# 📋 Checklist de Implementação Completa

## Fase 1 — Quick Wins Performance (1-2 horas)
- [ ] Adicionar `fetchpriority="high"` na imagem LCP
- [ ] Adicionar `<link rel="preconnect">` para fonts.bunny.net
- [ ] Defer GTM loading com setTimeout de 2s

## Fase 2 — Quick Wins Acessibilidade (1-2 horas)
- [ ] Adicionar `aria-label` ao botão navbar-toggle
- [ ] Adicionar `aria-expanded` toggle ao menu mobile
- [ ] Adicionar `fetchpriority="high"` na imagem LCP
- [ ] Adicionar skip navigation link
- [ ] Adicionar `:focus-visible` styling global

## Fase 3 — Cache & Fonts (2-4 horas)
- [ ] Configurar cache headers adequados no servidor
- [ ] Self-host fonts Mona Sans (eliminar fonts.bunny.net)
- [ ] Preload fonts self-hosted

## Fase 4 — Contraste & Headings (3-5 horas)
- [ ] Auditar e corrigir contraste em TODOS os elementos identificados
- [ ] Reestruturar hierarquia de headings (h1-h6 sequencial)
- [ ] Converter elementos decorativos de headings para span/p
- [ ] Verificar que existe apenas um h1 por página

## Fase 5 — Imagens (3-5 horas)
- [ ] Gerar responsive images (srcset) para hero images
- [ ] Converter video posters de JPG para WebP
- [ ] Implementar `<picture>` com AVIF fallback
- [ ] Criar script de build para automação

## Fase 6 — Vídeos & Multimedia (2-3 horas)
- [ ] Classificar vídeos como decorativos ou informativos
- [ ] Adicionar aria-hidden a vídeos decorativos
- [ ] Adicionar tracks/captions a vídeos informativos
- [ ] Verificar que posters têm alt text adequado

## Fase 7 — JavaScript & Animações (4-6 horas)
- [ ] Investigar e corrigir forced reflows
- [ ] Otimizar animações para propriedades composited
- [ ] Audit GTM tags e remover não utilizados

## Fase 8 — Security Headers / Best Practices (2-4 horas)
- [ ] Implementar CSP (Content Security Policy) — começar em Report-Only
- [ ] Adicionar HSTS header (começar com max-age baixo, escalar gradualmente)
- [ ] Adicionar COOP header (Cross-Origin-Opener-Policy: same-origin)
- [ ] Adicionar X-Frame-Options: DENY (proteção clickjacking)
- [ ] Adicionar X-Content-Type-Options: nosniff
- [ ] Adicionar Referrer-Policy: strict-origin-when-cross-origin
- [ ] Adicionar Permissions-Policy (desativar APIs não usadas)
- [ ] Verificar headers em securityheaders.com
- [ ] Testar que GTM, fonts, vídeos e imagens continuam a funcionar

## Fase 9 — Best Practices Avançadas (2-3 horas)
- [ ] Monitorizar CSP reports e ajustar policy
- [ ] Mover CSP de Report-Only para enforcement
- [ ] Implementar Trusted Types (começar em Report-Only)
- [ ] Verificar e atualizar snippet GTM para resolver API deprecated
- [ ] Aumentar HSTS max-age para 1 ano e submeter ao preload list
- [ ] Validar CSP em https://csp-evaluator.withgoogle.com/

## Fase 10 — Audit Manual Acessibilidade (2-3 horas)
- [ ] Verificar landmarks HTML5 (main, nav, header, footer)
- [ ] Testar keyboard navigation completa (tab through)
- [ ] Verificar focus indicators em todos os interativos
- [ ] Confirmar offscreen content está hidden de assistive tech
- [ ] Testar com screen reader (VoiceOver/NVDA)

---

# 🎯 Resultados Esperados

## Performance

| Métrica | Antes | Depois (estimado) |
|---------|-------|-------------------|
| Performance Score | 75 | 90+ |
| LCP | ~2.5s+ | <1.5s |
| Cache savings | 0 | ~559 KiB por revisita |
| Image savings | 0 | ~194 KiB |
| JS savings | 0 | ~57 KiB |
| Critical path | 670ms | <200ms (self-hosted fonts) |

## Acessibilidade

| Métrica | Antes | Depois (estimado) |
|---------|-------|-------------------|
| Botões sem nome | 1+ failing | 0 failing |
| Contraste insuficiente | 8+ elementos | 0 failing |
| Heading order | 20+ incorretos | Hierarquia sequencial |
| Vídeos sem captions | 1+ failing | 0 failing (tracks adicionados) |
| Landmarks | A verificar | main, nav, header, footer presentes |
| Skip navigation | Ausente | Implementado |

## Best Practices

| Métrica | Antes | Depois (estimado) |
|---------|-------|-------------------|
| Best Practices Score | 81 | 95+ |
| CSP | Ausente | Enforcement ativo |
| HSTS | Ausente | max-age 1 ano + preload |
| COOP | Ausente | same-origin |
| X-Frame-Options | Ausente | DENY |
| X-Content-Type-Options | Ausente | nosniff |
| Referrer-Policy | Ausente | strict-origin-when-cross-origin |
| Permissions-Policy | Ausente | APIs não usadas desativadas |
| SecurityHeaders.com Grade | F (estimado) | A+ |
| APIs deprecated | 1 warning (GTM) | 0-1 (depende da Google) |

---

# ⚠️ Notas Importantes

1. **Antes de começar**, indicar ao Claude Code qual é a plataforma de hosting (Netlify, Vercel, servidor VPS, etc.) pois a configuração de cache varia.

2. **Fazer backup** de todos os ficheiros antes de otimizar.

3. **Testar após cada fase** no PageSpeed Insights (performance) e Lighthouse (acessibilidade) para medir o impacto incremental.

4. **Prioridade de implementação**: Fase 1 e 2 (quick wins) primeiro, depois fases pela ordem indicada.

5. **Ferramentas de teste de acessibilidade recomendadas**:
   - Chrome DevTools Lighthouse (tab Accessibility)
   - axe DevTools extension
   - WAVE Web Accessibility Evaluator
   - HeadingsMap extension (para verificar hierarquia)
   - WebAIM Contrast Checker (para verificar ratios de contraste)

6. **WCAG Target**: Nível AA (mínimo recomendado para websites comerciais na UE).
