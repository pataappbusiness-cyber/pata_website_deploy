
# 🔧 PATA.CARE - Relatório de Correção de Performance

## Score: 39 → Meta 80+

---

## 🔍 3 PROBLEMAS CRÍTICOS ENCONTRADOS

### PROBLEMA 1: Ficheiro HTML TRUNCADO (CRÍTICO)
O ficheiro `index.html` terminava abruptamente no meio do script do Consentmanager:
```
s.setAttribute('data-cmp-ab',  ← ficheiro cortado aqui
```
**Faltava:** o resto do script, `</body>` e `</html>`

**Impacto:** O browser nunca fecha o documento. O parser fica em modo "quirks", o DOM nunca completa corretamente, e todos os scripts ficam à espera.

**Fix aplicado:** Consentmanager script completo + `</body></html>`

---

### PROBLEMA 2: Mockup LCP Invisível — opacity:0 (CRÍTICO)
O CSS externo (`styles.min.css`) contém:
```css
.mockup-center { opacity: 0; transition: opacity .6s ease .4s; }
.mockup-center.visible { opacity: 1; }
```

O mockup começa **invisível** e só aparece quando o JavaScript da `HeaderAnimations` class adiciona `.visible` via IntersectionObserver. 

O browser **NÃO conta elementos com opacity:0 como LCP**. Por isso:
- **Antes (5.84MB):** Os vídeos pesados atrasavam tudo, e por acaso o mockup ficava visible antes da medição LCP
- **Agora (1.17MB):** Sem vídeos, DOM Ready é 1s, mas o mockup ainda está opacity:0 quando o LCP é medido → browser escolhe `BONE.svg` como LCP → LCP = 8.9s (porque BONE.svg aparece tarde)

**Fix aplicado:** CSS inline no `<head>`:
```css
.mockup-center { opacity: 1 !important; }
```
Isto garante que o mockup (130kB, preloaded) é imediatamente visível e reconhecido como LCP.

---

### PROBLEMA 3: Rocket Loader AINDA ATIVO
O ficheiro contém na linha 2605:
```html
<script data-cfasync="false" src="/cdn-cgi/scripts/5c5dd728/cloudflare-static/email-decode.min.js"></script>
```
Isto é **injetado pelo Cloudflare**, confirmando que Rocket Loader está ativo.

**Fix necessário (no Dashboard Cloudflare):**
1. **Speed → Optimization → Content Optimization → Rocket Loader → OFF**
2. Opcionalmente: **Scrape Shield → Email Address Obfuscation → OFF** (remove o email-decode.min.js)

---

## ✅ O QUE JÁ ESTAVA CORRETO (Bom trabalho!)

| Otimização | Status |
|---|---|
| Vídeos sem `autoplay` e sem `src` direto | ✅ Correto |
| `data-lazy-video` + `data-src` nos vídeos | ✅ Correto |
| `poster` nos vídeos | ✅ Correto |
| CSS sync (sem async pattern) | ✅ Correto |
| Preconnects limpos (só media.pata.care + bunny.net) | ✅ Correto |
| Consentmanager com `data-cfasync="false"` | ✅ Correto |
| Width/height no mockup e pills | ✅ Correto |
| Transfer reduzido de 5.84MB → 1.17MB | ✅ Excelente |

---

## 📦 FICHEIRO CORRIGIDO: `index.html`

### Alterações feitas:

1. **Linha ~435:** Adicionado CSS critical inline:
   ```css
   .mockup-center { opacity: 1 !important; }
   ```

2. **Linha ~2628-final:** Corrigido script truncado do Consentmanager + `</body></html>`

3. **Várias linhas:** Adicionadas dimensões `width/height` às 5 imagens restantes (benefit cards)

4. **Várias linhas:** Adicionadas dimensões aos SVG icons que faltavam (tutores_adiam, 100 beneficios, logo_preto, junte-se, zero risco, zero custo, 100 beneficios branco)

---

## ⚡ AÇÕES NECESSÁRIAS NO CLOUDFLARE (Manual)

