/* ===========================================================
   MAIN — orchestrator + loader hide + utilities
   =========================================================== */
(() => {
    'use strict';

    /* ----- Loader ----- */
    const loader = document.getElementById('loader');
    if (loader) {
        const hide = () => loader.classList.add('is-done');
        if (document.readyState === 'complete') {
            setTimeout(hide, 900);
        } else {
            window.addEventListener('load', () => setTimeout(hide, 900));
        }
    }

    /* ----- Keyboard focus ring ----- */
    const onKey = (e) => document.body.classList.toggle('has-keyboard', e.type === 'keydown');
    window.addEventListener('keydown', onKey);
    window.addEventListener('mousedown', onKey);

    /* ----- Year injection (footer) ----- */
    const yearEl = document.querySelector('[data-year]');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
