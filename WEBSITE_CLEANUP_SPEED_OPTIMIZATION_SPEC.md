# 🚀 PATA.CARE — Guia Completo de Otimização de Performance Web

## 📊 ESTADO ATUAL (Baseline)

| Métrica | Valor Atual | Meta | Estado |
|---------|-------------|------|--------|
| **Performance Score** | 42/100 | ≥ 90 | 🔴 Crítico |
| **FCP** (First Contentful Paint) | 1.6s | ≤ 1.8s | 🟢 OK |
| **LCP** (Largest Contentful Paint) | 6.1s | ≤ 2.5s | 🔴 Crítico |
| **TBT** (Total Blocking Time) | 13s | ≤ 200ms | 🔴 Crítico |
| **CLS** (Cumulative Layout Shift) | 0 | ≤ 0.1 | 🟢 Perfeito |
| **TTFB** (Time to First Byte) | 458ms | ≤ 200ms | 🟡 Aceitável |
| **DOM Ready** | 2,071ms | ≤ 1,500ms | 🟡 Melhorável |
| **onLoad** | 11,429ms | ≤ 3,000ms | 🔴 Crítico |
| **Network Time** | 16,972ms | ≤ 5,000ms | 🔴 Crítico |

---

## 📋 LISTA DE BOAS PRÁTICAS DE OTIMIZAÇÃO WEB

### 🔴 PRIORIDADE CRÍTICA (Impacto Alto no Score)

#### 1. Otimização de Imagens
- Converter todas as imagens para **WebP** ou **AVIF** (redução de 25-50% no tamanho)
- Definir `width` e `height` explícitos em todas as `<img>` tags (evita CLS)
- Implementar **lazy loading** com `loading="lazy"` em imagens abaixo do fold
- Usar `srcset` e `sizes` para servir imagens responsivas
- Comprimir imagens: qualidade 80% para fotos, máximo 100KB para hero images
- Usar `<picture>` element com fallbacks para browsers antigos
- Preload da hero image/LCP image com `<link rel="preload" as="image">`

#### 2. Eliminação de JavaScript Bloqueante (TBT = 13s!)
- Adicionar `defer` ou `async` a TODOS os `<script>` tags externos









- Mover scripts não-críticos para o final do `<body>`
- Carregar reCAPTCHA **apenas quando o formulário recebe focus** (lazy load)
- Carregar analytics (Google Analytics/Tag Manager) de forma assíncrona
- Carregar cookie consent banner de forma diferida
- Implementar `requestIdleCallback()` para scripts não-urgentes
- Code-split JavaScript: separar código crítico de código secundário

#### 3. Otimização de CSS
- Fazer **inline do CSS crítico** (above-the-fold) no `<head>`
- Carregar CSS não-crítico de forma assíncrona: `<link rel="preload" as="style">`
- Minificar todos os ficheiros CSS
- Remover CSS não utilizado (unused CSS)
- Evitar `@import` em CSS (bloqueia rendering)
- Usar `font-display: swap` para web fonts

#### 4. Otimização de Fontes
- Usar `font-display: swap` em todas as declarações `@font-face`
- Fazer **preload** das fontes críticas: `<link rel="preload" as="font" crossorigin>`
- Hospedar fontes localmente em vez de usar Google Fonts CDN (elimina DNS lookup)
- Limitar variantes de fonte ao mínimo necessário (regular + bold)
- Usar formato WOFF2 (melhor compressão)
- Aplicar `unicode-range` para carregar apenas caracteres necessários

### 🟡 PRIORIDADE MÉDIA (Impacto Moderado)

#### 5. Otimização de Third-Party Scripts
- **reCAPTCHA**: Carregar apenas no submit ou focus do formulário
- **Cookie Consent**: Usar versão lightweight ou implementar custom
- **Analytics**: Carregar após `window.onload`
- **Chat widgets**: Carregar apenas após interação do utilizador
- Estabelecer `dns-prefetch` e `preconnect` para domínios de terceiros:
  ```html
  <link rel="dns-prefetch" href="https://www.google.com">
  <link rel="preconnect" href="https://www.gstatic.com" crossorigin>
  ```

#### 6. Caching e Compressão
- Ativar compressão **Brotli** (ou Gzip como fallback) no Cloudflare
- Configurar **Cache-Control headers** agressivos para assets estáticos:
  - Imagens: `max-age=31536000` (1 ano)
  - CSS/JS: `max-age=31536000` com cache busting via hash no filename
  - HTML: `max-age=0, must-revalidate`
