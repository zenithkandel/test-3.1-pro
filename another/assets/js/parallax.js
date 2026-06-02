/* ===========================================================
   PARALLAX — translateY based on scroll progress
   Reads `data-parallax="0.08"` (strength multiplier)
   =========================================================== */
(() => {
    'use strict';

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
    const items = $$('[data-parallax]');
    if (!items.length) return;

    const elems = items.map(el => ({
        el,
        strength: parseFloat(el.dataset.parallax) || 0.05,
        rect: null,
        offset: 0
    }));

    const measure = () => {
        elems.forEach(item => {
            item.rect = item.el.getBoundingClientRect();
        });
    };

    const tick = () => {
        const scroll = window.__zenithScroll ? window.__zenithScroll.current : window.scrollY;
        elems.forEach(item => {
            if (!item.rect) return;
            const top = item.rect.top + scroll;
            const center = top + item.rect.height / 2;
            const vh = window.innerHeight;
            // distance from center of viewport, normalized
            const dist = (center - (scroll + vh / 2)) / vh;
            // clamp
            const d = Math.max(-1, Math.min(1, dist));
            const y = -d * 60 * item.strength * 10; // tuned scale
            item.el.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0)`;
        });
        requestAnimationFrame(tick);
    };

    window.addEventListener('resize', measure);
    window.addEventListener('load', measure);
    measure();
    requestAnimationFrame(tick);
})();
