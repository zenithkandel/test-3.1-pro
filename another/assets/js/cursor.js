/* ===========================================================
   CURSOR — macOS-style cursor system
   - Default state: macOS arrow cursor
   - Hover over interactive: pointer (hand) cursor
   - Hover over text input: I-beam cursor
   =========================================================== */
(() => {
    'use strict';

    const cursor = document.getElementById('cursor');
    if (!cursor) return;
    if (window.matchMedia('(hover: none)').matches) { cursor.style.display = 'none'; return; }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { cursor.style.display = 'none'; return; }

    const arrow   = cursor.querySelector('[data-cursor="arrow"]');
    const pointer = cursor.querySelector('[data-cursor="pointer"]');
    const text    = cursor.querySelector('[data-cursor="text"]');

    let x = -100, y = -100;
    let tx = x, ty = y;
    const lerp = 0.22;

    let mode = 'arrow';

    const setMode = (next) => {
        if (mode === next) return;
        mode = next;
        arrow  .style.opacity = (next === 'arrow')   ? '1' : '0';
        pointer.style.opacity = (next === 'pointer') ? '1' : '0';
        text   .style.opacity = (next === 'text')    ? '1' : '0';
    };

    const onMove = (e) => {
        tx = e.clientX;
        ty = e.clientY;
    };

    const tick = () => {
        x += (tx - x) * lerp;
        y += (ty - y) * lerp;
        cursor.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-4px, -2px)`;
        requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    requestAnimationFrame(tick);

    // Hover bindings
    const linkSel   = 'a, button, .btn, .nav__link, .nav__cta, .nav__brand, .feature, .stack-card, .disclosure, .project, .contact-row, .social, [data-magnetic], [role="button"]';
    const textSel   = 'input[type="text"], input[type="email"], textarea, [data-cursor-text]';

    document.addEventListener('mouseover', (e) => {
        const t = e.target.closest(linkSel);
        if (t) { setMode('pointer'); return; }
        const tx = e.target.closest(textSel);
        if (tx) { setMode('text'); return; }
        setMode('arrow');
    }, { passive: true });

    document.addEventListener('mouseleave', () => setMode('arrow'), { passive: true });

    // Press feedback
    window.addEventListener('mousedown', () => cursor.classList.add('is-down'));
    window.addEventListener('mouseup',   () => cursor.classList.remove('is-down'));

    // Hide when leaving viewport
    document.addEventListener('mouseleave', () => cursor.style.opacity = '0');
    document.addEventListener('mouseenter', () => cursor.style.opacity = '1');
})();
