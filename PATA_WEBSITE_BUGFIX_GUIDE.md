# 🐛 PATA Website — Guia de Correção de Bugs

## Contexto

O website **pata.care** está a mostrar um **fundo branco/transparente** na hero section em vez do fundo preto com efeito liquid shader. A causa raiz são erros de minificação no CSS e na concatenação do JavaScript.

**Ficheiros afetados:**
- `styles_min.css` — CSS minificado (ficheiro único)
- `scripts_min.js` — JavaScript concatenado (ficheiro único)
- `index.html` — Referência de font pode precisar de ajuste

---

## 🔴 BUG 1: Variáveis CSS Não Definidas (CRÍTICO)

### Problema

O `:root` não define 3 variáveis CSS que são usadas em todo o site:

| Variável | Usada em | Efeito |
|---|---|---|
| `--bg-black` | `.header-section { background: var(--bg-black) }` | Hero fica transparente/branco |
| `--font-family` | `h1`, `h2`, `a`, `blockquote`, etc. | Tipografia toda em fallback |
| `--transition-fast` | `a:hover`, transições diversas | Transições sem duração |

### Correção

No **primeiro bloco `:root`** do ficheiro CSS source (antes de minificar), adicionar as variáveis em falta:

```css
:root {
    /* VARIÁVEIS EXISTENTES - manter */
    --gradient-color-1: rgba(223, 110, 57, 0.39);
    --gradient-color-2: rgba(198, 84, 32, 0.61);
    --gradient-color-3: rgba(6, 41, 70, 0.28);
    --gradient-color-4: rgba(255, 255, 255, 0.25);
    --gradient-color-5: rgba(77, 34, 0, 0.39);
    --gradient-color-6: rgba(56, 123, 178, 1.0);
    --gradient-color-7: rgba(219, 93, 35, 0.20);
    --gradient-color-8: rgba(18, 40, 58, 1.0);
    --color-primary-500: #DF6E39;
    --color-primary-700: #C65420;
    --z-sticky: 1000;
    --z-modal: 2000;
    --radius-sm: 4px;
    --radius-md: 8px;
    --radius-lg: 12px;
    --radius-xl: 16px;

    /* ⬇️ ADICIONAR ESTAS 3 VARIÁVEIS EM FALTA ⬇️ */
    --bg-black: #000000;
    --font-family: 'Mona Sans', sans-serif;
    --transition-fast: 0.2s ease;
}
```

### Validação

```bash
# Confirmar que as 3 variáveis estão definidas no CSS final
grep -oP '\-\-(bg-black|font-family|transition-fast):' styles_min.css
# Esperado: 3 linhas de output
```

---

## 🔴 BUG 2: Regra `.liquid-shader-canvas` Separada do Seletor (CRÍTICO)

### Problema

A propriedade `filter: blur(125px) contrast(1.80)` aparece **fora** de qualquer seletor CSS em **3 locais**, quebrando o parsing de todo o CSS a partir desse ponto.

**Padrão corrompido** (aparece 3 vezes no ficheiro minificado):

```css
/* ERRADO — o } fecha a regra anterior, e filter fica órfão */
background:#000000}filter:blur(125px) contrast(1.80)}
```

**Locais afetados:**

1. **`.header-section`** — `background:var(--bg-black)}filter:blur(...)` (byte ~4827)
2. **`.joinus2-section`** — `background:#000000}filter:blur(...)` (byte ~65226)
3. **`.joinus3-section`** — `background:#000000}filter:blur(...)` (byte ~71457)

### Causa

Durante a minificação, a regra `.liquid-shader-canvas` (que deveria conter o `filter`) foi removida, mas a propriedade `filter` ficou colada ao fecho `}` da regra anterior.

### Correção

Nos **ficheiros CSS source** (antes de minificar), garantir que cada secção com liquid shader tem a estrutura correta:

#### Local 1: Header Section

```css
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
    background: var(--bg-black);
}

/* REGRA SEPARADA — o filter pertence ao canvas, NÃO ao header-section */
.header-section .liquid-shader-canvas {
    filter: blur(125px) contrast(1.80);
}

.header-section::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.20);
    z-index: 1;
    pointer-events: none;
}
```

#### Local 2: Join Us 2 Section

```css
.joinus2-section {
    position: relative;
    min-height: 90vh;
    width: 100%;
    padding: 120px 84px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background: #000000;
}

/* REGRA SEPARADA */
.joinus2-section .liquid-shader-canvas {
    filter: blur(125px) contrast(1.80);
}
```

