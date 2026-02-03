





## 🎯 VISÃO GERAL

**Objetivo:** Criar uma página web completa e responsiva da Política de Privacidade da PATA, seguindo pixel-perfect o design do Figma, com todos os ícones SVG locais e estrutura HTML semântica.

**Referência Figma:** https://www.figma.com/design/foywvD3Djh1yzshKk4Fwft/PATA-WEBSITE?node-id=495-4346&m=dev

**Stack Tecnológica:**
- HTML5 semântico
- CSS3 (ficheiro separado)
- JavaScript vanilla (ficheiro separado, se necessário)
- SVG Icons locais (não usar CDNs)

---

## 📁 ESTRUTURA DE FICHEIROS

```
politica-privacidade/
├── index.html                          # Página principal
├── css/
│   └── style.css                       # Estilos principais
├── js/
│   └── main.js                         # Scripts (se necessário)
└── img/
    └── icons/
        ├── logo_signature_branco.svg   # Logo PATA principal (header)
        ├── rato_pata_hover.svg         # Ícone pata inline
        ├── search-alt.svg              # Ícone "Aceder"
        ├── pen-clip.svg                # Ícone "Retificar"
        ├── trash.svg                   # Ícone "Apagar"
        ├── pause-circle.svg            # Ícone "Limitar"
        ├── box-open.svg                # Ícone "Portabilidade"
        └── ban.svg                     # Ícone "Opor-se"
```

---

## 🎨 DESIGN TOKENS

### Cores PATA

```css
:root {
    /* Primary Colors */
    --orange-primary: #FF8C42;
    --orange-light: #FF943D;
    --teal-secondary: #4ECDC4;
    
    /* Neutral Colors */
    --dark: #1a1a1a;
    --text-primary: #2C2C2C;
    --text-secondary: #666;
    --white: #FEFEFF;
    
    /* Background Colors */
    --bg-light: #FFF8F0;
    --bg-cream: #FFF5EE;
    --bg-peach: #FFB477;
    
    /* Border & Dividers */
    --border-light: #eee;
    
    /* Shadows */
    --shadow-sm: 0px 4px 8px 0px rgba(0, 0, 0, 0.1);
    --shadow-md: 0px 4px 20px 0px rgba(0, 0, 0, 0.05);
}
```

### Tipografia Mona Sans

```css
/* Font Imports */
@import url('https://fonts.googleapis.com/css2?family=Mona+Sans:wght@400;600;700;800&display=swap');

:root {
    /* Font Family */
    --font-primary: 'Mona Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    
    /* Font Sizes */
    --fs-h1: 52px;
    --fs-h2: 24px;
    --fs-h3: 20px;
    --fs-h4: 18px;
    --fs-body: 18px;
    --fs-small: 14px;
    
    /* Line Heights */
    --lh-h1: 38px;
    --lh-h2: 28px;
    --lh-h3: 24px;
    --lh-h4: 20px;
    --lh-body: 22px;
    --lh-small: 16px;
    
    /* Font Weights */
    --fw-regular: 400;
    --fw-semibold: 600;
    --fw-bold: 700;
    --fw-extrabold: 800;
}
```

### Espaçamentos

```css
:root {
    /* Container */
    --container-max-width: 800px;
    --container-padding: 24px;
    --container-padding-y: 60px;
    
    /* Sections */
    --section-gap: 24px;
    --section-padding: 32px;
    --section-border-radius: 16px;
    
    /* Elements */
    --highlight-padding: 20px 24px;
    --card-padding: 20px;
    --card-border-radius: 12px;
    --button-border-radius: 16px;
    
    /* Gaps */
    --gap-xs: 8px;
    --gap-sm: 12px;
    --gap-md: 16px;
    --gap-lg: 20px;
    --gap-xl: 32px;
}
```

---

## 🏗️ ESTRUTURA HTML

### 1. Header com Logo PATA

**Elemento:** Logo principal no topo
**Ícone:** `logo_signature_branco.svg`
**Localização:** `C:\Users\diogo\Desktop\Aventuras do Diego\PATA\pata_website_deploy\src\img\icons\logo_signature_branco.svg`

