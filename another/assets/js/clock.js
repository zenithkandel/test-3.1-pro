/* ===========================================================
   CLOCK — live KTM time in the hero.
   Updates once per second using Intl.DateTimeFormat.
   Falls back silently if the timezone is unavailable.
   =========================================================== */
(() => {
    'use strict';

    const el = document.querySelector('[data-clock-time]');
    if (!el) return;

    let formatter;
    try {
        formatter = new Intl.DateTimeFormat('en-GB', {
            timeZone: 'Asia/Kathmandu',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
        });
    } catch (e) {
        el.textContent = '';
        return;
    }

    const update = () => {
        try {
            el.textContent = formatter.format(new Date());
        } catch (e) {
            el.textContent = '';
        }
    };

    update();
    setInterval(update, 1000);
})();
