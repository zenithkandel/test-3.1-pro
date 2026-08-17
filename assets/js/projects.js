/* ===========================================================
   PROJECTS ARCHIVE — Search, Filter & Modal Logic
   =========================================================== */
(() => {
    'use strict';

    const $ = (sel, ctx) => (ctx || document).querySelector(sel);
    const $$ = (sel, ctx) => [...(ctx || document).querySelectorAll(sel)];

    let allProjects = [];
    let activeCategory = 'all';
    let activeTag = null;
    let searchQuery = '';
    let sortMode = 'newest';

    function esc(str) {
        const d = document.createElement('div');
        d.textContent = str || '';
        return d.innerHTML;
    }

    /* ---- Fetch / Hydrate Data ---- */
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

        // Collect projects from data.projects or fallback to data.work.projects
        allProjects = data.projects || (data.work && data.work.projects) || [];

        // Normalize data
        allProjects = allProjects.map((p, idx) => ({
            id: p.id || p.slug || 'proj-' + (idx + 1),
            slug: p.slug || p.id || 'proj-' + (idx + 1),
            num: p.num || String(idx + 1).padStart(2, '0'),
            title: p.title || 'Untitled Project',
            tag: p.tag || 'Project',
            category: p.category || (p.tag ? p.tag.split('·')[0].trim() : 'Builds'),
            year: String(p.year || '2025'),
            featured: Boolean(p.featured),
            badge: p.badge || (p.featured ? 'Featured Build' : ''),
            description: p.description || '',
            longDescription: p.longDescription || p.description || '',
            chips: Array.isArray(p.chips) ? p.chips : [],
            illustration: p.illustration || p.image || '../assets/svg/emblems/work.svg',
            image: p.image || p.illustration || '../assets/svg/emblems/work.svg',
            githubUrl: p.githubUrl || p.github || '',
            liveUrl: p.liveUrl || p.live || ''
        }));

        renderCategoryFilters();
        renderTagFilters();
        applyFilters();
        initModalEvents();
    }

    /* ---- Render Filter Controls ---- */
    function renderCategoryFilters() {
        const container = $('#categoryPills');
        if (!container) return;

        // Group counts
        const catCounts = {
            all: allProjects.length,
            featured: allProjects.filter(p => p.featured).length
        };

        allProjects.forEach(p => {
            const cat = p.category;
            catCounts[cat] = (catCounts[cat] || 0) + 1;
        });

        const categories = Object.keys(catCounts).filter(k => k !== 'all' && k !== 'featured');

        let html = `
            <button class="category-pill is-active" data-category="all">
                <span>All Projects</span>
                <span class="category-pill__count">${catCounts.all}</span>
            </button>
            <button class="category-pill" data-category="featured">
                <span>★ Featured</span>
                <span class="category-pill__count">${catCounts.featured}</span>
            </button>
        `;

        categories.forEach(cat => {
            html += `
                <button class="category-pill" data-category="${esc(cat)}">
                    <span>${esc(cat)}</span>
                    <span class="category-pill__count">${catCounts[cat]}</span>
                </button>
            `;
        });

        container.innerHTML = html;

        // Click listener
        container.querySelectorAll('.category-pill').forEach(btn => {
            btn.addEventListener('click', () => {
                container.querySelectorAll('.category-pill').forEach(b => b.classList.remove('is-active'));
                btn.classList.add('is-active');
                activeCategory = btn.dataset.category;
                applyFilters();
            });
        });
    }

    function renderTagFilters() {
        const container = $('#tagFilters');
        if (!container) return;

        // Collect all distinct chips
        const chipCounts = {};
        allProjects.forEach(p => {
            (p.chips || []).forEach(c => {
                chipCounts[c] = (chipCounts[c] || 0) + 1;
            });
        });

        // Sort by frequency
        const sortedTags = Object.keys(chipCounts).sort((a, b) => chipCounts[b] - chipCounts[a]).slice(0, 14);

        let html = sortedTags.map(tag => `
            <button class="tag-filter" data-tag="${esc(tag)}">
                #${esc(tag)} (${chipCounts[tag]})
            </button>
        `).join('');

        container.innerHTML = html;

        container.querySelectorAll('.tag-filter').forEach(btn => {
            btn.addEventListener('click', () => {
                const tag = btn.dataset.tag;
                if (activeTag === tag) {
                    activeTag = null;
                    btn.classList.remove('is-active');
                } else {
                    container.querySelectorAll('.tag-filter').forEach(b => b.classList.remove('is-active'));
                    btn.classList.add('is-active');
                    activeTag = tag;
                }
                applyFilters();
            });
        });
    }

    /* ---- Filter & Search Execution ---- */
    function applyFilters() {
        const grid = $('#projectsGrid');
        const empty = $('#emptyState');
        const countDisplay = $('#resultsCount');
        if (!grid) return;

        const q = searchQuery.trim().toLowerCase();

        let filtered = allProjects.filter(p => {
            // Category filter
            if (activeCategory === 'featured' && !p.featured) return false;
            if (activeCategory !== 'all' && activeCategory !== 'featured' && p.category !== activeCategory) return false;

            // Tag filter
            if (activeTag && !(p.chips || []).includes(activeTag)) return false;

            // Search query filter
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

        // Sorting
        filtered.sort((a, b) => {
            if (sortMode === 'newest') return parseInt(b.year) - parseInt(a.year);
            if (sortMode === 'oldest') return parseInt(a.year) - parseInt(b.year);
            if (sortMode === 'alpha') return a.title.localeCompare(b.title);
            return 0;
        });

        if (countDisplay) {
            countDisplay.innerHTML = `Showing <strong>${filtered.length}</strong> of ${allProjects.length} projects`;
        }

        if (filtered.length === 0) {
            grid.innerHTML = '';
            if (empty) empty.classList.add('is-visible');
            return;
        }

        if (empty) empty.classList.remove('is-visible');

        grid.innerHTML = filtered.map((p, idx) => `
            <article class="archive-card in-view" data-id="${esc(p.id)}">
                <div class="archive-card__header">
                    <div class="archive-card__art">
                        <img src="../${esc(p.illustration || p.image)}" alt="${esc(p.title)}" loading="lazy" onerror="this.src='../assets/svg/emblems/work.svg'" />
                    </div>
                    <div class="archive-card__meta">
                        <span class="archive-card__year">${esc(p.year)}</span>
                        ${p.badge ? `<span class="archive-card__badge">${esc(p.badge)}</span>` : ''}
                    </div>
                </div>

                <div class="archive-card__body">
                    <span class="archive-card__tag">${esc(p.tag)}</span>
                    <h3 class="archive-card__title">${esc(p.title)}</h3>
                    <p class="archive-card__desc">${esc(p.description)}</p>
                    <div class="archive-card__chips">
                        ${(p.chips || []).map(c => `<span class="archive-card__chip" data-chip="${esc(c)}">${esc(c)}</span>`).join('')}
                    </div>
                </div>

                <div class="archive-card__footer">
                    <div class="archive-card__links">
                        ${p.githubUrl ? `
                            <a href="${esc(p.githubUrl)}" target="_blank" rel="noopener noreferrer" class="archive-card__link" title="GitHub Repository">
                                <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                                <span>Code</span>
                            </a>` : ''}
                        ${p.liveUrl ? `
                            <a href="${esc(p.liveUrl)}" target="_blank" rel="noopener noreferrer" class="archive-card__link" title="Live Demo">
                                <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                                <span>Live</span>
                            </a>` : ''}
                    </div>

                    <button class="archive-card__btn-view" onclick="window.__openProjectModal('${esc(p.id)}')">
                        <span>Details</span>
                        <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 3 L11 8 L6 13"/></svg>
                    </button>
                </div>
            </article>
        `).join('');

        // Card chip click binding for fast filtering
        grid.querySelectorAll('.archive-card__chip').forEach(chip => {
            chip.addEventListener('click', (e) => {
                e.stopPropagation();
                const chipText = chip.dataset.chip;
                activeTag = chipText;
                const tagFilters = $('#tagFilters');
                if (tagFilters) {
                    tagFilters.querySelectorAll('.tag-filter').forEach(b => {
                        b.classList.toggle('is-active', b.dataset.tag === chipText);
                    });
                }
                applyFilters();
            });
        });
    }

    /* ---- Search & Controls Bindings ---- */
    function initSearchControls() {
        const input = $('#searchInput');
        const clearBtn = $('#searchClear');
        const sortSelect = $('#sortSelect');
        const resetBtn = $('#resetFilters');

        let debounceTimer;
        if (input) {
            input.addEventListener('input', () => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    searchQuery = input.value;
                    if (clearBtn) clearBtn.classList.toggle('is-visible', searchQuery.length > 0);
                    applyFilters();
                }, 150);
            });

            // Keyboard shortcut '/' to search, 'Escape' to clear
            document.addEventListener('keydown', (e) => {
                if (e.key === '/' && document.activeElement !== input) {
                    e.preventDefault();
                    input.focus();
                } else if (e.key === 'Escape' && document.activeElement === input) {
                    input.value = '';
                    searchQuery = '';
                    if (clearBtn) clearBtn.classList.remove('is-visible');
                    input.blur();
                    applyFilters();
                }
            });
        }

        if (clearBtn && input) {
            clearBtn.addEventListener('click', () => {
                input.value = '';
                searchQuery = '';
                clearBtn.classList.remove('is-visible');
                input.focus();
                applyFilters();
            });
        }

        if (sortSelect) {
            sortSelect.addEventListener('change', () => {
                sortMode = sortSelect.value;
                applyFilters();
            });
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                searchQuery = '';
                activeCategory = 'all';
                activeTag = null;
                if (input) input.value = '';
                if (clearBtn) clearBtn.classList.remove('is-visible');
                const catPills = $('#categoryPills');
                if (catPills) {
                    catPills.querySelectorAll('.category-pill').forEach(b => {
                        b.classList.toggle('is-active', b.dataset.category === 'all');
                    });
                }
                const tagFilters = $('#tagFilters');
                if (tagFilters) {
                    tagFilters.querySelectorAll('.tag-filter').forEach(b => b.classList.remove('is-active'));
                }
                applyFilters();
            });
        }
    }

    /* ---- Modal Handling ---- */
    window.__openProjectModal = function(id) {
        const p = allProjects.find(item => item.id === id);
        if (!p) return;

        const modal = $('#projectModal');
        const dialog = $('#projectModalDialog');
        if (!modal || !dialog) return;

        dialog.innerHTML = `
            <button class="project-modal__close" onclick="window.__closeProjectModal()" aria-label="Close modal">&times;</button>
            
            <div class="project-modal__head">
                <div class="project-modal__art">
                    <img src="../${esc(p.illustration || p.image)}" alt="${esc(p.title)}" onerror="this.src='../assets/svg/emblems/work.svg'" />
                </div>
                <div class="project-modal__title-group">
                    <span class="project-modal__tag">${esc(p.tag)} · ${esc(p.year)}</span>
                    <h2 class="project-modal__title">${esc(p.title)}</h2>
                </div>
            </div>

            <div class="project-modal__section">
                <h4 class="project-modal__section-title">Overview &amp; Problem Statement</h4>
                <p class="project-modal__body-text">${esc(p.longDescription || p.description)}</p>
            </div>

            <div class="project-modal__section">
                <h4 class="project-modal__section-title">Technologies &amp; Architecture</h4>
                <div class="project-modal__chips">
                    ${(p.chips || []).map(c => `<span>${esc(c)}</span>`).join('')}
                </div>
            </div>

            <div class="project-modal__actions">
                ${p.githubUrl ? `
                    <a href="${esc(p.githubUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn--primary">
                        <span>View Source on GitHub</span>
                        <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 12 L12 4 M6 4 H12 V10"/></svg>
                    </a>` : ''}
                ${p.liveUrl ? `
                    <a href="${esc(p.liveUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn--ghost-dark">
                        <span>Launch Live Prototype</span>
                        <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 12 L12 4 M6 4 H12 V10"/></svg>
                    </a>` : ''}
            </div>
        `;

        modal.classList.add('is-open');
        document.body.style.overflow = 'hidden';
    };

    window.__closeProjectModal = function() {
        const modal = $('#projectModal');
        if (!modal) return;
        modal.classList.remove('is-open');
        document.body.style.overflow = '';
    };

    function initModalEvents() {
        const modal = $('#projectModal');
        if (!modal) return;

        const backdrop = modal.querySelector('.project-modal__backdrop');
        if (backdrop) {
            backdrop.addEventListener('click', window.__closeProjectModal);
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('is-open')) {
                window.__closeProjectModal();
            }
        });
    }

    /* ---- DOM Ready Execution ---- */
    document.addEventListener('DOMContentLoaded', () => {
        initSearchControls();
        loadData();
    });
})();
