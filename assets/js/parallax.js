/* ===========================================================
   PARALLAX — Unified Scroll & Mouse Move Parallax Engine
   Supports data-parallax (scroll vertical multiplier),
   data-parallax-x (scroll horizontal multiplier),
   data-mouse-depth (mouse tracking multiplier),
   and data-hover-lift (smooth hover lift).
   =========================================================== */
(() => {
    'use strict';

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
    const items = $$('[data-parallax], [data-parallax-x], [data-mouse-depth]');
    if (!items.length) return;

    // Cache elements and their parameters
    const elems = items.map(el => {
        const pY = parseFloat(el.dataset.parallax) || 0;
        const pX = parseFloat(el.dataset.parallaxX) || 0;
        const mD = parseFloat(el.dataset.mouseDepth) || 0;
        const mDx = parseFloat(el.dataset.mouseDepthX || el.dataset.mouseDepth) || 0;
        const mDy = parseFloat(el.dataset.mouseDepthY || el.dataset.mouseDepth) || 0;
        const hL = parseFloat(el.dataset.hoverLift) || 0;

        // Apply standard parallax styling class if it's not a special transform (like .feature)
        if (!el.classList.contains('feature')) {
            el.classList.add('parallax-el');
        }

        return {
            el,
            scrollStrengthY: pY,
            scrollStrengthX: pX,
            mouseDepthX: mDx,
            mouseDepthY: mDy,
            maxHoverLift: hL,
            targetHoverLift: 0,
            currentHoverLift: 0,
            currentPX: 0,
            currentPY: 0,
            absoluteTop: 0,
            absoluteLeft: 0,
            width: 0,
            height: 0
        };
    });

    // Handle measures relative to document top/left to avoid scroll errors
    const measure = () => {
        const scrollY = window.scrollY;
        const scrollX = window.scrollX;
        elems.forEach(item => {
            const rect = item.el.getBoundingClientRect();
            item.absoluteTop = rect.top + scrollY;
            item.absoluteLeft = rect.left + scrollX;
            item.width = rect.width;
            item.height = rect.height;
        });
    };

    // Register hover listeners for elements that require smooth hover lifts
    elems.forEach(item => {
        if (item.maxHoverLift !== 0) {
            item.el.addEventListener('mouseenter', () => {
                item.targetHoverLift = item.maxHoverLift;
            });
            item.el.addEventListener('mouseleave', () => {
                item.targetHoverLift = 0;
            });
        }
    });

    // Global Mouse Position Tracking (normalized to [-0.5, 0.5])
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;
    const isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

    if (!isTouch) {
        window.addEventListener('mousemove', (e) => {
            targetMouseX = (e.clientX / window.innerWidth) - 0.5;
            targetMouseY = (e.clientY / window.innerHeight) - 0.5;
        }, { passive: true });

        document.addEventListener('mouseleave', () => {
            targetMouseX = 0;
            targetMouseY = 0;
        });
    }

    // Animation Tick
    const tick = () => {
        // Lerp mouse offsets for lag-buffered smoothness
        mouseX += (targetMouseX - mouseX) * 0.08;
        mouseY += (targetMouseY - mouseY) * 0.08;

        // Use custom smooth scroll value if available, else fallback to native
        const scrollY = window.__zenithScroll ? window.__zenithScroll.current : window.scrollY;
        const vh = window.innerHeight;

        elems.forEach(item => {
            let scrollOffsetY = 0;
            let scrollOffsetX = 0;

            // 1. Scroll-driven calculation
            if (item.scrollStrengthY !== 0 || item.scrollStrengthX !== 0) {
                const center = item.absoluteTop + item.height / 2;
                const dist = (center - (scrollY + vh / 2)) / vh;
                const d = Math.max(-1, Math.min(1, dist));

                if (item.scrollStrengthY !== 0) {
                    scrollOffsetY = -d * 60 * item.scrollStrengthY * 10;
                }
                if (item.scrollStrengthX !== 0) {
                    scrollOffsetX = -d * 60 * item.scrollStrengthX * 10;
                }
            }

            // 2. Mousemove-driven calculation
            let mouseOffsetX = 0;
            let mouseOffsetY = 0;
            if (!isTouch) {
                mouseOffsetX = mouseX * item.mouseDepthX * 2;
                mouseOffsetY = mouseY * item.mouseDepthY * 2;
            }

            // 3. Hover lift calculation
            if (item.maxHoverLift !== 0) {
                item.currentHoverLift += (item.targetHoverLift - item.currentHoverLift) * 0.12;
            }

            // Combine calculations
            const targetPX = scrollOffsetX + mouseOffsetX;
            const targetPY = scrollOffsetY + mouseOffsetY + item.currentHoverLift;

            // Interpolate coordinates for liquid responsiveness
            item.currentPX += (targetPX - item.currentPX) * 0.15;
            item.currentPY += (targetPY - item.currentPY) * 0.15;

            // Update custom CSS properties
            item.el.style.setProperty('--px', `${item.currentPX.toFixed(2)}px`);
            item.el.style.setProperty('--py', `${item.currentPY.toFixed(2)}px`);
        });

        requestAnimationFrame(tick);
    };

    window.addEventListener('resize', measure);
    window.addEventListener('load', measure);
    measure();
    requestAnimationFrame(tick);
})();
