/* ===========================================================
   SMOOTH-SCROLL — Lenis-powered weighted scroller.

   Preserves the legacy public API (window.__zenithScroll) so
   parallax.js, horizontal-scroll.js, and any future module can
   read the same shape they used to read from the old wheel-driven
   implementation:

       window.__zenithScroll.current   // current scrollY
       window.__zenithScroll.target    // current scrollY (Lenis drives directly)
       window.__zenithScroll.max       // max scrollY
       window.__zenithScroll.progress  // 0..1

   Behavior preserved from the old version:
     - Disabled on touch devices (native scroll is faster).
     - Disabled if the user prefers reduced motion.
     - Disabled if the body does NOT have data-smooth-scroll.
     - Anchor links animate via lenis.scrollTo with the same -8 offset.
     - Keyboard nav (Arrows, PgUp/PgDn, Home/End, Space) still works.
     - GSAP ScrollTrigger is wired to Lenis if both are present.

   If Lenis failed to load (CDN blocked, offline, etc.) we still
   expose the same API and just fall back to native scroll — the
   site never breaks.
   =========================================================== */
(() => {
    'use strict';

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    if (isTouch) return;
    if (!document.body.hasAttribute('data-smooth-scroll')) return;

    const init = () => initLenis();

    if (window.__zenithLibsReady) {
        init();
    } else {
        window.addEventListener('zenith:libs-ready', init, { once: true });
        // Safety: if the bridge never fires within 6s, init anyway
        // (will fall through to the no-Lenis fallback).
        setTimeout(() => { if (!window.__zenithScroll) init(); }, 6000);
    }

    function initLenis() {
        const getMax = () => Math.max(
            document.body.scrollHeight,
            document.documentElement.scrollHeight,
            document.body.offsetHeight,
            document.documentElement.offsetHeight
        ) - window.innerHeight;

        /* ----- Fallback: no Lenis, expose native API ----- */
        if (typeof window.Lenis !== 'function') {
            window.__zenithScroll = {
                get current()  { return window.scrollY || 0; },
                get target()   { return window.scrollY || 0; },
                get max()      { return Math.max(0, getMax()); },
                get progress() {
                    const m = Math.max(0, getMax());
                    return m === 0 ? 0 : (window.scrollY || 0) / m;
                },
            };
            return;
        }

        /* ----- Lenis path ----- */
        const lenis = new window.Lenis({
            duration: 1.15,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
            wheelMultiplier: 1.0,
            touchMultiplier: 1.6,
        });

        /* ----- GSAP / ScrollTrigger bridge (optional) ----- */
        if (window.gsap && window.ScrollTrigger) {
            window.gsap.ticker.add((time) => lenis.raf(time * 1000));
            window.gsap.ticker.lagSmoothing(0);
            lenis.on('scroll', window.ScrollTrigger.update);
        } else {
            const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
            requestAnimationFrame(raf);
        }

        /* ----- Public API (legacy-compatible shape) ----- */
        window.__zenithScroll = {
            get current()  { return lenis.scroll; },
            get target()   { return lenis.scroll; },
            get max()      { return lenis.limit; },
            get progress() { return lenis.progress; },
        };

        /* ----- Anchor click ----- */
        document.addEventListener('click', (e) => {
            const a = e.target.closest('a[href^="#"]');
            if (!a) return;
            const id = a.getAttribute('href');
            if (id === '#' || id.length < 2) return;
            const tgt = document.querySelector(id);
            if (!tgt) return;
            e.preventDefault();
            lenis.scrollTo(tgt, { offset: -8 });
        });

        /* ----- Keyboard navigation (Lenis does NOT intercept these) ----- */
        const step = () => window.innerHeight * 0.85;
        window.addEventListener('keydown', (e) => {
            const t = lenis.scroll;
            let next = null;
            switch (e.key) {
                case 'ArrowDown': next = t + step(); break;
                case 'ArrowUp':   next = t - step(); break;
                case 'PageDown':  next = t + step(); break;
                case 'PageUp':    next = t - step(); break;
                case 'Home':      next = 0; break;
                case 'End':       next = lenis.limit; break;
                case ' ':
                    next = t + (e.shiftKey ? -step() : step());
                    break;
            }
            if (next === null) return;
            e.preventDefault();
            next = Math.max(0, Math.min(next, lenis.limit));
            lenis.scrollTo(next, { lock: false, force: false });
        });
    }
})();
