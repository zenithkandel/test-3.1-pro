/* ===========================================================
   SECTION-LIFE — engagement animations for section elements.
   Research emblem sways while the section is in view.
   Contact emblem flaps once when the contact section enters.
   Stack rows pulse a tool-wave on first reveal.
   Section index underlines draw on first reveal.
   No GSAP / ScrollTrigger needed — all IntersectionObserver.
   =========================================================== */
(() => {
    'use strict';
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    /* ----- Research emblem: slow continuous sway ----- */
    const researchEmblem = document.querySelector('.research-emblem');
    if (researchEmblem) {
        const section = researchEmblem.closest('section');
        if (section) {
            const io = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        researchEmblem.classList.add('is-engaged');
                    }
                });
            }, { threshold: 0.25 });
            io.observe(section);
        }
    }

    /* ----- Contact emblem: one-shot flap ----- */
    const contactEmblem = document.querySelector('.contact-emblem');
    if (contactEmblem) {
        const section = contactEmblem.closest('section');
        if (section) {
            const io = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        contactEmblem.classList.add('is-engaged');
                        setTimeout(() => contactEmblem.classList.remove('is-engaged'), 1500);
                        io.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.4 });
            io.observe(section);
        }
    }

    /* ----- Stack rows: assign --i per tool, then on first reveal
       add .is-engaged so the CSS tool-wave fires (one-shot, staggered
       per row). ----- */
    document.querySelectorAll('.stack-row').forEach((row) => {
        row.querySelectorAll('.stack-row__tools li').forEach((li, i) => {
            li.style.setProperty('--i', i);
        });
        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    row.classList.add('is-engaged');
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.4 });
        io.observe(row);
    });

    /* ----- Section index: draw underline on first reveal ----- */
    document.querySelectorAll('.section__index').forEach((idx) => {
        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    idx.classList.add('in-view');
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.6 });
        io.observe(idx);
    });
})();
