# 🎬 PATA.CARE — Compressão de Vídeos + Cloudflare R2 CDN

## VISÃO GERAL

**Problema**: 6 vídeos de fundo pesam ~25-30 MB e vivem no GitHub Pages, causando 14.64 MB de transfer size e 16.5s de Network Time.

**Solução em 3 passos**:
1. Comprimir os 6 vídeos com ffmpeg (~85-90% redução)
2. Upload para Cloudflare R2 (gratuito, zero custos de bandwidth)
3. Mudar os `data-src` no HTML para apontar para o R2

**Resultado**: Os vídeos continuam a funcionar exatamente como estão (autoplay, loop, muted, com overlays) mas o GitHub Pages serve 0 bytes de vídeo. O Cloudflare R2 serve os vídeos comprimidos via CDN global.

---

## PARTE 1: SETUP DO CLOUDFLARE R2 (Manual — Diogo)

Faz isto no painel do Cloudflare ANTES de dar o prompt ao Claude Code.

### 1.1 Criar o Bucket R2

1. Vai a **dash.cloudflare.com**
2. No menu lateral esquerdo, clica em **R2 Object Storage**
3. Se for a primeira vez, aceita os termos (não precisa de cartão de crédito para o plano gratuito)
4. Clica em **Create bucket**
5. Configurações:
   - **Bucket name**: `pata-media`



   
   - **Location**: **Europe (Western Europe)** — mais perto de Portugal
6. Clica **Create bucket**

### 1.2 Ativar Acesso Público ao Bucket

Os vídeos precisam de ser acessíveis publicamente (sem autenticação) para o browser os carregar.

1. Dentro do bucket `pata-media`, vai ao separador **Settings**
2. Procura a secção **Public access**
3. Tens duas opções:

**Opção A — Custom Domain (RECOMENDADO):**
Permite servir os ficheiros a partir de um subdomínio teu, exemplo: `media.pata.care`

1. Em **Custom Domains**, clica **Connect Domain**
2. Escreve: `media.pata.care`
3. O Cloudflare configura automaticamente o DNS
4. Espera a propagação (~2-5 minutos)
5. Os ficheiros ficam acessíveis em: `https://media.pata.care/videos/nome-do-video.mp4`

**Opção B — R2.dev Subdomain (mais rápido de configurar):**
1. Em **Public access**, ativa **R2.dev subdomain**
2. Confirma a ativação
3. Os ficheiros ficam acessíveis em: `https://pub-XXXXXXXX.r2.dev/videos/nome-do-video.mp4`
4. Copia o URL base que aparece

**RECOMENDO a Opção A** porque:
- URL profissional (`media.pata.care`)
- Passa pelo Cloudflare CDN com caching automático
- Melhor para SEO
- Podes mudar de storage provider no futuro sem alterar URLs

### 1.3 Configurar CORS (Se Necessário)

Se os vídeos não carregarem por problemas de CORS:

1. No bucket, vai a **Settings** → **CORS Policy**
2. Adiciona esta regra:

```json
[
  {
    "AllowedOrigins": [
      "https://pata.care",
      "https://www.pata.care",
      "http://localhost:*"
    ],
    "AllowedMethods": [
      "GET",
      "HEAD"
    ],
    "AllowedHeaders": [
      "*"
    ],
    "MaxAgeSeconds": 86400
  }
]
```

### 1.4 Configurar Cache Rules (Importante para Performance)

Para os vídeos serem cacheados no Cloudflare CDN:

1. No painel Cloudflare, vai a **Rules** → **Cache Rules** (no domínio pata.care)
2. Se usaste Custom Domain (`media.pata.care`), cria uma regra:
   - **When**: Hostname equals `media.pata.care`
   - **Then**: 
     - Cache eligibility: **Eligible for cache**
     - Edge TTL: **1 month** (os vídeos não mudam frequentemente)
     - Browser TTL: **1 week**

Isto garante que após o primeiro visitante carregar um vídeo, os próximos visitantes na mesma região recebem-no do edge cache do Cloudflare (muito mais rápido).

