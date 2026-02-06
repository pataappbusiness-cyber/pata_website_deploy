# 🚀 PATA.CARE — Phase 2 Performance Optimization

## 📊 EVOLUÇÃO COMPLETA

| Métrica | V0 (Original) | V1 (Phase 1) | V2 (Vídeos R2) | Meta | Estado |
|---------|---------------|---------------|-----------------|------|--------|
| **Score** | 42 | 53 | **59** | ≥ 90 | 🟡 +17 total |
| **FCP** | 1.6s | 1.1s | **1.1s** | ≤ 1.0s | 🟢 Estável e bom |
| **LCP** | 6.1s | 3.4s | **3.3s** | ≤ 2.5s | 🟡 Precisa de -0.8s |
| **TBT** | 13s | 11.1s | **4s** | ≤ 200ms | 🟡 Grande melhoria mas ainda alto |
| **CLS** | 0 | 0.12 | **0** | ≤ 0.1 | 🟢 Corrigido! |
| **onLoad** | 11.4s | 6.1s | **4.4s** | ≤ 3s | 🟡 Quase lá |
| **Network** | 17s | 16.5s | **7.6s** | ≤ 5s | 🟡 Metade, precisa de -2.6s |
| **Transfer** | ~15 MB | 14.64 MB | **2.94 MB** | ≤ 2 MB | 🟢 -80% redução! |

### Vitórias Conquistadas ✅
- ✅ Transfer size: 14.64 MB → 2.94 MB (**-80%!**)
- ✅ Vídeos migrados para Cloudflare R2 (problem1_video1.mp4 carrega apenas 138.74 KB inicialmente)
- ✅ CLS corrigido de volta a 0
- ✅ TBT reduziu de 13s para 4s (**-69%**)
- ✅ Slowest resource: era vídeo 12 MB/13.97s, agora é imagem 213 KB/2.80s
- ✅ Poster images a funcionar no R2 (media.pata.care)

### Total Requests: 83
### Hostnames: 10
### Slowest Resource: badge_founder.png — 213.81 KB (2.80 seconds)

---

## 🔴 PROBLEMAS RESTANTES (Waterfall V2)

### PROBLEMA #1: TBT AINDA EM 4s (Meta: ≤200ms)
Os scripts de terceiros continuam a ser o maior bloqueador:
- `cmp_final.min.js` (consentmanager) = 107.83 KB — o maior script JS da página
- Google Tag Manager = 150.16 KB
- `customdata` consentmanager = 10.40 KB
- Múltiplos scripts de delivery do consentmanager

**O consentmanager sozinho carrega ~130 KB de JS + múltiplos requests adicionais.**

### PROBLEMA #2: LCP EM 3.3s (Meta: ≤2.5s)
O LCP element mudou — agora é `BONE.svg` (2.48 KB, cached). O LCP de 3.3s já não é causado por uma imagem pesada mas sim pelo bloqueio de CSS e scripts que atrasam o rendering.

Causas prováveis do LCP alto:
- 3 CSS files ainda em "blocking": Google Fonts, global.css, sections.css
- Consent manager script a atrasar parsing
- 18 CSS files separados (16 preload + 2 blocking) = muitos requests

### PROBLEMA #3: CSS AINDA FRAGMENTADO (18 ficheiros, 3 bloqueantes)
Na waterfall V2:
- `fonts.googleapis.com` → **blocking**
- `global.css` (3.20 KB) → **blocking**
- `sections.css` (3.77 KB) → **blocking**
- Os restantes 15 CSS files → preload (bom)

Os 3 blocking CSS atrasam o FCP e LCP.

### PROBLEMA #4: IMAGENS PNG AINDA NÃO CONVERTIDAS
Vários PNGs pesados continuam sem conversão para WebP:
- `mockup.png` = 886.53 KB (!) — já não é LCP mas é o ficheiro mais pesado
- `primeiros_500_2.png` = 323.19 KB
- `acesso_prioritario.png` = 254.23 KB
- `badge_founder.png` = 213.81 KB (slowest resource! 2.80s)
- `preco_bloqueado.png` = 185.47 KB
- `1consulta_mes.png` = 136.52 KB
- `PATA_APP.webp` = 75.39 KB (já WebP mas sem cache)

