# Problem3 Section - Código Completo

## 📋 INSTRUÇÕES PARA CLAUDE CODE

Substituir o código da section `problem3` no ficheiro `index.html` pelo código abaixo.

**FEATURES IMPLEMENTADAS:**
1. ✅ Layout two-column: Conteúdo à esquerda, statistics cards à direita
2. ✅ Ícones SVG inline (gato, relógio, notas, carro)
3. ✅ 3 statistics cards com hover effects e inner shadows
4. ✅ Tipografia multi-color (laranja + cinzento)
5. ✅ Links funcionais com underline
6. ✅ Responsividade mobile-first completa
7. ✅ Espaçamentos e box shadows exatos do Figma

---

## 🎨 CÓDIGO HTML

```html
<!-- ============================================= -->
<!--                  Problem 3                    -->
<!-- ============================================= -->

<section id="problem3" class="section-wrapper">
    <div class="problem3-container">
        
        <!-- Left Column: Header Content -->
        <div class="problem3-header">
            <!-- Cat Icon + Title -->
            <div class="problem3-title-wrapper">
                <!-- Cat SVG Icon -->
                <div class="problem3-cat-icon">
                    <svg width="154" height="125" viewBox="0 0 154 125" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <!-- Cat tail -->
                        <rect x="117.2" y="21.88" width="37.75" height="44.36" fill="#3D3D3D" stroke="#3D3D3D" stroke-width="4" transform="rotate(24 117.2 21.88)"/>
                        <!-- Left eye -->
                        <ellipse cx="85.21" cy="32.42" rx="3.76" ry="4.62" fill="#3D3D3D"/>
                        <!-- Right eye -->
                        <ellipse cx="66.01" cy="32.42" rx="3.69" ry="4.62" fill="#3D3D3D"/>
                        <!-- Nose -->
                        <path d="M63.88 41.11H87.93V49.05H63.88V41.11Z" fill="#3D3D3D"/>
                        <!-- Body -->
                        <rect x="22.68" y="3.41" width="87.52" height="117.93" rx="20" fill="#3D3D3D"/>
                    </svg>
                </div>
                
                <!-- Title Text -->
                <div class="problem3-title-text">
                    <h2 class="problem3-title-main">
                        <span class="problem3-title-orange">2 milhões</span>
                        <br>
                        <span class="problem3-title-regular">de lares portugueses</span>
                        <br>
                        <span class="problem3-title-regular">amam um </span>
                        <span class="problem3-title-orange">animal</span>
                    </h2>
                </div>
            </div>
            
            <!-- Subtitle & Description -->
            <div class="problem3-text-group">
                <h4 class="problem3-subtitle">
                    Mas amar não paga consultas. E quando a emergência acontece às 3h da manhã, o amor não responde ao telefone.
                </h4>
                
                <p class="problem3-description">
                    Estes números não são estatísticas.<br>
                    São noites mal dormidas. São decisões impossíveis.<br>
                    São histórias que acontecem todos os dias.
                </p>
            </div>
        </div>
        
        <!-- Right Column: Statistics Cards -->
        <div class="problem3-stats">
            
            <!-- Card 1: Custo Urgência -->
            <div class="problem3-stat-card">
                <!-- Clock Icon -->
                <div class="problem3-stat-icon">
                    <svg width="54" height="54" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M27 1C12.64 1 1 12.64 1 27C1 41.36 12.64 53 27 53C41.36 53 53 41.36 53 27C53 12.64 41.36 1 27 1ZM27 48C15.42 48 6 38.58 6 27C6 15.42 15.42 6 27 6C38.58 6 48 15.42 48 27C48 38.58 38.58 48 27 48ZM28 14H24V29L37 37L39 33.5L28 27V14Z" fill="#3D3D3D"/>
                    </svg>
                </div>
                
                <div class="problem3-stat-value-box">
                    <h2 class="problem3-stat-value">€70,90</h2>
                </div>
                
                <div class="problem3-stat-info">
                    <h6 class="problem3-stat-label">
                        Custo médio de urgência<br>
                        veterinária noturna
                    </h6>
                    <a href="https://www.veterinaria-atual.pt/destaques/quais-os-precos-medios-dos-servicos-veterinarios-em-portugal/" 
                       target="_blank" 
                       class="problem3-stat-source">
                        VetBizz, 2024
                    </a>
                </div>
            </div>
            
            <!-- Card 2: Custo Emergência -->
            <div class="problem3-stat-card">
                <!-- Notes Icon -->
                <div class="problem3-stat-icon">
                    <svg width="54" height="54" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M42 1H12C6.48 1 2 5.48 2 11V43C2 48.52 6.48 53 12 53H42C47.52 53 52 48.52 52 43V11C52 5.48 47.52 1 42 1ZM42 43H12V11H42V43ZM17 18H37V23H17V18ZM17 28H37V33H17V28Z" fill="#3D3D3D"/>
                    </svg>
                </div>
                
                <div class="problem3-stat-value-box">
                    <h2 class="problem3-stat-value">€300-400</h2>
                </div>
                
                <div class="problem3-stat-info">
                    <h6 class="problem3-stat-label">
                        Custo médio de um caso de emergência completo
                    </h6>
                    <a href="https://www.generalitranquilidade.pt/blog/familia/preco-consulta-veterinario" 
                       target="_blank" 
                       class="problem3-stat-source">
                        Generali
                    </a>
                </div>
            </div>
            
            <!-- Card 3: Lares com Animais -->
            <div class="problem3-stat-card">
                <!-- Car Icon -->
                <div class="problem3-stat-icon">
                    <svg width="64" height="54" viewBox="0 0 64 54" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M54.92 9H47.08L41 9.67V15.33L8.92 15.33C4.92 15.33 1.08 18.33 1.08 23V38.33C1.08 42 4 45 7.67 45H10C10 49.42 13.58 53 18 53C22.42 53 26 49.42 26 45H38C38 49.42 41.58 53 46 53C50.42 53 54 49.42 54 45H56.33C60 45 62.92 42 62.92 38.33V23C62.92 15 58.92 9 54.92 9ZM18 48C16.34 48 15 46.66 15 45C15 43.34 16.34 42 18 42C19.66 42 21 43.34 21 45C21 46.66 19.66 48 18 48ZM46 48C44.34 48 43 46.66 43 45C43 43.34 44.34 42 46 42C47.66 42 49 43.34 49 45C49 46.66 47.66 48 46 48ZM54.92 30H41V15H54.92V30Z" fill="#3D3D3D"/>
                    </svg>
                </div>
                
                <div class="problem3-stat-value-box">
                    <h2 class="problem3-stat-value">54%</h2>
                </div>
                
                <div class="problem3-stat-info">
                    <h6 class="problem3-stat-label">
                        Dos lares portugueses têm animais — 6,7 milhões de patudos
                    </h6>
                    <a href="https://www.veterinaria-atual.pt/na-clinica/portugal-tem-67-milhoes-de-animais-de-estimacao/" 
                       target="_blank" 
                       class="problem3-stat-source">
                        Vet. Atual
                    </a>
                </div>
            </div>
            
            <!-- Bottom Text (Mobile/Tablet) -->
            <h4 class="problem3-stats-footer">
                Estes números não são estatísticas.<br>
                São noites mal dormidas. São decisões impossíveis.<br>
                São histórias que acontecem todos os dias.
            </h4>
        </div>
        
    </div>
</section>
```

