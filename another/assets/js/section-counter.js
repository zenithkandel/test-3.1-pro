/* ===========================================================
   SECTION-COUNTER — fixed bottom-left "01 / 05" indicator
   plus a 30px progress bar.

   Uses GSAP ScrollTrigger if available (precise, scroll-linked
   to the same Lenis source). Falls back to a rAF scroll
   listener if not — still correct, just slightly less smooth.
   =========================================================== */
(() => {
    'use strict';

    const counter = document.getElementById('sectionCounter');
    if (!counter) return;
    const label = counter.querySelector('[data-counter-label]');
    if (!label) return;
    const progressEl = counter.querySelector('.section-counter__progress');
    if (!progressEl) return;

    // Hide entirely on touch (nothing to point at with one finger)
    if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) {
        counter.style.display = 'none';
        return;
    }

    const sections = [
        { el: document.getElementById('about'),    num: '01', dark: true  },
        { el: document.getElementById('work'),     num: '02', dark: false },
        { el: document.getElementById('stack'),    num: '03', dark: true  },
        { el: document.getElementById('research'), num: '04', dark: false },
        { el: document.getElementById('contact'),  num: '05', dark: true  },
    ].filter((s) => s.el);

    if (!sections.length) return;

    let activeNum = '';
    let isDark = false;
    let visible = false;

    const setLabel = (txt) => { if (label.textContent !== txt) label.textContent = txt; };
    const setDark = (dark) => {
        if (isDark === dark) return;
        isDark = dark;
        counter.classList.toggle('is-on-dark', dark);
    };
    const setVisible = (v) => {
        if (visible === v) return;
        visible = v;
        counter.classList.toggle('is-visible', v);
    };
    const setProgress = (p) => {
        progressEl.style.setProperty('--p', p.toFixed(3));
    };

    const onReady = () => {
        if (window.gsap && window.ScrollTrigger) {
            sections.forEach(({ el, num, dark }) => {
                window.ScrollTrigger.create({
                    trigger: el,
                    start: 'top 60%',
                    end:   'bottom 40%',
                    onEnter:      () => { setLabel(num); setDark(dark); setVisible(true); },
                    onEnterBack:  () => { setLabel(num); setDark(dark); setVisible(true); },
                });
            });
            const maxScroll = () => (
                (window.__zenithScroll && window.__zenithScroll.max) ||
                Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
            );
            window.ScrollTrigger.create({
                start: 0,
                end:   () => maxScroll(),
                onUpdate: (self) => setProgress(self.progress),
            });
        } else {
            // Vanilla fallback
            const tick = () => {
                const y = window.scrollY;
                if (y < 80) {
                    setVisible(false);
                } else {
                    setVisible(true);
                    const max = (window.__zenithScroll && window.__zenithScroll.max) ||
                        Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
                    setProgress(max === 0 ? 0 : y / max);
                    const center = y + window.innerHeight / 2;
                    for (const { el, num, dark } of sections) {
                        const top = el.offsetTop;
                        const bot = top + el.offsetHeight;
                        if (center >= top && center < bot) {
                            if (activeNum !== num) {
                                activeNum = num;
                                setLabel(num);
                                setDark(dark);
                            }
                            break;
                        }
                    }
                }
                requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
        }
    };

    if (window.__zenithLibsReady) onReady();
    else window.addEventListener('zenith:libs-ready', onReady, { once: true });
    // Safety: if the bridge never fires, still init the vanilla path
    setTimeout(() => {
        if (!counter.classList.contains('is-visible') && !window.__zenithLibsReady) onReady();
    }, 6500);
})();