**Total PNGs não otimizados: ~2 MB → poderia ser ~500 KB em WebP**

### PROBLEMA #5: FONTES EXTERNAS SEM CACHE
Duas fontes Mona Sans do Google (~40 KB cada) ainda carregam sem cache (Cache = "No"):
- `monasans/v4/...Ryti...` = 40.35 KB
- `monasans/v4/...RsfN...` = 41.82 KB

### PROBLEMA #6: POSTER IMAGES EM JPG (não WebP)
Os poster images dos vídeos estão em JPG:
- `problem1_video1_poster.jpg` = 23.51 KB
- `problem1_video2_poster.jpg` = 40.42 KB
- `2849936-hd_1280_720_24fps_poster.jpg` = 21.54 KB
- `1851002-hd_1280_720_24fps_poster.jpg` = 38.45 KB
- `3939111-hd_1280_720_24fps_poster.jpg` = 40.09 KB
- `6865078-hd_1366_720_25fps_poster.jpg` = 28.60 KB

Poderiam ser WebP para ~40% menos tamanho. Também não têm cache configurado.

---

## 🤖 PROMPT PARA CLAUDE CODE — Phase 2 Optimization

Copia e cola o seguinte prompt no Claude Code:

---

```
# TAREFA: Phase 2 — Otimização de Performance do Website pata.care

## CONTEXTO
O website pata.care passou por 3 rounds de otimização:
- V0 → V1 (Phase 1): Score 42→53 — defer scripts, preload CSS, lazy loading images
- V1 → V2 (Vídeos R2): Score 53→59 — compressão ffmpeg + Cloudflare R2, CLS fix
- V3 (Este prompt): Score 59→80-90 — CSS bundling, defer third-party, WebP images, self-host fonts

## DADOS DA WATERFALL REAL V2 (pós-vídeo R2)
- Transfer size total: 2.94 MB
- 83 requests, 10 hostnames
- Recurso mais lento: badge_founder.png (213.81 KB, 2.80s)
- LCP element: BONE.svg (2.48 KB, cached)
- LCP time: 3.3s (causado por CSS blocking + scripts, não pela imagem)
- TBT: 4s (consentmanager cmp_final.min.js = 107.83 KB é o maior culpado)
- CLS: 0 ✅

## ~~PRIORIDADE ABSOLUTA 1: O VÍDEO~~ ✅ CONCLUÍDO
Vídeos comprimidos com ffmpeg e migrados para Cloudflare R2 (media.pata.care).
O problem1_video1.mp4 que pesava 12.05 MB agora carrega apenas 138.74 KB inicialmente via streaming progressivo.
Transfer size total caiu de 14.64 MB para 2.94 MB.

## ~~PRIORIDADE 2: CORRIGIR CLS~~ ✅ CONCLUÍDO
CLS corrigido de 0.12 para 0.

---

## PRIORIDADE 1: COMBINAR E MINIFICAR CSS + JS (18 CSS + 6 JS → 2 ficheiros)

O site carrega 18 ficheiros CSS e 6 ficheiros JS separados = 24 HTTP requests só para assets locais.
Destes, 3 CSS são **blocking** (Google Fonts, global.css, sections.css).
Combinar tudo em 2 ficheiros (1 CSS + 1 JS) é a otimização com maior impacto no LCP e requests.

**Ver secções 5.2 e 3.5 mais abaixo para os build scripts completos com preservação de originais.**

---

## PRIORIDADE 2: REDUZIR TBT (de 4s para <500ms)

### 2.1 Consent Manager — O Maior Bloqueador
Na waterfall V2, o consentmanager carrega MÚLTIPLOS scripts:
1. `autoblocking/9f87e56a620e6.js` — script principal (14.27 KB, defer)
2. `cmp_final.min.js` — 107.83 KB — **o maior script JS da página**
3. `cmp.php` delivery script — 1.07 KB + 2.80 KB
4. `customdata` script — 10.40 KB
5. Mais 3 requests para imagens/logos do consent manager (~3.4 KB)

O consentmanager TOTAL está a usar ~135 KB de JavaScript + múltiplos requests.

**Solução — Carregar consent manager com delay:**
```javascript
// NO <head>, substituir o script atual do consentmanager por:
<script>
// Defer consent manager loading - carrega 3 segundos após o DOM estar pronto
// Isto é aceitável do ponto de vista legal porque o site não carrega
// cookies de tracking até o consent manager aparecer
(function() {
  function loadConsentManager() {
    var s = document.createElement('script');
    s.type = 'text/javascript';
    s.setAttribute('data-cmp-ab', '1');
    s.src = 'https://cdn.consentmanager.net/delivery/autoblocking/9f87e56a620e6.js';
    s.setAttribute('data-cmp-host', 'c.delivery.consentmanager.net');
    s.setAttribute('data-cmp-cdn', 'cdn.consentmanager.net');
    s.setAttribute('data-cmp-ext', '/delivery');
    document.head.appendChild(s);
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(loadConsentManager, 2000);
    });
  } else {
    setTimeout(loadConsentManager, 2000);
  }
})();
</script>
```

IMPORTANTE: Remove o `<script>` tag original do consentmanager e substitui por este código inline. Mantém TODOS os data attributes (data-cmp-host, data-cmp-cdn, data-cmp-ext) que existiam no script original.

### 2.2 Google Tag Manager — Diferir Mais
O GTM está a carregar 150.16 KB. Mesmo com async, é muito pesado.

```javascript
// Substituir o script GTM atual por carregamento com delay:
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
  }, 3000); // 3s delay após load
});
</script>
```

### 2.3 reCAPTCHA — Confirmar Lazy Loading
Verifica se o reCAPTCHA já foi lazy-loaded na Phase 1. Se ainda carrega no page load, implementa:

```javascript
// Lazy load reCAPTCHA — só carrega quando o utilizador interage com o formulário
(function() {
  var recaptchaLoaded = false;
  
  function loadRecaptcha() {
    if (recaptchaLoaded) return;
    recaptchaLoaded = true;
    var s = document.createElement('script');
    s.src = 'https://www.google.com/recaptcha/api.js?render=SITE_KEY_AQUI';
    s.async = true;
    document.head.appendChild(s);
  }
  
  // Carrega quando qualquer campo do formulário recebe focus
  var formInputs = document.querySelectorAll('#reservar input, #reservar textarea, #reservar select, form input, form textarea');
  formInputs.forEach(function(input) {
    input.addEventListener('focus', loadRecaptcha, { once: true });
  });
  
  // Fallback: carrega ao scroll até à secção do formulário
  var formSection = document.querySelector('#reservar') || document.querySelector('form');
  if (formSection && 'IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function(entries) {
      if (entries[0].isIntersecting) {
        loadRecaptcha();
        observer.disconnect();
      }
    }, { rootMargin: '500px' });
    observer.observe(formSection);
  }
})();
```

### 2.4 Verificar Scripts Locais Têm defer
Confirma que TODOS os scripts locais têm `defer`:
```html
<script defer src="./src/js/liquid-shader.js"></script>
<script defer src="./src/js/new/main.js"></script>
<script defer src="./src/js/new/faq.js"></script>
<script defer src="./src/js/new/reservar.js"></script>
<script defer src="./src/js/new/scroll-to-top.js"></script>
<script defer src="./src/js/new/scroll-button-shader.js"></script>
```

Na waterfall do teste, estes JÁ aparecem com `defer` — confirma que se mantém assim.

### 2.5 Combinar e Minificar JavaScript (Mantendo Originais)

Tal como no CSS, os ficheiros JS originais NUNCA são apagados ou alterados. São os ficheiros de trabalho. O ficheiro combinado é gerado a partir deles.

#### Estrutura de Pastas

```
src/
├── js/
│   ├── new/                          ← ORIGINAIS (ficheiros de trabalho)
│   │   ├── main.js
│   │   ├── faq.js
│   │   ├── reservar.js
│   │   ├── scroll-to-top.js
│   │   └── scroll-button-shader.js
│   ├── liquid-shader.js              ← ORIGINAL
│   │
│   └── dist/                         ← PRODUÇÃO (gerado automaticamente)
│       └── scripts.min.js               Combinado + minificado
```

#### Build Script para JS

Adiciona ao `build-css.sh` (renomear para `build.sh`) ou cria `build-js.sh`:

```bash
#!/bin/bash
# ============================================
# build-js.sh — Combinar e minificar JS
# Corre este script sempre que alterares um JS original
# ============================================

