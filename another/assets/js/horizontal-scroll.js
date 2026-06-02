/* ===========================================================
   HORIZONTAL SCROLL — Premium Apple-style Project Scroll
   Pins the work section while scrolling vertically, converting
   vertical scroll into horizontal translation of project cards.
   =========================================================== */
(() => {
    'use strict';

    const section = document.querySelector('.horizontal-scroll-section');
    const sticky = document.querySelector('.horizontal-scroll-sticky');
    const track = document.querySelector('.horizontal-scroll-track');
    const list = document.querySelector('.project-list');
    const projects = document.querySelectorAll('.project');

    if (!section || !sticky || !track || !list) return;

    // Only enable on wider viewports
    const mql = window.matchMedia('(min-width: 860px)');

    // Create progress bar
    const progressBar = document.createElement('div');
    progressBar.className = 'horizontal-scroll-progress';
    const progressFill = document.createElement('div');
    progressFill.className = 'horizontal-scroll-progress__fill';
    progressBar.appendChild(progressFill);
    sticky.appendChild(progressBar);

    let maxTranslate = 0;
    let sectionHeight = 0;
    let isEnabled = false;

    const calculateMetrics = () => {
        if (!mql.matches) {
            // Restore natural behavior for mobile
            section.style.height = '';
            list.style.transform = '';
            progressFill.style.width = '0%';
            projects.forEach(proj => {
                proj.style.opacity = '';
                proj.style.transform = '';
            });
            isEnabled = false;
            return;
        }

        isEnabled = true;

        // The total horizontal distance to scroll: list width minus visible container width
        const listWidth = list.scrollWidth;
        const containerWidth = track.clientWidth;

        // Add some padding so the last card has breathing room
        maxTranslate = listWidth - containerWidth + (window.innerWidth * 0.08);

        if (maxTranslate > 0) {
            // Measure the section header (the .section above the sticky) so the
            // section height = header + sticky (100vh). The horizontal travel
            // is then mapped onto the sticky pinning window, not onto dead
            // scroll space after the sticky releases.
            const headerEl = section.querySelector('.section');
            const headerHeight = headerEl ? headerEl.offsetHeight : 0;

            sectionHeight = headerHeight + window.innerHeight;
            section.style.height = `${sectionHeight}px`;
        } else {
            section.style.height = '';
            maxTranslate = 0;
        }
    };

    const updateScroll = () => {
        if (!isEnabled || maxTranslate <= 0) return;

        // Get the section's position relative to the viewport
        const sectionTop = section.getBoundingClientRect().top;
        const headerEl = section.querySelector('.section');
        const headerHeight = headerEl ? headerEl.offsetHeight : 0;

        let progress = 0;

        if (sectionTop <= -headerHeight) {
            // Progress is measured against the sticky pinning window (100vh),
            // not against the raw horizontal travel distance. This way the
            // horizontal scroll completes exactly while the sticky is pinned.
            const scrollPastHeader = -sectionTop - headerHeight;
            progress = Math.min(scrollPastHeader / window.innerHeight, 1);
        }

        // Apply the horizontal translation
        const translateVal = progress * maxTranslate;
        list.style.transform = `translate3d(${-translateVal}px, 0, 0)`;

        // Update progress bar
        progressFill.style.width = `${(progress * 100).toFixed(1)}%`;

        // Premium parallax effects on individual cards
        projects.forEach((proj) => {
            const projRect = proj.getBoundingClientRect();
            const cardCenter = projRect.left + projRect.width / 2;
            const viewCenter = window.innerWidth / 2;

            // How far from viewport center (-1 to 1)
            const distance = (cardCenter - viewCenter) / window.innerWidth;
            const clamped = Math.max(-1, Math.min(1, distance));
            const absDist = Math.abs(clamped);

            // Cards closer to center are brighter and slightly larger
            const opacity = 1 - absDist * 0.45;
            const scale = 1 - absDist * 0.035;

            proj.style.opacity = opacity.toFixed(3);
            proj.style.transform = `scale(${scale.toFixed(4)})`;
        });
    };

    // Use a continuous rAF loop for buttery-smooth updates
    // This syncs perfectly with the smooth-scroll system which
    // also uses rAF + window.scrollTo
    let running = true;
    const loop = () => {
        if (running) {
            updateScroll();
            requestAnimationFrame(loop);
        }
    };

    // Recalculate on resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            calculateMetrics();
        }, 100);
    });

    // Recalculate after fonts/images load
    window.addEventListener('load', () => {
        calculateMetrics();
    });

    // Initial setup
    calculateMetrics();
    requestAnimationFrame(loop);
})();