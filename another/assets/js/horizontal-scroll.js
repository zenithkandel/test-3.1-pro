/* ===========================================================
   HORIZONTAL-SCROLL — logic for pinning and track movement
   =========================================================== */
(() => {
    'use strict';

    const workSection = document.querySelector('.section-horizontal');
    const pinWrap = document.querySelector('.horizontal-pin');
    const track = document.querySelector('.horizontal-track');

    if (!workSection || !pinWrap || !track) return;

    const handleScroll = () => {
        const pinRect = pinWrap.getBoundingClientRect();

        const scrollDistance = -pinRect.top;
        const maxScroll = pinRect.height - window.innerHeight;

        if (scrollDistance >= 0 && scrollDistance <= maxScroll) {
            const progress = scrollDistance / maxScroll;

            const trackWidth = track.scrollWidth;
            const windowWidth = window.innerWidth;
            const startSection = document.querySelector('.horizontal-start');
            const startWidth = startSection.offsetWidth;

            // Smoother movement calculation
            const totalWidthToMove = (trackWidth + startWidth) - windowWidth * 0.8; 

            const moveX = progress * totalWidthToMove;
            track.style.transform = `translate3d(-${moveX}px, 0, 0)`;

            // Subtle parallax/scale/opacity for cards
            const cards = track.querySelectorAll('.horizontal-project');
            cards.forEach(card => {
                const rect = card.getBoundingClientRect();
                const viewportCenter = windowWidth / 2;
                const cardCenter = rect.left + rect.width / 2;
                
                // Distance from center of viewport (0 = centered, 1 = at edges)
                const distFromCenter = Math.abs(viewportCenter - cardCenter);
                const normalizedDist = Math.min(distFromCenter / (windowWidth * 0.5), 1);
                
                // Premium focus effect
                const scale = 1 + (1 - normalizedDist) * 0.08;
                const opacity = 0.4 + (1 - normalizedDist) * 0.6;
                const blur = normalizedDist * 4;
                
                card.style.transform = `scale(${scale})`;
                card.style.opacity = opacity;
                card.style.filter = `blur(${blur}px)`;
            });
        } else if (scrollDistance < 0) {
            // Reset if above section
            track.style.transform = `translate3d(0, 0, 0)`;
            const cards = track.querySelectorAll('.horizontal-project');
            cards.forEach(card => {
                card.style.transform = `scale(1)`;
                card.style.opacity = 1;
                card.style.filter = `blur(0px)`;
            });
        }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);

    // Use a mutation observer to refresh max scroll height if needed
    const observer = new MutationObserver(handleScroll);
    observer.observe(document.body, { childList: true, subtree: true });

    // Initial call
    handleScroll();
})();