DIST_DIR="./src/js/dist"
mkdir -p "$DIST_DIR"

# Ficheiros JS na ordem correta de execução
JS_FILES=(
  "./src/js/liquid-shader.js"
  "./src/js/new/main.js"
  "./src/js/new/faq.js"
  "./src/js/new/reservar.js"
  "./src/js/new/scroll-to-top.js"
  "./src/js/new/scroll-button-shader.js"
)

echo "🔨 A combinar ${#JS_FILES[@]} ficheiros JS..."

# Combinar com separadores IIFE para evitar conflitos de scope
COMBINED="$DIST_DIR/scripts.combined.js"
> "$COMBINED"

for file in "${JS_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "// === $(basename $file) ===" >> "$COMBINED"
    echo ";(function(){" >> "$COMBINED"
    cat "$file" >> "$COMBINED"
    echo "" >> "$COMBINED"
    echo "})();" >> "$COMBINED"
    echo "" >> "$COMBINED"
  else
    echo "⚠️  Ficheiro não encontrado: $file"
  fi
done

echo "📦 Ficheiro combinado: $(wc -c < "$COMBINED") bytes"

# Minificar
if command -v terser &> /dev/null; then
  terser "$COMBINED" -o "$DIST_DIR/scripts.min.js" --compress --mangle
  echo "✅ Minificado com terser: $(wc -c < "$DIST_DIR/scripts.min.js") bytes"
