/* ===========================================================
   AVATAR — bring the hero portrait to life.

   - Pupils follow the cursor (lerped, with a max travel).
   - Eyes blink on a slow CSS loop (.is-blinking toggles it).
   - Micro-saccades: tiny random pupil offsets every few seconds
     to keep the gaze from looking "frozen" when the cursor is
     still.
   - On touch: pupils run a pre-baked look-around loop.
   - On prefers-reduced-motion: no cursor follow, no saccade,
     slower blink.

   All values use CSS custom properties (--pupil-max, --pupil-lerp)
   so the CSS file stays the source of truth for tuning.
   =========================================================== */
(() => {
    'use strict';

    const svg = document.querySelector('.hero__portrait-svg');
    if (!svg) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

    const pupils = svg.querySelectorAll('[data-pupil]');
    if (!pupils.length) return;

    /* ----- Config (CSS-first) ----- */
    const lerp = parseFloat(getComputedStyle(svg).getPropertyValue('--pupil-lerp')) || 0.14;
    const maxTravel = parseFloat(getComputedStyle(svg).getPropertyValue('--pupil-max')) || 6;

    /* ----- State ----- */
    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    let rect = null;
    let saccadeTarget = { x: 0, y: 0 };
    let saccadeReturnAt = 0;
    let isSaccading = false;

    /* ----- Ticking ----- */
    const tick = () => {
        current.x += (target.x - current.x) * lerp;
        current.y += (target.y - current.y) * lerp;
        pupils.forEach((g) => {
            g.setAttribute('transform', `translate(${current.x.toFixed(2)} ${current.y.toFixed(2)})`);
        });
        requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

    /* ----- Geometry: map cursor position to pupil offset ----- */
    const updateTargetFromPointer = (clientX, clientY) => {
        if (!rect) rect = svg.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top  + rect.height / 2;
        // Normalize to roughly -1..1 relative to viewport
        const nx = Math.max(-1.2, Math.min(1.2, (clientX - cx) / (window.innerWidth  / 2)));
        const ny = Math.max(-1.2, Math.min(1.2, (clientY - cy) / (window.innerHeight / 2)));
        target.x = nx * maxTravel;
        target.y = ny * maxTravel * 0.7; // a little less vertical travel (eyes look more side-to-side)
        isSaccading = false;
    };

    /* ----- Pointer (mouse) ----- */
    if (!isTouch && !reduceMotion) {
        const measure = () => { rect = svg.getBoundingClientRect(); };
        window.addEventListener('resize', measure, { passive: true });
        window.addEventListener('load', measure, { once: true });
        // The portrait frame can be hovered; we re-measure on hover enter
        svg.addEventListener('mouseenter', measure, { passive: true });
        // Use a per-document listener (not window) so we can also disable
        // cheaply when not on the hero.
        document.addEventListener('mousemove', (e) => {
            // Only react when the cursor is in the visible viewport;
            // pupils otherwise drift and lag.
            if (e.clientY < 0 || e.clientY > window.innerHeight) return;
            if (e.clientX < 0 || e.clientX > window.innerWidth)  return;
            updateTargetFromPointer(e.clientX, e.clientY);
        }, { passive: true });
    }

    /* ----- Touch: pre-baked look-around ----- */
    if (isTouch) {
        const poses = [
            { x: -maxTravel * 0.6, y: 0 },           // look left
            { x:  maxTravel * 0.6, y: 0 },           // look right
            { x:  0, y: -maxTravel * 0.3 },          // up
            { x:  0, y:  maxTravel * 0.2 },          // down (slight)
        ];
        let i = 0;
        const advance = () => {
            const p = poses[i % poses.length];
            target.x = p.x; target.y = p.y;
            i++;
        };
        advance();
        setInterval(advance, 1800);
    }

    /* ----- Micro-saccade (only on desktop, not reduced-motion) ----- */
    if (!isTouch && !reduceMotion) {
        const scheduleSaccade = () => {
            const delay = 2000 + Math.random() * 2200; // 2.0s .. 4.2s
            setTimeout(() => {
                if (isSaccading) return;
                isSaccading = true;
                // Add a small jitter on top of the current target
                const jx = (Math.random() - 0.5) * 1.6;
                const jy = (Math.random() - 0.5) * 1.0;
                saccadeTarget.x = target.x + jx;
                saccadeTarget.y = target.y + jy;
                target.x = saccadeTarget.x;
                target.y = saccadeTarget.y;
                saccadeReturnAt = performance.now() + 220 + Math.random() * 180;
                setTimeout(() => {
                    isSaccading = false;
                    // target will be re-asserted by the next mousemove
                }, saccadeReturnAt - performance.now());
                scheduleSaccade();
            }, delay);
        };
        scheduleSaccade();
    }

    /* ----- Blink: toggle the .is-blinking class so the CSS animation
       only runs while the avatar is in view (saves GPU). ----- */
    if (!reduceMotion) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                svg.classList.toggle('is-blinking', entry.isIntersecting);
            });
        }, { threshold: 0.25 });
        io.observe(svg);
    } else {
        // Reduced motion: a very slow, single blink on reveal only
        setTimeout(() => {
            svg.classList.add('is-blinking');
            setTimeout(() => svg.classList.remove('is-blinking'), 200);
        }, 4000);
    }
})();