---

## 🎨 CSS STYLING

```css
/* ============================================= */
/*              Problem3 Section                 */
/* ============================================= */

#problem3 {
    background-color: var(--color-neutral-900, #F5F5F5);
    padding: 40px 48px;
}

.problem3-container {
    max-width: 1400px;
    margin: 0 auto;
    display: flex;
    gap: 40px;
    align-items: center;
    justify-content: center;
}

/* ===== LEFT COLUMN: HEADER ===== */
.problem3-header {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 20px;
    min-width: 300px;
}

/* Title Wrapper */
.problem3-title-wrapper {
    display: flex;
    gap: 20px;
    align-items: flex-start;
}

.problem3-cat-icon {
    width: 154px;
    height: 125px;
    flex-shrink: 0;
}

.problem3-cat-icon svg {
    width: 100%;
    height: 100%;
}

/* Title Text */
.problem3-title-text {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.problem3-title-main {
    margin: 0;
    font-family: 'Mona Sans', sans-serif;
    font-weight: 700;
    line-height: 1;
}

.problem3-title-main .problem3-title-orange {
    color: var(--dark-orange, #FF943D);
    font-size: 52px;
    line-height: 38px;
}

.problem3-title-main .problem3-title-regular {
    color: var(--color-neutral-100, #3D3D3D);
    font-size: 32px;
    line-height: 36px;
}

/* Text Group */
.problem3-text-group {
    padding-left: 18px;
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.problem3-subtitle {
    color: var(--color-neutral-200, #525252);
    font-family: 'Mona Sans', sans-serif;
    font-size: 24px;
    font-weight: 600;
    line-height: 28px;
    max-width: 478px;
    margin: 0;
}

.problem3-description {
    color: var(--color-neutral-300, #686868);
    font-family: 'Mona Sans', sans-serif;
    font-size: 18px;
    font-weight: 400;
    line-height: 22px;
    margin: 0;
}

/* ===== RIGHT COLUMN: STATISTICS CARDS ===== */
.problem3-stats {
    flex: 1;
    max-width: 1000px;
    display: flex;
    flex-wrap: wrap;
    gap: 18px;
    justify-content: center;
    align-items: flex-start;
    align-content: flex-start;
}

/* Individual Stat Card */
.problem3-stat-card {
    flex: 1 1 0;
    min-width: 200px;
    max-width: 300px;
    background: var(--color-neutral-950, #FEFEFF);
    border: 0.5px solid var(--color-neutral-800, #D4D4D4);
    border-radius: 16px;
    padding: 20px 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    box-shadow: 0px 4px 8px rgba(255, 180, 119, 0.15);
    position: relative;
    transition: all 0.3s ease;
}

/* Card Hover Effect - Subtle Inner Glow */
.problem3-stat-card::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    box-shadow: 
        inset 0px -2px 4px 0px #FF9B4A,
        inset 0px 0px 2px 2px rgba(255, 213, 179, 0.6);
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.problem3-stat-card:hover::after {
    opacity: 1;
}

/* Stat Icon */
.problem3-stat-icon {
    width: 54px;
    height: 54px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
}

.problem3-stat-icon svg {
    width: 100%;
    height: auto;
}

/* Stat Value Box */
.problem3-stat-value-box {
    background: var(--color-complementary-800, #FFF4E6);
    padding: 4px 12px;
    border-radius: 8px;
    box-shadow: 
        0px 4px 8px rgba(255, 180, 119, 0.25),
        inset 0px -2px 4px 0px rgba(255, 155, 74, 0.2),
        inset 0px 0px 2px 2px rgba(255, 213, 179, 0.2);
    display: flex;
    justify-content: center;
    align-items: center;
}

.problem3-stat-value {
    color: var(--color-neutral-200, #525252);
    font-family: 'Mona Sans', sans-serif;
    font-size: 32px;
    font-weight: 700;
    line-height: 36px;
    text-align: center;
    margin: 0;
}

/* Stat Info */
.problem3-stat-info {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 4px;
    text-align: center;
}

.problem3-stat-label {
    color: var(--color-neutral-400, #7D7D7D);
    font-family: 'Mona Sans', sans-serif;
    font-size: 20px;
    font-weight: 700;
    line-height: 24px;
    margin: 0;
}

.problem3-stat-source {
    color: var(--color-neutral-400, #7D7D7D);
    font-family: 'Mona Sans', sans-serif;
    font-size: 14px;
    font-weight: 600;
    line-height: 16px;
    text-decoration: underline;
    cursor: pointer;
    transition: color 0.2s ease;
}

.problem3-stat-source:hover {
    color: var(--dark-orange, #FF943D);
}

/* Stats Footer Text */
.problem3-stats-footer {
    width: 100%;
    max-width: 478px;
    color: var(--color-neutral-200, #525252);
    font-family: 'Mona Sans', sans-serif;
    font-size: 18px;
    font-weight: 600;
    line-height: 20px;
    text-align: center;
    margin: 0;
}

/* ===== RESPONSIVE DESIGN ===== */

/* Large Tablets & Small Desktops (1024px - 1200px) */
@media (max-width: 1200px) {
    .problem3-container {
        gap: 30px;
    }
    
    .problem3-title-main .problem3-title-orange {
        font-size: 44px;
        line-height: 42px;
    }
    
    .problem3-title-main .problem3-title-regular {
        font-size: 28px;
        line-height: 32px;
    }
    
    .problem3-subtitle {
        font-size: 22px;
        line-height: 26px;
    }
}

/* Tablets (768px - 1024px) */
@media (max-width: 1024px) {
    #problem3 {
        padding: 40px 32px;
    }
    
    .problem3-container {
        flex-direction: column;
        gap: 40px;
    }
    
    .problem3-header,
    .problem3-stats {
        max-width: 100%;
        width: 100%;
    }
    
    .problem3-stats {
        justify-content: center;
    }
    
    .problem3-stat-card {
        flex: 1 1 calc(33.333% - 18px);
        min-width: 220px;
    }
}

/* Mobile Landscape & Small Tablets (600px - 768px) */
@media (max-width: 768px) {
    #problem3 {
        padding: 40px 20px;
    }
    
    .problem3-title-wrapper {
        flex-direction: column;
        align-items: center;
        text-align: center;
    }
    
    .problem3-cat-icon {
        width: 120px;
        height: 100px;
    }
    
    .problem3-title-main .problem3-title-orange {
        font-size: 36px;
        line-height: 38px;
    }
    
    .problem3-title-main .problem3-title-regular {
        font-size: 24px;
        line-height: 28px;
    }
    
    .problem3-text-group {
        padding-left: 0;
        text-align: center;
    }
    
    .problem3-subtitle {
        font-size: 20px;
        line-height: 24px;
        max-width: 100%;
    }
    
    .problem3-description {
        font-size: 16px;
        line-height: 20px;
    }
    
    .problem3-stat-card {
        flex: 1 1 calc(50% - 9px);
        min-width: 160px;
    }
    
    .problem3-stats-footer {
        font-size: 16px;
        line-height: 18px;
    }
}

/* Mobile Portrait (< 600px) */
@media (max-width: 600px) {
    #problem3 {
        padding: 32px 16px;
    }
    
    .problem3-container {
        gap: 32px;
    }
    
    .problem3-title-main .problem3-title-orange {
        font-size: 32px;
        line-height: 34px;
    }
    
    .problem3-title-main .problem3-title-regular {
        font-size: 20px;
        line-height: 24px;
    }
    
    .problem3-subtitle {
        font-size: 18px;
        line-height: 22px;
    }
    
    .problem3-description {
        font-size: 15px;
        line-height: 19px;
    }
    
    .problem3-stat-card {
        flex: 1 1 100%;
        max-width: 400px;
        min-width: unset;
    }
    
    .problem3-stat-label {
        font-size: 18px;
        line-height: 22px;
    }
    
    .problem3-stat-value {
        font-size: 28px;
        line-height: 32px;
    }
}

/* Extra Small Mobile (< 400px) */
@media (max-width: 400px) {
    .problem3-cat-icon {
        width: 100px;
        height: 83px;
    }
    
    .problem3-title-main .problem3-title-orange {
        font-size: 28px;
        line-height: 30px;
    }
    
    .problem3-title-main .problem3-title-regular {
        font-size: 18px;
        line-height: 22px;
    }
    
    .problem3-subtitle {
        font-size: 16px;
        line-height: 20px;
    }
    
    .problem3-stat-label {
        font-size: 16px;
        line-height: 20px;
    }
}
```

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

