/* ===========================================================
   FOOTER-SCRAMBLE — single pass on first reveal of the
   .footer__brand element. Each character cycles through
   random letters then resolves to the original word. Plays once.
   =========================================================== */
(() => {
    'use strict';

    const brand = document.querySelector('[data-scramble]');
    if (!brand) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const original = brand.textContent;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const total = 22;
    const seen = sessionStorage.getItem('zenith:brandScrambled');
    if (seen) return;

    const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            io.unobserve(entry.target);
            sessionStorage.setItem('zenith:brandScrambled', '1');
            let frame = 0;
            const step = () => {
                frame++;
                const progress = frame / total;
                let out = '';
                for (let i = 0; i < original.length; i++) {
                    const ch = original[i];
                    if (ch === ' ') { out += ' '; continue; }
                    if (i < Math.floor(original.length * progress)) {
                        out += ch;
                    } else {
                        out += chars[Math.floor(Math.random() * chars.length)];
                    }
                }
                brand.textContent = out;
                if (frame < total) {
                    setTimeout(step, 32);
                } else {
                    brand.textContent = original;
                }
            };
            step();
        });
    }, { threshold: 0.4 });
    io.observe(brand);
})();
