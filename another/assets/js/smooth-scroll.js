/* ===========================================================
   SMOOTH-SCROLL — weighted/momentum scroller
   Keeps body in normal flow; only intercepts wheel/touch events
   and animates window.scrollTo for the weighted feel.
   =========================================================== */
(() => {
    'use strict';

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const html = document.documentElement;
    const body = document.body;

    if (!body.hasAttribute('data-smooth-scroll')) return;

    // Tunables
    const ease = 0.10;   // lerp factor (lower = heavier)
    const wheelMul = 1.0;    // wheel delta multiplier
    const touchMul = 1.0;    // touch delta multiplier

    let current = window.scrollY || html.scrollTop || 0;
    let target = current;
    let maxScroll = 0;
    let lastTouchY = 0;
    let animating = true;

    const getMax = () => {
        // body's scrollHeight is the reliable one when html/body aren't fixed
        const sh = Math.max(
            body.scrollHeight,
            html.scrollHeight,
            body.offsetHeight,
            html.offsetHeight
        );
        return Math.max(0, sh - window.innerHeight);
    };

    const setSize = () => {
        maxScroll = getMax();
        if (target > maxScroll) target = maxScroll;
    };

    const onWheel = (e) => {
        e.preventDefault();
        // accumulate target
        const delta = (e.deltaY !== undefined ? e.deltaY : 0) * wheelMul;
        target += delta;
        if (target < 0) target = 0;
        if (target > maxScroll) target = maxScroll;
    };

    const onTouchStart = (e) => {
        lastTouchY = e.touches[0].clientY;
    };

    const onTouchMove = (e) => {
        const y = e.touches[0].clientY;
        const dy = lastTouchY - y;
        lastTouchY = y;
        target += dy * touchMul;
        if (target < 0) target = 0;
        if (target > maxScroll) target = maxScroll;
    };

    const onKey = (e) => {
        const step = window.innerHeight * 0.85;
        let handled = true;
        if (e.key === 'ArrowDown') target += step;
        else if (e.key === 'ArrowUp') target -= step;
        else if (e.key === 'PageDown') target += step;
        else if (e.key === 'PageUp') target -= step;
        else if (e.key === 'Home') target = 0;
        else if (e.key === 'End') target = maxScroll;
        else if (e.key === ' ') target += (e.shiftKey ? -step : step);
        else handled = false;
        if (handled) {
            e.preventDefault();
            if (target < 0) target = 0;
            if (target > maxScroll) target = maxScroll;
        }
    };

    const onAnchorClick = (e) => {
        const a = e.target.closest('a[href^="#"]');
        if (!a) return;
        const id = a.getAttribute('href');
        if (id === '#' || id.length < 2) return;
        const tgt = document.querySelector(id);
        if (!tgt) return;
        e.preventDefault();
        // Recalculate max before anchor scroll to capture dynamic heights
        setSize();
        const y = tgt.getBoundingClientRect().top + window.scrollY - 8;
        target = Math.max(0, Math.min(y, maxScroll));
    };

    const tick = () => {
        if (animating) {
            // Recalculate max every frame to stay in sync with dynamic height changes
            // (e.g., horizontal scroll section adjusting its height via JS)
            maxScroll = getMax();
            if (target > maxScroll) target = maxScroll;

            const diff = target - current;
            if (Math.abs(diff) > 0.5) {
                current += diff * ease;
                window.scrollTo(0, current);
            } else if (current !== target) {
                current = target;
                window.scrollTo(0, current);
            }
        }
        requestAnimationFrame(tick);
    };

    // Watch for content height changes
    const mo = new MutationObserver(setSize);
    mo.observe(body, { childList: true, subtree: true });

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', setSize);
    window.addEventListener('load', setSize);
    document.addEventListener('click', onAnchorClick);

    setSize();
    requestAnimationFrame(tick);

    // Public API for other modules
    window.__zenithScroll = {
        get current() { return current; },
        get target() { return target; },
        get max() { return maxScroll; },
        get progress() { return maxScroll === 0 ? 0 : current / maxScroll; }
    };
})();
