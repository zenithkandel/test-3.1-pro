/* ===========================================================
   ZENITH KANDEL — PORTFOLIO SCRIPTS
   Hyer Aviation / Monochromatic light style
   Modules → 01 Cursor · 02 Nav (light/dark detect)
             03 Mobile Menu · 04 Reveals · 05 Smooth scroll
   =========================================================== */

(() => {
    'use strict';

    const $  = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouch = window.matchMedia('(hover: none)').matches;

    /* =====================================================
       01 · CUSTOM CURSOR
    ===================================================== */
    const initCursor = () => {
        if (reduceMotion || isTouch) return;
        const cursor = $('#cursor');
        if (!cursor) return;

        let x = -100, y = -100;
        let tx = x, ty = y;
        const speed = 0.18;

        const move = (e) => {
            tx = e.clientX;
            ty = e.clientY;
        };

        const tick = () => {
            x += (tx - x) * speed;
            y += (ty - y) * speed;
            cursor.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
            requestAnimationFrame(tick);
        };

        window.addEventListener('mousemove', move, { passive: true });
        requestAnimationFrame(tick);

        const hoverables = 'a, button, .btn, .nav__link, .nav__cta, .feature, .stack-card, .disclosure, .project, .contact-row, .social, input, textarea';
        $$(hoverables).forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('is-hover'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('is-hover'));
        });
    };

    /* =====================================================
       02 · NAV — scroll state + light/dark detect
    ===================================================== */
    const initNav = () => {
        const nav = $('#nav');
        if (!nav) return;

        const updateOnScroll = () => {
            nav.classList.toggle('is-scrolled', window.scrollY > 16);
        };

        // Light/dark section detection
        const darkSurfaces = $$('.surface--dark');
        const setNavTheme = (isDark) => {
            nav.classList.toggle('is-on-dark', isDark);
        };

        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setNavTheme(entry.target.classList.contains('surface--dark'));
                }
            });
        }, { rootMargin: '-1% 0px -85% 0px', threshold: 0 });

        darkSurfaces.forEach(s => sectionObserver.observe(s));

        // Top of page → assume light (hero is light)
        const heroObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setNavTheme(entry.target.classList.contains('surface--dark'));
                }
            });
        }, { threshold: 0.1 });
        $$('.surface').forEach(s => heroObserver.observe(s));

        window.addEventListener('scroll', updateOnScroll, { passive: true });
        updateOnScroll();

        // Scroll spy for active link
        const links = $$('.nav__link');
        const targets = links
            .map(a => $(a.getAttribute('href')))
            .filter(Boolean);

        if (targets.length) {
            const spy = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const id = '#' + entry.target.id;
                        links.forEach(a => {
                            a.classList.toggle('is-active', a.getAttribute('href') === id);
                        });
                    }
                });
            }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });

            targets.forEach(t => spy.observe(t));
        }
    };

    /* =====================================================
       03 · MOBILE MENU
    ===================================================== */
    const initMobileMenu = () => {
        const btn  = $('#navMenu');
        const menu = $('#mobileMenu');
        if (!btn || !menu) return;

        const close = () => {
            btn.classList.remove('is-open');
            btn.setAttribute('aria-expanded', 'false');
            menu.classList.remove('is-open');
            menu.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        };

        const open = () => {
            btn.classList.add('is-open');
            btn.setAttribute('aria-expanded', 'true');
            menu.classList.add('is-open');
            menu.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        };

        btn.addEventListener('click', () => {
            if (menu.classList.contains('is-open')) close();
            else open();
        });

        $$('.mobile-menu__link').forEach(a => a.addEventListener('click', close));

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && menu.classList.contains('is-open')) close();
        });
    };

    /* =====================================================
       04 · SCROLL REVEAL
    ===================================================== */
    const initReveal = () => {
        const items = $$('[data-reveal]');
        if (!items.length) return;

        if (reduceMotion) {
            items.forEach(i => i.classList.add('in-view'));
            return;
        }

        const io = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.10, rootMargin: '0px 0px -6% 0px' });

        items.forEach(i => io.observe(i));
    };

    /* =====================================================
       05 · SMOOTH SCROLL
    ===================================================== */
    const initSmoothScroll = () => {
        $$('a[href^="#"]').forEach(a => {
            a.addEventListener('click', (e) => {
                const id = a.getAttribute('href');
                if (id === '#' || id.length < 2) return;
                const target = $(id);
                if (!target) return;
                e.preventDefault();
                const top = target.getBoundingClientRect().top + window.scrollY - 8;
                window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
            });
        });
    };

    /* =====================================================
       06 · KEYBOARD FOCUS
    ===================================================== */
    const initFocus = () => {
        const handle = (e) => {
            document.body.classList.toggle('has-keyboard', e.type === 'keydown');
        };
        window.addEventListener('keydown', handle);
        window.addEventListener('mousedown', handle);
    };

    /* =====================================================
       BOOT
    ===================================================== */
    const boot = () => {
        initCursor();
        initNav();
        initMobileMenu();
        initReveal();
        initSmoothScroll();
        initFocus();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