### 1.5 Anotar o URL Base

Depois do setup, anota o URL base:

```
Se usaste Custom Domain:  https://media.pata.care
Se usaste R2.dev:         https://pub-XXXXXXXX.r2.dev
```

Vais precisar disto no Passo 3.

---

## PARTE 2: COMPRIMIR VÍDEOS COM FFMPEG (Claude Code)

### 2.0 Instalar ffmpeg (se necessário)

```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt update && sudo apt install ffmpeg -y

# Windows (via chocolatey)
choco install ffmpeg

# Verificar instalação
ffmpeg -version
```

### 2.1 Verificar Tamanhos Atuais

```bash
echo "=== VÍDEOS ORIGINAIS ==="
ls -lhS ./src/img/videos/*.mp4
echo ""
echo "=== TAMANHO TOTAL ==="
du -sh ./src/img/videos/
```

### 2.2 Comprimir Todos os Vídeos

```bash
# Criar pasta para outputs
mkdir -p ./src/img/videos/compressed

# ============================================
# VÍDEO 1: problem1_video1.mp4 (o mais pesado ~12 MB)
# Usado em: Problem section 1
# Overlays: overlay-saturation + overlay-dark
# ============================================
ffmpeg -i ./src/img/videos/problem1_video1.mp4 \
  -vcodec libx264 \
  -crf 32 \
  -preset veryslow \
  -vf "scale='min(720,iw)':-2" \
  -an \
  -movflags +faststart \
  -pix_fmt yuv420p \
  -profile:v baseline \
  -level 3.1 \
  -y \
  ./src/img/videos/compressed/problem1_video1.mp4

# ============================================
# VÍDEO 2: problem1_video2.mp4
# Usado em: Problem section 1 (card)
# Overlays: overlay-orange
# ============================================
ffmpeg -i ./src/img/videos/problem1_video2.mp4 \
  -vcodec libx264 \
  -crf 32 \
  -preset veryslow \
  -vf "scale='min(720,iw)':-2" \
  -an \
  -movflags +faststart \
  -pix_fmt yuv420p \
  -profile:v baseline \
  -level 3.1 \
  -y \
  ./src/img/videos/compressed/problem1_video2.mp4

# ============================================
# VÍDEO 3: 2849936-hd_1280_720_24fps.mp4
# Usado em: Problem section 4
# Overlays: overlay-dark + overlay-saturation
# ============================================
ffmpeg -i ./src/img/videos/2849936-hd_1280_720_24fps.mp4 \
  -vcodec libx264 \
  -crf 32 \
  -preset veryslow \
  -vf "scale='min(720,iw)':-2" \
  -an \
  -movflags +faststart \
  -pix_fmt yuv420p \
  -profile:v baseline \
  -level 3.1 \
  -y \
  ./src/img/videos/compressed/2849936-hd_1280_720_24fps.mp4

# ============================================
# VÍDEO 4: 1851002-hd_1280_720_24fps.mp4
# Usado em: Solution card 1
# Overlays: overlay-saturation + overlay-multiply
# ============================================
ffmpeg -i ./src/img/videos/1851002-hd_1280_720_24fps.mp4 \
  -vcodec libx264 \
  -crf 32 \
  -preset veryslow \
  -vf "scale='min(720,iw)':-2" \
  -an \
  -movflags +faststart \
  -pix_fmt yuv420p \
  -profile:v baseline \
  -level 3.1 \
  -y \
  ./src/img/videos/compressed/1851002-hd_1280_720_24fps.mp4

# ============================================
# VÍDEO 5: 3939111-hd_1280_720_24fps.mp4
# Usado em: Solution card 2
# Overlays: overlay-dark + overlay-orange
# ============================================
ffmpeg -i ./src/img/videos/3939111-hd_1280_720_24fps.mp4 \
  -vcodec libx264 \
  -crf 32 \
  -preset veryslow \
  -vf "scale='min(720,iw)':-2" \
  -an \
  -movflags +faststart \
  -pix_fmt yuv420p \
  -profile:v baseline \
  -level 3.1 \
  -y \
  ./src/img/videos/compressed/3939111-hd_1280_720_24fps.mp4

# ============================================
# VÍDEO 6: 6865078-hd_1366_720_25fps.mp4
# Usado em: Solution section 3
# Overlays: overlay-dark
# ============================================
ffmpeg -i ./src/img/videos/6865078-hd_1366_720_25fps.mp4 \
  -vcodec libx264 \
  -crf 32 \
  -preset veryslow \
  -vf "scale='min(720,iw)':-2" \
  -an \
  -movflags +faststart \
  -pix_fmt yuv420p \
  -profile:v baseline \
  -level 3.1 \
  -y \
  ./src/img/videos/compressed/6865078-hd_1366_720_25fps.mp4
```

