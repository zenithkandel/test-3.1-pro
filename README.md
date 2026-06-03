# Portfolio — Zenith Kandel

A single-page static portfolio + CV page. Vanilla HTML/CSS/JS with no build tools, no frameworks, no bundler.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Markup | HTML5 |
| Styling | CSS3 (custom properties, BEM naming, no preprocessor) |
| Scripting | Vanilla JavaScript (ES6+, IIFEs, no modules) |
| Fonts | Google Fonts — Inter + JetBrains Mono |
| Icons | Inline SVGs |
| Data | JSON (`data/data.json`) loaded synchronously at runtime |

No npm, no webpack, no React, no build step. Open `index.html` in a browser and it works.

## How It Works

All personal content (name, bio, projects, skills, links, contact details, images) lives in a single JSON file:

```
data/data.json
```

A synchronous XHR loader (`assets/js/data-loader.js`) fetches this JSON before any other script runs and populates the DOM. Every deferred script (reveal animations, parallax, cursor, etc.) then initializes on the already-populated DOM.

### To edit content

1. Open `data/data.json`
2. Change any value — text, links, image paths, project details, etc.
3. Save. Reload the page.

No HTML editing needed. The HTML serves only as a structural skeleton.

### Data structure

```json
{
  "meta":        "Page title, meta description, OG tags, favicon initial",
  "brand":       "Name, initials, tagline, loader text, home link",
  "cursors":     "Paths to custom cursor SVGs",
  "hero":        "Chip text, name, subtitle, portrait, CTAs, born date, school",
  "marquee":     "Array of marquee strip items",
  "about":       "Section index, title lines, paragraph text, feature cards",
  "work":        "Section index, title, intro, ornament SVG, project array",
  "stack":       "Section index, title, intro, emblem SVG, skill rows",
  "research":    "Section index, title, intro, emblem SVG, disclosure articles",
  "contact":     "Section index, title, intro, emblem SVG, contact fields, socials, CTA",
  "footer":      "Brand, role, nav links, copyright, version",
  "nav":         "Desktop links, CTA text + href, mobile links, menu aria-label"
}
```

## File Structure

```
portfolio-nneeww/
├── index.html                    # Main portfolio page
├── cv.html                       # Print-ready CV page
├── data/
│   └── data.json                 # All dynamic content
├── assets/
│   ├── css/
│   │   ├── tokens.css            # CSS custom properties, reset
│   │   ├── nav.css               # Fixed nav + mobile menu
│   │   ├── hero.css              # Hero section
│   │   ├── sections.css          # About, work, stack, research, contact
│   │   ├── footer.css            # Footer
│   │   ├── svg-art.css           # Marquee + SVG illustration styles
│   │   ├── animations.css        # Reveal utilities + loader + keyframes
│   │   ├── life.css              # Life section styles
│   │   └── responsive.css        # Media queries + touch overrides
│   ├── js/
│   │   ├── data-loader.js        # Sync XHR loader (no defer, runs first)
│   │   ├── cursor.js             # macOS-style custom cursor
│   │   ├── smooth-scroll.js      # Momentum scroller
│   │   ├── horizontal-scroll.js  # Horizontal scroll for work section
│   │   ├── reveal.js             # IntersectionObserver reveals + nav spy
│   │   ├── parallax.js           # Scroll-driven translate on illustrations
│   │   ├── interactions.js       # 3D tilt on feature cards + stat counters
│   │   ├── svg-anim.js           # Stroke-dashoffset line drawing on SVGs
│   │   ├── clock.js              # Live KTM time in hero
│   │   ├── footer-life.js        # Footer brand scramble (once per session)
│   │   ├── page-wipe.js          # Transition between index and cv pages
│   │   └── main.js               # Loader hide + utilities
│   ├── images/
│   │   ├── me-with-transparent-background.jpg
│   │   └── me-with-white-background.jpg
│   └── svg/
│       ├── cursors/              # arrow.svg, pointer.svg, text.svg
│       └── illustrations/        # Section ornaments + project art
└── AGENTS.md                     # Agent instructions
```

## JS Architecture

All scripts are self-contained IIFEs with `defer`. They run in order after DOM parsing.

**Execution order:**
1. `data-loader.js` — runs synchronously (no `defer`), populates DOM from JSON
2. All `defer` scripts run in sequence on the populated DOM

**Key behaviors:**
- `data-loader.js` uses synchronous `XMLHttpRequest` so the DOM is ready before other scripts init
- `reveal.js` uses `IntersectionObserver` for scroll-triggered reveals + nav theme switching
- `smooth-scroll.js` is disabled on touch devices (`hover: none` + `pointer: coarse`)
- `cursor.js` hides the custom cursor on touch devices
- `prefers-reduced-motion: reduce` disables all animations and transitions
- `footer-life.js` plays the brand scramble once per session (via `sessionStorage`)

## CSS Architecture

All CSS custom properties (colors, spacing, radii, easing) live in `tokens.css`. No preprocessor. BEM-like class naming (`.block__elem--mod`).

## Running Locally

Open `index.html` directly in a browser, or use any static server:

```bash
# Python
python -m http.server 8000

# Node
npx serve .

# VS Code
# Live Server extension (configured on port 5501)
```

## CV Page

`cv.html` is a print-ready page with an `html2pdf` download button (CDN). A page-wipe transition animates between the two pages via `page-wipe.js` + `sessionStorage`.
