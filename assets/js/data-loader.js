/* ===========================================================
   DATA-LOADER — fetches data.json and populates the DOM.
   Runs synchronously (no defer) so the DOM is ready before
   any deferred scripts initialise.
   =========================================================== */
(() => {
    'use strict';

    const $ = (sel, ctx) => (ctx || document).querySelector(sel);
    const $$ = (sel, ctx) => [...(ctx || document).querySelectorAll(sel)];

    function resolve(path, obj) {
        return path.split('.').reduce((acc, key) => {
            if (acc == null) return undefined;
            return acc[key];
        }, obj);
    }

    function esc(str) {
        const d = document.createElement('div');
        d.textContent = str;
        return d.innerHTML;
    }

    /* ---- Template renderers ---- */

    function renderFeatures(container, features) {
        container.innerHTML = features.map(f => `
            <article class="feature" data-reveal>
                <span class="feature__num" data-counter="${esc(f.number)}">${esc(f.number)}</span>
                <h3 class="feature__title">${esc(f.title)}</h3>
                <p class="feature__desc">${esc(f.description)}</p>
                <span class="feature__foot">${esc(f.foot)}</span>
            </article>
        `).join('');
    }

    function renderProjects(container, projects) {
        container.innerHTML = projects.map(p => `
            <li class="project" data-reveal>
                <div class="project__art">
                    <img src="${esc(p.illustration)}" alt="" />
                </div>
                <div class="project__num">${esc(p.num)}</div>
                <div class="project__main">
                    <div class="project__head">
                        <h3 class="project__title">${esc(p.title)}</h3>
                        <span class="project__tag">${esc(p.tag)}</span>
                    </div>
                    <p class="project__desc">${esc(p.description)}</p>
                    <div class="project__chips">
                        ${p.chips.map(c => `<span>${esc(c)}</span>`).join('')}
                    </div>
                </div>
                <div class="project__year">${esc(p.year)}</div>
            </li>
        `).join('');
    }

    function renderStackRows(container, rows) {
        container.innerHTML = rows.map(r => `
            <div class="stack-row" data-reveal>
                <span class="stack-row__num">${esc(r.num)}</span>
                <h3 class="stack-row__label">${esc(r.label)}</h3>
                <ul class="stack-row__tools">
                    ${r.tools.map(t => `<li>${esc(t)}</li>`).join('')}
                </ul>
            </div>
        `).join('');
    }

    function renderDisclosures(container, disclosures) {
        container.innerHTML = disclosures.map(d => `
            <article class="disclosure" data-reveal>
                <div class="disclosure__top">
                    <span class="disclosure__target">${esc(d.target)}</span>
                    <span class="disclosure__status">${esc(d.status)}</span>
                </div>
                <h3 class="disclosure__title">${esc(d.title)}</h3>
                <p class="disclosure__desc">${esc(d.description)}</p>
                <div class="disclosure__foot">
                    ${d.tags.map((t, i) => `${i > 0 ? '<span class="dot" aria-hidden="true"></span>' : ''}<span>${esc(t)}</span>`).join('')}
                </div>
            </article>
        `).join('');
    }

    function renderContactFields(container, fields) {
        container.innerHTML = fields.map(f => {
            if (f.type === 'link') {
                return `
                    <li class="contact-row" data-reveal>
                        <span class="contact-row__label">${esc(f.label)}</span>
                        <a href="${esc(f.href)}" class="contact-row__value" data-text="${esc(f.value)}">${esc(f.value)}</a>
                    </li>`;
            }
            return `
                <li class="contact-row" data-reveal>
                    <span class="contact-row__label">${esc(f.label)}</span>
                    <span class="contact-row__value contact-row__value--static">${esc(f.value)}</span>
                </li>`;
        }).join('');
    }

    function renderSocials(container, socials) {
        const arrowSvg = `<svg class="social__arrow" viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 12 L12 4 M6 4 H12 V10" stroke-linecap="square" /></svg>`;
        container.innerHTML = socials.map(s => `
            <li data-reveal>
                <a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer" class="social">
                    <span class="social__label">${esc(s.label)}</span>
                    <span class="social__handle">${esc(s.handle)}</span>
                    ${arrowSvg}
                </a>
            </li>
        `).join('');
    }

    function renderNavLinks(container, links) {
        container.innerHTML = links.map(l =>
            `<a href="${esc(l.href)}" class="nav__link">${esc(l.label)}</a>`
        ).join('');
    }

    function renderMobileLinks(container, links) {
        container.innerHTML = links.map(l =>
            `<a href="${esc(l.href)}" class="mobile-menu__link">${esc(l.num)} — ${esc(l.label)}</a>`
        ).join('');
    }

    function renderFooterLinks(container, links) {
        container.innerHTML = links.map(l =>
            `<a href="${esc(l.href)}" class="footer__link">${esc(l.label)}</a>`
        ).join('');
    }

    function renderMarquee(container, items) {
        const dot = '<span class="marquee__dot"></span>';
        const group = items.map(t => `<span>${esc(t)}</span>${dot}`).join('');
        container.innerHTML = `
            <div class="marquee__group">${group}</div>
            <div class="marquee__group" aria-hidden="true">${group}</div>
        `;
    }

    function renderAboutTitle(container, lines) {
        container.innerHTML = lines.map(l =>
            `<span class="reveal-line"><span data-text="${esc(l)}">${esc(l)}</span></span>`
        ).join('');
    }

    function renderSectionTitle(container, lines) {
        container.innerHTML = lines.join('<br />');
    }

    /* ---- Main apply function ---- */

    function apply(data) {
        /* Meta / Head */
        document.title = data.meta.title;
        $('meta[name="description"]')?.setAttribute('content', data.meta.description);
        $('meta[property="og:title"]')?.setAttribute('content', data.meta.ogTitle);
        $('meta[property="og:description"]')?.setAttribute('content', data.meta.ogDescription);
        $('meta[name="theme-color"]')?.setAttribute('content', data.meta.themeColor);
        $('meta[property="og:type"]')?.setAttribute('content', data.meta.ogType);

        /* Favicon */
        const init = data.meta.faviconInitial || 'Z';
        const faviconHref = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%23000d10'/%3E%3Ctext x='50%25' y='58%25' text-anchor='middle' dominant-baseline='middle' font-family='Inter,sans-serif' font-size='18' font-weight='800' fill='%23ffffff'%3E${encodeURIComponent(init)}%3C/text%3E%3C/svg%3E`;
        $('link[rel="icon"]')?.setAttribute('href', faviconHref);

        /* Cursor paths */
        if (data.cursors) {
            const arrow = $('[data-cursor="arrow"]');
            const pointer = $('[data-cursor="pointer"]');
            const textCur = $('[data-cursor="text"]');
            if (arrow) arrow.setAttribute('src', data.cursors.arrow);
            if (pointer) pointer.setAttribute('src', data.cursors.pointer);
            if (textCur) textCur.setAttribute('src', data.cursors.text);
        }

        /* Brand / Nav */
        const navBrand = $('.nav__brand');
        if (navBrand) {
            navBrand.setAttribute('href', data.brand.homeHref);
            navBrand.setAttribute('aria-label', data.brand.name + ' — Home');
            navBrand.querySelector('.nav__word').textContent = data.brand.name;
            navBrand.querySelector('.nav__mark').textContent = data.brand.initials;
        }
        const navLinks = $('.nav__links');
        if (navLinks) renderNavLinks(navLinks, data.nav.links);
        const navCta = $('.nav__cta');
        if (navCta) {
            navCta.setAttribute('href', data.nav.ctaHref);
            navCta.querySelector('span').textContent = data.nav.cta;
        }
        const mobileMenu = $('#mobileMenu .mobile-menu__nav');
        if (mobileMenu) renderMobileLinks(mobileMenu, data.nav.mobileLinks);

        /* Loader */
        const loaderText = $('.loader__text');
        if (loaderText) loaderText.textContent = data.brand.loaderText;

        /* Hero */
        const heroChip = $('.hero__chip');
        if (heroChip) {
            heroChip.innerHTML = `<span class="hero__chip-dot" aria-hidden="true"></span>\n              ${esc(data.hero.chip)}`;
        }
        const heroLoc = $('.hero__loc');
        if (heroLoc) heroLoc.textContent = data.hero.location;

        const heroLines = $$('.hero__line');
        if (heroLines[0]) {
            heroLines[0].textContent = data.hero.firstName;
            heroLines[0].setAttribute('data-text', data.hero.firstName);
        }
        if (heroLines[1]) {
            heroLines[1].innerHTML = `${esc(data.hero.lastName)}<span class="hero__period">.</span>`;
            heroLines[1].setAttribute('data-text', data.hero.lastName);
        }
        const heroSub = $('.hero__sub');
        if (heroSub) heroSub.textContent = data.hero.subtitle;

        const heroCtaPrimary = $('.hero__cta .btn--primary');
        if (heroCtaPrimary) {
            heroCtaPrimary.setAttribute('href', data.hero.ctaPrimary.href);
            heroCtaPrimary.querySelector('span').textContent = data.hero.ctaPrimary.text;
        }
        const heroCtaSecondary = $('.hero__cta .btn--ghost-dark');
        if (heroCtaSecondary) {
            heroCtaSecondary.setAttribute('href', data.hero.ctaSecondary.href);
            heroCtaSecondary.querySelector('span').textContent = data.hero.ctaSecondary.text;
        }

        const heroImg = $('.hero__portrait-img');
        if (heroImg) {
            heroImg.setAttribute('src', data.hero.portrait.src);
            heroImg.setAttribute('alt', data.hero.portrait.alt);
        }
        const heroCap = $('.hero__portrait-cap span:last-child');
        if (heroCap) heroCap.textContent = data.hero.portrait.caption;

        const heroBorn = $('.hero__meta span:first-child');
        if (heroBorn) heroBorn.innerHTML = `Born <em>${esc(data.hero.born)}</em>`;
        const heroSchool = $('.hero__meta span:nth-child(3)');
        if (heroSchool) heroSchool.textContent = data.hero.school;

        /* Hero scroll text */
        const heroScroll = $('.hero__scroll span');
        if (heroScroll && data.hero.scrollText) heroScroll.textContent = data.hero.scrollText;

        /* Marquee */
        const marqueeTrack = $('.marquee__track');
        if (marqueeTrack) renderMarquee(marqueeTrack, data.marquee);

        /* About */
        const aboutIndex = $('#about .section__index');
        if (aboutIndex) aboutIndex.textContent = data.about.index;
        const aboutTitle = $('#about .section__title');
        if (aboutTitle) renderAboutTitle(aboutTitle, data.about.title);
        const aboutBody = $('#about .section__body');
        if (aboutBody) {
            aboutBody.innerHTML = data.about.paragraphs.map(p =>
                `<p data-reveal>${p}</p>`
            ).join('');
        }
        const featureGrid = $('#about .feature-grid');
        if (featureGrid) renderFeatures(featureGrid, data.about.features);

        /* Work */
        const workIndex = $('#work .section__index');
        if (workIndex) workIndex.textContent = data.work.index;
        const workTitle = $('#work .section__title');
        if (workTitle) renderSectionTitle(workTitle, data.work.title);
        const workIntro = $('#work .section__body p');
        if (workIntro) workIntro.textContent = data.work.intro;
        const workArt = $('#work .section__art img');
        if (workArt) workArt.setAttribute('src', data.work.ornament);
        const projectList = $('#work .project-list');
        if (projectList) renderProjects(projectList, data.work.projects);

        /* Stack */
        const stackIndex = $('#stack .section__index');
        if (stackIndex) stackIndex.textContent = data.stack.index;
        const stackTitle = $('#stack .section__title');
        if (stackTitle) renderSectionTitle(stackTitle, data.stack.title);
        const stackIntro = $('#stack .section__body p');
        if (stackIntro) stackIntro.textContent = data.stack.intro;
        const stackArt = $('#stack .section__art img');
        if (stackArt) stackArt.setAttribute('src', data.stack.emblem);
        const stackList = $('#stack .stack-list');
        if (stackList) renderStackRows(stackList, data.stack.rows);

        /* Research */
        const researchIndex = $('#research .section__index');
        if (researchIndex) researchIndex.textContent = data.research.index;
        const researchTitle = $('#research .section__title');
        if (researchTitle) renderSectionTitle(researchTitle, data.research.title);
        const researchIntro = $('#research .section__body p');
        if (researchIntro) researchIntro.textContent = data.research.intro;
        const researchArt = $('#research .section__art img');
        if (researchArt) researchArt.setAttribute('src', data.research.emblem);
        const disclosures = $('#research .disclosures');
        if (disclosures) renderDisclosures(disclosures, data.research.disclosures);

        /* Contact */
        const contactIndex = $('#contact .section__index');
        if (contactIndex) contactIndex.textContent = data.contact.index;
        const contactTitle = $('#contact .section__title');
        if (contactTitle) renderSectionTitle(contactTitle, data.contact.title);
        const contactIntro = $('#contact .section__body p');
        if (contactIntro) contactIntro.textContent = data.contact.intro;
        const contactArt = $('#contact .section__art img');
        if (contactArt) contactArt.setAttribute('src', data.contact.emblem);
        const contactList = $('#contact .contact-list');
        if (contactList) renderContactFields(contactList, data.contact.fields);
        const socialList = $('#contact .social-list');
        if (socialList) renderSocials(socialList, data.contact.socials);
        const ctaBtn = $('#contact .cta-strip .btn--primary');
        if (ctaBtn) {
            ctaBtn.setAttribute('href', data.contact.ctaButton.href);
            ctaBtn.querySelector('span').textContent = data.contact.ctaButton.text;
        }

        /* Footer */
        const footerBrand = $('.footer__brand');
        if (footerBrand) footerBrand.textContent = data.footer.brand;
        const footerRole = $('.footer__role');
        if (footerRole) footerRole.textContent = data.footer.role;
        const footerNav = $('.footer__nav');
        if (footerNav) renderFooterLinks(footerNav, data.footer.links);
        const footerBottom = $('.footer__bottom');
        if (footerBottom) {
            footerBottom.children[0].textContent = data.footer.copyright;
            footerBottom.children[1].textContent = data.footer.version;
        }

        /* Dispatch event so other scripts can re-init */
        window.dispatchEvent(new CustomEvent('data-loaded', { detail: data }));
    }

    /* ---- Sync XHR so DOM is populated before defer scripts run ---- */
    try {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', 'data/data.json', false);
        xhr.send();
        if (xhr.status >= 200 && xhr.status < 300) {
            apply(JSON.parse(xhr.responseText));
        } else {
            console.error('[data-loader] HTTP ' + xhr.status);
        }
    } catch (e) {
        console.error('[data-loader] Failed to load data.json:', e);
    }
})();
