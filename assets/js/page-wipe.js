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
    if (reduceMotion) return;

    // ---------- Pick the origin ----------
    // Priority: 1) stored value from previous page (means we
    //             got here via a wipe from the other side),
    //          2) data-wipe-origin attribute on the wipe div,
    //          3) right (default for index).
    let origin = null;
    try {
        const stored = sessionStorage.getItem('zenith:wipeOrigin');
        if (stored === 'left' || stored === 'right') {
            origin = stored;
            sessionStorage.removeItem('zenith:wipeOrigin');
        }
    } catch (_) { }
    if (!origin) {
        const attr = (wipe.getAttribute('data-wipe-origin') || '').toLowerCase();
        origin = (attr === 'left' || attr === 'right') ? attr : 'right';
    }

    wipe.style.transformOrigin = origin === 'left' ? 'left center' : 'right center';

    // ---------- Wipe out on load (reveal this page) ----------
    requestAnimationFrame(() => {
        wipe.classList.add('is-out');
        setTimeout(() => wipe.classList.remove('is-out'), 450);
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
        // The destination page will use the same origin so the
        // wipe continues in the same direction.
        try { sessionStorage.setItem('zenith:wipeOrigin', origin); } catch (_) { }

        wipe.classList.add('is-in');
        setTimeout(() => {
            window.location.href = a.href;
        }, 420);
    });
})();