elif command -v uglifyjs &> /dev/null; then
  uglifyjs "$COMBINED" -o "$DIST_DIR/scripts.min.js" -c -m
  echo "✅ Minificado com uglifyjs: $(wc -c < "$DIST_DIR/scripts.min.js") bytes"
else
  echo "⚠️  terser/uglifyjs não encontrado. A copiar sem minificar..."
  cp "$COMBINED" "$DIST_DIR/scripts.min.js"
fi

rm -f "$COMBINED"
echo "✅ JS build completo"
```

#### Instalar Minificador JS

```bash
# Terser (recomendado)
npm install -g terser

# OU UglifyJS
npm install -g uglify-js
```

#### Atualizar HTML

```html
<!-- REMOVER os 6 scripts individuais -->
<!-- <script defer src="./src/js/liquid-shader.js"></script> -->
<!-- <script defer src="./src/js/new/main.js"></script> -->
<!-- ... etc ... -->

<!-- SUBSTITUIR POR 1 script: -->
<script defer src="./src/js/dist/scripts.min.js"></script>
```

**Resultado**: 6 HTTP requests → 1 request. Originais intactos para edição.

#### Workflow de Edição (CSS + JS)

```
1. Editas ficheiro original (src/css/new/*.css ou src/js/new/*.js)
2. Corres: ./build.sh  (ou build-css.sh + build-js.sh separados)
3. Ficheiros minificados regenerados em src/css/dist/ e src/js/dist/
4. Testas no browser
5. Commit de TUDO: originais + minificados
```

---

## PRIORIDADE 3: CONVERTER PNGs PARA WebP

O LCP element agora é `BONE.svg` (2.48 KB, cached) — já não é o mockup. Mas o `mockup.png` com 886 KB continua a ser o ficheiro de imagem mais pesado da página. Há 6 PNGs que somam ~2 MB e devem ser convertidos para WebP (~500 KB total).

### 3.1 Converter mockup.png para WebP
```bash
# Converter para WebP com boa qualidade
cwebp -q 82 mockup.png -o mockup.webp

# OU se tiver instalado, usar AVIF para compressão ainda melhor
# avifenc --min 20 --max 30 mockup.png mockup.avif
```

### 3.2 Usar <picture> com Fallback
```html
<picture>
  <source srcset="./path/to/mockup.avif" type="image/avif">
  <source srcset="./path/to/mockup.webp" type="image/webp">
  <img src="./path/to/mockup.png" 
       alt="PATA App Mockup" 
       width="XXX" height="YYY"
       fetchpriority="high"
       decoding="async">
</picture>
```

### 3.3 Preload da Imagem Mais Pesada
Adiciona no `<head>` para carregar o mockup mais rápido (mesmo não sendo LCP):
```html
<link rel="preload" as="image" type="image/webp" href="./path/to/mockup.webp">
```

### 3.4 Outras Imagens PNG Grandes para Converter
Da waterfall, estas imagens também precisam de conversão:
| Ficheiro | Tamanho | Ação |
|----------|---------|------|
| primeiros_500_2.png | 323 KB | Converter para WebP |
| acesso_prioritario.png | 254 KB | Converter para WebP |
| badge_founder.png | 213 KB | Converter para WebP |
| preco_bloqueado.png | 185 KB | Converter para WebP |
| 1consulta_mes.png | 136 KB | Converter para WebP |

Usa o mesmo padrão `<picture>` com WebP + PNG fallback para todas.

---

## PRIORIDADE 4: CSS RESTANTE BLOQUEANTE

### 4.1 global.css e sections.css Ainda Bloqueiam
Na waterfall, `global.css` (3.27 KB) e `sections.css` (3.85 KB) aparecem como "blocking". Os restantes CSS files já foram convertidos para preload.

**Solução**: O CSS crítico (above-the-fold) já deve estar inline no `<head>`. Portanto, global.css e sections.css podem ser convertidos para preload também:

```html
<!-- Substituir -->
<link rel="stylesheet" href="./src/css/new/global.css">
<link rel="stylesheet" href="./src/css/new/sections.css">

<!-- Por -->
<link rel="preload" href="./src/css/new/global.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="./src/css/new/global.css"></noscript>

<link rel="preload" href="./src/css/new/sections.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="./src/css/new/sections.css"></noscript>
```

MAS PRIMEIRO: Verifica que o CSS inline no `<head>` contém os estilos necessários para o above-the-fold (navbar + hero). Se não contém, extrai esses estilos de global.css e sections.css e adiciona ao bloco `<style>` inline antes de converter estes para preload.

### 4.2 Combinar e Minificar CSS Files (Mantendo Originais)

Atualmente há 18 ficheiros CSS separados. Vamos combinar todos num único ficheiro minificado para produção, mas **MANTER os ficheiros originais intactos** para edição futura.

**REGRA FUNDAMENTAL**: Os ficheiros originais em `./src/css/new/` NUNCA são alterados ou apagados. São os ficheiros de trabalho (source). O ficheiro combinado e minificado é gerado a partir deles e é o que o HTML carrega em produção.

#### Estrutura de Pastas

```
src/
├── css/
│   ├── new/                          ← ORIGINAIS (nunca tocar para minificar)
│   │   ├── global.css                   Ficheiros de trabalho legíveis
│   │   ├── sections.css                 Para edição e manutenção
│   │   ├── animated-gradient.css
│   │   ├── problem1.css
│   │   ├── problem2.css
│   │   ├── problem3.css
│   │   ├── problem4.css
│   │   ├── problem5.css
│   │   ├── solution1.css
│   │   ├── solution2.css
│   │   ├── solution3.css
│   │   ├── solution4.css
│   │   ├── joinus1.css
│   │   ├── joinus2.css
│   │   ├── joinus3.css
│   │   ├── faq.css
│   │   ├── reservar.css
│   │   ├── footer.css
│   │   └── scroll-to-top.css
│   │
│   └── dist/                         ← PRODUÇÃO (gerado automaticamente)
│       └── styles.min.css               Combinado + minificado
```

#### Build Script para Gerar o CSS de Produção

Cria um script `build-css.sh` na raiz do projeto:

```bash
#!/bin/bash
# ============================================
# build-css.sh — Combinar e minificar CSS
# Corre este script sempre que alterares um CSS original
# ============================================

SRC_DIR="./src/css/new"
DIST_DIR="./src/css/dist"

# Criar pasta dist se não existe
mkdir -p "$DIST_DIR"

# Ordem de concatenação (importa para cascading)
CSS_FILES=(
  "$SRC_DIR/global.css"
  "$SRC_DIR/sections.css"
  "$SRC_DIR/animated-gradient.css"
  "$SRC_DIR/problem1.css"
  "$SRC_DIR/problem2.css"
  "$SRC_DIR/problem3.css"
  "$SRC_DIR/problem4.css"
  "$SRC_DIR/problem5.css"
  "$SRC_DIR/solution1.css"
  "$SRC_DIR/solution2.css"
  "$SRC_DIR/solution3.css"
  "$SRC_DIR/solution4.css"
  "$SRC_DIR/joinus1.css"
  "$SRC_DIR/joinus2.css"
  "$SRC_DIR/joinus3.css"
  "$SRC_DIR/faq.css"
  "$SRC_DIR/reservar.css"
  "$SRC_DIR/footer.css"
  "$SRC_DIR/scroll-to-top.css"
)

echo "🔨 A combinar ${#CSS_FILES[@]} ficheiros CSS..."

# Combinar todos num ficheiro temporário
COMBINED="$DIST_DIR/styles.combined.css"
> "$COMBINED"

for file in "${CSS_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "/* === $(basename $file) === */" >> "$COMBINED"
    cat "$file" >> "$COMBINED"
    echo "" >> "$COMBINED"
  else
    echo "⚠️  Ficheiro não encontrado: $file"
  fi
done

echo "📦 Ficheiro combinado: $(wc -c < "$COMBINED") bytes"

# Minificar
# Opção 1: Se tiver csso instalado (npm install -g csso-cli)
if command -v csso &> /dev/null; then
  csso "$COMBINED" -o "$DIST_DIR/styles.min.css"
  echo "✅ Minificado com csso: $(wc -c < "$DIST_DIR/styles.min.css") bytes"

# Opção 2: Se tiver clean-css instalado (npm install -g clean-css-cli)
elif command -v cleancss &> /dev/null; then
  cleancss -o "$DIST_DIR/styles.min.css" "$COMBINED"
  echo "✅ Minificado com clean-css: $(wc -c < "$DIST_DIR/styles.min.css") bytes"

# Opção 3: Minificação básica com sed (fallback sem dependências)
else
  echo "⚠️  csso/clean-css não encontrado. A usar minificação básica..."
  cat "$COMBINED" | \
    sed 's/\/\*.*?\*\///g' | \
    sed '/^[[:space:]]*\/\*/,/\*\//d' | \
    tr -d '\n' | \
    sed 's/  */ /g' | \
    sed 's/ *{ */{/g' | \
    sed 's/ *} */}/g' | \
    sed 's/ *: */:/g' | \
    sed 's/ *; */;/g' | \
    sed 's/;}/}/g' \
    > "$DIST_DIR/styles.min.css"
  echo "✅ Minificação básica: $(wc -c < "$DIST_DIR/styles.min.css") bytes"
fi

# Limpar ficheiro temporário combinado
rm -f "$COMBINED"

# Mostrar resultado
ORIGINAL_SIZE=0
for file in "${CSS_FILES[@]}"; do
  if [ -f "$file" ]; then
    ORIGINAL_SIZE=$((ORIGINAL_SIZE + $(wc -c < "$file")))
  fi
done
MIN_SIZE=$(wc -c < "$DIST_DIR/styles.min.css")
SAVING=$((ORIGINAL_SIZE - MIN_SIZE))
PERCENT=$((SAVING * 100 / ORIGINAL_SIZE))

echo ""
echo "=========================================="
echo "  CSS Build Report"
echo "=========================================="
echo "  Ficheiros originais: ${#CSS_FILES[@]}"
echo "  Tamanho original:    ${ORIGINAL_SIZE} bytes"
echo "  Tamanho minificado:  ${MIN_SIZE} bytes"
echo "  Redução:             ${SAVING} bytes (-${PERCENT}%)"
echo "  HTTP requests:       18 → 1"
echo "=========================================="
```

Torna executável:
```bash
chmod +x build-css.sh
```

#### Workflow de Edição

```
1. Editas um CSS original (ex: src/css/new/problem1.css)
2. Corres: ./build-css.sh
3. O styles.min.css é regenerado automaticamente
4. Testas no browser
5. Commit de AMBOS: o original editado + o styles.min.css gerado
```

#### Atualizar o HTML para Usar o CSS Combinado

No index.html, substitui as 18 linhas de CSS (as preloaded e as blocking) por UMA ÚNICA referência:

```html
<!-- REMOVER todas estas linhas (18 ficheiros separados): -->
<!-- <link rel="stylesheet" href="./src/css/new/global.css"> -->
<!-- <link rel="stylesheet" href="./src/css/new/sections.css"> -->
<!-- <link rel="preload" href="./src/css/new/animated-gradient.css" ...> -->
<!-- ... todos os outros 15 ... -->

<!-- SUBSTITUIR POR (1 ficheiro apenas): -->
<link rel="preload" href="./src/css/dist/styles.min.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="./src/css/dist/styles.min.css"></noscript>
```

**Resultado**: 18 HTTP requests → 1 request. Ficheiro minificado (~25% mais pequeno). Originais intactos para edição.

#### Instalar Minificador (Recomendado)

```bash
# Instalar csso (recomendado — melhor compressão para CSS)
npm install -g csso-cli

# OU instalar clean-css
npm install -g clean-css-cli
```

Se não quiseres instalar nada, o script tem fallback com `sed` que faz minificação básica.

---

## PRIORIDADE 5: FONTES LOCAIS

### 5.1 Download e Self-Host Mona Sans
Na waterfall, as duas fontes do Google Fonts (40.35 KB + 41.82 KB) aparecem sem cache (Cache = "No").

1. Faz download dos ficheiros WOFF2 do Google Fonts
2. Guarda em `./src/fonts/`
3. Cria @font-face local:

```css
/* Adicionar ao CSS inline ou global.css */
@font-face {
  font-family: 'Mona Sans';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('./src/fonts/mona-sans-regular.woff2') format('woff2');
}

@font-face {
  font-family: 'Mona Sans';
  font-style: normal;
  font-weight: 600;
  font-display: swap;
  src: url('./src/fonts/mona-sans-semibold.woff2') format('woff2');
}

@font-face {
  font-family: 'Mona Sans';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url('./src/fonts/mona-sans-bold.woff2') format('woff2');
}

/* Adicionar APENAS os pesos que realmente usas */
/* Verifica no CSS quais font-weight são usados */
```

4. Remove o link para Google Fonts do `<head>`:
```html
<!-- REMOVER esta linha -->
<link href="https://fonts.googleapis.com/css2?family=Mona+Sans:ital,wght@0,200..900;1,200..900&display=swap" rel="stylesheet">
```

5. Adiciona preload para a fonte principal:
```html
<link rel="preload" href="./src/fonts/mona-sans-regular.woff2" as="font" type="font/woff2" crossorigin>
```

**NOTA**: Mona Sans é uma fonte variable font. Se possível, faz download do ficheiro variable único em vez de múltiplos pesos estáticos. O ficheiro variable WOFF2 tem ~80-100 KB mas suporta todos os pesos.

---

## PRIORIDADE 6: PRECONNECT ADICIONAL

Adiciona ao `<head>` (LOGO APÓS charset e viewport):
```html
<!-- Preconnect para domínios que vão ser usados -->
<link rel="preconnect" href="https://cdn.consentmanager.net" crossorigin>
<link rel="preconnect" href="https://c.delivery.consentmanager.net" crossorigin>
<link rel="preconnect" href="https://www.googletagmanager.com" crossorigin>
<!-- Manter os existentes para fonts se ainda usar Google Fonts -->
```

Se implementares self-hosted fonts, remove os preconnect para Google Fonts.

---

## FASE DE VALIDAÇÃO

Após aplicar TODAS as otimizações acima:

### Checklist de Funcionalidade
- [ ] Os vídeos de fundo carregam via R2 com lazy load (já funcionava)
- [ ] O cookie consent banner aparece (com delay de ~2s, aceitável)
- [ ] O Google Analytics carrega (com delay de ~3s após load)
- [ ] O formulário funciona e o reCAPTCHA carrega ao interagir com o form
- [ ] Todas as imagens aparecem corretamente (WebP com fallback PNG)
- [ ] Não há layout shifts visíveis (CLS deve manter-se a 0)
- [ ] As fontes carregam sem flash visível
- [ ] Scroll-to-top funciona
- [ ] FAQ accordion funciona
- [ ] Liquid shader/animações funcionam
- [ ] Site responsivo funciona em mobile

### Checklist Técnico
- [ ] Zero erros na consola do browser
- [ ] 1 único CSS file carrega (styles.min.css)
- [ ] 1 único JS file carrega (scripts.min.js)
- [ ] Nenhum CSS é blocking (tudo preload ou inline)
- [ ] Fontes são self-hosted com preload
- [ ] PNGs convertidos para WebP com <picture> fallback
- [ ] Preconnect para domínios de terceiros
- [ ] Cache configurado para assets do R2

### Gera PERFORMANCE_CHANGELOG_V3.md com:
```markdown
# Performance Changelog V3 — pata.care

## Métricas
| Métrica | V0 (original) | V1 (phase 1) | V2 (vídeos R2) | V3 (phase 2) |
|---------|----------------|---------------|-----------------|---------------|
| Score   | 42             | 53            | 59              | [novo]        |
| FCP     | 1.6s           | 1.1s          | 1.1s            | [novo]        |
| LCP     | 6.1s           | 3.4s          | 3.3s            | [novo]        |
| TBT     | 13s            | 11.1s         | 4s              | [novo]        |
| CLS     | 0              | 0.12          | 0               | [novo]        |

## Otimizações Aplicadas na V3
1. [lista com impacto estimado de cada]

## Ficheiros Modificados
- [lista]

## Peso da Página
- V0: ~15 MB
- V1: 14.64 MB
- V2: 2.94 MB
- V3: [novo] (estimado: ~1.5 MB)
```

---

## ⚡ RESUMO DE IMPACTO ESPERADO (Otimizações Restantes)

| Otimização | Métrica Afetada | Impacto Estimado |
|------------|-----------------|------------------|
| ~~Lazy load vídeo 12MB~~ | ~~Network, onLoad, TBT~~ | ✅ **FEITO — -12 MB, -9s network** |
| ~~CLS fix (width/height)~~ | ~~CLS~~ | ✅ **FEITO — CLS voltou a 0** |
| Combinar 18 CSS → 1 ficheiro | LCP, FCP, Requests | **-17 requests, LCP -300-500ms** |
| Converter CSS blocking → preload | LCP, FCP | **LCP: -200-400ms** |
| Defer consent manager (delay 2-3s) | TBT | **TBT: -1.5 a 2.5s** |
| Defer GTM (delay 3s pós-load) | TBT | **TBT: -0.5 a 1s** |
| Converter 6 PNGs para WebP | Transfer, Network | **-1.5 MB (~2 MB → ~500 KB)** |
| Combinar 6 JS → 1 ficheiro | Requests | **-5 requests** |
| Self-host fontes (Mona Sans) | FCP, Requests | **-2 DNS lookups, -200ms FCP** |
| Converter poster JPGs para WebP | Transfer | **-80 KB total** |
| Configurar cache no R2 | Repeat visits | **Load instantâneo em revisitas** |

### Projeção Final
| Métrica | V0 | V1 | V2 (Agora) | Estimativa V3 |
|---------|----|----|------------|---------------|
| **Score** | 42 | 53 | **59** | **80-90** |
| **FCP** | 1.6s | 1.1s | **1.1s** | **0.7-0.9s** |
| **LCP** | 6.1s | 3.4s | **3.3s** | **1.8-2.5s** |
| **TBT** | 13s | 11.1s | **4s** | **300ms-1s** |
| **CLS** | 0 | 0.12 | **0** | **0** |
| **Transfer** | ~15 MB | 14.64 MB | **2.94 MB** | **~1.5 MB** |
| **Requests** | ~77 | 77 | **83** | **~60** |

As maiores vitórias restantes são:
1. **Combinar CSS (18→1)** — reduz requests e elimina blocking, impacto direto no LCP
2. **Defer consent manager** — o cmp_final.min.js de 108 KB é o maior culpado do TBT restante
3. **Converter PNGs para WebP** — mockup.png de 887 KB é o ficheiro mais pesado (sem ser vídeo)
```

---

*PATA Performance Optimization Phase 2 — Fevereiro 2026 — Atualizado com dados V2 (post-vídeo R2)*















