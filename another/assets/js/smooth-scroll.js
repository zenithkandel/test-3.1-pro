/* ===========================================================
   SMOOTH-SCROLL — weighted/momentum scroller
   Hand-rolled Lenis-style:
   - Captures native wheel + touch + keys
   - Lerps a virtual scroll position toward target
   - Renders via translateY on body
   =========================================================== */
(() => {
    'use strict';

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const html = document.documentElement;
    const body = document.body;
    body.style.position = 'fixed';
    body.style.top = '0';
    body.style.left = '0';
    body.style.right = '0';

    const ease = 0.085;            // lerp factor (lower = heavier)
    const wheelEase = 1.05;        // wheel input ease
    const touchEase = 1.4;         // touch input ease

    let current = 0;
    let target  = 0;
    let maxScroll = 0;
    let lastTouchY = 0;
    let isAnimating = true;

    const setSize = () => {
        maxScroll = html.scrollHeight - window.innerHeight;
        if (maxScroll < 0) maxScroll = 0;
    };

    const onResize = () => {
        setSize();
        if (target > maxScroll) target = maxScroll;
    };

    const onWheel = (e) => {
        e.preventDefault();
        const delta = e.deltaY;
        target += delta * wheelEase;
        if (target < 0) target = 0;
        if (target > maxScroll) target = maxScroll;
    };

    const onTouchStart = (e) => {
        lastTouchY = e.touches[0].clientY;
    };

    const onTouchMove = (e) => {
        e.preventDefault();
        const y = e.touches[0].clientY;
        const dy = lastTouchY - y;
        lastTouchY = y;
        target += dy * touchEase;
        if (target < 0) target = 0;
        if (target > maxScroll) target = maxScroll;
    };

    const onKey = (e) => {
        const step = window.innerHeight * 0.85;
        if (e.key === 'ArrowDown') { target += step; }
        else if (e.key === 'ArrowUp') { target -= step; }
        else if (e.key === 'PageDown') { target += step; }
        else if (e.key === 'PageUp') { target -= step; }
        else if (e.key === 'Home') { target = 0; }
        else if (e.key === 'End') { target = maxScroll; }
        else return;
        if (target < 0) target = 0;
        if (target > maxScroll) target = maxScroll;
    };

    // Anchor links → smooth scroll to target
    const onAnchorClick = (e) => {
        const a = e.target.closest('a[href^="#"]');
        if (!a) return;
        const id = a.getAttribute('href');
        if (id === '#' || id.length < 2) return;
        const tgt = document.querySelector(id);
        if (!tgt) return;
        e.preventDefault();
        const y = tgt.getBoundingClientRect().top + target - 8;
        target = Math.max(0, Math.min(y, maxScroll));
    };

    const tick = () => {
        if (isAnimating) {
            current += (target - current) * ease;
            if (Math.abs(target - current) < 0.5) current = target;
            body.style.transform = `translate3d(0, ${-current}px, 0)`;
        }
        requestAnimationFrame(tick);
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    document.addEventListener('click', onAnchorClick);

    // Mutation observer for content growth
    const mo = new MutationObserver(setSize);
    mo.observe(body, { childList: true, subtree: true });
    window.addEventListener('load', setSize);

    setSize();
    requestAnimationFrame(tick);

    // Expose for other modules (parallax, reveal, etc.)
    window.__zenithScroll = {
        get current() { return current; },
        get target()  { return target;  },
        get max()     { return maxScroll; },
        get progress(){ return maxScroll === 0 ? 0 : current / maxScroll; }
    };
})();