**Especificações:**
- Largura: 467px
- Altura: 159px
- Posição: Centrada no header
- Background: Imagem de fundo escura (gradient ou imagem)

```html
<header class="header">
    <div class="logo-container">
        <img src="img/icons/logo_signature_branco.svg" alt="PATA - Telemedicina Veterinária" class="logo">
    </div>
    <h1>Política de Privacidade</h1>
    <p class="subtitle">
        Como a 
        <img src="img/icons/rato_pata_hover.svg" alt="PATA" class="pata-icon-inline">
        cuida dos seus dados
    </p>
    <p class="last-update">Última atualização: Janeiro de 2025</p>
</header>
```

**CSS para Header:**
```css
.header {
    text-align: center;
    margin-bottom: 48px;
    padding-bottom: 32px;
    border-bottom: 2px solid var(--border-light);
    background: linear-gradient(180deg, #2C3E50 0%, #34495E 100%);
    padding: 40px 24px;
    color: var(--white);
}

.logo-container {
    margin-bottom: 16px;
}

.logo {
    width: 467px;
    max-width: 100%;
    height: auto;
}

.pata-icon-inline {
    width: 24px;
    height: 24px;
    vertical-align: middle;
    margin: 0 4px;
}
```

---

### 2. Ícone Pata Inline (Texto)

**Elemento:** Ícone pequeno da pata usado inline no texto
**Ícone:** `rato_pata_hover.svg`
**Localização:** `C:\Users\diogo\Desktop\Aventuras do Diego\PATA\pata_website_deploy\src\img\icons\rato_pata_hover.svg`

**Onde usar:**
1. Subtitle do header: "Como a [PATA] cuida dos seus dados"
2. Secção 1 (Responsável): "[PATA] — Telemedicina Veterinária, Lda."
3. Secção 10 (Menores): "A [PATA] destina-se a maiores de 18 anos"
4. Intro box: "como a [PATA] recolhe"

**Especificações:**
- Largura inline: ~24px
- Altura inline: ~24px
- Alinhamento: `vertical-align: middle`
- Margem: `0 4px`

```html
<!-- Exemplo de uso inline -->
<p>
    Como a 
    <img src="img/icons/rato_pata_hover.svg" alt="PATA" class="pata-icon-inline">
    cuida dos seus dados
</p>
```

---

### 3. Secção 7: Os Seus Direitos (Grid de Cards com Ícones)

**Referência Figma:** https://www.figma.com/design/foywvD3Djh1yzshKk4Fwft/PATA-WEBSITE?node-id=495-4615&m=dev

Esta secção contém 6 cards com ícones representando os direitos RGPD:

#### Card 1: Aceder
**Ícone:** `search-alt.svg`
**Referência:** https://www.figma.com/design/foywvD3Djh1yzshKk4Fwft/PATA-WEBSITE?node-id=495-4623&m=dev
**Localização:** `C:\Users\diogo\Desktop\Aventuras do Diego\PATA\pata_website_deploy\src\img\icons\search-alt.svg`
**Especificações:**
- Tamanho: 40px × 40px
- Cor: Usar cor original do SVG (geralmente laranja/orange)

#### Card 2: Retificar
**Ícone:** `pen-clip.svg`
**Referência:** https://www.figma.com/design/foywvD3Djh1yzshKk4Fwft/PATA-WEBSITE?node-id=495-4628&m=dev
**Localização:** `C:\Users\diogo\Desktop\Aventuras do Diego\PATA\pata_website_deploy\src\img\icons\pen-clip.svg`
**Especificações:**
- Tamanho: 40px × 40px

#### Card 3: Apagar
**Ícone:** `trash.svg`
**Referência:** https://www.figma.com/design/foywvD3Djh1yzshKk4Fwft/PATA-WEBSITE?node-id=495-4633&m=dev
**Localização:** `C:\Users\diogo\Desktop\Aventuras do Diego\PATA\pata_website_deploy\src\img\icons\trash.svg`
**Especificações:**
- Tamanho: 40px × 40px

