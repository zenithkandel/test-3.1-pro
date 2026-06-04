/* ===========================================================
   REVEAL — IntersectionObserver-based reveal
   + nav scroll-spy
   + light/dark nav theming
   =========================================================== */
(() => {
    'use strict';

    const $  = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ----- Reveal ----- */
    const items = $$('[data-reveal]');
    if (items.length) {
        if (reduceMotion) {
            items.forEach(i => i.classList.add('in-view'));
        } else {
            const io = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('in-view');
                        io.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.10, rootMargin: '0px 0px -6% 0px' });
            items.forEach(i => io.observe(i));
        }
    }

    /* ----- Nav state ----- */
    const nav = $('#nav');
    if (nav) {
        const updateOnScroll = () => {
            nav.classList.toggle('is-scrolled', window.scrollY > 16);
        };

        // Single observer: trigger zone is a thin strip just below the nav.
        // The most recently intersecting section defines the theme.
        let lastSectionWasDark = false;
        const setTheme = (isDark) => {
            lastSectionWasDark = isDark;
            const isDarkMode = document.documentElement.classList.contains('dark-mode');
            nav.classList.toggle('is-on-dark', isDark || isDarkMode);
        };
        const themeSources = $$('.surface, .hero');

        const themeObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setTheme(entry.target.classList.contains('surface--dark'));
                }
            });
        }, { rootMargin: '-80px 0px -90% 0px', threshold: 0 });
        themeSources.forEach(s => themeObserver.observe(s));

        // Fallback for very-top-of-page: hero is always light.
        // Also reset when scrolling back above the first surface.
        const onScrollTheme = () => {
            const isDarkMode = document.documentElement.classList.contains('dark-mode');
            if (window.scrollY < 80) setTheme(isDarkMode);
        };
        window.addEventListener('scroll', onScrollTheme, { passive: true });

        // Sync visual theme change immediately on toggle click
        window.addEventListener('theme-change', () => {
            setTheme(lastSectionWasDark);
        });

        // Tick the scroll state via rAF
        const tick = () => {
            updateOnScroll();
            requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);

        // Active link scroll-spy
        const links = $$('.nav__link');
        const targets = links.map(a => $(a.getAttribute('href'))).filter(Boolean);
        if (targets.length) {
            const spy = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const id = '#' + entry.target.id;
                        links.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === id));
                    }
                });
            }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });
            targets.forEach(t => spy.observe(t));
        }
    }

    /* ----- Mobile menu ----- */
    const btn  = $('#navMenu');
    const menu = $('#mobileMenu');
    if (btn && menu) {
        const close = () => {
            btn.classList.remove('is-open');
            btn.setAttribute('aria-expanded', 'false');
            menu.classList.remove('is-open');
            menu.setAttribute('aria-hidden', 'true');
        };
        const open = () => {
            btn.classList.add('is-open');
            btn.setAttribute('aria-expanded', 'true');
            menu.classList.add('is-open');
            menu.setAttribute('aria-hidden', 'false');
        };
        btn.addEventListener('click', () => menu.classList.contains('is-open') ? close() : open());
        $$('.mobile-menu__link').forEach(a => a.addEventListener('click', close));
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && menu.classList.contains('is-open')) close();
        });
    }
})();