- Ativar Cloudflare **Auto Minify** para HTML, CSS e JS
- Ativar **Cloudflare Polish** para otimização automática de imagens
- Ativar **Early Hints** (103) no Cloudflare

#### 7. Otimização do HTML
- Minificar HTML (remover comentários, espaços desnecessários)
- Remover meta tags desnecessárias
- Usar `<link rel="preload">` para recursos críticos
- Usar `<link rel="prefetch">` para páginas prováveis de navegação
- Garantir que o DOCTYPE está correto e no topo
- Remover inline styles desnecessários

### 🟢 PRIORIDADE COMPLEMENTAR (Polish Final)

#### 8. Otimização de Rede
- Reduzir número total de HTTP requests
- Combinar ficheiros CSS pequenos num só
- Combinar ficheiros JS pequenos num só
- Usar HTTP/2 ou HTTP/3 (verificar no Cloudflare)
- Implementar Service Worker para caching offline

#### 9. Performance Monitoring
- Implementar `PerformanceObserver` para monitorização contínua
- Configurar alertas para regressões de performance
- Testar em múltiplas condições de rede (3G, 4G, WiFi)
- Testar em dispositivos móveis reais

#### 10. Acessibilidade que Afeta Performance
- Evitar reflows desnecessários (não mudar layout após load)
- Usar `will-change` CSS com moderação
- Evitar animações que triggam layout/paint
- Preferir `transform` e `opacity` para animações

---

## 🔍 CHECKLIST RÁPIDO PRÉ-DEPLOY

```
□ Todas as imagens em WebP/AVIF com fallback
□ Todas as imagens com width/height definidos
□ Lazy loading em imagens abaixo do fold
□ Hero image com preload
□ CSS crítico inline no <head>
□ Todos os scripts com defer/async
□ reCAPTCHA com lazy load
□ Fontes com font-display: swap
□ Fontes em WOFF2 hospedadas localmente
□ Compressão Brotli ativa
□ Cache headers configurados
□ HTML/CSS/JS minificados
□ Sem CSS unused
□ Third-party scripts diferidos
□ Preconnect para domínios externos
```

---
---

# 🤖 PROMPT PARA CLAUDE CODE — Scan & Otimização do pata.care

## INSTRUÇÕES PARA O CLAUDE CODE

Copia e cola o seguinte prompt completo no Claude Code para ele analisar e otimizar o website:

---