#### Local 3: Join Us 3 Section

```css
.joinus3-section {
    position: relative;
    min-height: auto;
    width: 100%;
    padding: 64px 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background: #000000;
}

/* REGRA SEPARADA */
.joinus3-section .liquid-shader-canvas {
    filter: blur(125px) contrast(1.80);
}
```

### Validação

```bash
# Após re-minificar, NÃO deve haver nenhum }filter: no CSS
grep -c '}filter:' styles_min.css
# Esperado: 0

# Deve haver 3 regras .liquid-shader-canvas com filter
grep -c 'liquid-shader-canvas{' styles_min.css
# Esperado: pelo menos 3 (+ as dos media queries)
```

---

## 🔴 BUG 3: Segundo `:root` Corrompido (CRÍTICO)

### Problema

Existe um **segundo bloco `:root`** no CSS que tem um seletor `.problem1-section` aninhado dentro dele, o que é CSS inválido:

```css
/* ERRADO */
:root{--dark-orange:#FF943D;.problem1-section{display:flex;...
```

### Correção

Separar em dois blocos distintos:

```css
:root {
    --dark-orange: #FF943D;
}

.problem1-section {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    background: #FFF8F2;
    box-shadow: inset 0px -14px 52.9px 0px rgba(0, 0, 0, 0.25);
    min-height: 800px;
}
```

> **Nota:** Idealmente, mover `--dark-orange` para o primeiro `:root` block para ter todas as variáveis num só lugar.

### Validação

```bash
# Não deve haver mais que 1 bloco :root (idealmente)
grep -c ':root{' styles_min.css
# Esperado: 1 (ou 2 se mantiveres separados, mas NUNCA com seletor aninhado)
```

---

## 🟡 BUG 4: Ordem de Concatenação JavaScript (ALTO)

### Problema

No `scripts_min.js`, a classe `ScrollToTopButton` é **usada na linha 1793** (dentro de `main.js`) mas só é **definida na linha 2572** (dentro de `scroll-to-top.js`).

**Erro na consola:**
```
Uncaught ReferenceError: ScrollToTopButton is not defined
```

**Ordem actual (ERRADA):**
```
1. liquid-shader.js     (linha 1)
2. main.js              (linha 272)   ← USA ScrollToTopButton na linha 1793
3. faq.js               (linha 1874)
4. reservar.js          (linha 2050)
5. scroll-to-top.js     (linha 2565)  ← DEFINE ScrollToTopButton
6. scroll-button-shader.js (linha 2747)
```

### Correção

Alterar a ordem de concatenação no build script para:

```
1. liquid-shader.js
2. scroll-to-top.js          ← MOVER PARA ANTES de main.js
3. scroll-button-shader.js   ← MOVER PARA ANTES de main.js
4. faq.js
5. reservar.js
6. main.js                   ← AGORA no final, depois de todas as dependências
```

**Se estiveres a concatenar manualmente:**

```bash
cat \
  src/js/liquid-shader.js \
  src/js/scroll-to-top.js \
  src/js/scroll-button-shader.js \
  src/js/faq.js \
  src/js/reservar.js \
  src/js/main.js \
  > scripts_min.js
```

### Alternativa Rápida (sem re-ordenar)

Se não puderes alterar a ordem de concatenação, wrapa a instanciação em `main.js` num `DOMContentLoaded` ou muda para instanciação lazy:

```javascript
// Em main.js, substituir:
window.scrollToTopButton = new ScrollToTopButton(smoothScroll);

// Por:
document.addEventListener('DOMContentLoaded', () => {
    if (typeof ScrollToTopButton !== 'undefined') {
        window.scrollToTopButton = new ScrollToTopButton(smoothScroll);
    }
});
```

### Validação

```bash
# Abrir no browser e verificar consola — não deve haver ReferenceError
# O botão scroll-to-top deve aparecer ao fazer scroll down
```

---

## 🟡 BUG 5: Font "Mona Sans" Rejeitada pelo Sanitizer (MÉDIO)

### Problema

A consola mostra:
```
OTS > ... > Failed to sanitize font (Mona-Sans.woff2)
```

### Possíveis Causas

1. Ficheiro `./src/fonts/Mona-Sans.woff2` corrompido
2. Path relativo incorrecto dependendo do ambiente (local vs GitHub Pages)
3. Ficheiro woff2 descarregado incorretamente (ex: Git LFS não configurado)

### Correção

