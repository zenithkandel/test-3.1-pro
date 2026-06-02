/* ===========================================================
   PAGE-WIPE — sienna wipe between index and cv.

   index -> cv:  in-animation  (scaleX 0 -> 1, origin right)
   on load:      out-animation (scaleX 1 -> 0, origin left)

   The wipe element is in the DOM on every page; the animation
   just runs on this page only. To get a wipe from cv back to
   index, see the small inline <script> appended at the bottom
   of cv.html.
   =========================================================== */
(() => {
    'use strict';

    const wipe = document.getElementById('pageWipe');
    if (!wipe) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    // Animate wipe-out on load
    requestAnimationFrame(() => {
        wipe.classList.add('is-out');
        setTimeout(() => wipe.classList.remove('is-out'), 450);
    });

    // Intercept clicks on internal links to cv.html
    document.addEventListener('click', (e) => {
        const a = e.target.closest('a');
        if (!a) return;
        const href = a.getAttribute('href');
        if (!href || href !== 'cv.html') return;
        if (a.target && a.target !== '_self') return;
        e.preventDefault();
        wipe.classList.add('is-in');
        setTimeout(() => {
            window.location.href = a.href;
        }, 420);
    });
})();
