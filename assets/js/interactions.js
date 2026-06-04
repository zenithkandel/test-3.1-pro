/* ===========================================================
   INTERACTIONS — hover tilt, scroll counter
   =========================================================== */
(() => {
    'use strict';

    const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouch = window.matchMedia('(hover: none)').matches;

    /* ----- Tilt on feature cards (3D-ish) ----- */
    if (!isTouch && !reduceMotion) {
        const tiltItems = $$('.feature');
        tiltItems.forEach(el => {
            let raf = null;
            let rx = 0, ry = 0, tx = 0, ty = 0;

            const onMove = (e) => {
                const rect = el.getBoundingClientRect();
                const px = (e.clientX - rect.left) / rect.width;
                const py = (e.clientY - rect.top) / rect.height;
                tx = (px - 0.5) * 6;
                ty = -(py - 0.5) * 6;
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

    /* ----- Counter (data-counter) -----
       Upgraded to scroll-bound interpolation in scroll-interactions.js
    ------------------------------------- */
})();