**Parâmetros explicados:**
| Parâmetro | O que faz | Porquê |
|-----------|-----------|--------|
| `-crf 32` | Qualidade reduzida | Backgrounds com overlay não precisam de HD |
| `-preset veryslow` | Compressão máxima | Ficheiro mais pequeno, demora mais a processar |
| `-vf "scale='min(720,iw)':-2"` | Máximo 720px largura | Suficiente para backgrounds |
| `-an` | Remove áudio | Vídeos são muted, áudio é desperdício |
| `-movflags +faststart` | Metadata no início | Browser começa a mostrar antes de descarregar tudo |
| `-pix_fmt yuv420p` | Formato de cor standard | Compatibilidade máxima |
| `-profile:v baseline -level 3.1` | Perfil base H.264 | Funciona até em mobiles antigos |

### 2.3 Gerar Poster Images

```bash
# Poster para cada vídeo (imagem estática do primeiro frame)
for f in ./src/img/videos/compressed/*.mp4; do
  filename=$(basename "$f" .mp4)
  ffmpeg -i "$f" -vframes 1 -q:v 3 -y "./src/img/videos/compressed/${filename}_poster.jpg"
done

# Se tiveres cwebp instalado, converte para WebP (mais leve):
# brew install webp  OU  sudo apt install webp
for f in ./src/img/videos/compressed/*_poster.jpg; do
  filename=$(basename "$f" .jpg)
  cwebp -q 70 "$f" -o "./src/img/videos/compressed/${filename}.webp"
done
```

### 2.4 Comparar Tamanhos

```bash
echo "=========================================="
echo "  RELATÓRIO DE COMPRESSÃO DE VÍDEOS"
echo "=========================================="
echo ""
echo "ORIGINAIS:"
ls -lhS ./src/img/videos/*.mp4
echo ""
echo "COMPRIMIDOS:"
ls -lhS ./src/img/videos/compressed/*.mp4
echo ""
echo "POSTERS:"
ls -lhS ./src/img/videos/compressed/*_poster.* 2>/dev/null
echo ""
echo "TOTAIS:"
echo -n "  Original: " && du -sh ./src/img/videos/*.mp4 | tail -1
echo -n "  Comprimido: " && du -sh ./src/img/videos/compressed/*.mp4 | tail -1
```

### 2.5 Testar Visualmente

Abre cada vídeo comprimido e verifica a qualidade:
```bash
# macOS
open ./src/img/videos/compressed/problem1_video1.mp4

# Linux
xdg-open ./src/img/videos/compressed/problem1_video1.mp4

# Windows
start ./src/img/videos/compressed/problem1_video1.mp4
```

Se algum vídeo ficar com qualidade demasiado baixa, recomprime com CRF 28:
```bash
ffmpeg -i ./src/img/videos/NOME_ORIGINAL.mp4 \
  -vcodec libx264 -crf 28 -preset veryslow \
  -vf "scale='min(720,iw)':-2" -an \
  -movflags +faststart -pix_fmt yuv420p \
  -profile:v baseline -level 3.1 -y \
  ./src/img/videos/compressed/NOME_ORIGINAL.mp4
```

---

## PARTE 3: UPLOAD PARA CLOUDFLARE R2 (Manual — Diogo)

### 3.1 Upload via Dashboard (Mais Simples)

