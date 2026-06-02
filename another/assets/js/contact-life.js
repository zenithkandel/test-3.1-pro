/* ===========================================================
   CONTACT-LIFE — copy email & phone to clipboard on click.

   On desktop: clicking the row copies the value to clipboard
   and flashes "COPIED ✓" for 1.4s.

   On mobile: we leave the default behavior intact so the
   user gets the OS dialer (tel:) or mail client (mailto:).
   No copy-to-clipboard on touch — it would block the tap.

   Keyboard accessible (Enter / Space) on desktop.
   =========================================================== */
(() => {
    'use strict';

    // On touch devices, let the browser handle tel:/mailto: as designed.
    if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) return;

    const rows = document.querySelectorAll('.contact-row__value');
    if (!rows.length) return;

    rows.forEach((row) => {
        if (row.classList.contains('contact-row__value--static')) return;

        const original = row.textContent;
        row.setAttribute('role', 'button');
        row.setAttribute('tabindex', '0');
        row.setAttribute('aria-label', 'Copy ' + original.trim());
        row.dataset.original = original;

        let resetTimer = null;
        const restore = () => {
            row.classList.remove('is-copied');
            row.textContent = row.dataset.original;
        };
        const flash = (text) => {
            clearTimeout(resetTimer);
            row.classList.add('is-copied');
            row.textContent = text;
            resetTimer = setTimeout(restore, 1400);
        };

        const doCopy = async () => {
            const text = original.trim();
            let ok = false;
            try {
                if (navigator.clipboard && window.isSecureContext) {
                    await navigator.clipboard.writeText(text);
                    ok = true;
                } else {
                    const ta = document.createElement('textarea');
                    ta.value = text;
                    ta.setAttribute('readonly', '');
                    ta.style.position = 'fixed';
                    ta.style.opacity = '0';
                    ta.style.left = '-9999px';
                    document.body.appendChild(ta);
                    ta.select();
                    ok = document.execCommand('copy');
                    document.body.removeChild(ta);
                }
            } catch (e) { ok = false; }

            flash(ok ? 'COPIED ✓' : 'PRESS CTRL+C');
        };

        row.addEventListener('click', (e) => {
            // Only intercept on desktop (we already returned on touch).
            e.preventDefault();
            doCopy();
        });
        row.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                doCopy();
            }
        });
    });
})();