#### Card 4: Limitar
**Ícone:** `pause-circle.svg`
**Referência:** https://www.figma.com/design/foywvD3Djh1yzshKk4Fwft/PATA-WEBSITE?node-id=495-4638&m=dev
**Localização:** `C:\Users\diogo\Desktop\Aventuras do Diego\PATA\pata_website_deploy\src\img\icons\pause-circle.svg`
**Especificações:**
- Tamanho: 40px × 40px

#### Card 5: Portabilidade
**Ícone:** `box-open.svg`
**Referência:** https://www.figma.com/design/foywvD3Djh1yzshKk4Fwft/PATA-WEBSITE?node-id=495-4643&m=dev
**Localização:** `C:\Users\diogo\Desktop\Aventuras do Diego\PATA\pata_website_deploy\src\img\icons\box-open.svg`
**Especificações:**
- Tamanho: 40px × 40px

#### Card 6: Opor-se
**Ícone:** `ban.svg`
**Referência:** https://www.figma.com/design/foywvD3Djh1yzshKk4Fwft/PATA-WEBSITE?node-id=495-4648&m=dev
**Localização:** `C:\Users\diogo\Desktop\Aventuras do Diego\PATA\pata_website_deploy\src\img\icons\ban.svg`
**Especificações:**
- Tamanho: 40px × 40px

**HTML Structure - Grid de Direitos:**

```html
<section class="section" id="direitos">
    <h2><span class="number">7</span> Os seus direitos</h2>
    <p>O RGPD dá-lhe controlo sobre os seus dados. Tem direito a:</p>
    
    <div class="rights-grid">
        <!-- Card 1: Aceder -->
        <div class="right-card">
            <img src="img/icons/search-alt.svg" alt="Aceder" class="right-icon">
            <div class="right-title">Aceder</div>
            <div class="right-desc">Saber que dados temos sobre si</div>
        </div>
        
        <!-- Card 2: Retificar -->
        <div class="right-card">
            <img src="img/icons/pen-clip.svg" alt="Retificar" class="right-icon">
            <div class="right-title">Retificar</div>
            <div class="right-desc">Corrigir dados incorretos</div>
        </div>
        
        <!-- Card 3: Apagar -->
        <div class="right-card">
            <img src="img/icons/trash.svg" alt="Apagar" class="right-icon">
            <div class="right-title">Apagar</div>
            <div class="right-desc">Pedir eliminação dos dados</div>
        </div>
        
        <!-- Card 4: Limitar -->
        <div class="right-card">
            <img src="img/icons/pause-circle.svg" alt="Limitar" class="right-icon">
            <div class="right-title">Limitar</div>
            <div class="right-desc">Restringir o tratamento</div>
        </div>
        
        <!-- Card 5: Portabilidade -->
        <div class="right-card">
            <img src="img/icons/box-open.svg" alt="Portabilidade" class="right-icon">
            <div class="right-title">Portabilidade</div>
            <div class="right-desc">Receber dados em formato digital</div>
        </div>
        
        <!-- Card 6: Opor-se -->
        <div class="right-card">
            <img src="img/icons/ban.svg" alt="Opor-se" class="right-icon">
            <div class="right-title">Opor-se</div>
            <div class="right-desc">Recusar certos tratamentos</div>
        </div>
    </div>
    
    <div class="highlight">
        <strong>Como exercer os seus direitos:</strong><br>
        Envie email para <a href="mailto:privacidade@pata.pt">privacidade@pata.pt</a> com o seu pedido. Respondemos em 30 dias (máximo legal). É gratuito.
    </div>
    
    <p>Se achar que não tratámos bem os seus dados, pode apresentar queixa à <strong>CNPD</strong> (Comissão Nacional de Proteção de Dados) em <a href="https://www.cnpd.pt" target="_blank" rel="noopener noreferrer">www.cnpd.pt</a>.</p>
</section>
```

**CSS para Grid de Direitos:**

