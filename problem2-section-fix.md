# Problem2 Section - Código Corrigido

## 📋 INSTRUÇÕES PARA CLAUDE CODE

Substituir o código da section `problem2` no ficheiro `index.html` pelo código abaixo.

**CORREÇÕES IMPLEMENTADAS:**
1. ✅ Layout correto: Texto à esquerda, animação Lottie à direita
2. ✅ Integração Lottie animation com loop infinito
3. ✅ Responsividade mobile-first
4. ✅ Tipografia e espaçamentos exatos do Figma
5. ✅ Box shadow e styling do preço (€187)

---

## 🎨 CÓDIGO HTML/CSS

```html
<!-- ============================================= -->
<!--                  Problem 2                    -->
<!-- ============================================= -->

<section id="problem2" class="section-wrapper">
    <div class="problem2-container">
        <!-- Left Column: Text Content -->
        <div class="problem2-content">
            <h2 class="problem2-title">Imagine isto:</h2>
            
            <div class="problem2-text-group">
                <p class="problem2-story">
                    São 3h da manhã. O Max vomitou duas vezes. Abre a app PATA. 
                    <br><br>
                    Em 47 segundos, está em videochamada com a Dra. Ana. Ela vê o Max, faz perguntas, acalma-o: "É indigestão. Vou receitar um protetor gástrico. Amanhã estará bem." A receita chega ao email em segundos. A app mostra a farmácia mais próxima que abre às 9h. De manhã, avias em 2 minutos.
                </p>
                
                <p class="problem2-conclusion">
                    Volta a dormir. O Max também.
                </p>
                
                <div class="problem2-cost">
                    <p class="problem2-cost-label">Custo total:</p>
                    <div class="problem2-cost-box">
                        <h2 class="problem2-cost-value">€187</h2>
                    </div>
                    <p class="problem2-cost-label">da consulta.</p>
                </div>
            </div>
        </div>
        
        <!-- Right Column: Lottie Animation -->
        <div class="problem2-animation">
            <div id="problem2-lottie" class="lottie-container"></div>
        </div>
    </div>
</section>
```

---

## 🎨 CSS STYLING

```css
/* ============================================= */
/*              Problem2 Section                 */
/* ============================================= */

#problem2 {
    background-color: var(--color-neutral-900, #F5F5F5);
    padding: 80px 40px;
}

.problem2-container {
    max-width: 1280px;
    margin: 0 auto;
    display: flex;
    flex-wrap: wrap;
    gap: 60px;
    align-items: center;
    justify-content: center;
}

/* Left Column: Content */
.problem2-content {
    width: 570px;
    max-width: 600px;
    min-width: 300px;
    display: flex;
    flex-direction: column;
    gap: 32px;
}

.problem2-title {
    color: var(--color-neutral-200, #525252);
    font-family: 'Mona Sans', sans-serif;
    font-size: 52px;
    font-weight: 700;
    line-height: 38px;
    margin: 0;
}

.problem2-text-group {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.problem2-story {
    color: var(--color-neutral-200, #525252);
    font-family: 'Mona Sans', sans-serif;
    font-size: 18px;
    font-weight: 400;
    line-height: 22px;
    margin: 0;
}

.problem2-conclusion {
    color: var(--color-neutral-200, #525252);
    font-family: 'Mona Sans', sans-serif;
    font-size: 32px;
    font-weight: 700;
    line-height: 36px;
    margin: 0;
}

/* Cost Display */
.problem2-cost {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    margin-top: 8px;
}

.problem2-cost-label {
    color: var(--color-neutral-100, #3D3D3D);
    font-family: 'Mona Sans', sans-serif;
    font-size: 24px;
    font-weight: 600;
    line-height: 28px;
    text-align: center;
    margin: 0;
}

.problem2-cost-box {
    background: var(--color-complementary-800, #FFF4E6);
    padding: 8px 12px;
    border-radius: 8px;
    box-shadow: 
        0px 4px 8px rgba(255, 180, 119, 0.25),
        inset 0px -2px 4px 0px rgba(255, 155, 74, 0.2),
        inset 0px 0px 2px 2px rgba(255, 213, 179, 0.2);
    display: flex;
    justify-content: center;
    align-items: center;
}

.problem2-cost-value {
    color: var(--color-neutral-200, #525252);
    font-family: 'Mona Sans', sans-serif;
    font-size: 48px;
    font-weight: 700;
    line-height: 53px;
    text-align: center;
    margin: 0;
}

/* Right Column: Lottie Animation */
.problem2-animation {
    width: 570px;
    height: 481px;
    flex-shrink: 0;
    display: flex;
    justify-content: center;
    align-items: center;
}

.lottie-container {
    width: 100%;
    height: 100%;
}

/* Responsive Design */
@media (max-width: 1200px) {
    .problem2-container {
        gap: 40px;
    }
    
    .problem2-content,
    .problem2-animation {
        width: 100%;
        max-width: 600px;
    }
    
    .problem2-animation {
        height: 400px;
    }
}

@media (max-width: 768px) {
    #problem2 {
        padding: 60px 20px;
    }
    
    .problem2-title {
        font-size: 40px;
        line-height: 44px;
    }
    
    .problem2-story {
        font-size: 16px;
        line-height: 20px;
    }
    
    .problem2-conclusion {
        font-size: 24px;
        line-height: 28px;
    }
    
    .problem2-cost-label {
        font-size: 20px;
        line-height: 24px;
    }
    
    .problem2-cost-value {
        font-size: 36px;
        line-height: 40px;
    }
    
    .problem2-animation {
        height: 300px;
    }
}

@media (max-width: 480px) {
    .problem2-content {
        min-width: 280px;
    }
    
    .problem2-title {
        font-size: 32px;
        line-height: 36px;
    }
    
    .problem2-conclusion {
        font-size: 20px;
        line-height: 24px;
    }
}
```

