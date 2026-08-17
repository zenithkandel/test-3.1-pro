/* ===========================================================
   09 · PROJECTS ARCHIVE — High-Impact Editorial Logic
   16:9 Real Image Banners, Multi-Image Galleries & Tactile CTAs
   =========================================================== */
(() => {
    'use strict';

    const $ = (sel, ctx) => (ctx || document).querySelector(sel);
    const $$ = (sel, ctx) => [...(ctx || document).querySelectorAll(sel)];

    let allProjects = [];
    let activeCategory = 'all';
    let searchQuery = '';
    let currentModalProject = null;
    let currentImageIndex = 0;

    function esc(str) {
        const d = document.createElement('div');
        d.textContent = str || '';
        return d.innerHTML;
    }

    /* ---- Load Data ---- */
    function loadData() {
        try {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', '../data/data.json', false);
            xhr.send();
            if (xhr.status >= 200 && xhr.status < 300) {
                const data = JSON.parse(xhr.responseText);
                initProjects(data);
            } else {
                fetch('../data/data.json')
                    .then(res => res.json())
                    .then(data => initProjects(data))
                    .catch(err => console.error('[projects.js] Load error:', err));
            }
        } catch (e) {
            fetch('../data/data.json')
                .then(res => res.json())
                .then(data => initProjects(data))
                .catch(err => console.error('[projects.js] Fetch error:', err));
        }
    }

    function initProjects(data) {
        if (!data) return;

        allProjects = data.projects || (data.work && data.work.projects) || [];

        // Normalize
        allProjects = allProjects.map((p, idx) => {
            const images = Array.isArray(p.images) && p.images.length > 0
                ? p.images
                : [p.coverImage || p.image || p.illustration || 'assets/svg/emblems/work.svg'];

            const cover = p.coverImage || p.image || images[0] || p.illustration;

            return {
                id: p.id || p.slug || 'proj-' + (idx + 1),
                num: p.num || String(idx + 1).padStart(2, '0'),
                title: p.title || 'Untitled Project',
                tag: p.tag || 'Project',
                category: p.category || (p.tag ? p.tag.split('·')[0].trim() : 'Builds'),
                year: String(p.year || '2025'),
                featured: Boolean(p.featured),
                description: p.description || '',
                longDescription: p.longDescription || p.description || '',
                chips: Array.isArray(p.chips) ? p.chips : [],
                coverImage: cover,
                images: images,
                illustration: p.illustration || cover,
                githubUrl: p.githubUrl || p.github || '',
                liveUrl: p.liveUrl || p.live || ''
            };
        });

        renderCategoryTabs();
        applyFilters();
        initModalEvents();
    }

    /* ---- Render Category Navigation Tabs ---- */
    function renderCategoryTabs() {
        const container = $('#archiveCategories');
        if (!container) return;

        const catMap = new Map();
        catMap.set('all', 'All');
        catMap.set('featured', 'Featured');

        allProjects.forEach(p => {
            if (p.category && !catMap.has(p.category)) {
                catMap.set(p.category, p.category);
            }
        });

        let html = '';
        catMap.forEach((label, catKey) => {
            const isActive = catKey === activeCategory ? ' is-active' : '';
            html += `<button class="archive-cat-btn${isActive}" data-cat="${esc(catKey)}">${esc(label)}</button>`;
        });

        container.innerHTML = html;

        container.querySelectorAll('.archive-cat-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                container.querySelectorAll('.archive-cat-btn').forEach(b => b.classList.remove('is-active'));
                btn.classList.add('is-active');
                activeCategory = btn.dataset.cat;
                applyFilters();
            });
        });
    }

    /* ---- Filter Execution ---- */
    function applyFilters() {
        const grid = $('#projectsGrid');
        const empty = $('#archiveEmpty');
        const countDisplay = $('#archiveCount');
        if (!grid) return;

        const q = searchQuery.trim().toLowerCase();

        const filtered = allProjects.filter(p => {
            if (activeCategory === 'featured' && !p.featured) return false;
            if (activeCategory !== 'all' && activeCategory !== 'featured' && p.category !== activeCategory) return false;

            if (q) {
                const haystack = [
                    p.title,
                    p.tag,
                    p.category,
                    p.year,
                    p.description,
                    p.longDescription,
                    ...(p.chips || [])
                ].join(' ').toLowerCase();

                if (!haystack.includes(q)) return false;
            }

            return true;
        });

        if (countDisplay) {
            countDisplay.textContent = `[ ${filtered.length} Project${filtered.length !== 1 ? 's' : ''} ]`;
        }

        if (filtered.length === 0) {
            grid.innerHTML = '';
            if (empty) empty.classList.add('is-visible');
            return;
        }

        if (empty) empty.classList.remove('is-visible');

        grid.innerHTML = filtered.map(p => {
            const imgCount = p.images.length;
            return `
                <article class="archive-item in-view" data-id="${esc(p.id)}">
                    <div class="archive-item__top">
                        <span class="archive-item__num">${esc(p.num)}</span>
                        <span class="archive-item__year">${esc(p.year)}</span>
                    </div>

                    <div class="archive-item__banner" onclick="window.__openProjectModal('${esc(p.id)}')">
                        <img src="../${esc(p.coverImage)}" alt="${esc(p.title)}" loading="lazy" onerror="this.src='../assets/svg/emblems/work.svg'" />
                        ${imgCount > 1 ? `<div class="archive-item__photo-count">📷 ${imgCount} Photos</div>` : ''}
                    </div>

                    <span class="archive-item__tag">${esc(p.tag)}</span>
                    <h2 class="archive-item__title">${esc(p.title)}</h2>
                    <p class="archive-item__desc">${esc(p.description)}</p>

                    <div class="archive-item__chips">
                        ${(p.chips || []).map(c => `<span>${esc(c)}</span>`).join('')}
                    </div>

                    <div class="archive-item__footer">
                        ${p.liveUrl ? `
                            <a href="${esc(p.liveUrl)}" target="_blank" rel="noopener noreferrer" class="archive-cta-btn archive-cta-btn--primary">
                                <span>Live Demo ↗</span>
                            </a>` : ''}
                        ${p.githubUrl ? `
                            <a href="${esc(p.githubUrl)}" target="_blank" rel="noopener noreferrer" class="archive-cta-btn archive-cta-btn--secondary">
                                <span>GitHub ↗</span>
                            </a>` : ''}
                        <button class="archive-cta-btn archive-cta-btn--ghost" onclick="window.__openProjectModal('${esc(p.id)}')">
                            <span>Overview &amp; Specs ↗</span>
                        </button>
                    </div>
                </article>
            `;
        }).join('');
    }

    /* ---- Search Bar Bindings ---- */
    function initSearch() {
        const input = $('#archiveSearch');
        const clear = $('#archiveClear');
        const resetBtn = $('#archiveReset');

        let debounce;
        if (input) {
            input.addEventListener('input', () => {
                clearTimeout(debounce);
                debounce = setTimeout(() => {
                    searchQuery = input.value;
                    if (clear) clear.classList.toggle('is-visible', searchQuery.length > 0);
                    applyFilters();
                }, 120);
            });
        }

        if (clear && input) {
            clear.addEventListener('click', () => {
                input.value = '';
                searchQuery = '';
                clear.classList.remove('is-visible');
                input.focus();
                applyFilters();
            });
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                searchQuery = '';
                activeCategory = 'all';
                if (input) input.value = '';
                if (clear) clear.classList.remove('is-visible');
                const tabs = $('#archiveCategories');
                if (tabs) {
                    tabs.querySelectorAll('.archive-cat-btn').forEach(b => {
                        b.classList.toggle('is-active', b.dataset.cat === 'all');
                    });
                }
                applyFilters();
            });
        }
    }

    /* ---- Project Overview Modal & Multi-Image Gallery ---- */
    window.__openProjectModal = function(id) {
        const p = allProjects.find(item => item.id === id);
        if (!p) return;

        currentModalProject = p;
        currentImageIndex = 0;

        const modal = $('#projectModal');
        const dialog = $('#projectModalDialog');
        if (!modal || !dialog) return;

        renderModalContent(p);

        modal.classList.add('is-open');
        document.body.style.overflow = 'hidden';
    };

    function renderModalContent(p) {
        const dialog = $('#projectModalDialog');
        if (!dialog) return;

        const images = p.images && p.images.length > 0 ? p.images : [p.coverImage];
        const hasMultiple = images.length > 1;

        dialog.innerHTML = `
            <button class="archive-modal__close" onclick="window.__closeProjectModal()" aria-label="Close dialog">&times;</button>
            
            <div class="archive-modal__head">
                <span class="archive-modal__index">${esc(p.num)} · ${esc(p.tag)} · ${esc(p.year)}</span>
                <h2 class="archive-modal__title">${esc(p.title)}</h2>
            </div>

            <!-- Multi-Image Gallery Viewer -->
            <div class="archive-modal__gallery">
                <img id="modalGalleryMain" class="archive-modal__gallery-main" src="../${esc(images[currentImageIndex])}" alt="${esc(p.title)}" onerror="this.src='../assets/svg/emblems/work.svg'" />
                ${hasMultiple ? `
                    <div class="archive-modal__gallery-nav">
                        <button class="archive-modal__gallery-btn" onclick="window.__switchModalImage(-1)" aria-label="Previous image">‹</button>
                        <button class="archive-modal__gallery-btn" onclick="window.__switchModalImage(1)" aria-label="Next image">›</button>
                    </div>
                ` : ''}
            </div>

            ${hasMultiple ? `
                <div class="archive-modal__thumbnails">
                    ${images.map((img, i) => `
                        <div class="archive-modal__thumb${i === currentImageIndex ? ' is-active' : ''}" onclick="window.__setModalImage(${i})">
                            <img src="../${esc(img)}" alt="Thumbnail ${i + 1}" onerror="this.src='../assets/svg/emblems/work.svg'" />
                        </div>
                    `).join('')}
                </div>
            ` : ''}

            <div>
                <h4 class="archive-modal__section-title">Context &amp; Problem Statement</h4>
                <p class="archive-modal__body">${esc(p.longDescription || p.description)}</p>
            </div>

            <div>
                <h4 class="archive-modal__section-title">Technologies &amp; Architecture</h4>
                <div class="archive-modal__chips">
                    ${(p.chips || []).map(c => `<span>${esc(c)}</span>`).join('')}
                </div>
            </div>

            <div class="archive-modal__actions">
                ${p.liveUrl ? `
                    <a href="${esc(p.liveUrl)}" target="_blank" rel="noopener noreferrer" class="archive-cta-btn archive-cta-btn--primary">
                        <span>Launch Live Prototype ↗</span>
                    </a>` : ''}
                ${p.githubUrl ? `
                    <a href="${esc(p.githubUrl)}" target="_blank" rel="noopener noreferrer" class="archive-cta-btn archive-cta-btn--secondary">
                        <span>View Source Code on GitHub ↗</span>
                    </a>` : ''}
            </div>
        `;
    }

    window.__switchModalImage = function(direction) {
        if (!currentModalProject || !currentModalProject.images) return;
        const total = currentModalProject.images.length;
        currentImageIndex = (currentImageIndex + direction + total) % total;
        updateModalGalleryImage();
    };

    window.__setModalImage = function(index) {
        currentImageIndex = index;
        updateModalGalleryImage();
    };

    function updateModalGalleryImage() {
        if (!currentModalProject) return;
        const mainImg = $('#modalGalleryMain');
        if (mainImg) {
            mainImg.src = '../' + currentModalProject.images[currentImageIndex];
        }
        $$('.archive-modal__thumb').forEach((thumb, i) => {
            thumb.classList.toggle('is-active', i === currentImageIndex);
        });
    }

    window.__closeProjectModal = function() {
        const modal = $('#projectModal');
        if (!modal) return;
        modal.classList.remove('is-open');
        document.body.style.overflow = '';
        currentModalProject = null;
    };

    function initModalEvents() {
        const modal = $('#projectModal');
        if (!modal) return;

        const backdrop = modal.querySelector('.archive-modal__backdrop');
        if (backdrop) {
            backdrop.addEventListener('click', window.__closeProjectModal);
        }

        document.addEventListener('keydown', (e) => {
            if (modal.classList.contains('is-open')) {
                if (e.key === 'Escape') {
                    window.__closeProjectModal();
                } else if (e.key === 'ArrowLeft') {
                    window.__switchModalImage(-1);
                } else if (e.key === 'ArrowRight') {
                    window.__switchModalImage(1);
                }
            }
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        initSearch();
        loadData();
    });
})();