```css
.rights-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(179px, 1fr));
    gap: 29px 16px;
    margin: 20px 0;
}

.right-card {
    background: var(--bg-light);
    border-radius: var(--card-border-radius);
    padding: var(--card-padding);
    text-align: center;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    box-shadow: var(--shadow-sm);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    min-height: 148px;
}

.right-card:hover {
    transform: translateY(-4px);
    box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.15);
}

.right-icon {
    width: 40px;
    height: 40px;
    flex-shrink: 0;
}

.right-title {
    font-weight: var(--fw-semibold);
    font-size: var(--fs-h4);
    line-height: var(--lh-h4);
    color: var(--dark);
    margin: 0;
}

.right-desc {
    font-size: var(--fs-small);
    line-height: var(--lh-small);
    color: var(--text-secondary);
    font-weight: var(--fw-semibold);
}
```

---

## 📄 CONTEÚDO COMPLETO HTML

### Estrutura Base

```html
<!DOCTYPE html>
<html lang="pt-PT">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Política de Privacidade da PATA - Saiba como protegemos os seus dados pessoais e veterinários.">
    <title>Política de Privacidade | PATA - Telemedicina Veterinária</title>
    <link rel="stylesheet" href="css/style.css">
    
    <!-- COPIAR O HEADER DO INDEX PRINCIPAL AQUI -->
    <!-- O header do website principal deve ser copiado para manter consistência -->
</head>
<body>
    <!-- HEADER WEBSITE PRINCIPAL (copiar do index.html) -->
    <!-- ... -->
    
    <!-- CONTEÚDO DA POLÍTICA DE PRIVACIDADE -->
    <main class="privacy-policy">
        <!-- Background Gradient/Image -->
        <div class="hero-background"></div>
        
        <div class="container">
            <!-- Header da Política -->
            <header class="policy-header">
                <div class="logo-container">
                    <img src="img/icons/logo_signature_branco.svg" alt="PATA - Telemedicina Veterinária" class="logo">
                </div>
                <h1>Política de Privacidade</h1>
                <p class="subtitle">
                    Como a 
                    <img src="img/icons/rato_pata_hover.svg" alt="PATA" class="pata-icon-inline">
                    cuida dos seus dados
                </p>
                <p class="last-update">Última atualização: Janeiro de 2025</p>
            </header>
            
            <!-- Intro Box -->
            <div class="intro-box">
                <p><strong>Bem-vindo!</strong> Esta Política de Privacidade explica, de forma clara e humana, como a <img src="img/icons/rato_pata_hover.svg" alt="PATA" class="pata-icon-inline"> recolhe, usa, protege e partilha os seus dados pessoais.</p>
                <p>Sabemos que políticas de privacidade costumam ser longas e confusas. Tentámos tornar esta diferente: escrita em português simples, sem juridiquês desnecessário.</p>
                <p><strong>A versão resumida:</strong> Tratamos os seus dados com respeito, usamos apenas o necessário para prestar o serviço, e nunca os vendemos.</p>
            </div>
            
            <!-- Índice -->
            <nav class="toc">
                <h2>Índice</h2>
                <ol>
                    <li><a href="#responsavel">Quem é o responsável pelos dados</a></li>
                    <li><a href="#dados">Que dados recolhemos</a></li>
                    <li><a href="#como">Como recolhemos</a></li>
                    <li><a href="#porque">Para que usamos</a></li>
                    <li><a href="#partilha">Com quem partilhamos</a></li>
                    <li><a href="#tempo">Durante quanto tempo guardamos</a></li>
                    <li><a href="#direitos">Os seus direitos</a></li>
                    <li><a href="#cookies">Cookies</a></li>
                    <li><a href="#seguranca">Segurança</a></li>
                    <li><a href="#menores">Menores de idade</a></li>
                    <li><a href="#alteracoes">Alterações a esta política</a></li>
                    <li><a href="#contacto">Como nos contactar</a></li>
                </ol>
            </nav>
            
            <!-- Secções (1-12) -->
            <!-- Ver conteúdo completo no ficheiro HTML gerado anteriormente -->
            <!-- ... todas as 12 secções com conteúdo completo ... -->
            
        </div>
    </main>
    
    <!-- FOOTER WEBSITE PRINCIPAL (copiar do index.html) -->
    <!-- ... -->
    
    <script src="js/main.js"></script>
</body>
</html>
```

