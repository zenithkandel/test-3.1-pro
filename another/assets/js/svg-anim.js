/* ===========================================================
   SVG-ANIM — path drawing (stroke-dashoffset) on view
   Animate any SVG path/line/circle inside [data-svg-anim]
   Only targets elements within containers marked [data-svg-anim]
   =========================================================== */
(() => {
    'use strict';

    const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion) return;

    const targets = $$('[data-svg-anim]');
    if (!targets.length) return;

    // Only pre-compute path lengths for elements inside [data-svg-anim] containers
    targets.forEach(container => {
        const paths = $$('path, line, circle', container);
        paths.forEach(p => {
            try {
                const len = p.getTotalLength ? p.getTotalLength() : 0;
                if (len > 0) {
                    p.style.strokeDasharray  = len;
                    p.style.strokeDashoffset = len;
                    p.dataset.svglen = len;
                }
            } catch (e) { /* noop */ }
        });
    });

    const animate = (el) => {
        const len = parseFloat(el.dataset.svglen || '0');
        if (len > 0) {
            el.style.transition = 'stroke-dashoffset 1.2s cubic-bezier(0.22, 0.61, 0.36, 1)';
            el.style.strokeDashoffset = '0';
        }
    };

    const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.querySelectorAll('path, line, circle').forEach(animate);
                io.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });
    targets.forEach(t => io.observe(t));
})();
