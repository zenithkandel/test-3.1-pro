/* ===========================================================
   LIB-BRIDGE — dynamic CDN loader for GSAP / ScrollTrigger / Lenis.

   Why dynamic? A <script defer src="https://cdn..."> at the top of
   the document blocks the entire defer queue until that script
   finishes loading. On a slow or blocked CDN that means a blank
   page for seconds. Dynamic loading (after the page has parsed)
   keeps first-paint snappy and degrades gracefully — the site
   still works without these libraries.

   When loading finishes (success OR fail) we set
   `window.__zenithLibsReady = true` and dispatch the
   `zenith:libs-ready` event. Any module that depends on these
   libraries waits on that event with a short safety timeout.
   =========================================================== */
(() => {
    'use strict';
    if (window.__zenithLibsReady) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
        // We still mark ready — dependents will see no GSAP/Lenis and use a no-op path.
        window.__zenithLibsReady = true;
        window.dispatchEvent(new CustomEvent('zenith:libs-ready'));
        return;
    }

    const TIMEOUT_MS = 5000;
    const CDN = 'https://cdnjs.cloudflare.com/ajax/libs';

    const SOURCES = [
        `${CDN}/gsap/3.12.5/gsap.min.js`,
        `${CDN}/gsap/3.12.5/ScrollTrigger.min.js`,
        `${CDN}/lenis/1.1.13/lenis.min.js`,
    ];

    const loadOne = (src) => new Promise((resolve) => {
        const s = document.createElement('script');
        s.src = src;
        s.async = false; // preserve order: GSAP before ScrollTrigger before Lenis
        let done = false;
        const finish = (ok) => { if (done) return; done = true; resolve(ok); };
        s.onload  = () => finish(true);
        s.onerror = () => finish(false);
        document.head.appendChild(s);
        setTimeout(() => finish(false), TIMEOUT_MS);
    });

    Promise.all(SOURCES.map(loadOne)).then((results) => {
        // Register ScrollTrigger with GSAP only if both actually loaded.
        if (window.gsap && window.ScrollTrigger && results[0] && results[1]) {
            try { window.gsap.registerPlugin(window.ScrollTrigger); } catch (_) { /* noop */ }
        }
        window.__zenithLibsReady = true;
        window.dispatchEvent(new CustomEvent('zenith:libs-ready'));
    });
})();
