/**
 * PATA - Política de Privacidade
 * JavaScript para smooth scrolling
 */

(function() {
    'use strict';

    /**
     * Smooth scroll para links internos
     */
    function initSmoothScroll() {
        const links = document.querySelectorAll('a[href^="#"]');

        links.forEach(link => {
            link.addEventListener('click', function(e) {
                const href = this.getAttribute('href');

                // Ignorar links vazios
                if (href === '#') {
                    e.preventDefault();
                    return;
                }

                const target = document.querySelector(href);

                if (target) {
                    e.preventDefault();

                    // Offset para header fixo (se houver)
                    const offset = 20;
                    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });

                    // Atualizar URL sem scroll
                    if (history.pushState) {
                        history.pushState(null, null, href);
                    }
                }
            });
        });
    }

    /**
     * Inicializar quando o DOM estiver pronto
     */
    function init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initSmoothScroll);
        } else {
            initSmoothScroll();
        }
    }

    // Iniciar
    init();

})();
