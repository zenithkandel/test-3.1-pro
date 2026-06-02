/* ===========================================================
   INTERACTIONS — magnetic buttons, hover tilt, scroll counter
   =========================================================== */
(() => {
    'use strict';

    const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouch = window.matchMedia('(hover: none)').matches;

    /* ----- Magnetic buttons ----- */
    if (!isTouch && !reduceMotion) {
        const magnets = $$('[data-magnetic]');
        magnets.forEach(el => {
            const strength = 0.28;
            let raf = null;
            let tx = 0, ty = 0, x = 0, y = 0;

            const onMove = (e) => {
                const rect = el.getBoundingClientRect();
                const cx = rect.left + rect.width / 2;
                const cy = rect.top + rect.height / 2;
                tx = (e.clientX - cx) * strength;
                ty = (e.clientY - cy) * strength;
            };

            const onLeave = () => { tx = 0; ty = 0; };

            const tick = () => {
                x += (tx - x) * 0.18;
                y += (ty - y) * 0.18;
                el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
                raf = requestAnimationFrame(tick);
            };

            el.addEventListener('mousemove', onMove, { passive: true });
            el.addEventListener('mouseleave', onLeave, { passive: true });
            raf = requestAnimationFrame(tick);
        });
    }

    /* ----- Tilt on feature cards (3D-ish) ----- */
    if (!isTouch && !reduceMotion) {
        const tiltItems = $$('.feature, .stack-card, .disclosure');
        tiltItems.forEach(el => {
            let raf = null;
            let rx = 0, ry = 0, tx = 0, ty = 0;

            const onMove = (e) => {
                const rect = el.getBoundingClientRect();
                const px = (e.clientX - rect.left) / rect.width;
                const py = (e.clientY - rect.top) / rect.height;
                tx = (px - 0.5) * 6;   // -3..3 deg
                ty = -(py - 0.5) * 6;  // -3..3 deg
            };

            const onLeave = () => { tx = 0; ty = 0; };

            const tick = () => {
                rx += (tx - rx) * 0.12;
                ry += (ty - ry) * 0.12;
                el.style.setProperty('--rx', `${ry.toFixed(2)}deg`);
                el.style.setProperty('--ry', `${(-rx).toFixed(2)}deg`);
                raf = requestAnimationFrame(tick);
            };

            el.addEventListener('mousemove', onMove, { passive: true });
            el.addEventListener('mouseleave', onLeave, { passive: true });
            raf = requestAnimationFrame(tick);
        });
    }

    /* ----- Counter (data-counter) ----- */
    if (!reduceMotion) {
        const counters = $$('[data-counter]');
        const animate = (el) => {
            const target = parseInt(el.dataset.counter, 10) || 0;
            const original = el.textContent.trim();
            const suffix = original.replace(/[0-9]/g, '');
            const dur = 1400;
            const start = performance.now();
            const ease = (t) => 1 - Math.pow(1 - t, 3);
            const tick = (now) => {
                const t = Math.min(1, (now - start) / dur);
                const v = Math.round(target * ease(t));
                el.textContent = String(v).padStart(original.length - suffix.length, '0') + suffix;
                if (t < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
        };

        const io = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animate(entry.target);
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(c => io.observe(c));
    }
})();
