/* ===========================================================
   FOOTER-LIFE — status row + brand scramble.

   Status row:
     - "Last seen · now" — resets on any user activity.
     - Increments by 1 minute per real minute of idle.
     - The LED beside the status text beats at heartbeat cadence.

   Brand scramble (footer .footer__brand):
     - On first reveal, each character cycles through random
       letters and resolves back to the original word. Plays once.
   =========================================================== */
(() => {
    'use strict';

    /* ----- Status row ----- */
    const seen = document.querySelector('[data-footer-seen]');
    if (seen) {
        let lastActivity = Date.now();
        const update = () => {
            const idle = Math.floor((Date.now() - lastActivity) / 60000);
            seen.textContent = idle === 0 ? 'Last seen · now' : 'Last seen · ' + idle + ' min ago';
        };
        const onActivity = () => { lastActivity = Date.now(); update(); };
        ['mousemove', 'keydown', 'scroll', 'click'].forEach((ev) => {
            window.addEventListener(ev, onActivity, { passive: true });
        });
        setInterval(update, 60000);
        update();
    }

    /* ----- Brand scramble ----- */
    const brand = document.querySelector('[data-scramble]');
    if (brand && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const original = brand.textContent;
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                io.unobserve(entry.target);
                const total = 22;
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
    }
})();
