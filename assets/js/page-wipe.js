/* ===========================================================
   PAGE-WIPE — sienna wipe between index.html and cv.html.

   Model: the wipe is a fixed full-screen panel that scales
   horizontally. transform-origin is the side the wipe "lives
   on" (where it's anchored). On load it shrinks to nothing
   (is-out: scaleX 1 → 0). On click of a link to the other
   page it grows to cover the screen (is-in: scaleX 0 → 1),
   then navigates.

   The origin is the same for both in and out. It is the
   side the wipe came from. The destination page inherits
   the origin from the source page (via sessionStorage) so
   the wipe continues sliding in the same direction.
   =========================================================== */
(() => {
    'use strict';

    const wipe = document.getElementById('pageWipe');
    if (!wipe) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
        // Fallback for prefers-reduced-motion: reveal instantly
        wipe.style.display = 'none';
        return;
    }

    // Inject SVG dynamically so HTML files stay clean
    wipe.innerHTML = `
        <svg viewBox="0 0 100 100" preserveAspectRatio="none">
            <path id="wipePath" d="M 100 0 L 100 100 L 100 100 L 100 0 Z"></path>
        </svg>
    `;
    const path = document.getElementById('wipePath');
    if (!path) return;

    // Morph the SVG path points using bezier curves to produce a liquid-wipe look
    const animatePath = (isIn, callback) => {
        const duration = 480;
        const start = performance.now();

        const tick = (now) => {
            const t = Math.min(1, (now - start) / duration);
            // Cubic ease out
            const progress = isIn ? 1 - Math.pow(1 - t, 3) : Math.pow(1 - t, 3);

            // Left boundary of the wave
            const x = 100 - progress * 100;
            // Control point pulls to create wave curve
            const controlX = x - Math.sin(progress * Math.PI) * 25;

            let d;
            if (isIn) {
                // Wipe in: block enters from the right to cover screen
                d = `M 100 0 L 100 100 L ${x} 100 Q ${controlX} 50 ${x} 0 Z`;
            } else {
                // Wipe out: block exits to the left to reveal screen
                d = `M ${x} 0 Q ${controlX} 50 ${x} 100 L 0 100 L 0 0 Z`;
            }

            path.setAttribute('d', d);

            if (t < 1) {
                requestAnimationFrame(tick);
            } else if (callback) {
                callback();
            }
        };
        requestAnimationFrame(tick);
    };

    // ---------- Wipe out on load (reveal this page) ----------
    wipe.style.visibility = 'visible';
    animatePath(false, () => {
        wipe.style.visibility = 'hidden';
    });

    // ---------- Intercept link clicks ----------
    const filename = (href) => {
        try { return href.split('/').pop().toLowerCase(); }
        catch (_) { return ''; }
    };

    document.addEventListener('click', (e) => {
        const a = e.target.closest('a');
        if (!a) return;
        if (a.target && a.target !== '_self') return;
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        if (e.button !== 0) return;

        const href = a.getAttribute('href') || '';
        if (!href) return;
        if (/^https?:|^mailto:|^tel:|^#/.test(href)) return;

        const dest = filename(href);
        const here = filename(window.location.pathname) || 'index.html';
        if (dest !== 'cv.html' && dest !== 'index.html') return;
        if (dest === here) return;

        e.preventDefault();

        wipe.style.visibility = 'visible';
        animatePath(true, () => {
            window.location.href = a.href;
        });
    });
})();
