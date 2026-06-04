/* ===========================================================
   SCROLL INTERACTIONS — Premium Parallax & Scroll Features
   =========================================================== */
(() => {
    'use strict';

    const isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Helper utilities
    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

    // Dynamic spotlight background glow
    const initSpotlightGlow = () => {
        window.addEventListener('scroll', () => {
            const sh = document.documentElement.scrollHeight - window.innerHeight;
            const progress = sh === 0 ? 0 : window.scrollY / sh;
            document.documentElement.style.setProperty('--scroll-pct', progress.toFixed(4));
        }, { passive: true });
    };

    // 1. Magnetic Hover Cursor System (Desktop only)
    const initMagneticCues = () => {
        if (isTouch) return;
        const targets = $$('.nav__link, .nav__cta, .nav__brand, .btn, .social');
        
        targets.forEach(el => {
            let tx = 0, ty = 0;
            let cx = 0, cy = 0;

            const onMouseMove = (e) => {
                const rect = el.getBoundingClientRect();
                const elX = rect.left + rect.width / 2;
                const elY = rect.top + rect.height / 2;
                const dist = Math.hypot(e.clientX - elX, e.clientY - elY);

                if (dist < 55) {
                    tx = (e.clientX - elX) * 0.35;
                    ty = (e.clientY - elY) * 0.35;
                } else {
                    tx = 0;
                    ty = 0;
                }
            };

            const onMouseLeave = () => {
                tx = 0;
                ty = 0;
            };

            const tick = () => {
                cx += (tx - cx) * 0.12;
                cy += (ty - cy) * 0.12;
                if (Math.abs(cx) > 0.05 || Math.abs(cy) > 0.05) {
                    el.style.transform = `translate3d(${cx.toFixed(2)}px, ${cy.toFixed(2)}px, 0)`;
                } else {
                    el.style.transform = '';
                }
                requestAnimationFrame(tick);
            };

            el.addEventListener('mousemove', onMouseMove, { passive: true });
            el.addEventListener('mouseleave', onMouseLeave, { passive: true });
            requestAnimationFrame(tick);
        });
    };

    // 2. Scroll-Velocity Synced Marquee
    const initMarqueeScroll = () => {
        const marquee = $('.marquee');
        if (!marquee) return;
        let lastScrollY = window.scrollY;
        let offset = 0;

        const tick = () => {
            const currentScrollY = window.scrollY;
            const diff = currentScrollY - lastScrollY;
            offset += diff * 0.25;
            lastScrollY = currentScrollY;

            marquee.style.transform = `translate3d(${offset.toFixed(1)}px, 0, 0)`;
            requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    };

    // 3. Character-Splitting Title Cascade
    const initTitleSplitting = () => {
        if (reduceMotion) return;
        const titles = $$('.section__title');
        
        titles.forEach(title => {
            const lines = $$( 'span[data-text]', title );
            const targetSpans = lines.length ? lines : $$( 'span', title );
            
            targetSpans.forEach(span => {
                if (span.querySelector('.char')) return;
                const text = span.textContent.trim();
                const words = text.split(' ').map((word, wIdx) => {
                    const chars = Array.from(word).map((c, cIdx) => {
                        return `<span class="char" style="display: inline-block; opacity: 0; transform: translate3d(0, 20px, 0); will-change: transform, opacity; transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1); transition-delay: ${(wIdx * 3 + cIdx) * 15}ms">${c}</span>`;
                    }).join('');
                    return `<span class="word" style="display: inline-block; white-space: nowrap;">${chars}</span>`;
                }).join(' ');
                span.innerHTML = words;
            });

            const io = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    const chars = entry.target.querySelectorAll('.char');
                    if (entry.isIntersecting) {
                        chars.forEach(c => {
                            c.style.transform = 'translate3d(0, 0, 0)';
                            c.style.opacity = '1';
                        });
                    } else {
                        chars.forEach(c => {
                            c.style.transform = 'translate3d(0, 20px, 0)';
                            c.style.opacity = '0';
                        });
                    }
                });
            }, { threshold: 0.1, rootMargin: '0px 0px -5% 0px' });
            io.observe(title);
        });
    };

    // 4. Scroll-Driven SVG Path Drawing
    const initSVGDrawing = async () => {
        if (reduceMotion) return;
        
        // Inline all section emblem SVGs for DOM path access
        const emblemImages = $$('.section__art img[src$=".svg"], .project__art img[src$=".svg"]');
        for (const img of emblemImages) {
            try {
                const resp = await fetch(img.src);
                const text = await resp.text();
                const parser = new DOMParser();
                const doc = parser.parseFromString(text, 'image/svg+xml');
                const svg = doc.querySelector('svg');

                if (svg) {
                    Array.from(img.attributes).forEach(attr => {
                        if (attr.name !== 'src') {
                            svg.setAttribute(attr.name, attr.value);
                        }
                    });
                    svg.classList.add('draw-on-scroll');
                    img.replaceWith(svg);
                }
            } catch (err) {
                console.warn('SVG inlining failed, falling back to standard img tag:', err);
            }
        }

        const drawPaths = () => {
            const inlineSVGs = $$('svg.draw-on-scroll');
            inlineSVGs.forEach(svg => {
                const rect = svg.getBoundingClientRect();
                const entry = window.innerHeight;
                let progress = (entry - rect.top) / (entry * 0.85);
                progress = Math.max(0, Math.min(1, progress));

                const paths = svg.querySelectorAll('path, line, rect, circle, ellipse');
                paths.forEach(path => {
                    let len = 0;
                    if (path.getTotalLength) {
                        len = path.getTotalLength();
                    } else if (path.tagName === 'line') {
                        len = Math.hypot(
                            parseFloat(path.getAttribute('x2')) - parseFloat(path.getAttribute('x1')),
                            parseFloat(path.getAttribute('y2')) - parseFloat(path.getAttribute('y1'))
                        );
                    } else if (path.tagName === 'rect') {
                        len = 2 * (parseFloat(path.getAttribute('width')) + parseFloat(path.getAttribute('height')));
                    } else if (path.tagName === 'circle') {
                        len = 2 * Math.PI * parseFloat(path.getAttribute('r'));
                    }

                    if (len > 0) {
                        if (!path.style.strokeDasharray) {
                            path.style.strokeDasharray = len;
                        }
                        path.style.strokeDashoffset = len * (1 - progress);
                    }
                });
            });
        };

        window.addEventListener('scroll', drawPaths, { passive: true });
        drawPaths();
    };

    // 5. Interactive Multi-Axis Z-Depth Tilt on Hover
    const initCardZDepth = () => {
        if (isTouch || reduceMotion) return;
        const cards = $$('.feature');
        cards.forEach(card => {
            const num = card.querySelector('.feature__num');
            const title = card.querySelector('.feature__title');
            const foot = card.querySelector('.feature__foot');

            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width - 0.5;
                const y = (e.clientY - rect.top) / rect.height - 0.5;

                if (num) num.style.transform = `translate3d(${(x * 24).toFixed(1)}px, ${(y * 24).toFixed(1)}px, 45px)`;
                if (title) title.style.transform = `translate3d(${(x * 12).toFixed(1)}px, ${(y * 12).toFixed(1)}px, 25px)`;
                if (foot) foot.style.transform = `translate3d(${(x * 6).toFixed(1)}px, ${(y * 6).toFixed(1)}px, 12px)`;
            }, { passive: true });

            card.addEventListener('mouseleave', () => {
                if (num) num.style.transform = '';
                if (title) title.style.transform = '';
                if (foot) foot.style.transform = '';
            }, { passive: true });
        });
    };

    // 6. Depth-Layered Horizontal Project Card Parallax
    const initHorizontalParallax = () => {
        if (isTouch || reduceMotion) return;
        const tick = () => {
            const projects = $$('.project');
            projects.forEach(proj => {
                const rect = proj.getBoundingClientRect();
                const cardCenter = rect.left + rect.width / 2;
                const viewCenter = window.innerWidth / 2;
                const offset = (cardCenter - viewCenter) / window.innerWidth;

                const art = proj.querySelector('.project__art');
                const tag = proj.querySelector('.project__tag');
                if (art) {
                    art.style.transform = `translate3d(${(offset * 40).toFixed(1)}px, 0, 0)`;
                }
                if (tag) {
                    tag.style.transform = `translate3d(${(offset * -20).toFixed(1)}px, 0, 0)`;
                }
            });
            requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    };

    // 7. Masked Image Zoom Reveal on Scroll
    const initMaskReveals = () => {
        if (reduceMotion) return;
        const targets = $$('.hero__portrait, .project__art, .section__art');
        
        const io = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal-masked');
                } else {
                    entry.target.classList.remove('reveal-masked');
                }
            });
        }, { threshold: 0.08 });

        targets.forEach(t => {
            t.classList.add('mask-reveal-target');
            io.observe(t);
        });
    };

    // 8. Scroll-Bound Stat Counter Interpolation
    const initScrollCounters = () => {
        if (reduceMotion) return;
        const counters = $$('[data-counter]');

        const tick = () => {
            counters.forEach(el => {
                const target = parseInt(el.dataset.counter, 10) || 0;
                const original = el.textContent.trim();
                const suffix = original.replace(/[0-9]/g, '');

                const rect = el.getBoundingClientRect();
                const viewHeight = window.innerHeight;
                let progress = (viewHeight - rect.top) / (viewHeight * 0.45);
                progress = Math.max(0, Math.min(1, progress));

                // Cubic ease out interpolation
                const ease = 1 - Math.pow(1 - progress, 3);
                const val = Math.round(target * ease);
                el.textContent = String(val).padStart(original.length - suffix.length, '0') + suffix;
            });
            requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    };

    // Initialize all components
    window.addEventListener('DOMContentLoaded', () => {
        initSpotlightGlow();
        initMagneticCues();
        initMarqueeScroll();
        initTitleSplitting();
        initSVGDrawing();
        initCardZDepth();
        initHorizontalParallax();
        initMaskReveals();
        initScrollCounters();
    });
})();