- [ ] Copiar código HTML para substituir section `problem3`
- [ ] Copiar CSS para o ficheiro de estilos
- [ ] Verificar ícones SVG renderizam corretamente
- [ ] Testar hover effects nos cards
- [ ] Verificar links externos funcionam
- [ ] Testar responsividade em:
  - [ ] Desktop (1200px+)
  - [ ] Tablet (768px - 1024px)
  - [ ] Mobile landscape (600px - 768px)
  - [ ] Mobile portrait (< 600px)
- [ ] Verificar cores laranja (#FF943D) aplicadas corretamente
- [ ] Verificar espaçamentos (40px, 20px, 18px, 16px)

---

## 🎨 DESIGN TOKENS UTILIZADOS

```css
/* Colors */
--dark-orange: #FF943D;           /* Accent color */
--color-neutral-100: #3D3D3D;     /* Dark text */
--color-neutral-200: #525252;     /* Medium dark text */
--color-neutral-300: #686868;     /* Medium text */
--color-neutral-400: #7D7D7D;     /* Light text */
--color-neutral-800: #D4D4D4;     /* Border */
--color-neutral-900: #F5F5F5;     /* Background */
--color-neutral-950: #FEFEFF;     /* Card background */
--color-complementary-800: #FFF4E6; /* Value box background */

/* Typography */
/* H1 - 52px/38px Bold - Orange highlight */
/* H3 - 32px/36px Bold - Regular text */
/* H4 - 24px/28px SemiBold - Subtitle */
/* H5 - 20px/24px Bold - Card labels */
/* H6 - 18px/20px SemiBold - Footer */
/* p - 18px/22px Regular - Description */
```

---

## 🔍 DETALHES TÉCNICOS

### Ícones SVG Inline
Todos os ícones estão incorporados como SVG inline para:
- ✅ Melhor performance (sem requests HTTP)
- ✅ Fácil customização de cor
- ✅ Escalabilidade perfeita
- ✅ Animações futuras (se necessário)

### Box Shadows Multi-layer
Os cards usam múltiplas camadas de shadow:
```css
box-shadow: 
    0px 4px 8px rgba(255, 180, 119, 0.15),  /* Outer drop shadow */
    inset 0px -2px 4px 0px rgba(255, 155, 74, 0.2),  /* Inner bottom glow */
    inset 0px 0px 2px 2px rgba(255, 213, 179, 0.2);  /* Inner border glow */
```

### Hover Effects
Cards têm hover effect suave com inner glow que aparece em 0.3s:
```css
.problem3-stat-card:hover::after {
    opacity: 1;
}
```

### Responsividade Breakpoints
- 1200px: Ajuste de fontes
- 1024px: Stack vertical (column)
- 768px: Cards 2 colunas + texto centrado
- 600px: Cards 1 coluna
- 400px: Fontes extra pequenas

---

## 📝 NOTAS ADICIONAIS

1. **Links Externos:** Todos os links abrem em nova tab (`target="_blank"`)
2. **Acessibilidade:** Ícones SVG podem receber `aria-label` se necessário
3. **SEO:** Estrutura semântica com `<h2>`, `<h4>`, `<h6>`, `<p>`
4. **Performance:** SVG inline = 0 requests adicionais
5. **Maintenance:** Cores centralizadas via CSS variables

---

## 🚀 PRÓXIMOS PASSOS OPCIONAIS

### Animações Futuras (Opcional)
```css
/* Hover Animation - Cards */
.problem3-stat-card {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.problem3-stat-card:hover {
    transform: translateY(-4px);
    box-shadow: 0px 8px 16px rgba(255, 180, 119, 0.25);
}

/* Icon Pulse Animation */
@keyframes iconPulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
}

.problem3-stat-icon svg {
    animation: iconPulse 2s ease-in-out infinite;
}
```

### Intersection Observer (Load Animations)
```javascript
// Fade in cards on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }, index * 100);
        }
    });
}, observerOptions);

document.querySelectorAll('.problem3-stat-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    cardObserver.observe(card);
});
```

Código pronto para executar! 🎯