1. Vai a **dash.cloudflare.com** → **R2 Object Storage** → bucket **pata-media**
2. Cria uma pasta: clica **Create folder** → nome: `videos`
3. Entra na pasta `videos`
4. Clica **Upload files**
5. Seleciona TODOS os ficheiros da pasta `./src/img/videos/compressed/`:
   - Os 6 ficheiros `.mp4` comprimidos
   - Os 6 ficheiros `_poster.webp` (ou `.jpg`)
6. Espera o upload completar

### 3.2 Upload via CLI (Alternativa — Mais Rápido)

Se preferires linha de comando, instala o Wrangler (CLI da Cloudflare):

```bash
# Instalar wrangler
npm install -g wrangler

# Login
wrangler login

# Upload de todos os vídeos comprimidos
for f in ./src/img/videos/compressed/*; do
  filename=$(basename "$f")
  wrangler r2 object put "pata-media/videos/$filename" --file="$f"
  echo "✅ Uploaded: $filename"
done
```

### 3.3 Verificar Upload

Testa que os ficheiros são acessíveis:

```
Se Custom Domain (media.pata.care):
  https://media.pata.care/videos/problem1_video1.mp4

Se R2.dev:
  https://pub-XXXXXXXX.r2.dev/videos/problem1_video1.mp4
```

Abre cada URL no browser e confirma que o vídeo reproduz.

### 3.4 Anota Todos os URLs

Preenche esta tabela com os URLs reais:

```
VIDEO_BASE_URL = https://media.pata.care/videos
(OU)
VIDEO_BASE_URL = https://pub-XXXXXXXX.r2.dev/videos

URLs finais:
1. {VIDEO_BASE_URL}/problem1_video1.mp4
2. {VIDEO_BASE_URL}/problem1_video2.mp4
3. {VIDEO_BASE_URL}/2849936-hd_1280_720_24fps.mp4
4. {VIDEO_BASE_URL}/1851002-hd_1280_720_24fps.mp4
5. {VIDEO_BASE_URL}/3939111-hd_1280_720_24fps.mp4
6. {VIDEO_BASE_URL}/6865078-hd_1366_720_25fps.mp4

Posters:
1. {VIDEO_BASE_URL}/problem1_video1_poster.webp
2. {VIDEO_BASE_URL}/problem1_video2_poster.webp
3. {VIDEO_BASE_URL}/2849936-hd_1280_720_24fps_poster.webp
4. {VIDEO_BASE_URL}/1851002-hd_1280_720_24fps_poster.webp
5. {VIDEO_BASE_URL}/3939111-hd_1280_720_24fps_poster.webp
6. {VIDEO_BASE_URL}/6865078-hd_1366_720_25fps_poster.webp
```

---

## PARTE 4: ATUALIZAR O HTML (Claude Code)

### 🤖 PROMPT PARA CLAUDE CODE

