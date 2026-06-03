<?php
declare(strict_types=1);
require_once __DIR__ . '/auth.php';
auth_require();
$csrf = csrf_token();
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Portfolio Dashboard</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
:root {
  --obsidian: #000d10;
  --white: #ffffff;
  --mist: #8e8e95;
  --sienna: #bc7155;
  --sienna-15: rgba(188,113,85,0.15);
  --sienna-25: rgba(188,113,85,0.25);
  --surface: #0a0e10;
  --card: #111618;
  --border: #1e2528;
  --border-focus: #2a3538;
  --input-bg: #0d1214;
  --danger: #e55;
  --danger-bg: rgba(220,50,50,0.08);
  --danger-border: rgba(220,50,50,0.25);
  --success: #4b8;
  --success-bg: rgba(50,180,80,0.08);
  --success-border: rgba(50,180,80,0.25);
  --font: 'Inter', system-ui, sans-serif;
  --mono: 'JetBrains Mono', monospace;
  --sidebar-w: 240px;
}
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: var(--font); background: var(--surface); color: #ccc; font-size: 14px; line-height: 1.5; }
a { color: inherit; text-decoration: none; }

/* ── TOPBAR ── */
.topbar {
  position: fixed; top: 0; left: 0; right: 0; z-index: 200;
  height: 56px; background: var(--obsidian); border-bottom: 1px solid var(--border);
  display: flex; align-items: center; justify-content: space-between; padding: 0 24px;
}
.topbar__left { display: flex; align-items: center; gap: 14px; }
.topbar__brand { font-weight: 700; font-size: 15px; color: var(--white); letter-spacing: -0.3px; }
.topbar__sep { width: 1px; height: 20px; background: var(--border); }
.topbar__sub { font-size: 12px; color: var(--mist); text-transform: uppercase; letter-spacing: 1px; }
.topbar__right { display: flex; align-items: center; gap: 12px; }
.topbar__badge {
  font-size: 11px; padding: 4px 10px; border-radius: 100px;
  background: var(--sienna-15); color: var(--sienna); font-weight: 600;
}
.topbar__btn {
  padding: 7px 16px; border-radius: 6px; font-size: 13px; font-weight: 500;
  border: 1px solid var(--border); background: transparent; color: var(--mist);
  cursor: pointer; transition: all 0.2s;
}
.topbar__btn:hover { background: var(--card); color: var(--white); border-color: var(--border-focus); }

