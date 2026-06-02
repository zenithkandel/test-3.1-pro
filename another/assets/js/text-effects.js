/* ===========================================================
   TEXT-EFFECTS — text scramble on hover
   Splits inner text into spans and resolves to original after a random scramble
   =========================================================== */
(() => {
    'use strict';

    const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouch = window.matchMedia('(hover: none)').matches;

    if (reduceMotion || isTouch) return;

    const CHARS = '!<>-_\\/[]{}—=+*^?#________';

    const scramble = (el) => {
        const original = el.dataset.original || el.textContent;
        if (!el.dataset.original) el.dataset.original = original;
        const letters = original.split('');
        const totalFrames = 14;
        let frame = 0;

        const tick = () => {
            let out = '';
            for (let i = 0; i < letters.length; i++) {
                const ch = letters[i];
                if (ch === ' ') { out += ' '; continue; }
                if (frame >= totalFrames - i) { out += ch; }
                else { out += CHARS[Math.floor(Math.random() * CHARS.length)]; }
            }
            el.textContent = out;
            frame++;
            if (frame < totalFrames + letters.length) {
                requestAnimationFrame(tick);
            } else {
                el.textContent = original;
            }
        };
        requestAnimationFrame(tick);
    };

    // Apply to nav links, footer links, project titles, etc.
    const targets = $$('.nav__link, .footer__link, .project__title, .section__title, .feature__title, .contact-row__value, .social__handle');

    targets.forEach(el => {
        el.dataset.original = el.textContent;
        let timer;
        el.addEventListener('mouseenter', () => {
            clearTimeout(timer);
            scramble(el);
        });
    });
})();