```
# TAREFA: Atualizar URLs dos Vídeos para Cloudflare R2

## CONTEXTO
Os vídeos de fundo do pata.care foram comprimidos e hospedados no Cloudflare R2.
O URL base é: VIDEO_BASE_URL (substituir pelo URL real)
Os vídeos mantêm autoplay, loop, muted, playsinline — sem alteração de comportamento.
O lazy loading via data-lazy-video já existe e deve ser mantido.

## O QUE FAZER

### Passo 1: Substituir data-src dos vídeos

Encontra no index.html TODAS as 6 tags <video> e atualiza os data-src das sources.
Adiciona também o atributo poster com a imagem de placeholder.
Adiciona preload="none" se ainda não tiver.

SUBSTITUIÇÕES (faz EXATAMENTE estas 6):

1. ENCONTRA:
<source data-src="./src/img/videos/problem1_video1.mp4" type="video/mp4">

SUBSTITUI POR:
<source data-src="VIDEO_BASE_URL/problem1_video1.mp4" type="video/mp4">

E no <video> parent, adiciona poster:
poster="VIDEO_BASE_URL/problem1_video1_poster.webp"

---

2. ENCONTRA:
<source data-src="./src/img/videos/problem1_video2.mp4" type="video/mp4">

SUBSTITUI POR:
<source data-src="VIDEO_BASE_URL/problem1_video2.mp4" type="video/mp4">

E poster: poster="VIDEO_BASE_URL/problem1_video2_poster.webp"

---

3. ENCONTRA:
<source data-src="./src/img/videos/2849936-hd_1280_720_24fps.mp4" type="video/mp4">

SUBSTITUI POR:
<source data-src="VIDEO_BASE_URL/2849936-hd_1280_720_24fps.mp4" type="video/mp4">

E poster: poster="VIDEO_BASE_URL/2849936-hd_1280_720_24fps_poster.webp"

---

4. ENCONTRA:
<source data-src="./src/img/videos/1851002-hd_1280_720_24fps.mp4" type="video/mp4">

SUBSTITUI POR:
<source data-src="VIDEO_BASE_URL/1851002-hd_1280_720_24fps.mp4" type="video/mp4">

E poster: poster="VIDEO_BASE_URL/1851002-hd_1280_720_24fps_poster.webp"

---

5. ENCONTRA:
<source data-src="./src/img/videos/3939111-hd_1280_720_24fps.mp4" type="video/mp4">

SUBSTITUI POR:
<source data-src="VIDEO_BASE_URL/3939111-hd_1280_720_24fps.mp4" type="video/mp4">

E poster: poster="VIDEO_BASE_URL/3939111-hd_1280_720_24fps_poster.webp"

---

6. ENCONTRA:
<source data-src="./src/img/videos/6865078-hd_1366_720_25fps.mp4" type="video/mp4">

SUBSTITUI POR:
<source data-src="VIDEO_BASE_URL/6865078-hd_1366_720_25fps.mp4" type="video/mp4">

E poster: poster="VIDEO_BASE_URL/6865078-hd_1366_720_25fps_poster.webp"

---

### Passo 2: Resultado Final de Cada Video Tag

Cada <video> deve ficar assim (exemplo do vídeo 1):

```html
<video
    class="background-video"
    autoplay
    loop
    muted
    playsinline
    preload="none"
    poster="VIDEO_BASE_URL/problem1_video1_poster.webp"
    data-lazy-video>
    <source data-src="VIDEO_BASE_URL/problem1_video1.mp4" type="video/mp4">
</video>
```

Mudanças em relação ao original:
- ✅ data-src aponta para Cloudflare R2 (não local)
- ✅ poster adicionado (imagem estática enquanto vídeo carrega)
- ✅ preload="none" (não carregar nada até IntersectionObserver ativar)
- ❌ NÃO mudar: class, autoplay, loop, muted, playsinline, data-lazy-video

### Passo 3: Adicionar Preconnect para R2

No <head> do index.html, adiciona preconnect para o domínio do R2
(LOGO APÓS os meta charset e viewport, antes de qualquer CSS):

```html
<!-- Preconnect para Cloudflare R2 video CDN -->
<link rel="preconnect" href="VIDEO_BASE_URL_DOMAIN" crossorigin>
<link rel="dns-prefetch" href="VIDEO_BASE_URL_DOMAIN">
```

Onde VIDEO_BASE_URL_DOMAIN é:
- Se custom domain: https://media.pata.care
- Se r2.dev: https://pub-XXXXXXXX.r2.dev

### Passo 4: Verificação

Confirma que:
- [ ] As 6 tags <source> apontam para Cloudflare R2
- [ ] As 6 tags <video> têm poster
- [ ] Todas têm preload="none"
- [ ] Preconnect adicionado no <head>
- [ ] data-lazy-video mantido em todas
- [ ] autoplay loop muted playsinline mantidos
- [ ] Nenhum ficheiro de vídeo local é referenciado no HTML
```

---

## PARTE 5: LIMPEZA DO REPOSITÓRIO (Após Testar)

Depois de confirmar que tudo funciona com os vídeos do R2:

### 5.1 Remover Vídeos do Git