```
# TAREFA: Auditoria Completa de Performance + Otimização do Website pata.care

## CONTEXTO
O website pata.care (hospedado no GitHub Pages com Cloudflare CDN) teve um score de 42/100 no PageSpeed Insights. Os principais problemas são:
- LCP: 6.1s (meta: ≤2.5s) — conteúdo principal demora a aparecer
- TBT: 13s (meta: ≤200ms) — JavaScript bloqueia o main thread
- onLoad: 11.4s — página demora muito a carregar completamente
- Network Time: 17s — assets pesados ou muitos requests

O FCP (1.6s) e CLS (0) estão bons.

## FASE 1: AUDITORIA (Scan Completo)

Analisa TODOS os ficheiros do website e gera um relatório detalhado com:

### 1.1 Análise de Imagens
- Lista TODAS as imagens do site com: nome, formato, tamanho em KB, dimensões
- Identifica quais NÃO estão em WebP/AVIF
- Identifica quais NÃO têm width/height definidos no HTML
- Identifica quais NÃO têm loading="lazy" (exceto a hero image/LCP que deve ter preload)
- Identifica quais NÃO têm srcset para responsividade
- Calcula o peso total de todas as imagens

### 1.2 Análise de JavaScript
- Lista TODOS os scripts (inline e externos) com: localização, tamanho, se tem defer/async
- Identifica scripts que BLOQUEIAM o rendering (sem defer/async no <head>)
- Identifica scripts de terceiros: reCAPTCHA, analytics, cookie consent, etc.
- Verifica se reCAPTCHA está a carregar no page load (deveria ser lazy)
- Calcula o peso total de JavaScript
- Identifica código JavaScript não utilizado se possível

### 1.3 Análise de CSS
- Lista TODOS os ficheiros/blocos CSS com: localização, tamanho
- Verifica se existe CSS crítico inline no <head>
- Verifica se CSS não-crítico está a bloquear rendering
- Identifica @import statements (bloqueantes)
- Verifica font-display em @font-face declarations
- Calcula o peso total de CSS

### 1.4 Análise de Fontes
- Lista TODAS as fontes usadas com: nome, formato, tamanho, source (local vs CDN)
- Verifica se têm font-display: swap
- Verifica se estão em WOFF2
- Verifica se têm preload
- Identifica fontes carregadas mas não utilizadas

### 1.5 Análise de HTML
- Verifica estrutura do <head> (ordem dos recursos)
- Lista todos os <link> tags com rel, type, e propósito
- Verifica se existe preconnect/dns-prefetch para domínios externos
- Conta total de HTTP requests que a página faz
- Verifica se HTML está minificado
- Identifica inline styles desnecessários

### 1.6 Análise de Third-Party
- Lista TODOS os domínios externos carregados
- Para cada um: propósito, tamanho dos recursos, impacto na performance
- Classifica cada um como: crítico / diferível / removível

### 1.7 Relatório Resumo
Gera uma tabela com:
| Categoria | Problemas Encontrados | Impacto Estimado | Prioridade |
E uma lista ordenada por impacto das otimizações a fazer.

## FASE 2: OTIMIZAÇÃO (Aplicar Correções)

Após a auditoria, aplica AS SEGUINTES OTIMIZAÇÕES por ordem de prioridade:

### 2.1 Otimização de Imagens (Impacto: ALTO)
- Converte TODAS as imagens para WebP usando ferramentas de linha de comando (cwebp ou similar)
- Mantém originais como fallback com <picture> element
- Adiciona width e height a TODAS as <img> tags
- Adiciona loading="lazy" a imagens abaixo do fold
- Adiciona preload à hero image / imagem LCP
- Comprime imagens para qualidade 80% (ou o melhor compromisso qualidade/tamanho)
- Gera versões responsivas (1x, 2x) se aplicável

### 2.2 Otimização de JavaScript (Impacto: MUITO ALTO - TBT é 13s!)
- Adiciona defer a TODOS os scripts não-críticos
- Move scripts para o final do </body> se ainda não estão
- Implementa lazy loading do reCAPTCHA:
  ```javascript
  // Carregar reCAPTCHA apenas quando o formulário recebe focus
  let recaptchaLoaded = false;
  function loadRecaptcha() {
    if (recaptchaLoaded) return;
    recaptchaLoaded = true;
    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js?render=YOUR_SITE_KEY';
    script.async = true;
    document.head.appendChild(script);
  }
  // Adicionar listener ao primeiro input do formulário
  document.querySelector('form input, form textarea')?.addEventListener('focus', loadRecaptcha, { once: true });
  ```
- Implementa carregamento diferido de analytics:
  ```javascript
  // Carregar analytics após page load
  window.addEventListener('load', function() {
    setTimeout(function() {
      // Código de analytics aqui
    }, 2000); // 2s delay após load
  });
  ```
- Implementa carregamento diferido do cookie consent
- Minifica todo o JavaScript inline

### 2.3 Otimização de CSS (Impacto: ALTO)
- Extrai CSS crítico (above-the-fold) e coloca inline no <head>
- Carrega CSS restante de forma assíncrona:
  ```html
  <link rel="preload" href="styles.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="styles.css"></noscript>
  ```
- Minifica todos os ficheiros CSS
- Remove CSS não utilizado
- Substitui @import por <link> tags

### 2.4 Otimização de Fontes (Impacto: MÉDIO)
- Adiciona font-display: swap a todas as @font-face
- Converte fontes para WOFF2 se não estão
- Adiciona preload para fontes críticas
- Se usa Google Fonts, faz download e hospeda localmente
- Remove variantes de fonte não utilizadas

### 2.5 Otimização de HTML (Impacto: MÉDIO)
- Reorganiza <head> para ordem ótima:
  1. charset e viewport meta
  2. Preconnect/dns-prefetch
  3. Preload de recursos críticos
  4. CSS crítico inline
  5. CSS não-crítico async
  6. Scripts diferidos
- Adiciona preconnect para domínios de terceiros
- Minifica HTML
- Remove comentários HTML desnecessários

### 2.6 Configuração de Resource Hints
Adiciona ao <head>:
```html
<!-- DNS Prefetch & Preconnect para domínios externos -->
<link rel="preconnect" href="https://fonts.googleapis.com" crossorigin>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preconnect" href="https://www.google.com" crossorigin>
<link rel="preconnect" href="https://www.gstatic.com" crossorigin>
<!-- Adicionar outros domínios externos identificados na auditoria -->
```

## FASE 3: VALIDAÇÃO

Após aplicar todas as otimizações:

### 3.1 Verificação de Funcionalidade
- Testa que o formulário de contacto/waitlist ainda funciona
- Testa que o reCAPTCHA lazy-loaded funciona corretamente
- Testa que o cookie consent aparece corretamente
- Testa que todas as imagens carregam (incluindo WebP com fallback)
- Testa que as fontes carregam corretamente
- Verifica que não há erros na consola do browser

### 3.2 Gera Relatório de Mudanças
Cria um ficheiro PERFORMANCE_CHANGELOG.md com:

```markdown
# Performance Changelog — pata.care
## Data: [data]

