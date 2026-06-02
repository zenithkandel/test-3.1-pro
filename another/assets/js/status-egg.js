/* ===========================================================
   STATUS-EGG — easter egg 1.

   Click the "available" chip (the small sienna dot) three times
   within two seconds and a small love-letter modal slides up
   from the bottom-right. Esc / click-outside / × to close.

   localStorage flag so it only fires once per visitor.
   =========================================================== */
(() => {
    'use strict';

    const trigger = document.querySelector('[data-egg-dot="status"]');
    const modal = document.getElementById('eggModal');
    if (!trigger || !modal) return;

    try {
        if (localStorage.getItem('zenith:egg-status') === '1') return;
    } catch (e) { /* localStorage blocked, just allow it */ }

    const WINDOW_MS = 2000;
    const THRESHOLD = 3;
    const clicks = [];

    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const now = Date.now();
        while (clicks.length && now - clicks[0] > WINDOW_MS) clicks.shift();
        clicks.push(now);
        if (clicks.length >= THRESHOLD) {
            clicks.length = 0;
            openModal();
        }
    });

    const closeBtn = modal.querySelector('[data-egg-close]');
    let lastFocus = null;

    const openModal = () => {
        lastFocus = document.activeElement;
        modal.hidden = false;
        // Force layout
        void modal.offsetWidth;
        modal.classList.add('is-open');
        setTimeout(() => { try { closeBtn.focus(); } catch (e) { /* noop */ } }, 80);
        try { localStorage.setItem('zenith:egg-status', '1'); } catch (e) { /* noop */ }
    };

    const closeModal = () => {
        if (!modal.classList.contains('is-open')) return;
        modal.classList.remove('is-open');
        setTimeout(() => { modal.hidden = true; }, 380);
        if (lastFocus && typeof lastFocus.focus === 'function') {
            try { lastFocus.focus(); } catch (e) { /* noop */ }
        }
    };

    closeBtn.addEventListener('click', (e) => { e.stopPropagation(); closeModal(); });
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
    });
})();