```bash
# Remover ficheiros de vídeo do repositório
git rm ./src/img/videos/problem1_video1.mp4
git rm ./src/img/videos/problem1_video2.mp4
git rm ./src/img/videos/2849936-hd_1280_720_24fps.mp4
git rm ./src/img/videos/1851002-hd_1280_720_24fps.mp4
git rm ./src/img/videos/3939111-hd_1280_720_24fps.mp4
git rm ./src/img/videos/6865078-hd_1366_720_25fps.mp4

# Adicionar ao .gitignore
echo "" >> .gitignore
echo "# Video files — hosted on Cloudflare R2" >> .gitignore
echo "*.mp4" >> .gitignore
echo "*.webm" >> .gitignore
echo "*.mov" >> .gitignore

# Commit
git commit -m "chore: move videos to Cloudflare R2 CDN for performance"
```

### 5.2 Limpar Histórico do Git (Opcional — Reduz Tamanho do Repo)

Os vídeos de 25+ MB ainda existem no histórico do Git. Para limpeza total:

```bash
# CUIDADO: isto reescreve o histórico do Git
# Só fazer se tens a certeza

# Instalar git-filter-repo (mais seguro que filter-branch)
pip install git-filter-repo

# Remover ficheiros grandes do histórico
git filter-repo --path src/img/videos/ --invert-paths

# Force push (avisa a equipa antes)
git push --force
```

**NOTA**: Só faz isto se o repositório é só teu. Se tiver colaboradores, coordena com eles.

---

## PARTE 6: RESULTADO FINAL

### Antes vs Depois

| | Antes | Depois |
|--|-------|--------|
| **Vídeos servidos de** | GitHub Pages | Cloudflare R2 CDN |
| **Tamanho dos vídeos** | ~25-30 MB | ~3-5 MB (comprimidos) |
| **Peso no GitHub Pages** | ~25-30 MB | 0 MB |
| **Peso no page load** | 12+ MB (sem lazy load eficaz) | 0 MB (lazy load + poster) |
| **Custo** | Grátis (GitHub) | Grátis (R2 free tier) |
| **CDN** | GitHub (não otimizado para media) | Cloudflare edge global |
| **Cache** | Básico | Edge cache + browser cache |
| **Comportamento visual** | Idêntico | Idêntico + poster placeholder |

### Impacto Esperado no Performance Score

| Métrica | Atual | Estimativa |
|---------|-------|------------|
| **Transfer Size** | 14.64 MB | ~2.5-3 MB |
| **Network Time** | 16.5s | ~3-5s |
| **onLoad** | 6.1s | ~2-3s |
| **Score** | 53 | ~75-85 |

A combinação com as outras otimizações do Phase 2 (CLS fix, TBT reduction, LCP optimization) deve levar o score para **85-95**.

---

## 📋 CHECKLIST COMPLETO — ORDEM DE EXECUÇÃO

### Tu (Diogo):
- [ ] 1. Criar bucket R2 `pata-media` no Cloudflare
- [ ] 2. Configurar acesso público (custom domain ou r2.dev)
- [ ] 3. Configurar CORS se necessário
- [ ] 4. Instalar ffmpeg no computador

### Claude Code:
- [ ] 5. Comprimir os 6 vídeos com ffmpeg
- [ ] 6. Gerar poster images

### Tu (Diogo):
- [ ] 7. Verificar qualidade visual dos vídeos comprimidos
- [ ] 8. Upload dos vídeos + posters para R2
- [ ] 9. Testar URLs dos vídeos no browser
- [ ] 10. Anotar o URL base

### Claude Code:
- [ ] 11. Atualizar data-src no HTML para URLs do R2
- [ ] 12. Adicionar poster a cada <video>
- [ ] 13. Adicionar preconnect no <head>

### Tu (Diogo):
- [ ] 14. Testar site localmente — vídeos funcionam?
- [ ] 15. Testar em mobile — autoplay funciona?
- [ ] 16. Deploy para GitHub Pages
- [ ] 17. Re-testar no PageSpeed Insights
- [ ] 18. Remover vídeos locais do repositório
- [ ] 19. 🎉 Celebrar o score novo

---

*PATA Cloudflare R2 Video Migration — Fevereiro 2026*
