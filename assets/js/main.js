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

    /* ----- Theme Toggle ----- */
    const themeBtn = document.getElementById('themeToggle');
    if (themeBtn) {
        // Ensure body matches documentElement state immediately on load
        const initDark = document.documentElement.classList.contains('dark-mode');
        document.body.classList.toggle('dark-mode', initDark);

        const toggleTheme = () => {
            const isDark = document.documentElement.classList.toggle('dark-mode');
            document.body.classList.toggle('dark-mode', isDark);
            localStorage.setItem('theme', isDark ? 'dark' : 'light');

            // Dispatch notification to sync other visual controllers (like nav observers)
            window.dispatchEvent(new CustomEvent('theme-change', { detail: { isDark } }));
        };
        themeBtn.addEventListener('click', toggleTheme);
    }
})();