---

## 🎬 JAVASCRIPT - LOTTIE INTEGRATION

```javascript
// ============================================= 
//          Problem2 Lottie Animation           
// ============================================= 

// Inicializar animação Lottie quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    initProblem2Lottie();
});

function initProblem2Lottie() {
    const lottieContainer = document.getElementById('problem2-lottie');
    
    if (!lottieContainer) {
        console.warn('Problem2 Lottie container não encontrado');
        return;
    }
    
    // Verificar se Lottie está carregado
    if (typeof lottie === 'undefined') {
        console.error('Lottie library não está carregada. Adicione: <script src="https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js"></script>');
        return;
    }
    
    // Configuração da animação Lottie
    const animation = lottie.loadAnimation({
        container: lottieContainer,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        // IMPORTANTE: Substituir com o caminho correto da animação Lottie
        path: 'assets/animations/problem2-animation.json'
        // OU se tiver a animação inline:
        // animationData: lottieAnimationData
    });
    
    // Optional: Add intersection observer for performance
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animation.play();
            } else {
                animation.pause();
            }
        });
    }, {
        threshold: 0.1
    });
    
    observer.observe(lottieContainer);
    
    // Cleanup
    return () => {
        animation.destroy();
        observer.disconnect();
    };
}
```

---

## 📦 DEPENDÊNCIAS NECESSÁRIAS

Adicionar no `<head>` do `index.html` (se ainda não estiver):

```html
<!-- Lottie Animation Library -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js"></script>
```

---

## 🎯 ANIMAÇÃO LOTTIE - PLACEHOLDER

Se ainda não tiveres a animação Lottie, podes usar este placeholder temporário até teres a animação real:

```javascript
// Placeholder: Criar um simples ícone SVG animado
function createPlaceholderAnimation() {
    const container = document.getElementById('problem2-lottie');
    container.innerHTML = `
        <svg width="300" height="300" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#00D4C8;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#00B4AA;stop-opacity:1" />
                </linearGradient>
            </defs>
            
            <!-- Background Circle -->
            <circle cx="150" cy="150" r="120" fill="#B8F5F1" opacity="0.3">
                <animate attributeName="r" values="120;130;120" dur="3s" repeatCount="indefinite"/>
            </circle>
            
            <!-- Main Icon -->
            <path d="M150 80 C180 80, 200 100, 200 130 L200 170 C200 200, 180 220, 150 220 C120 220, 100 200, 100 170 L100 130 C100 100, 120 80, 150 80 Z" 
                  fill="url(#iconGradient)" 
                  stroke="#00B4AA" 
                  stroke-width="4">
                <animateTransform attributeName="transform" 
                                  type="scale" 
                                  values="1;1.05;1" 
                                  dur="2s" 
                                  repeatCount="indefinite"
                                  additive="sum"
                                  attributeType="XML"/>
            </path>
            
            <!-- Pulse effect -->
            <circle cx="150" cy="150" r="80" fill="none" stroke="#00D4C8" stroke-width="2" opacity="0.6">
                <animate attributeName="r" values="80;100;80" dur="2.5s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.6;0;0.6" dur="2.5s" repeatCount="indefinite"/>
            </circle>
        </svg>
    `;
}
```

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

- [ ] Copiar código HTML para substituir section `problem2`
- [ ] Copiar CSS para o ficheiro de estilos
- [ ] Copiar JavaScript para o ficheiro de scripts
- [ ] Adicionar script Lottie no `<head>` se necessário
- [ ] Adicionar ficheiro JSON da animação Lottie em `assets/animations/`
- [ ] Verificar que texto aparece à **ESQUERDA**
- [ ] Verificar que animação aparece à **DIREITA**
- [ ] Testar responsividade em mobile
- [ ] Verificar que animação Lottie está a fazer loop

---

## 🔧 TROUBLESHOOTING

**Problema:** Animação não aparece
- ✅ Verificar se script Lottie está carregado
- ✅ Verificar caminho do ficheiro JSON da animação
- ✅ Ver console do browser para erros

**Problema:** Layout invertido
- ✅ Verificar ordem no HTML (conteúdo primeiro, depois animação)
- ✅ Verificar CSS flexbox wrap

**Problema:** Spacing incorreto
- ✅ Verificar valores de `gap` no container
- ✅ Verificar `padding` da section

---

## 📝 NOTAS ADICIONAIS

1. **Ficheiro Lottie:** Precisas de criar/exportar a animação Lottie do Figma ou usar uma animação similar
2. **Performance:** O intersection observer pausa a animação quando fora do viewport
3. **Fallback:** O placeholder SVG pode ser usado temporariamente

**Path da animação:** Atualizar `path: 'assets/animations/problem2-animation.json'` com o caminho correto quando tiveres o ficheiro.