/* ── SIDEBAR ── */
.sidebar {
  position: fixed; top: 56px; left: 0; bottom: 0; width: var(--sidebar-w);
  background: var(--obsidian); border-right: 1px solid var(--border);
  overflow-y: auto; padding: 16px 0; z-index: 100;
}
.sidebar__label {
  font-size: 10px; font-weight: 600; color: #555; text-transform: uppercase;
  letter-spacing: 1.2px; padding: 8px 20px 6px;
}
.sidebar__item {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 20px; font-size: 13px; color: var(--mist);
  cursor: pointer; transition: all 0.15s; border-left: 2px solid transparent;
}
.sidebar__item:hover { background: rgba(255,255,255,0.03); color: #bbb; }
.sidebar__item.active {
  color: var(--white); background: rgba(255,255,255,0.04);
  border-left-color: var(--sienna);
}
.sidebar__icon { font-size: 15px; width: 20px; text-align: center; flex-shrink: 0; }
.sidebar__divider { height: 1px; background: var(--border); margin: 12px 20px; }

/* ── MAIN ── */
.main {
  margin-left: var(--sidebar-w); margin-top: 56px;
  padding: 28px 32px 60px; min-height: calc(100vh - 56px);
}

/* ── PANEL ── */
.panel {
  background: var(--card); border: 1px solid var(--border); border-radius: 10px;
  padding: 28px; margin-bottom: 24px; display: none;
}
.panel.active { display: block; }
.panel__head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
.panel__title { font-size: 18px; font-weight: 700; color: var(--white); letter-spacing: -0.3px; }
.panel__subtitle { font-size: 12px; color: var(--mist); margin-top: 2px; }

/* ── FORM ── */
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
.form-grid--full { grid-template-columns: 1fr; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group--full { grid-column: 1 / -1; }
.form-label { font-size: 11px; font-weight: 600; color: #666; text-transform: uppercase; letter-spacing: 0.8px; }
.form-input, .form-select, .form-textarea {
  background: var(--input-bg); border: 1px solid var(--border); border-radius: 6px;
  padding: 10px 14px; color: var(--white); font-family: var(--font); font-size: 13px;
  outline: none; transition: border-color 0.2s; width: 100%;
}
.form-input:focus, .form-select:focus, .form-textarea:focus { border-color: var(--sienna); }
.form-textarea { font-family: var(--mono); font-size: 12px; min-height: 80px; resize: vertical; line-height: 1.6; }
.form-select { cursor: pointer; appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M3 5l3 3 3-3' fill='none' stroke='%23666' stroke-width='1.5'/%3E%3C/svg%3E");
  background-repeat: no-repeat; background-position: right 12px center; padding-right: 32px;
}
.form-hint { font-size: 11px; color: #555; }
.form-section { margin-bottom: 28px; }
.form-section__title {
  font-size: 12px; font-weight: 600; color: var(--sienna); text-transform: uppercase;
  letter-spacing: 1px; margin-bottom: 14px; padding-bottom: 8px; border-bottom: 1px solid var(--border);
}

/* ── BUTTONS ── */
.btn-row { display: flex; gap: 10px; margin-top: 20px; flex-wrap: wrap; }
.btn {
  padding: 10px 22px; border-radius: 6px; font-size: 13px; font-weight: 600;
  cursor: pointer; transition: all 0.18s; border: none; font-family: var(--font);
}
.btn--primary { background: var(--white); color: var(--obsidian); }
.btn--primary:hover { opacity: 0.85; }
.btn--ghost { background: transparent; color: var(--mist); border: 1px solid var(--border); }
.btn--ghost:hover { background: var(--card); color: var(--white); border-color: var(--border-focus); }
.btn--danger { background: var(--danger-bg); color: var(--danger); border: 1px solid var(--danger-border); }
.btn--danger:hover { background: rgba(220,50,50,0.15); }
.btn--sm { padding: 6px 14px; font-size: 12px; }

/* ── UPLOAD ZONE ── */
.upload-zone {
  border: 2px dashed var(--border); border-radius: 8px; padding: 36px 20px;
  text-align: center; cursor: pointer; transition: all 0.2s; position: relative;
}
.upload-zone:hover, .upload-zone.dragover { border-color: var(--sienna); background: rgba(188,113,85,0.04); }
.upload-zone input[type="file"] { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
.upload-zone__icon { font-size: 28px; margin-bottom: 8px; opacity: 0.4; }
.upload-zone__text { font-size: 13px; color: #888; }
.upload-zone__hint { font-size: 11px; color: #555; margin-top: 4px; }
.upload-preview { margin-top: 14px; text-align: center; }
.upload-preview img { max-height: 120px; border-radius: 6px; border: 1px solid var(--border); display: inline-block; }
.upload-path {
  margin-top: 10px; display: inline-block; background: var(--input-bg); padding: 6px 14px;
  border-radius: 4px; font-family: var(--mono); font-size: 12px; color: var(--sienna);
}

/* ── FILE LIST ── */
.file-list { max-height: 340px; overflow-y: auto; }
.file-item {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 14px; border: 1px solid var(--border); border-radius: 6px;
  margin-bottom: 4px; font-size: 12px; transition: background 0.15s;
}
.file-item:hover { background: rgba(255,255,255,0.02); }
.file-item__name { display: flex; align-items: center; gap: 8px; color: #bbb; min-width: 0; }
.file-item__name span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.file-item__icon { font-size: 14px; flex-shrink: 0; }
.file-item__size { color: #555; font-family: var(--mono); font-size: 11px; margin-left: 12px; flex-shrink: 0; }
.file-item__actions { display: flex; gap: 4px; flex-shrink: 0; margin-left: 12px; }
.file-item__btn {
  width: 28px; height: 28px; border-radius: 4px; border: 1px solid transparent;
  display: flex; align-items: center; justify-content: center;
  color: #666; cursor: pointer; transition: all 0.15s; font-size: 13px; background: none;
}
.file-item__btn:hover { color: var(--white); background: rgba(255,255,255,0.05); border-color: var(--border); }
.file-item__btn--del:hover { color: var(--danger); background: var(--danger-bg); }

/* ── STATUS ── */
.status {
  position: fixed; bottom: 24px; right: 24px; z-index: 300;
  padding: 12px 20px; border-radius: 8px; font-size: 13px; font-weight: 500;
  transform: translateY(20px); opacity: 0; transition: all 0.25s; pointer-events: none;
  max-width: 400px;
}
.status.show { transform: translateY(0); opacity: 1; }
.status--ok { background: var(--success-bg); border: 1px solid var(--success-border); color: var(--success); }
.status--err { background: var(--danger-bg); border: 1px solid var(--danger-border); color: var(--danger); }

/* ── JSON EDITOR ── */
.json-editor {
  width: 100%; min-height: 500px; background: var(--input-bg); border: 1px solid var(--border);
  border-radius: 6px; color: #ccc; font-family: var(--mono); font-size: 12px;
  padding: 16px; resize: vertical; outline: none; tab-size: 2; line-height: 1.7;
}
.json-editor:focus { border-color: var(--sienna); }

/* ── TAGS (for marquee, chips, etc) ── */
.tag-list { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
.tag {
  display: inline-flex; align-items: center; gap: 6px;
  background: var(--input-bg); border: 1px solid var(--border); border-radius: 4px;
  padding: 4px 10px; font-size: 12px; color: #bbb;
}
.tag__remove {
  cursor: pointer; color: #666; font-size: 14px; line-height: 1; transition: color 0.15s;
}
.tag__remove:hover { color: var(--danger); }

/* ── LIST EDITOR (for arrays of objects) ── */
.list-editor { display: flex; flex-direction: column; gap: 10px; }
.list-item {
  background: var(--input-bg); border: 1px solid var(--border); border-radius: 8px;
  padding: 16px; position: relative;
}
.list-item__header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.list-item__title { font-size: 13px; font-weight: 600; color: var(--sienna); }
.list-item__remove { cursor: pointer; color: #555; font-size: 18px; transition: color 0.15s; background: none; border: none; }
.list-item__remove:hover { color: var(--danger); }

/* ── SCROLLBAR ── */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: #444; }

/* ── IMAGE PICKER ── */
.img-picker { display: flex; flex-direction: column; gap: 10px; }
.img-picker__row { display: flex; gap: 8px; align-items: center; }
.img-picker__row .form-select { flex: 1; }
.img-picker__row .btn { flex-shrink: 0; }
.img-picker__preview {
  width: 100%; min-height: 80px; max-height: 200px; border-radius: 6px;
  border: 1px solid var(--border); background: var(--input-bg);
  display: flex; align-items: center; justify-content: center; overflow: hidden;
}
.img-picker__preview img {
  max-height: 180px; max-width: 100%; object-fit: contain; border-radius: 4px;
}
.img-picker__preview .placeholder { color: #444; font-size: 12px; }
.img-picker__path {
  font-family: var(--mono); font-size: 11px; color: var(--sienna);
  background: var(--input-bg); padding: 4px 10px; border-radius: 4px;
  border: 1px solid var(--border); word-break: break-all;
}
</style>
</head>
<body>

<!-- TOPBAR -->
<div class="topbar">
  <div class="topbar__left">
    <span class="topbar__brand">Portfolio</span>
    <span class="topbar__sep"></span>
    <span class="topbar__sub">Dashboard</span>
  </div>
  <div class="topbar__right">
    <span class="topbar__badge">PIN 8038</span>
    <a href="../index.html" target="_blank" class="topbar__btn">View Site</a>
    <button class="topbar__btn" onclick="logout()">Sign Out</button>
  </div>
</div>

<!-- SIDEBAR -->
<aside class="sidebar">
  <div class="sidebar__label">Content</div>
  <div class="sidebar__item active" data-panel="meta"><span class="sidebar__icon">&#9881;</span> Meta / SEO</div>
  <div class="sidebar__item" data-panel="brand"><span class="sidebar__icon">&#9733;</span> Brand</div>
  <div class="sidebar__item" data-panel="hero"><span class="sidebar__icon">&#9758;</span> Hero</div>
  <div class="sidebar__item" data-panel="marquee"><span class="sidebar__icon">&#8644;</span> Marquee</div>
  <div class="sidebar__item" data-panel="about"><span class="sidebar__icon">&#9998;</span> About</div>
  <div class="sidebar__item" data-panel="work"><span class="sidebar__icon">&#9874;</span> Work / Projects</div>
  <div class="sidebar__item" data-panel="stack"><span class="sidebar__icon">&#9881;</span> Stack</div>
  <div class="sidebar__item" data-panel="research"><span class="sidebar__icon">&#128270;</span> Research</div>
  <div class="sidebar__item" data-panel="contact"><span class="sidebar__icon">&#9993;</span> Contact</div>
  <div class="sidebar__item" data-panel="footer"><span class="sidebar__icon">&#8212;</span> Footer / Nav</div>
  <div class="sidebar__divider"></div>
  <div class="sidebar__label">System</div>
  <div class="sidebar__item" data-panel="files"><span class="sidebar__icon">&#128193;</span> File Browser</div>
  <div class="sidebar__item" data-panel="json"><span class="sidebar__icon">&#123;&#125;</span> Raw JSON</div>
</aside>

<!-- MAIN CONTENT -->
<div class="main">

  <!-- ─── META / SEO ─── -->
  <div class="panel active" id="panel-meta">
    <div class="panel__head">
      <div><div class="panel__title">Meta / SEO</div>
      <div class="panel__subtitle">Page title, description, Open Graph tags</div></div>
    </div>
    <div class="form-grid">
      <div class="form-group form-group--full">
        <label class="form-label">Page Title</label>
        <input class="form-input" data-path="meta.title">
      </div>
      <div class="form-group form-group--full">
        <label class="form-label">Meta Description</label>
        <textarea class="form-textarea" rows="2" data-path="meta.description"></textarea>
      </div>
      <div class="form-group">
        <label class="form-label">OG Title</label>
        <input class="form-input" data-path="meta.ogTitle">
      </div>
      <div class="form-group">
        <label class="form-label">OG Description</label>
        <input class="form-input" data-path="meta.ogDescription">
      </div>
      <div class="form-group">
        <label class="form-label">Theme Color</label>
        <input class="form-input" data-path="meta.themeColor" type="color">
      </div>
      <div class="form-group">
        <label class="form-label">Favicon Initial</label>
        <input class="form-input" data-path="meta.faviconInitial" maxlength="2">
      </div>
    </div>
    <div class="btn-row"><button class="btn btn--primary" onclick="saveSection()">Save Changes</button></div>
  </div>

  <!-- ─── BRAND ─── -->
  <div class="panel" id="panel-brand">
    <div class="panel__head">
      <div><div class="panel__title">Brand</div>
      <div class="panel__subtitle">Name, initials, tagline, loader text</div></div>
    </div>
    <div class="form-grid">
      <div class="form-group"><label class="form-label">Full Name</label>
        <input class="form-input" data-path="brand.name"></div>
      <div class="form-group"><label class="form-label">Initials</label>
        <input class="form-input" data-path="brand.initials" maxlength="3"></div>
      <div class="form-group form-group--full"><label class="form-label">Tagline</label>
        <input class="form-input" data-path="brand.tagline"></div>
      <div class="form-group"><label class="form-label">Loader Text</label>
        <input class="form-input" data-path="brand.loaderText"></div>
      <div class="form-group"><label class="form-label">Home Href</label>
        <input class="form-input" data-path="brand.homeHref"></div>
    </div>
    <div class="btn-row"><button class="btn btn--primary" onclick="saveSection()">Save Changes</button></div>
  </div>

  <!-- ─── HERO ─── -->
  <div class="panel" id="panel-hero">
    <div class="panel__head">
      <div><div class="panel__title">Hero Section</div>
      <div class="panel__subtitle">Name, subtitle, portrait, CTAs, metadata</div></div>
    </div>
    <div class="form-section">
      <div class="form-section__title">Identity</div>
      <div class="form-grid">
        <div class="form-group"><label class="form-label">First Name</label>
          <input class="form-input" data-path="hero.firstName"></div>
        <div class="form-group"><label class="form-label">Last Name</label>
          <input class="form-input" data-path="hero.lastName"></div>
        <div class="form-group form-group--full"><label class="form-label">Subtitle</label>
          <textarea class="form-textarea" rows="3" data-path="hero.subtitle"></textarea></div>
        <div class="form-group form-group--full"><label class="form-label">Availability Chip</label>
          <input class="form-input" data-path="hero.chip"></div>
        <div class="form-group"><label class="form-label">Location</label>
          <input class="form-input" data-path="hero.location"></div>
        <div class="form-group"><label class="form-label">Clock Aria Label</label>
          <input class="form-input" data-path="hero.clockAriaLabel"></div>
      </div>
    </div>
    <div class="form-section">
      <div class="form-section__title">Portrait</div>
      <div class="form-grid">
        <div class="form-group form-group--full"><label class="form-label">Image</label>
          <input type="hidden" data-path="hero.portrait.src" id="heroPortraitSrc">
          <div id="picker-hero-portrait"></div>
        </div>
        <div class="form-group"><label class="form-label">Alt Text</label>
          <input class="form-input" data-path="hero.portrait.alt"></div>
        <div class="form-group"><label class="form-label">Caption</label>
          <input class="form-input" data-path="hero.portrait.caption"></div>
      </div>
    </div>
    <div class="form-section">
      <div class="form-section__title">Calls to Action</div>
      <div class="form-grid">
        <div class="form-group"><label class="form-label">Primary CTA Text</label>
          <input class="form-input" data-path="hero.ctaPrimary.text"></div>
        <div class="form-group"><label class="form-label">Primary CTA Href</label>
          <input class="form-input" data-path="hero.ctaPrimary.href"></div>
        <div class="form-group"><label class="form-label">Secondary CTA Text</label>
          <input class="form-input" data-path="hero.ctaSecondary.text"></div>
        <div class="form-group"><label class="form-label">Secondary CTA Href</label>
          <input class="form-input" data-path="hero.ctaSecondary.href"></div>
      </div>
    </div>
    <div class="form-section">
      <div class="form-section__title">Metadata</div>
      <div class="form-grid">
        <div class="form-group"><label class="form-label">Born</label>
          <input class="form-input" data-path="hero.born"></div>
        <div class="form-group"><label class="form-label">School</label>
          <input class="form-input" data-path="hero.school"></div>
        <div class="form-group"><label class="form-label">Scroll Text</label>
          <input class="form-input" data-path="hero.scrollText"></div>
      </div>
    </div>
    <div class="btn-row"><button class="btn btn--primary" onclick="saveSection()">Save Changes</button></div>
  </div>

  <!-- ─── MARQUEE ─── -->
  <div class="panel" id="panel-marquee">
    <div class="panel__head">
      <div><div class="panel__title">Marquee Strip</div>
      <div class="panel__subtitle">Scrolling text items between hero and about</div></div>
    </div>
    <div class="form-grid form-grid--full">
      <div class="form-group">
        <label class="form-label">Items (one per line)</label>
        <textarea class="form-textarea" rows="6" id="marqueeEditor"></textarea>
        <div class="form-hint">Each line becomes one marquee item</div>
      </div>
    </div>
    <div class="btn-row"><button class="btn btn--primary" onclick="saveMarquee()">Save Changes</button></div>
  </div>

  <!-- ─── ABOUT ─── -->
  <div class="panel" id="panel-about">
    <div class="panel__head">
      <div><div class="panel__title">About Section</div>
      <div class="panel__subtitle">Section heading, bio paragraphs, feature cards</div></div>
    </div>
    <div class="form-section">
      <div class="form-section__title">Header</div>
      <div class="form-grid">
        <div class="form-group"><label class="form-label">Section Index</label>
          <input class="form-input" data-path="about.index"></div>
        <div class="form-group form-group--full"><label class="form-label">Title Lines (JSON array)</label>
          <textarea class="form-textarea" rows="3" id="aboutTitleEditor"></textarea>
          <div class="form-hint">JSON array, e.g. ["A high schooler","building at the","edge of curiosity."]</div>
        </div>
      </div>
    </div>
    <div class="form-section">
      <div class="form-section__title">Bio Paragraphs</div>
      <div class="form-grid form-grid--full">
        <div class="form-group">
          <textarea class="form-textarea" rows="8" id="aboutParasEditor"></textarea>
          <div class="form-hint">JSON array of strings. HTML tags allowed for inline formatting.</div>
        </div>
      </div>
    </div>
    <div class="form-section">
      <div class="form-section__title">Feature Cards</div>
      <div class="list-editor" id="aboutFeatures"></div>
      <div class="btn-row">
        <button class="btn btn--ghost btn--sm" onclick="addFeature()">+ Add Feature</button>
        <button class="btn btn--primary" onclick="saveAbout()">Save Changes</button>
      </div>
    </div>
  </div>

  <!-- ─── WORK / PROJECTS ─── -->
  <div class="panel" id="panel-work">
    <div class="panel__head">
      <div><div class="panel__title">Work / Projects</div>
      <div class="panel__subtitle">Section header, ornament, and project list</div></div>
    </div>
    <div class="form-section">
      <div class="form-section__title">Header</div>
      <div class="form-grid">
        <div class="form-group"><label class="form-label">Section Index</label>
          <input class="form-input" data-path="work.index"></div>
        <div class="form-group form-group--full"><label class="form-label">Title Lines (JSON array)</label>
          <textarea class="form-textarea" rows="2" id="workTitleEditor"></textarea></div>
        <div class="form-group form-group--full"><label class="form-label">Intro Paragraph</label>
          <textarea class="form-textarea" rows="3" data-path="work.intro"></textarea></div>
        <div class="form-group form-group--full"><label class="form-label">Ornament SVG</label>
          <input type="hidden" data-path="work.ornament" id="workOrnament">
          <div id="picker-work-ornament"></div>
        </div>
      </div>
    </div>
    <div class="form-section">
      <div class="form-section__title">Projects</div>
      <div class="list-editor" id="workProjects"></div>
      <div class="btn-row">
        <button class="btn btn--ghost btn--sm" onclick="addProject()">+ Add Project</button>
        <button class="btn btn--primary" onclick="saveWork()">Save Changes</button>
      </div>
    </div>
  </div>

  <!-- ─── STACK ─── -->
  <div class="panel" id="panel-stack">
    <div class="panel__head">
      <div><div class="panel__title">Stack / Skills</div>
      <div class="panel__subtitle">Skill categories and tools</div></div>
    </div>
    <div class="form-section">
      <div class="form-section__title">Header</div>
      <div class="form-grid">
        <div class="form-group"><label class="form-label">Section Index</label>
          <input class="form-input" data-path="stack.index"></div>
        <div class="form-group form-group--full"><label class="form-label">Title Lines (JSON array)</label>
          <textarea class="form-textarea" rows="2" id="stackTitleEditor"></textarea></div>
        <div class="form-group form-group--full"><label class="form-label">Intro Paragraph</label>
          <textarea class="form-textarea" rows="3" data-path="stack.intro"></textarea></div>
        <div class="form-group form-group--full"><label class="form-label">Emblem SVG</label>
          <input type="hidden" data-path="stack.emblem" id="stackEmblem">
          <div id="picker-stack-emblem"></div>
        </div>
      </div>
    </div>
    <div class="form-section">
      <div class="form-section__title">Skill Rows</div>
      <div class="list-editor" id="stackRows"></div>
      <div class="btn-row">
        <button class="btn btn--ghost btn--sm" onclick="addStackRow()">+ Add Row</button>
        <button class="btn btn--primary" onclick="saveStack()">Save Changes</button>
      </div>
    </div>
  </div>

  <!-- ─── RESEARCH ─── -->
  <div class="panel" id="panel-research">
    <div class="panel__head">
      <div><div class="panel__title">Research / Disclosures</div>
      <div class="panel__subtitle">Security research section and disclosure cards</div></div>
    </div>
    <div class="form-section">
      <div class="form-section__title">Header</div>
      <div class="form-grid">
        <div class="form-group"><label class="form-label">Section Index</label>
          <input class="form-input" data-path="research.index"></div>
        <div class="form-group form-group--full"><label class="form-label">Title Lines (JSON array)</label>
          <textarea class="form-textarea" rows="2" id="researchTitleEditor"></textarea></div>
        <div class="form-group form-group--full"><label class="form-label">Intro Paragraph</label>
          <textarea class="form-textarea" rows="3" data-path="research.intro"></textarea></div>
        <div class="form-group form-group--full"><label class="form-label">Emblem SVG</label>
          <input type="hidden" data-path="research.emblem" id="researchEmblem">
          <div id="picker-research-emblem"></div>
        </div>
      </div>
    </div>
    <div class="form-section">
      <div class="form-section__title">Disclosures</div>
      <div class="list-editor" id="researchDisclosures"></div>
      <div class="btn-row">
        <button class="btn btn--ghost btn--sm" onclick="addDisclosure()">+ Add Disclosure</button>
        <button class="btn btn--primary" onclick="saveResearch()">Save Changes</button>
      </div>
    </div>
  </div>

  <!-- ─── CONTACT ─── -->
  <div class="panel" id="panel-contact">
    <div class="panel__head">
      <div><div class="panel__title">Contact Section</div>
      <div class="panel__subtitle">Contact fields, social links, CTA button</div></div>
    </div>
    <div class="form-section">
      <div class="form-section__title">Header</div>
      <div class="form-grid">
        <div class="form-group"><label class="form-label">Section Index</label>
          <input class="form-input" data-path="contact.index"></div>
        <div class="form-group form-group--full"><label class="form-label">Title Lines (JSON array)</label>
          <textarea class="form-textarea" rows="2" id="contactTitleEditor"></textarea></div>
        <div class="form-group form-group--full"><label class="form-label">Intro Paragraph</label>
          <textarea class="form-textarea" rows="3" data-path="contact.intro"></textarea></div>
        <div class="form-group form-group--full"><label class="form-label">Emblem SVG</label>
          <input type="hidden" data-path="contact.emblem" id="contactEmblem">
          <div id="picker-contact-emblem"></div>
        </div>
      </div>
    </div>
    <div class="form-section">
      <div class="form-section__title">Contact Fields</div>
      <div class="list-editor" id="contactFields"></div>
      <div class="btn-row"><button class="btn btn--ghost btn--sm" onclick="addContactField()">+ Add Field</button></div>
    </div>
    <div class="form-section">
      <div class="form-section__title">Social Links</div>
      <div class="list-editor" id="contactSocials"></div>
      <div class="btn-row">
        <button class="btn btn--ghost btn--sm" onclick="addSocial()">+ Add Social</button>
        <button class="btn btn--primary" onclick="saveContact()">Save Changes</button>
      </div>
    </div>
  </div>

  <!-- ─── FOOTER / NAV ─── -->
  <div class="panel" id="panel-footer">
    <div class="panel__head">
      <div><div class="panel__title">Footer & Navigation</div>
      <div class="panel__subtitle">Footer content, copyright, nav links</div></div>
    </div>
    <div class="form-section">
      <div class="form-section__title">Footer</div>
      <div class="form-grid">
        <div class="form-group"><label class="form-label">Brand Name</label>
          <input class="form-input" data-path="footer.brand"></div>
        <div class="form-group"><label class="form-label">Role</label>
          <input class="form-input" data-path="footer.role"></div>
        <div class="form-group form-group--full"><label class="form-label">Copyright</label>
          <input class="form-input" data-path="footer.copyright"></div>
        <div class="form-group"><label class="form-label">Version</label>
          <input class="form-input" data-path="footer.version"></div>
      </div>
    </div>
    <div class="form-section">
      <div class="form-section__title">Navigation</div>
      <div class="form-grid">
        <div class="form-group"><label class="form-label">CTA Text</label>
          <input class="form-input" data-path="nav.cta"></div>
        <div class="form-group"><label class="form-label">CTA Href</label>
          <input class="form-input" data-path="nav.ctaHref"></div>
        <div class="form-group"><label class="form-label">Menu Aria Label</label>
          <input class="form-input" data-path="nav.menuAriaLabel"></div>
      </div>
    </div>
    <div class="btn-row"><button class="btn btn--primary" onclick="saveSection()">Save Changes</button></div>
  </div>

  <!-- ─── FILE BROWSER ─── -->
  <div class="panel" id="panel-files">
    <div class="panel__head">
      <div><div class="panel__title">File Browser</div>
      <div class="panel__subtitle">Upload, browse, and delete files in assets/</div></div>
    </div>
    <div class="form-section">
      <div class="form-section__title">Upload</div>
      <div class="form-grid">
        <div class="form-group">
          <label class="form-label">Destination Folder</label>
          <select class="form-select" id="uploadFolder">
            <option value="images">assets/images</option>
            <option value="svg/cursors">assets/svg/cursors</option>
            <option value="svg/emblems">assets/svg/emblems</option>
            <option value="svg/projects">assets/svg/projects</option>
            <option value="svg/ui">assets/svg/ui</option>
            <option value="css">assets/css</option>
            <option value="js">assets/js</option>
            <option value="">assets/ (root)</option>
          </select>
        </div>
      </div>
      <div class="upload-zone" id="dropZone" style="margin-top:14px">
        <input type="file" id="fileInput" accept=".jpg,.jpeg,.png,.gif,.webp,.svg">
        <div class="upload-zone__icon">&#8679;</div>
        <div class="upload-zone__text">Drop file here or click to browse</div>
        <div class="upload-zone__hint">jpg, jpeg, png, gif, webp, svg &mdash; max 10MB</div>
      </div>
      <div id="uploadResult"></div>
    </div>
    <div class="form-section">
      <div class="form-section__title">Browse</div>
      <div class="form-grid">
        <div class="form-group">
          <label class="form-label">Directory</label>
          <select class="form-select" id="browseDir" onchange="listFiles()">
            <option value="images">assets/images</option>
            <option value="svg">assets/svg</option>
            <option value="svg/cursors">assets/svg/cursors</option>
            <option value="svg/emblems">assets/svg/emblems</option>
            <option value="svg/projects">assets/svg/projects</option>
            <option value="css">assets/css</option>
            <option value="js">assets/js</option>
            <option value="">assets/ (root)</option>
          </select>
        </div>
      </div>
      <div id="fileList" class="file-list" style="margin-top:14px"></div>
    </div>
  </div>

  <!-- ─── RAW JSON ─── -->
  <div class="panel" id="panel-json">
    <div class="panel__head">
      <div><div class="panel__title">Raw JSON Editor</div>
      <div class="panel__subtitle">Edit data.json directly &mdash; backups are created automatically</div></div>
    </div>
    <textarea class="json-editor" id="jsonEditor" spellcheck="false"></textarea>
    <div class="btn-row">
      <button class="btn btn--primary" onclick="saveRawJson()">Save data.json</button>
      <button class="btn btn--ghost" onclick="loadRawJson()">Reload</button>
    </div>
  </div>

</div><!-- /.main -->

<!-- STATUS TOAST -->
<div class="status" id="status"></div>

<script>
const CSRF = '<?= htmlspecialchars($csrf) ?>';
const API  = 'api.php';
let DATA = {};

/* ── Utilities ── */
function hdrs(json) {
  const h = { 'X-CSRF-TOKEN': CSRF };
  if (json) h['Content-Type'] = 'application/json';
  return h;
}

function status(msg, ok) {
  const el = document.getElementById('status');
  el.textContent = msg;
  el.className = 'status status--' + (ok ? 'ok' : 'err') + ' show';
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 4000);
}

function get(path) {
  return path.split('.').reduce((o, k) => (o != null ? o[k] : undefined), DATA);
}

function set(path, val) {
  const keys = path.split('.');
  let obj = DATA;
  for (let i = 0; i < keys.length - 1; i++) {
    if (obj[keys[i]] == null) obj[keys[i]] = {};
    obj = obj[keys[i]];
  }
  obj[keys[keys.length - 1]] = val;
}

/* ── Load data ── */
async function loadData() {
  try {
    const r = await fetch(API + '?action=get');
    const d = await r.json();
    if (!d.ok) throw new Error(d.error);
    DATA = d.data;
    populateAll();
    status('Data loaded', true);
  } catch (e) { status('Load failed: ' + e.message, false); }
}

function populateAll() {
  document.querySelectorAll('[data-path]').forEach(el => {
    const v = get(el.dataset.path);
    if (v == null) return;
    el.value = typeof v === 'object' ? JSON.stringify(v) : v;
  });
  populateMarquee();
  populateAboutTitle();
  populateAboutParas();
  populateAboutFeatures();
  populateWorkTitle();
  populateWorkProjects();
  populateStackTitle();
  populateStackRows();
  populateResearchTitle();
  populateDisclosures();
  populateContactTitle();
  populateContactFields();
  populateContactSocials();
  populateRawJson();
}

/* ── Save simple sections (meta, brand, hero, footer) ── */
async function saveSection() {
  document.querySelectorAll('[data-path]').forEach(el => {
    const path = el.dataset.path;
    const current = get(path);
    if (typeof current === 'number' || typeof current === 'boolean') {
      set(path, el.value);
    } else {
      set(path, el.value);
    }
  });
  await saveData();
}

/* ── Save to API ── */
async function saveData() {
  try {
    const r = await fetch(API + '?action=save', {
      method: 'POST',
      headers: hdrs(true),
      body: JSON.stringify({ data: DATA })
    });
    const d = await r.json();
    status(d.ok ? 'Saved successfully' : (d.error || 'Save failed'), !!d.ok);
    if (d.ok) populateRawJson();
  } catch (e) { status('Save failed: ' + e.message, false); }
}

/* ── Marquee ── */
function populateMarquee() {
  const arr = get('marquee') || [];
  document.getElementById('marqueeEditor').value = arr.join('\n');
}
async function saveMarquee() {
  const lines = document.getElementById('marqueeEditor').value.split('\n').map(s => s.trim()).filter(Boolean);
  DATA.marquee = lines;
  await saveData();
}

/* ── About ── */
function populateAboutTitle() {
  const v = get('about.title') || [];
  document.getElementById('aboutTitleEditor').value = JSON.stringify(v, null, 2);
}
function populateAboutParas() {
  const v = get('about.paragraphs') || [];
  document.getElementById('aboutParasEditor').value = JSON.stringify(v, null, 2);
}
function populateAboutFeatures() {
  const features = get('about.features') || [];
  const el = document.getElementById('aboutFeatures');
  el.innerHTML = features.map((f, i) => `
    <div class="list-item">
      <div class="list-item__header">
        <span class="list-item__title">Feature ${i + 1}</span>
        <button class="list-item__remove" onclick="removeFeature(${i})">&times;</button>
      </div>
      <div class="form-grid">
        <div class="form-group"><label class="form-label">Number</label>
          <input class="form-input" data-list="about.features" data-idx="${i}" data-key="number" value="${esc(f.number)}"></div>
        <div class="form-group"><label class="form-label">Title</label>
          <input class="form-input" data-list="about.features" data-idx="${i}" data-key="title" value="${esc(f.title)}"></div>
        <div class="form-group form-group--full"><label class="form-label">Description</label>
          <textarea class="form-textarea" rows="2" data-list="about.features" data-idx="${i}" data-key="description">${esc(f.description)}</textarea></div>
        <div class="form-group"><label class="form-label">Footer Text</label>
          <input class="form-input" data-list="about.features" data-idx="${i}" data-key="foot" value="${esc(f.foot)}"></div>
      </div>
    </div>
  `).join('');
}
function addFeature() {
  const arr = get('about.features') || [];
  arr.push({ number: '00', title: 'New Feature', description: '', foot: '' });
  DATA.about.features = arr;
  populateAboutFeatures();
}
function removeFeature(i) {
  DATA.about.features.splice(i, 1);
  populateAboutFeatures();
}
async function saveAbout() {
  collectListInputs('about.features');
  try { DATA.about.title = JSON.parse(document.getElementById('aboutTitleEditor').value); } catch {}
  try { DATA.about.paragraphs = JSON.parse(document.getElementById('aboutParasEditor').value); } catch {}
  await saveData();
}

/* ── Work ── */
function populateWorkTitle() {
  const v = get('work.title') || [];
  document.getElementById('workTitleEditor').value = JSON.stringify(v);
}
function populateWorkProjects() {
  const projects = get('work.projects') || [];
  const el = document.getElementById('workProjects');
  el.innerHTML = projects.map((p, i) => `
    <div class="list-item">
      <div class="list-item__header">
        <span class="list-item__title">${esc(p.title || 'Project ' + (i+1))}</span>
        <button class="list-item__remove" onclick="removeProject(${i})">&times;</button>
      </div>
      <div class="form-grid">
        <div class="form-group"><label class="form-label">Title</label>
          <input class="form-input" data-list="work.projects" data-idx="${i}" data-key="title" value="${esc(p.title)}"></div>
        <div class="form-group"><label class="form-label">Tag</label>
          <input class="form-input" data-list="work.projects" data-idx="${i}" data-key="tag" value="${esc(p.tag)}"></div>
        <div class="form-group"><label class="form-label">Number</label>
          <input class="form-input" data-list="work.projects" data-idx="${i}" data-key="num" value="${esc(p.num)}"></div>
        <div class="form-group"><label class="form-label">Year</label>
          <input class="form-input" data-list="work.projects" data-idx="${i}" data-key="year" value="${esc(p.year)}"></div>
        <div class="form-group form-group--full"><label class="form-label">Description</label>
          <textarea class="form-textarea" rows="3" data-list="work.projects" data-idx="${i}" data-key="description">${esc(p.description)}</textarea></div>
        <div class="form-group form-group--full"><label class="form-label">Tech Chips (comma separated)</label>
          <input class="form-input" data-list="work.projects" data-idx="${i}" data-key="chips" value="${esc(Array.isArray(p.chips) ? p.chips.join(', ') : '')}"></div>
        <div class="form-group form-group--full"><label class="form-label">Illustration SVG</label>
          <input type="hidden" data-list="work.projects" data-idx="${i}" data-key="illustration" id="projIllustration${i}" value="${esc(p.illustration)}">
          <div id="picker-proj-${i}"></div>
        </div>
      </div>
    </div>
  `).join('');
  projects.forEach((p, i) => {
    createImagePicker('picker-proj-' + i, {
      folder: 'svg/projects', accept: '.svg', inputId: 'projIllustration' + i
    });
  });
}
  const arr = get('work.projects') || [];
  const n = String(arr.length + 1).padStart(2, '0');
  arr.push({ num: n, title: 'New Project', tag: 'Category', description: '', chips: [], year: '2025', illustration: '' });
  DATA.work.projects = arr;
  populateWorkProjects();
}
function removeProject(i) {
  DATA.work.projects.splice(i, 1);
  populateWorkProjects();
}
async function saveWork() {
  collectListInputs('work.projects');
  DATA.work.projects.forEach(p => {
    if (typeof p.chips === 'string') p.chips = p.chips.split(',').map(s => s.trim()).filter(Boolean);
  });
  try { DATA.work.title = JSON.parse(document.getElementById('workTitleEditor').value); } catch {}
  await saveData();
}

/* ── Stack ── */
function populateStackTitle() {
  document.getElementById('stackTitleEditor').value = JSON.stringify(get('stack.title') || []);
}
function populateStackRows() {
  const rows = get('stack.rows') || [];
  const el = document.getElementById('stackRows');
  el.innerHTML = rows.map((r, i) => `
    <div class="list-item">
      <div class="list-item__header">
        <span class="list-item__title">${esc(r.label || 'Row ' + (i+1))}</span>
        <button class="list-item__remove" onclick="removeStackRow(${i})">&times;</button>
      </div>
      <div class="form-grid">
        <div class="form-group"><label class="form-label">Number</label>
          <input class="form-input" data-list="stack.rows" data-idx="${i}" data-key="num" value="${esc(r.num)}"></div>
        <div class="form-group"><label class="form-label">Label</label>
          <input class="form-input" data-list="stack.rows" data-idx="${i}" data-key="label" value="${esc(r.label)}"></div>
        <div class="form-group form-group--full"><label class="form-label">Tools (comma separated)</label>
          <input class="form-input" data-list="stack.rows" data-idx="${i}" data-key="tools" value="${esc(Array.isArray(r.tools) ? r.tools.join(', ') : '')}"></div>
      </div>
    </div>
  `).join('');
}
function addStackRow() {
  const arr = get('stack.rows') || [];
  const n = String(arr.length + 1).padStart(2, '0');
  arr.push({ num: n, label: 'New Category', tools: [] });
  DATA.stack.rows = arr;
  populateStackRows();
}
function removeStackRow(i) { DATA.stack.rows.splice(i, 1); populateStackRows(); }
async function saveStack() {
  collectListInputs('stack.rows');
  DATA.stack.rows.forEach(r => { if (typeof r.tools === 'string') r.tools = r.tools.split(',').map(s => s.trim()).filter(Boolean); });
  try { DATA.stack.title = JSON.parse(document.getElementById('stackTitleEditor').value); } catch {}
  await saveData();
}

/* ── Research ── */
function populateResearchTitle() {
  document.getElementById('researchTitleEditor').value = JSON.stringify(get('research.title') || []);
}
function populateDisclosures() {
  const items = get('research.disclosures') || [];
  const el = document.getElementById('researchDisclosures');
  el.innerHTML = items.map((d, i) => `
    <div class="list-item">
      <div class="list-item__header">
        <span class="list-item__title">${esc(d.target || 'Disclosure ' + (i+1))}</span>
        <button class="list-item__remove" onclick="removeDisclosure(${i})">&times;</button>
      </div>
      <div class="form-grid">
        <div class="form-group"><label class="form-label">Target</label>
          <input class="form-input" data-list="research.disclosures" data-idx="${i}" data-key="target" value="${esc(d.target)}"></div>
        <div class="form-group"><label class="form-label">Status</label>
          <input class="form-input" data-list="research.disclosures" data-idx="${i}" data-key="status" value="${esc(d.status)}"></div>
        <div class="form-group form-group--full"><label class="form-label">Title</label>
          <input class="form-input" data-list="research.disclosures" data-idx="${i}" data-key="title" value="${esc(d.title)}"></div>
        <div class="form-group form-group--full"><label class="form-label">Description</label>
          <textarea class="form-textarea" rows="2" data-list="research.disclosures" data-idx="${i}" data-key="description">${esc(d.description)}</textarea></div>
        <div class="form-group form-group--full"><label class="form-label">Tags (comma separated)</label>
          <input class="form-input" data-list="research.disclosures" data-idx="${i}" data-key="tags" value="${esc(Array.isArray(d.tags) ? d.tags.join(', ') : '')}"></div>
      </div>
    </div>
  `).join('');
}
function addDisclosure() {
  const arr = get('research.disclosures') || [];
  arr.push({ target: 'Company', status: 'Disclosed', title: 'Bug title', description: '', tags: [] });
  DATA.research.disclosures = arr;
  populateDisclosures();
}
function removeDisclosure(i) { DATA.research.disclosures.splice(i, 1); populateDisclosures(); }
async function saveResearch() {
  collectListInputs('research.disclosures');
  DATA.research.disclosures.forEach(d => { if (typeof d.tags === 'string') d.tags = d.tags.split(',').map(s => s.trim()).filter(Boolean); });
  try { DATA.research.title = JSON.parse(document.getElementById('researchTitleEditor').value); } catch {}
  await saveData();
}

/* ── Contact ── */
function populateContactTitle() {
  document.getElementById('contactTitleEditor').value = JSON.stringify(get('contact.title') || []);
}
function populateContactFields() {
  const fields = get('contact.fields') || [];
  const el = document.getElementById('contactFields');
  el.innerHTML = fields.map((f, i) => `
    <div class="list-item">
      <div class="list-item__header">
        <span class="list-item__title">${esc(f.label || 'Field ' + (i+1))}</span>
        <button class="list-item__remove" onclick="removeContactField(${i})">&times;</button>
      </div>
      <div class="form-grid">
        <div class="form-group"><label class="form-label">Label</label>
          <input class="form-input" data-list="contact.fields" data-idx="${i}" data-key="label" value="${esc(f.label)}"></div>
        <div class="form-group"><label class="form-label">Type</label>
          <select class="form-select" data-list="contact.fields" data-idx="${i}" data-key="type">
            <option value="link" ${f.type==='link'?'selected':''}>Link</option>
            <option value="text" ${f.type==='text'?'selected':''}>Text</option>
          </select></div>
        <div class="form-group"><label class="form-label">Value</label>
          <input class="form-input" data-list="contact.fields" data-idx="${i}" data-key="value" value="${esc(f.value)}"></div>
        <div class="form-group"><label class="form-label">Href (for links)</label>
          <input class="form-input" data-list="contact.fields" data-idx="${i}" data-key="href" value="${esc(f.href || '')}"></div>
      </div>
    </div>
  `).join('');
}
function addContactField() {
  const arr = get('contact.fields') || [];
  arr.push({ label: 'New Field', type: 'text', value: '', href: '' });
  DATA.contact.fields = arr;
  populateContactFields();
}
function removeContactField(i) { DATA.contact.fields.splice(i, 1); populateContactFields(); }

function populateContactSocials() {
  const socials = get('contact.socials') || [];
  const el = document.getElementById('contactSocials');
  el.innerHTML = socials.map((s, i) => `
    <div class="list-item">
      <div class="list-item__header">
        <span class="list-item__title">${esc(s.label || 'Social ' + (i+1))}</span>
        <button class="list-item__remove" onclick="removeSocial(${i})">&times;</button>
      </div>
      <div class="form-grid">
        <div class="form-group"><label class="form-label">Platform</label>
          <input class="form-input" data-list="contact.socials" data-idx="${i}" data-key="label" value="${esc(s.label)}"></div>
        <div class="form-group"><label class="form-label">Handle</label>
          <input class="form-input" data-list="contact.socials" data-idx="${i}" data-key="handle" value="${esc(s.handle)}"></div>
        <div class="form-group form-group--full"><label class="form-label">URL</label>
          <input class="form-input" data-list="contact.socials" data-idx="${i}" data-key="url" value="${esc(s.url)}"></div>
      </div>
    </div>
  `).join('');
}
function addSocial() {
  const arr = get('contact.socials') || [];
  arr.push({ label: 'Platform', handle: '@username', url: 'https://' });
  DATA.contact.socials = arr;
  populateContactSocials();
}
function removeSocial(i) { DATA.contact.socials.splice(i, 1); populateContactSocials(); }
async function saveContact() {
  collectListInputs('contact.fields');
  collectListInputs('contact.socials');
  try { DATA.contact.title = JSON.parse(document.getElementById('contactTitleEditor').value); } catch {}
  await saveData();
}

/* ── Collect list editor inputs back into DATA ── */
function collectListInputs(listPath) {
  document.querySelectorAll(`[data-list="${listPath}"]`).forEach(el => {
    const idx = parseInt(el.dataset.idx);
    const key = el.dataset.key;
    let val = el.value;
    if (key === 'chips' || key === 'tags' || key === 'tools') {
      val = val.split(',').map(s => s.trim()).filter(Boolean);
    }
    const obj = get(listPath);
    if (obj && obj[idx]) obj[idx][key] = val;
  });
}

/* ── Helpers ── */
function esc(s) { const d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; }

/* ── Image Picker ── */
const pickers = {};
function createImagePicker(containerId, opts) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const id = containerId;
  const accept = opts.accept || '.jpg,.jpeg,.png,.gif,.webp,.svg';
  const folder = opts.folder || 'images';
  const folderLabel = opts.folderLabel || folder;
  el.innerHTML = `
    <div class="img-picker">
      <div class="img-picker__preview" id="${id}-preview">
        <span class="placeholder">No image selected</span>
      </div>
      <div class="img-picker__path" id="${id}-path"></div>
      <div class="img-picker__row">
        <select class="form-select" id="${id}-select" onchange="onPickerSelect('${id}')">
          <option value="">— Select existing —</option>
        </select>
        <label class="btn btn--ghost btn--sm" style="cursor:pointer;white-space:nowrap">
          Upload <input type="file" accept="${accept}" style="display:none" onchange="onPickerUpload('${id}',this.files[0])">
        </label>
      </div>
    </div>`;
  pickers[id] = { folder, accept, inputId: opts.inputId };
  populatePickerDropdown(id);
}

async function populatePickerDropdown(id) {
  const p = pickers[id];
  if (!p) return;
  const sel = document.getElementById(id + '-select');
  try {
    const r = await fetch(API + '?action=list&dir=' + encodeURIComponent(p.folder));
    const d = await r.json();
    if (d.ok && d.files.length) {
      const currentVal = document.getElementById(p.inputId)?.value || '';
      sel.innerHTML = '<option value="">— Select existing —</option>' +
        d.files.filter(f => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(f.name))
          .map(f => `<option value="${esc(f.path)}" ${f.path === currentVal ? 'selected' : ''}>${esc(f.name)} (${f.size})</option>`)
          .join('');
    }
  } catch {}
}

function onPickerSelect(id) {
  const p = pickers[id];
  const val = document.getElementById(id + '-select').value;
  if (val && p.inputId) {
    document.getElementById(p.inputId).value = val;
    // trigger change on data-path input for saveSection
    const dpInput = document.querySelector(`[data-path="${document.getElementById(p.inputId).dataset.path}"]`);
    if (dpInput) dpInput.value = val;
  }
  updatePickerPreview(id, val);
}

function updatePickerPreview(id, path) {
  const preview = document.getElementById(id + '-preview');
  const pathEl = document.getElementById(id + '-path');
  if (path) {
    preview.innerHTML = `<img src="../${esc(path)}" onerror="this.parentElement.innerHTML='<span class=placeholder>Preview unavailable</span>'">`;
    pathEl.textContent = path;
  } else {
    preview.innerHTML = '<span class="placeholder">No image selected</span>';
    pathEl.textContent = '';
  }
}

async function onPickerUpload(id, file) {
  const p = pickers[id];
  const fd = new FormData();
  fd.append('file', file);
  fd.append('folder', p.folder);
  try {
    const r = await fetch(API + '?action=upload', { method: 'POST', headers: { 'X-CSRF-TOKEN': CSRF }, body: fd });
    const d = await r.json();
    if (d.ok) {
      if (p.inputId) document.getElementById(p.inputId).value = d.path;
      await populatePickerDropdown(id);
      const sel = document.getElementById(id + '-select');
      sel.value = d.path;
      updatePickerPreview(id, d.path);
      status('Uploaded: ' + d.path, true);
    } else { status(d.error || 'Upload failed', false); }
  } catch { status('Upload failed', false); }
}

function refreshPicker(id) {
  populatePickerDropdown(id).then(() => {
    const p = pickers[id];
    const val = document.getElementById(p.inputId)?.value || '';
    document.getElementById(id + '-select').value = val;
    updatePickerPreview(id, val);
  });
}

/* ── File Upload ── */
async function uploadForInput(inputId, file, folderOverride) {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('folder', folderOverride || document.getElementById('uploadFolder').value);
  try {
    const r = await fetch(API + '?action=upload', { method: 'POST', headers: { 'X-CSRF-TOKEN': CSRF }, body: fd });
    const d = await r.json();
    if (d.ok) {
      document.getElementById(inputId).value = d.path;
      status('Uploaded: ' + d.path, true);
    } else { status(d.error || 'Upload failed', false); }
  } catch (e) { status('Upload failed', false); }
}
async function uploadForListItem(listPath, idx, key, file) {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('folder', document.getElementById('uploadFolder').value);
  try {
    const r = await fetch(API + '?action=upload', { method: 'POST', headers: { 'X-CSRF-TOKEN': CSRF }, body: fd });
    const d = await r.json();
    if (d.ok) {
      const obj = get(listPath);
      if (obj && obj[idx]) obj[idx][key] = d.path;
      populateWorkProjects();
      status('Uploaded: ' + d.path, true);
    } else { status(d.error || 'Upload failed', false); }
  } catch (e) { status('Upload failed', false); }
}

document.getElementById('fileInput').addEventListener('change', function() {
  if (this.files[0]) {
    const fd = new FormData();
    fd.append('file', this.files[0]);
    fd.append('folder', document.getElementById('uploadFolder').value);
    fetch(API + '?action=upload', { method: 'POST', headers: { 'X-CSRF-TOKEN': CSRF }, body: fd })
      .then(r => r.json()).then(d => {
        if (d.ok) {
          status('Uploaded: ' + d.path, true);
          document.getElementById('uploadResult').innerHTML =
            '<div class="upload-path">' + esc(d.path) + '</div>';
          listFiles();
        } else status(d.error, false);
      }).catch(() => status('Upload failed', false));
    this.value = '';
  }
});
const dz = document.getElementById('dropZone');
dz.addEventListener('dragover', e => { e.preventDefault(); dz.classList.add('dragover'); });
dz.addEventListener('dragleave', () => dz.classList.remove('dragover'));
dz.addEventListener('drop', e => {
  e.preventDefault(); dz.classList.remove('dragover');
  if (e.dataTransfer.files[0]) {
    const fd = new FormData();
    fd.append('file', e.dataTransfer.files[0]);
    fd.append('folder', document.getElementById('uploadFolder').value);
    fetch(API + '?action=upload', { method: 'POST', headers: { 'X-CSRF-TOKEN': CSRF }, body: fd })
      .then(r => r.json()).then(d => {
        if (d.ok) {
          status('Uploaded: ' + d.path, true);
          document.getElementById('uploadResult').innerHTML =
            '<div class="upload-path">' + esc(d.path) + '</div>';
          listFiles();
        } else status(d.error, false);
      }).catch(() => status('Upload failed', false));
  }
});

/* ── File Browser ── */
async function listFiles() {
  const dir = document.getElementById('browseDir').value;
  try {
    const r = await fetch(API + '?action=list&dir=' + encodeURIComponent(dir));
    const d = await r.json();
    const el = document.getElementById('fileList');
    if (!d.ok || !d.files.length) { el.innerHTML = '<div style="color:#555;font-size:12px;padding:12px">No files found</div>'; return; }
    el.innerHTML = d.files.map(f => {
      const icon = f.type.includes('svg') ? '&#9670;' : f.type.includes('image') ? '&#9634;' : '&#9644;';
      return '<div class="file-item">' +
        '<div class="file-item__name"><span class="file-item__icon">' + icon + '</span><span>' + esc(f.name) + '</span></div>' +
        '<span class="file-item__size">' + f.size + '</span>' +
        '<div class="file-item__actions">' +
        '<button class="file-item__btn" onclick="downloadFile(\'' + esc(f.path) + '\')" title="Download">&#8595;</button>' +
        '<button class="file-item__btn file-item__btn--del" onclick="deleteFile(\'' + esc(f.path) + '\',\'' + esc(f.name) + '\')" title="Delete">&times;</button>' +
        '</div></div>';
    }).join('');
  } catch { document.getElementById('fileList').innerHTML = '<div style="color:#555;font-size:12px">Error</div>'; }
}
async function deleteFile(path, name) {
  if (!confirm('Delete ' + name + '?')) return;
  try {
    const r = await fetch(API + '?action=delete', { method: 'POST', headers: hdrs(true), body: JSON.stringify({ path }) });
    const d = await r.json();
    status(d.ok ? 'Deleted ' + name : (d.error || 'Failed'), !!d.ok);
    listFiles();
  } catch { status('Delete failed', false); }
}
function downloadFile(path) {
  window.open(API + '?action=download&path=' + encodeURIComponent(path), '_blank');
}

/* ── Raw JSON ── */
function populateRawJson() {
  document.getElementById('jsonEditor').value = JSON.stringify(DATA, null, 2);
}
async function loadRawJson() {
  try {
    const r = await fetch(API + '?action=get');
    const d = await r.json();
    DATA = d.data;
    populateRawJson();
    status('Reloaded', true);
  } catch (e) { status('Failed', false); }
}
async function saveRawJson() {
  const raw = document.getElementById('jsonEditor').value.trim();
  try { JSON.parse(raw); } catch { status('Invalid JSON', false); return; }
  try {
    const r = await fetch(API + '?action=save', {
      method: 'POST', headers: hdrs(true),
      body: JSON.stringify({ data: JSON.parse(raw) })
    });
    const d = await r.json();
    if (d.ok) { DATA = JSON.parse(raw); populateAll(); }
    status(d.ok ? 'Saved' : (d.error || 'Failed'), !!d.ok);
  } catch (e) { status('Failed', false); }
}

/* ── Sidebar Navigation ── */
document.querySelectorAll('.sidebar__item').forEach(item => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.sidebar__item').forEach(i => i.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    item.classList.add('active');
    const panel = document.getElementById('panel-' + item.dataset.panel);
    if (panel) panel.classList.add('active');
  });
});

/* ── Logout ── */
async function logout() {
  try { await fetch('auth.php?action=logout'); } catch {}
  window.location = 'index.php';
}

/* ── Init ── */
loadData();
listFiles();
</script>
</body>
</html>