```bash
# 1. Verificar se o ficheiro existe e tem tamanho razoável (>50KB)
ls -la src/fonts/Mona-Sans.woff2
# Se for muito pequeno (<1KB), provavelmente é um pointer LFS

# 2. Re-descarregar do GitHub oficial
# https://github.com/github/mona-sans/releases
# Descarregar Mona-Sans.woff2 e substituir em src/fonts/

# 3. Verificar integridade
file src/fonts/Mona-Sans.woff2
# Esperado: "Web Open Font Format (Version 2)"
# Se disser "ASCII text" → é um pointer Git LFS, não o font real
```

### Alternativa (CDN Fallback)

No `index.html`, adicionar um fallback de Google Fonts ou CDN antes do `@font-face` local:

```html
<!-- Fallback CDN -->
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<style>
    @font-face {
        font-family: 'Mona Sans';
        src: url('./src/fonts/Mona-Sans.woff2') format('woff2');
        font-weight: 200 900;
        font-style: normal;
        font-display: swap;
    }
</style>
```

---

## ⚪ BUG 6: Video `<source>` Sem `src` (BAIXO — Esperado)

### Problema

Consola mostra warnings sobre `<source>` elements sem atributo `src`.

### Explicação

Isto é **comportamento intencional** — os vídeos usam `data-src` para lazy loading. Os warnings são inofensivos e esperados.

**Nenhuma ação necessária.**

---

## 📋 Checklist de Execução

```
PRIORIDADE ALTA (resolver primeiro):
□ 1. Adicionar --bg-black, --font-family, --transition-fast ao :root
□ 2. Corrigir 3x filter:blur() órfãos → mover para .liquid-shader-canvas
□ 3. Separar segundo :root corrompido do .problem1-section
□ 4. Corrigir ordem de concatenação JS (scroll-to-top.js ANTES de main.js)

PRIORIDADE MÉDIA:
□ 5. Verificar/re-descarregar Mona-Sans.woff2

APÓS CORREÇÕES:
□ Re-minificar CSS com ferramenta confiável (cssnano, clean-css)
□ Re-concatenar JS na ordem correta
□ Testar localmente com `python -m http.server` ou Live Server
□ Verificar consola do browser — 0 erros
□ Confirmar que hero section tem fundo preto com shader
□ Confirmar que scroll-to-top button funciona
□ Deploy para GitHub Pages e verificar em produção
```

---

## 🔧 Quick Fix Directo no Minificado

Se precisares de corrigir **diretamente** no `styles_min.css` sem aceder aos sources:

### Fix 1: Adicionar variáveis ao início do ficheiro

Procurar:
```
:root{--gradient-color-1:
```

Substituir por:
```
:root{--bg-black:#000000;--font-family:'Mona Sans', sans-serif;--transition-fast:0.2s ease;--gradient-color-1:
```

### Fix 2: Corrigir os 3 filter órfãos

**Substituição 1** — Procurar:
```
background:var(--bg-black)}filter:blur(125px) contrast(1.80)}.header-section::after
```
Substituir por:
```
background:var(--bg-black)}.header-section .liquid-shader-canvas{filter:blur(125px) contrast(1.80)}.header-section::after
```

**Substituição 2** — Procurar (joinus2):
```
background:#000000}filter:blur(125px) contrast(1.80)}@media (prefers-reduced-motion:reduce){.joinus2-section
```
Substituir por:
```
background:#000000}.joinus2-section .liquid-shader-canvas{filter:blur(125px) contrast(1.80)}@media (prefers-reduced-motion:reduce){.joinus2-section
```

**Substituição 3** — Procurar (joinus3):
```
background:#000000}filter:blur(125px) contrast(1.80)}@media (prefers-reduced-motion:reduce){.joinus3-section
```
Substituir por:
```
background:#000000}.joinus3-section .liquid-shader-canvas{filter:blur(125px) contrast(1.80)}@media (prefers-reduced-motion:reduce){.joinus3-section
```

### Fix 3: Corrigir segundo :root

Procurar:
```
:root{--dark-orange:#FF943D;.problem1-section{
```
Substituir por:
```
:root{--dark-orange:#FF943D}.problem1-section{
```

### Fix 4: Extra `}` — Verificar balanceamento

Após as correções acima, contar chaves para confirmar balanceamento:

```bash
# Contar { e } — devem ser iguais
echo "Open: $(grep -o '{' styles_min.css | wc -l)"
echo "Close: $(grep -o '}' styles_min.css | wc -l)"
```

---

*Última atualização: 2025-02-06*
*Diagnóstico feito por CTO Claude para Diogo/PATA*
