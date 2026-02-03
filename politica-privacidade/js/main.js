/**
 * PATA - Política de Privacidade
 * JavaScript para interatividade e smooth scrolling
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
     * Highlight da secção ativa baseado no scroll
     */
    function initActiveSection() {
        const sections = document.querySelectorAll('.section[id]');
        const tocLinks = document.querySelectorAll('.toc a');

        if (sections.length === 0 || tocLinks.length === 0) return;

        function highlightActiveSection() {
            const scrollPos = window.pageYOffset + 100;

            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;
                const sectionId = section.getAttribute('id');

                if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                    tocLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${sectionId}`) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }

        // Throttle scroll event
        let scrollTimeout;
        window.addEventListener('scroll', function() {
            if (scrollTimeout) {
                window.cancelAnimationFrame(scrollTimeout);
            }
            scrollTimeout = window.requestAnimationFrame(highlightActiveSection);
        });
    }

    /**
     * Adicionar animação de fade-in aos elementos quando entram no viewport
     */
    function initScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in-active');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observar todas as secções
        const sections = document.querySelectorAll('.section, .intro-box, .toc');
        sections.forEach(section => {
            section.classList.add('fade-in');
            observer.observe(section);
        });
    }

    /**
     * Adicionar estilos de animação CSS dinamicamente
     */
    function addAnimationStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .fade-in {
                opacity: 0;
                transform: translateY(20px);
                transition: opacity 0.6s ease, transform 0.6s ease;
            }

            .fade-in-active {
                opacity: 1;
                transform: translateY(0);
            }

            .toc a.active {
                color: var(--orange-primary);
                font-weight: var(--fw-bold);
            }

            @media (prefers-reduced-motion: reduce) {
                .fade-in {
                    opacity: 1;
                    transform: none;
                    transition: none;
                }
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Copiar email ao clicar (funcionalidade extra)
     */
    function initEmailCopy() {
        const emailLinks = document.querySelectorAll('a[href^="mailto:"]');

        emailLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                const email = this.textContent.trim();

                // Tentar copiar para clipboard
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(email).then(() => {
                        // Feedback visual (opcional)
                        const originalText = this.textContent;
                        this.textContent = '✓ Copiado!';
                        setTimeout(() => {
                            this.textContent = originalText;
                        }, 2000);
                    }).catch(() => {
                        // Falhou, continuar com comportamento normal
                    });
                }
            });
        });
    }

    /**
     * Scroll to top ao carregar se houver hash na URL
     */
    function handleInitialHash() {
        if (window.location.hash) {
            setTimeout(() => {
                const target = document.querySelector(window.location.hash);
                if (target) {
                    const offset = 20;
                    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }, 100);
        }
    }

    /**
     * Inicializar tudo quando o DOM estiver pronto
     */
    function init() {
        // Verificar se DOM está pronto
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                addAnimationStyles();
                initSmoothScroll();
                initActiveSection();
                initScrollAnimations();
                initEmailCopy();
                handleInitialHash();
            });
        } else {
            // DOM já está pronto
            addAnimationStyles();
            initSmoothScroll();
            initActiveSection();
            initScrollAnimations();
            initEmailCopy();
            handleInitialHash();
        }
    }

    // Iniciar
    init();

})();
