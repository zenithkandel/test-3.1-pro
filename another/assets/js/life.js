/* ===========================================================
   LIFE — orchestrator (intentionally thin).

   Most life systems live in their own module (avatar.js,
   section-life.js, clock.js, etc.). This file is a single
   place to coordinate things that span multiple modules and
   to expose a small global namespace for debugging.

   Today: logs a single ready-line in the console, only if
   the visitor has a ?debug=1 query (so we don't add noise
   to the default experience).
   =========================================================== */
(() => {
    'use strict';
    try {
        const params = new URLSearchParams(window.location.search);
        if (!params.has('debug')) return;
        // eslint-disable-next-line no-console
        console.info('[zenith] life systems online. lib-bridge:', !!window.__zenithLibsReady);
        window.__zenith = {
            scroll: () => window.__zenithScroll,
            libs:   () => window.__zenithLibsReady,
        };
    } catch (e) { /* noop */ }
})();