### Obrigatório:
- [ ] **Rocket Loader → OFF** (Speed → Optimization → Content Optimization)

### Recomendado:
- [ ] **Email Obfuscation → OFF** (Scrape Shield) — remove email-decode.min.js
- [ ] **Early Hints → ON** (Speed → Optimization)
- [ ] **Page Rule:** `pata.care/src/*` → Cache Everything, Edge TTL 1 month

---

## 📊 IMPACTO ESPERADO

| Métrica | Atual (39) | Esperado |
|---|---|---|
| **LCP** | 8.9s (BONE.svg) | ~1.5s (mockup) |
| **TBT** | 7.4s | <1.5s (com Rocket OFF) |
| **CLS** | 0 | 0 |
| **Transfer** | 1.17MB | ~1.17MB |
| **Score** | 39 | **75-90** |

---

## 🔧 SOBRE AS FERRAMENTAS QUE MENCIONASTE

### Partytown (partytown.qwik.dev) — ANÁLISE DETALHADA

**O que faz:** Partytown é uma biblioteca (~6KB) que move scripts de terceiros (GTM, analytics, Consentmanager, reCAPTCHA) da main thread para Web Workers. Isto significa que esses scripts deixam de competir com o teu código pelo processamento do browser, resultando em melhor TBT (Total Blocking Time) e INP (Interaction to Next Paint).

**Como funciona:** Em vez de `<script src="...">`, usas `<script type="text/partytown" src="...">`. O Partytown intercepta esses scripts, executa-os num Web Worker separado, e usa um Service Worker + JavaScript Proxies para dar acesso sincronizado ao DOM. O script de terceiros "pensa" que está na main thread, mas na verdade está isolado.

#### 🎯 Scripts candidatos no PATA que poderiam ir para Partytown:

| Script | Candidato? | Razão |
|---|---|---|
| **Google Tag Manager (GTM/gtag)** | ✅ SIM — ideal | GTM é o caso de uso #1 do Partytown. Forward `dataLayer.push` e funciona perfeitamente |
| **reCAPTCHA v3** | ⚠️ ARRISCADO | reCAPTCHA precisa de acesso direto ao DOM para detectar comportamento do utilizador. Dentro de um Web Worker perde essa capacidade e pode falhar silenciosamente |
| **Consentmanager (CMP)** | ❌ NÃO recomendado | O CMP precisa de injetar/bloquear scripts no DOM, criar iframes de consent, e interagir com cookies. Partytown está em beta e há issues reportados com CMPs que usam DOM intensivamente. Risco alto de quebrar o consent flow (crítico para GDPR) |
| **scripts.min.js (teu código)** | ❌ NUNCA | O teu código principal NUNCA deve ir para Partytown. A biblioteca é exclusivamente para scripts de terceiros |

#### 📊 Impacto estimado do Partytown APENAS no GTM:

| Métrica | Sem Partytown (atual) | Com Partytown no GTM |
|---|---|---|
| **TBT** | ~1.5s (após Rocket OFF) | ~0.8-1.2s |
| **INP** | Variável | Melhoria ~20-30% |
| **Score boost** | — | +3 a +8 pontos |

#### ⚠️ Trade-offs e riscos do Partytown:

1. **Ainda em Beta** — Partytown não é production-ready garantido. Scripts podem falhar silenciosamente dentro do Web Worker
2. **Service Worker obrigatório** — Precisa de servir ficheiros estáticos de `~/~partytown/` no mesmo domínio. No GitHub Pages/Cloudflare funciona, mas precisa de setup
3. **CORS** — Scripts de terceiros carregados via Worker podem precisar de proxy para resolver problemas de CORS
4. **Debug mais difícil** — Erros dentro do Worker são mais difíceis de diagnosticar
5. **Conflito com Cloudflare Rocket Loader** — Se Rocket Loader estiver ON, vai interferir com o `type="text/partytown"`. Rocket Loader DEVE estar OFF primeiro

#### 🏗️ Como implementar Partytown no PATA (se decidires avançar):