### Métricas Antes
| Métrica | Valor |
|---------|-------|
| Score | 42 |
| FCP | 1.6s |
| LCP | 6.1s |
| TBT | 13s |
| CLS | 0 |

### Otimizações Aplicadas
1. [Otimização] — Impacto estimado: [X]
2. [Otimização] — Impacto estimado: [X]
...

### Ficheiros Modificados
- [ficheiro] — [o que mudou]
- [ficheiro] — [o que mudou]
...

### Peso Total Antes vs Depois
- Imagens: [X KB] → [Y KB] (redução de Z%)
- JavaScript: [X KB] → [Y KB] (redução de Z%)
- CSS: [X KB] → [Y KB] (redução de Z%)
- Total: [X KB] → [Y KB] (redução de Z%)

### Próximos Passos
- Re-testar no PageSpeed Insights
- Verificar métricas no Cloudflare Analytics
- Configurar Cloudflare settings (Brotli, Polish, Auto Minify)
```

### 3.3 Checklist Final
Confirma que:
- [ ] Todas as imagens convertidas para WebP com fallback
- [ ] width/height em todas as <img>
- [ ] Lazy loading implementado
- [ ] Hero image com preload
- [ ] reCAPTCHA com lazy loading
- [ ] Analytics diferido
- [ ] Cookie consent diferido
- [ ] CSS crítico inline
- [ ] CSS não-crítico async
- [ ] Fontes com font-display: swap
- [ ] Fontes em WOFF2
- [ ] Preconnect para domínios externos
- [ ] HTML minificado
- [ ] Todos os scripts com defer/async
- [ ] Zero erros na consola
- [ ] Formulário funcional
- [ ] Site visualmente idêntico ao original

## NOTAS IMPORTANTES
- O site é hospedado no GitHub Pages — não temos controlo sobre server-side headers diretamente, mas o Cloudflare pode ajudar
- O Cloudflare está configurado como CDN — podemos usar as features de otimização dele
- Manter TODOS os ficheiros originais como backup antes de modificar
- O domínio é pata.care e os emails ola@pata.care e privacidade@pata.care devem continuar a funcionar
- Não alterar conteúdo textual ou visual — apenas otimizar performance
- Testar em mobile E desktop após otimizações
```

---

## ⚙️ CONFIGURAÇÕES CLOUDFLARE RECOMENDADAS (Manual)

Após o Claude Code fazer as otimizações no código, aplica estas configurações manualmente no painel Cloudflare:

### Speed > Optimization
- **Auto Minify**: Ativar para HTML, CSS, JS
- **Brotli**: Ativar
- **Early Hints**: Ativar
- **Rocket Loader**: Testar (pode conflitar com alguns scripts — se causar problemas, desativar)

### Speed > Image Optimization (se disponível no teu plano)
- **Polish**: Ativar com "Lossy" para máxima compressão
- **WebP**: Ativar conversão automática

### Caching > Configuration
- **Browser Cache TTL**: Respeitar headers existentes
- **Caching Level**: Standard

### Rules > Page Rules (se necessário)
- `pata.care/assets/*` → Cache Level: Cache Everything, Edge Cache TTL: 1 month

---

## 📈 METAS DE PERFORMANCE PÓS-OTIMIZAÇÃO

| Métrica | Antes | Meta Realista | Meta Ideal |
|---------|-------|---------------|------------|
| **Score** | 42 | ≥ 75 | ≥ 90 |
| **FCP** | 1.6s | ≤ 1.5s | ≤ 1.0s |
| **LCP** | 6.1s | ≤ 3.0s | ≤ 2.5s |
| **TBT** | 13s | ≤ 500ms | ≤ 200ms |
| **CLS** | 0 | 0 | 0 |
| **onLoad** | 11.4s | ≤ 5s | ≤ 3s |
| **Network** | 17s | ≤ 8s | ≤ 5s |

A maior vitória será no **TBT** (de 13s para <500ms) através do lazy loading de scripts de terceiros, e no **LCP** (de 6.1s para <3s) através da otimização de imagens e CSS crítico.

---

*Documento criado para o projeto PATA — pata.care*
*Versão 1.0 — Fevereiro 2026*