# Agents.md — portfolio-nneeww

## What this is

A single-page static portfolio (`another/index.html`) + a CV page (`another/cv.html`).  
Vanilla HTML/CSS/JS. No build tools, no npm, no bundler, no CI, no tests.

## Open / develop

- Open `another/index.html` directly in a browser, or serve via any static server.
- VS Code Live Server is configured on port 5501 (`.vscode/settings.json`).
- **No build command.** No dev server setup. Just reload.

## Two pages

| Page      | Route                | Notes                                                               |
| --------- | -------------------- | ------------------------------------------------------------------- |
| Portfolio | `another/index.html` | Main page with sections hero, about, work, stack, research, contact |
| CV        | `another/cv.html`    | Print-ready; `html2pdf` download button (CDN)                       |

A page-wipe transition animates between them via `page-wipe.js` + sessionStorage.

## Key architecture

- **Custom cursor**: 3 macOS-style SVGs in `assets/svg/cursors/`. `cursor.js` picks one by element type: `arrow` (default), `pointer` (links/buttons), `text` (inputs). Touch devices hide the cursor entirely (`responsive.css`).
- **Smooth scroll**: `smooth-scroll.js` gates on `<body data-smooth-scroll>`. Intercepts wheel/key/anchors; lerps via rAF + `window.scrollTo`. **Disabled on touch devices** (media query `(hover: none) and (pointer: coarse)`). Not a body-hijack; native scroll is preserved for scrollbar/keyboard.
- **Loader**: Black overlay with progress bar. Hides after `window.load` + 900ms (`main.js`).
- **Footer scramble**: Plays once per session (keyed in `sessionStorage`).
- **Reduced motion**: All animations respect `prefers-reduced-motion: reduce` (no transitions, no delays).
- **Design tokens**: All CSS custom properties in `tokens.css` (obsidian, desert-sienna, spacing, radii, ease curves).
- **JS modules**: Each file is a self-contained IIFE with no dependencies between them. Loading order in `<head>` does not matter (all `defer`).

## All JS files (9, all `defer`)

```
assets/js/
├── cursor.js          # macOS cursor system
├── smooth-scroll.js   # weighted/momentum scroller
├── reveal.js          # IntersectionObserver reveals + nav spy + mobile menu
├── parallax.js        # scroll-driven translate on illustrations
├── interactions.js    # 3D tilt on feature cards + stat counters
├── svg-anim.js        # stroke-dashoffset line drawing on SVGs
├── clock.js           # live KTM time in hero
├── footer-life.js     # footer brand scramble (once per session)
├── page-wipe.js       # transition between index and cv pages
└── main.js            # loader hide + utilities
```

## All CSS files (8)

```
assets/css/
├── tokens.css         # variables, reset, custom cursor base
├── nav.css            # fixed nav + mobile menu
├── hero.css           # hero section
├── sections.css       # about, work, stack, research, contact
├── footer.css         # footer
├── svg-art.css        # marquee + SVG illustration styles
├── animations.css     # reveal utilities + loader + keyframes
└── responsive.css     # media queries + touch device overrides
```

## Conventions

- **Formatting**: No formatter config present. The code uses 4-space indentation in CSS, 4-space in JS. CSS class naming is BEM-like (`.block__elem--mod`).
- **JS**: All scripts are IIFEs (`(() => { 'use strict'; ... })()`). No imports, no ES modules, no bundler. DOM queries via `querySelector`/`querySelectorAll` with a local `$` / `$$` shorthand.
- **CSS**: Custom properties for everything. No preprocessor.
- **Touch**: `cursor: none` on body is overridden to `auto` on touch devices. The cursor element is hidden. Smooth scroll is off. `hover: none` / `pointer: coarse` media queries.