---

## 🎨 CSS COMPLETO

### Reset & Base Styles

```css
/* CSS Variables (já definidas acima) */

/* Reset */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: var(--font-primary);
    line-height: var(--lh-body);
    color: var(--text-primary);
    background: var(--bg-light);
    font-size: var(--fs-body);
}

/* Container */
.container {
    max-width: var(--container-max-width);
    margin: 0 auto;
    padding: var(--container-padding-y) var(--container-padding);
}

/* Links */
a {
    color: var(--orange-light);
    text-decoration: none;
    font-weight: var(--fw-semibold);
    transition: all 0.2s ease;
}

a:hover {
    text-decoration: underline;
}

/* Headings */
h1, h2, h3, h4, h5, h6 {
    font-weight: var(--fw-bold);
    color: var(--dark);
    margin-bottom: 1rem;
}

h1 {
    font-size: var(--fs-h1);
    line-height: var(--lh-h1);
    font-weight: var(--fw-extrabold);
}

h2 {
    font-size: var(--fs-h2);
    line-height: var(--lh-h2);
    font-weight: var(--fw-semibold);
}

h3 {
    font-size: var(--fs-h3);
    line-height: var(--lh-h3);
}

/* Lists */
ul, ol {
    padding-left: 24px;
    margin-bottom: 16px;
}

li {
    margin-bottom: 8px;
}

/* Strong/Bold */
strong {
    font-weight: var(--fw-semibold);
    color: var(--dark);
}
```

### Header Específico da Política

```css
.hero-background {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 400px;
    background: linear-gradient(180deg, #2C3E50 0%, #34495E 100%);
    z-index: -1;
}

.policy-header {
    text-align: center;
    margin-bottom: 48px;
    padding: 40px 24px 32px;
    border-bottom: 2px solid var(--border-light);
    background: transparent;
    color: var(--white);
}

.policy-header h1 {
    color: var(--white);
    margin-bottom: 12px;
}

.policy-header .subtitle {
    font-size: var(--fs-h2);
    line-height: var(--lh-h2);
    font-weight: var(--fw-semibold);
    color: var(--white);
    max-width: 600px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: 4px;
}

.policy-header .last-update {
    font-size: var(--fs-small);
    line-height: var(--lh-small);
    color: rgba(255, 255, 255, 0.8);
    margin-top: 16px;
}
```

### Sections & Cards

```css
.section {
    background: white;
    border-radius: var(--section-border-radius);
    padding: var(--section-padding);
    margin-bottom: var(--section-gap);
    box-shadow: var(--shadow-md);
}

.section h2 {
    display: flex;
    align-items: center;
    gap: var(--gap-sm);
    margin-bottom: 20px;
}

.section h2 .number {
    background: var(--orange-primary);
    color: white;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14.4px;
    font-weight: var(--fw-bold);
    flex-shrink: 0;
}

.section h3 {
    font-size: var(--fs-h3);
    margin: 24px 0 12px;
}

.section p {
    margin-bottom: 16px;
}
```

### Intro Box & Highlights

```css
.intro-box {
    background: white;
    border-radius: var(--section-border-radius);
    padding: var(--section-padding);
    margin-bottom: 40px;
    box-shadow: var(--shadow-md);
    border-left: 5px solid var(--orange-primary);
}

.intro-box p {
    margin-bottom: 16px;
}

.intro-box p:last-child {
    margin-bottom: 0;
}

.highlight {
    background: var(--bg-light);
    border-radius: var(--card-border-radius);
    padding: var(--highlight-padding);
    margin: 20px 0;
    border-left: 4px solid var(--teal-secondary);
}

.highlight.warning {
    border-left-color: var(--orange-primary);
}
```

### Table Styles

```css
.data-table {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
    font-size: 0.95rem;
}

.data-table th,
.data-table td {
    padding: 14px 16px;
    text-align: left;
    border-bottom: 1px solid var(--border-light);
}

.data-table th {
    background: var(--dark);
    color: white;
    font-weight: var(--fw-semibold);
    font-size: var(--fs-h4);
}

.data-table tr:hover {
    background: #fafafa;
}
```

