/* ===========================================================
   SVG-ANIM — path drawing (stroke-dashoffset) on view
   Animate any SVG path/line/circle inside [data-svg-anim]
   =========================================================== */
(() => {
    'use strict';

    const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion) return;

    // Pre-compute path lengths
    const paths = $$('svg [data-svg-anim], svg path, svg line, svg circle, svg rect');
    paths.forEach(p => {
        try {
            const len = p.getTotalLength ? p.getTotalLength() : 0;
            if (len > 0 && p.tagName.toLowerCase() !== 'rect') {
                p.style.strokeDasharray  = len;
                p.style.strokeDashoffset = len;
                p.dataset.svglen = len;
            }
        } catch (e) { /* noop */ }
    });

    const animate = (el) => {
        const len = parseFloat(el.dataset.svglen || '0');
        if (len > 0) {
            el.style.transition = 'stroke-dashoffset 1.2s cubic-bezier(0.22, 0.61, 0.36, 1)';
            el.style.strokeDashoffset = '0';
        }
    };

    const targets = $$('[data-svg-anim]');
    if (targets.length) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.querySelectorAll('path, line, circle').forEach(animate);
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });
        targets.forEach(t => io.observe(t));
    }

    // Code window typing effect on load
    const codeWindow = document.querySelector('.hero-illustration__svg .hero-window');
    if (codeWindow) {
        const codeLines = codeWindow.querySelectorAll('g.hero-code text');
        codeLines.forEach((line, i) => {
            const full = line.textContent;
            line.textContent = '';
            line.style.opacity = '1';
            const chars = full.split('');
            let idx = 0;
            const type = () => {
                if (idx <= chars.length) {
                    line.textContent = chars.slice(0, idx).join('');
                    idx++;
                    setTimeout(type, 6 + Math.random() * 14);
                }
            };
            setTimeout(type, 600 + i * 50);
        });
    }
})();
