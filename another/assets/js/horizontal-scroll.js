/* ===========================================================
   HORIZONTAL SCROLL — Premium Apple-style Project Scroll
   =========================================================== */
(() => {
    'use strict';

    const section = document.querySelector('.horizontal-scroll-section');
    const sticky = document.querySelector('.horizontal-scroll-sticky');
    const track = document.querySelector('.horizontal-scroll-track');
    const list = document.querySelector('.project-list');
    const projects = document.querySelectorAll('.project');

    if (!section || !sticky || !track || !list) return;

    // We only enable this on non-mobile devices or if width is large enough
    const mql = window.matchMedia('(min-width: 860px)');

    let trackWidth, viewportWidth;

    const calculateMetrics = () => {
        if (!mql.matches) {
            // Restore natural behavior for mobile
            section.style.height = 'auto';
            track.style.transform = 'none';
            list.style.transform = 'none';
            return;
        }

        // To map 1px of horizontal distance to 1px of vertical scroll
        // we add the horizontal travel distance to the viewport height.
        trackWidth = list.scrollWidth;
        viewportWidth = window.innerWidth;

        // Total horizontal distance to travel
        // Calculate the maximum left transform possible: container width - viewport width
        // Wait, track is inside section, we need to move the list left by (trackWidth - track.clientWidth + some padding)
        const containerWidth = track.clientWidth;
        const maxTranslate = list.scrollWidth - containerWidth + (window.innerWidth * 0.15);

        if (maxTranslate > 0) {
            section.style.height = `${maxTranslate + window.innerHeight}px`;
        } else {
            section.style.height = 'auto';
        }
    };

    const updateScroll = () => {
        if (!mql.matches) return;

        const sectionRect = section.getBoundingClientRect();

        // Let start represent how far we've scrolled down into the pinned section timeline
        let progress = 0;

        // As soon as the top of `.horizontal-scroll-section` goes above 0, pinning starts
        if (sectionRect.top <= 0) {
            const availableScroll = sectionRect.height - window.innerHeight;
            if (availableScroll > 0) {
                progress = Math.min(-sectionRect.top / availableScroll, 1);
            }
        }

        const maxTranslate = list.scrollWidth - track.clientWidth + (window.innerWidth * 0.15);

        if (maxTranslate > 0) {
            const translateVal = progress * maxTranslate;
            // Use translation instead of scrollLeft for smooth performance
            list.style.transform = `translate3d(${-translateVal}px, 0, 0)`;

            // Subtle parallax/opacity effects on items
            projects.forEach((proj) => {
                const projRect = proj.getBoundingClientRect();
                const centerOffset = (projRect.left + projRect.width / 2) - window.innerWidth / 2;

                // Normalise the distance from center (-1 to 1 roughly)
                const distance = Math.min(Math.max(centerOffset / window.innerWidth, -1), 1);

                // Opacity curve: brightest at center, fades out slightly on edges
                const opacity = 1 - Math.abs(distance) * 0.5;
                const scale = 1 - Math.abs(distance) * 0.03;

                proj.style.opacity = opacity.toFixed(2);
                proj.style.transform = `scale(${scale.toFixed(3)})`;
            });
        }
    };

    window.addEventListener('resize', () => {
        calculateMetrics();
        updateScroll();
    });

    // Tap into smooth scroll or native scroll
    // Using a simple rAF loop gives the smoothest interpolated result for CSS transforms
    let ticking = false;
    const render = () => {
        updateScroll();
        ticking = false;
    };

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(render);
            ticking = true;
        }
    }, { passive: true });

    // Initial setup
    calculateMetrics();
    updateScroll();
})();