/* ===========================================================
   PAGE-WIPE — sienna wipe between index.html and cv.html.

   The .page-wipe element exists on every page. On load it
   animates in (revealing the new page from one side). On click
   of a link to the other page it animates out (covering the
   current page from one side) before navigating.

   Direction is picked from the destination:
     - Going to cv.html     → wipe in from right to left
     - Going to index.html  → wipe in from left to right
   =========================================================== */
(() => {
    'use strict';

    const wipe = document.getElementById('pageWipe');
    if (!wipe) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    const filename = (href) => {
        try { return href.split('/').pop().toLowerCase(); }
        catch (_) { return ''; }
    };

    // ---------- On load: wipe-out (reveal this page) ----------
    // Default origin is "right" (index.html uses wipe-out from right).
    // cv.html sets data-wipe-origin="left" on the wipe element.
    const origin = (wipe.getAttribute('data-wipe-origin') || 'right').toLowerCase();
    wipe.style.transformOrigin = origin === 'left' ? 'left center' : 'right center';
    requestAnimationFrame(() => {
        wipe.classList.add('is-out');
        setTimeout(() => wipe.classList.remove('is-out'), 450);
    });

    // ---------- On click: wipe-in (cover, then navigate) ----------
    document.addEventListener('click', (e) => {
        const a = e.target.closest('a');
        if (!a) return;
        if (a.target && a.target !== '_self') return;
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        if (e.button !== 0) return;

        const href = a.getAttribute('href') || '';
        if (!href) return;

        const dest = filename(href);
        const here = filename(window.location.pathname) || 'index.html';
        if (dest !== 'cv.html' && dest !== 'index.html') return;
        if (dest === here) return;
        if (!/\.html?$/.test(href) || /^https?:|^mailto:|^tel:/.test(href)) return;

        e.preventDefault();
        // When navigating from index to cv, the destination loads
        // with origin=right (matches its expected entrance).
        // When navigating from cv to index, the destination loads
        // with origin=left.
        const newOrigin = dest === 'cv.html' ? 'right' : 'left';
        try { sessionStorage.setItem('zenith:wipeOrigin', newOrigin); } catch (_) {}

        wipe.style.transformOrigin = newOrigin === 'left' ? 'left center' : 'right center';
        wipe.classList.add('is-in');
        setTimeout(() => {
            window.location.href = a.href;
        }, 420);
    });

    // ---------- If page was reached via a wipe, honor the origin ----------
    try {
        const stored = sessionStorage.getItem('zenith:wipeOrigin');
        if (stored === 'left' || stored === 'right') {
            wipe.style.transformOrigin = stored === 'left' ? 'left center' : 'right center';
            // Re-trigger the wipe-out with the new origin
            requestAnimationFrame(() => {
                wipe.classList.add('is-out');
                setTimeout(() => wipe.classList.remove('is-out'), 450);
            });
            sessionStorage.removeItem('zenith:wipeOrigin');
        }
    } catch (_) {}
})();