### TOC (Table of Contents)

```css
.toc {
    background: white;
    border-radius: var(--section-border-radius);
    padding: var(--section-padding);
    margin-bottom: 40px;
    box-shadow: var(--shadow-md);
}

.toc h2 {
    font-size: var(--fs-h4);
    margin-bottom: 20px;
}

.toc ol {
    padding-left: 24px;
}

.toc li {
    margin-bottom: 8px;
    font-size: var(--fs-small);
    font-weight: var(--fw-semibold);
}

.toc a {
    color: var(--orange-light);
}
```

### Contact Box

```css
.contact-box {
    background: var(--bg-light);
    border-radius: var(--card-border-radius);
    padding: 24px;
    margin: 20px 0;
}

.contact-box h3 {
    color: var(--dark);
    margin-bottom: 12px;
    font-size: var(--fs-h4);
}
```

---

## 📱 RESPONSIVIDADE

### Breakpoints

```css
/* Mobile First Approach */

/* Tablet: 768px+ */
@media (min-width: 768px) {
    .container {
        padding: 60px 32px;
    }
    
    .rights-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

/* Desktop: 1024px+ */
@media (min-width: 1024px) {
    .rights-grid {
        grid-template-columns: repeat(3, 1fr);
    }
    
    .data-table {
        font-size: 1rem;
    }
}

/* Mobile: <768px */
@media (max-width: 767px) {
    h1 {
        font-size: 36px;
        line-height: 40px;
    }
    
    .policy-header .subtitle {
        font-size: 20px;
        line-height: 24px;
    }
    
    .logo {
        width: 100%;
        max-width: 300px;
    }
    
    .section {
        padding: 24px 20px;
    }
    
    .rights-grid {
        grid-template-columns: 1fr;
        gap: 16px;
    }
    
    .data-table {
        font-size: 14px;
    }
    
    .data-table th,
    .data-table td {
        padding: 10px 12px;
    }
}
```

---

## ⚙️ INSTRUÇÕES DE IMPLEMENTAÇÃO

### Passo 1: Copiar Ícones SVG

1. **Copiar do projeto principal** os seguintes ficheiros:
   ```
   C:\Users\diogo\Desktop\Aventuras do Diego\PATA\pata_website_deploy\src\img\icons\logo_signature_branco.svg
   C:\Users\diogo\Desktop\Aventuras do Diego\PATA\pata_website_deploy\src\img\icons\rato_pata_hover.svg
   C:\Users\diogo\Desktop\Aventuras do Diego\PATA\pata_website_deploy\src\img\icons\search-alt.svg
   C:\Users\diogo\Desktop\Aventuras do Diego\PATA\pata_website_deploy\src\img\icons\pen-clip.svg
   C:\Users\diogo\Desktop\Aventuras do Diego\PATA\pata_website_deploy\src\img\icons\trash.svg
   C:\Users\diogo\Desktop\Aventuras do Diego\PATA\pata_website_deploy\src\img\icons\pause-circle.svg
   C:\Users\diogo\Desktop\Aventuras do Diego\PATA\pata_website_deploy\src\img\icons\box-open.svg
   C:\Users\diogo\Desktop\Aventuras do Diego\PATA\pata_website_deploy\src\img\icons\ban.svg
   ```

2. **Colar** na pasta `politica-privacidade/img/icons/`

### Passo 2: Copiar Header do Index Principal

1. Abrir `index.html` do website principal
2. Copiar o código HTML do `<header>` principal (navegação, logo, menu)
3. Colar no início do `<body>` da política de privacidade
4. Copiar também os estilos CSS associados ao header

### Passo 3: Criar Ficheiro HTML