**Passo 1: Instalar ficheiros estáticos**
Descarregar os ficheiros da lib do Partytown e colocá-los em `/~partytown/` no teu site:
```
pata.care/
├── ~partytown/
│   ├── partytown.js
│   ├── partytown-sw.js
│   ├── partytown-atomics.js
│   └── partytown-media.js
├── index.html
└── ...
```

**Passo 2: Adicionar snippet inline no `<head>` (ANTES de qualquer outro script)**
```html
<head>
  <!-- ... meta tags ... -->

  <!-- Partytown Config + Snippet (inline, ~2KB) -->
  <script>
    partytown = {
      forward: ['dataLayer.push', 'gtag'],
      lib: '/~partytown/'
    };
  </script>
  <script>
    /* Colar aqui o conteúdo minificado de partytown.js */
    /* ~2KB inline — NÃO usar src externo */
  </script>
```

**Passo 3: Mover GTM para `type="text/partytown"`**
```html
<!-- ANTES (atual - delay loading manual): -->
<script>
  window.addEventListener('load', function() {
    setTimeout(function() {
      var s = document.createElement('script');
      s.async = true;
      s.src = 'https://www.googletagmanager.com/gtag/js?id=G-JD85N7J78Y';
      document.head.appendChild(s);
      // ...
    }, 3000);
  });
</script>

<!-- DEPOIS (com Partytown): -->
<script type="text/partytown" src="https://www.googletagmanager.com/gtag/js?id=G-JD85N7J78Y"></script>
<script type="text/partytown">
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-JD85N7J78Y');
</script>
```

**Passo 4: Manter reCAPTCHA e Consentmanager como estão** (lazy loading manual)

#### 🎯 VEREDICTO FINAL: Partytown para PATA

**Recomendação: NÃO implementar agora. Implementar como Fase 2 de otimização.**

Razões:
1. O teu approach atual de delay loading (3s GTM, 5s Consentmanager, lazy reCAPTCHA) já faz 80% do trabalho que Partytown faria
2. As 3 fixes críticas deste relatório (HTML truncado, opacity:0, Rocket Loader OFF) vão ter um impacto **muito maior** que Partytown (~40+ pontos vs ~5 pontos)
3. Partytown adiciona complexidade de deployment (ficheiros estáticos, Service Worker, possíveis problemas CORS)
4. Se após as fixes o score ficar entre 75-85, Partytown pode empurrá-lo para 85-92 — mas só vale a pena nessa altura

**Quando implementar:** Após confirmar score ≥75 com as fixes atuais, e se TBT continuar >1s.

---

### Unlighthouse (github.com/harlan-zw/unlighthouse)
**O que faz:** Corre Lighthouse automaticamente em todas as páginas do site e gera um relatório visual.

**Para PATA:** Excelente ferramenta mas **só tens 1 página agora**. Será muito útil quando tiveres mais páginas (blog, FAQ standalone, etc.). Para agora, usa o WebPageTest.org ou o PageSpeed Insights diretamente.

---

## 🎯 PRÓXIMOS PASSOS

### Fase 1: Fixes Críticas (AGORA — impacto ~40+ pontos)
1. **Substituir o `index.html` no repositório** com o ficheiro corrigido
2. **Desligar Rocket Loader** no Cloudflare Dashboard
3. **Deploy + testar** no WebPageTest.org (Mobile, Moto G Power, 4G)
4. **Se TBT > 1.5s:** Considerar aumentar delay do Consentmanager para 8s
5. **Se LCP > 2.5s:** Verificar se poster images dos vídeos estão otimizadas

### Fase 2: Partytown (DEPOIS — se score < 85 após Fase 1)
6. **Descarregar Partytown lib** (`npm i @qwik.dev/partytown` → copiar `lib/` para `/~partytown/`)
7. **Inline o snippet** de ~2KB no `<head>`
8. **Mover APENAS o GTM** para `type="text/partytown"` (deixar reCAPTCHA e Consentmanager como estão)
9. **Testar extensivamente** — verificar que GTM continua a registar pageviews e eventos
10. **Se TBT ainda > 1s:** Considerar mover também o reCAPTCHA para Partytown (com testes)