1. Criar `politica-privacidade/index.html`
2. Usar a estrutura HTML completa fornecida
3. Incluir todo o conteúdo das 12 secções
4. Garantir que todos os links internos (#responsavel, #dados, etc.) funcionam

### Passo 4: Criar Ficheiro CSS

1. Criar `politica-privacidade/css/style.css`
2. Copiar todos os design tokens e estilos fornecidos
3. Adicionar media queries para responsividade
4. Testar em diferentes tamanhos de ecrã

### Passo 5: Validação

**Checklist de Validação:**
- [ ] Logo principal aparece corretamente no header
- [ ] Ícones da pata inline aparecem em todos os locais corretos
- [ ] Grid de 6 cards (Secção 7) está correto com todos os ícones
- [ ] Cores PATA aplicadas corretamente
- [ ] Tipografia Mona Sans carregada e aplicada
- [ ] Todas as tabelas formatadas corretamente
- [ ] Links internos (índice) funcionam
- [ ] Links externos abrem em nova tab
- [ ] Responsivo em mobile, tablet e desktop
- [ ] Header do site principal integrado
- [ ] Todos os ícones SVG locais (não CDN)

---

## 🔍 DETALHES IMPORTANTES

### Acessibilidade

```html
<!-- SEMPRE incluir alt text em imagens -->
<img src="img/icons/logo_signature_branco.svg" alt="PATA - Telemedicina Veterinária" class="logo">

<!-- Links externos com rel attributes -->
<a href="https://www.cnpd.pt" target="_blank" rel="noopener noreferrer">www.cnpd.pt</a>

<!-- Emails com mailto -->
<a href="mailto:privacidade@pata.pt">privacidade@pata.pt</a>
```

### SEO

```html
<!-- Meta tags essenciais -->
<meta name="description" content="Política de Privacidade da PATA - Saiba como protegemos os seus dados pessoais e veterinários.">
<meta name="keywords" content="política privacidade, RGPD, proteção dados, veterinária, PATA">
<meta name="author" content="PATA - Telemedicina Veterinária">

<!-- Open Graph para redes sociais -->
<meta property="og:title" content="Política de Privacidade | PATA">
<meta property="og:description" content="Como a PATA cuida dos seus dados">
<meta property="og:type" content="website">
<meta property="og:url" content="https://pata.pt/politica-privacidade">
```

### Performance

```html
<!-- Preload da fonte principal -->
<link rel="preload" href="https://fonts.googleapis.com/css2?family=Mona+Sans:wght@400;600;700;800&display=swap" as="style">

<!-- Lazy loading para ícones não-críticos -->
<img src="img/icons/search-alt.svg" alt="Aceder" class="right-icon" loading="lazy">
```

---

## 📦 ENTREGA FINAL

**Estrutura da Pasta Completa:**

```
politica-privacidade/
├── index.html                          ✅ HTML5 semântico completo
├── css/
│   └── style.css                       ✅ Todos os estilos + responsividade
├── js/
│   └── main.js                         ✅ Scripts (smooth scroll, etc.)
└── img/
    └── icons/
        ├── logo_signature_branco.svg   ✅ Logo principal
        ├── rato_pata_hover.svg         ✅ Pata inline
        ├── search-alt.svg              ✅ Direitos: Aceder
        ├── pen-clip.svg                ✅ Direitos: Retificar
        ├── trash.svg                   ✅ Direitos: Apagar
        ├── pause-circle.svg            ✅ Direitos: Limitar
        ├── box-open.svg                ✅ Direitos: Portabilidade
        └── ban.svg                     ✅ Direitos: Opor-se
```

---

## ✅ CONCLUSÃO

Esta especificação fornece **TUDO** o que é necessário para implementar a página de Política de Privacidade da PATA de forma **pixel-perfect** seguindo o design do Figma.

**Prioridades de Implementação:**
1. ✅ Estrutura HTML semântica
2. ✅ Integração do header do site principal
3. ✅ Todos os ícones SVG locais
4. ✅ Design tokens PATA (cores, tipografia, espaçamentos)
5. ✅ Secção 7 (Grid de Direitos) com 6 cards + ícones
6. ✅ Responsividade completa
7. ✅ Acessibilidade e SEO

**Estimativa de Implementação:** 4-6 horas

**Pronto para Claude Code executar! 🚀**
