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
  <title>ZK CMS — Portfolio Control Center</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --obsidian: #000d10;
      --white: #ffffff;
      --mist: #8e8e95;
      --sienna: #bc7155;
      --sienna-15: rgba(188, 113, 85, 0.15);
      --sienna-25: rgba(188, 113, 85, 0.25);
      --surface: #070b0c;
      --surface-elevated: #0d1315;
      --card: #11181a;
      --card-hover: #151e20;
      --border: #1c2629;
      --border-focus: #bc7155;
      --input-bg: #090e10;
      --danger: #ff5555;
      --danger-bg: rgba(255, 85, 85, 0.1);
      --success: #44bb88;
      --success-bg: rgba(68, 187, 136, 0.1);
      --font: 'Inter', system-ui, -apple-system, sans-serif;
      --mono: 'JetBrains Mono', monospace;
      --sidebar-w: 260px;
    }

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: var(--font);
      background: var(--surface);
      color: #d1d5db;
      font-size: 14px;
      line-height: 1.5;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    a { color: inherit; text-decoration: none; }

    /* ── TOPBAR ── */
    .topbar {
      position: fixed;
      top: 0; left: 0; right: 0;
      z-index: 100;
      height: 60px;
      background: var(--obsidian);
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
    }

    .topbar__left {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .topbar__brand {
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 800;
      font-size: 16px;
      color: var(--white);
      letter-spacing: -0.3px;
    }

    .topbar__badge {
      font-family: var(--mono);
      font-size: 10px;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
      background: var(--sienna-15);
      color: var(--sienna);
      border: 1px solid rgba(188, 113, 85, 0.3);
    }

    .topbar__right {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .save-indicator {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      font-family: var(--mono);
      color: var(--mist);
      margin-right: 8px;
    }

    .save-indicator__dot {
      width: 8px; height: 8px;
      border-radius: 50%;
      background: var(--success);
    }

    .save-indicator__dot--unsaved {
      background: #f59e0b;
      animation: pulse 1.5s infinite;
    }

    /* ── LAYOUT ── */
    .layout {
      display: flex;
      margin-top: 60px;
      min-height: calc(100vh - 60px);
    }

    /* ── SIDEBAR ── */
    .sidebar {
      position: fixed;
      top: 60px; bottom: 0; left: 0;
      width: var(--sidebar-w);
      background: #090e10;
      border-right: 1px solid var(--border);
      padding: 20px 12px;
      overflow-y: auto;
      z-index: 90;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .sidebar__group {
      font-family: var(--mono);
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--mist);
      padding: 12px 12px 6px;
    }

    .sidebar__item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 14px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      color: #9ca3af;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .sidebar__item:hover {
      background: var(--surface-elevated);
      color: var(--white);
    }

    .sidebar__item.active {
      background: var(--sienna-15);
      color: var(--sienna);
      font-weight: 700;
    }

    .sidebar__icon {
      font-size: 16px;
      width: 20px;
      text-align: center;
    }

    /* ── MAIN CONTENT ── */
    .main {
      margin-left: var(--sidebar-w);
      flex: 1;
      padding: 32px 40px 80px;
      max-width: 1300px;
    }

    /* ── PANELS ── */
    .panel {
      display: none;
      flex-direction: column;
      gap: 24px;
    }

    .panel.active {
      display: flex;
    }

    .panel__header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 16px;
      padding-bottom: 20px;
      border-bottom: 1px solid var(--border);
      flex-wrap: wrap;
    }

    .panel__title {
      font-size: 26px;
      font-weight: 800;
      color: var(--white);
      letter-spacing: -0.02em;
    }

    .panel__desc {
      font-size: 13px;
      color: var(--mist);
      margin-top: 4px;
    }

    /* ── BUTTONS ── */
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      height: 38px;
      padding: 0 16px;
      border-radius: 8px;
      font-family: var(--font);
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      border: 1px solid transparent;
      transition: all 0.15s ease;
      white-space: nowrap;
    }

    .btn--primary {
      background: var(--sienna);
      color: #fff;
      border-color: var(--sienna);
    }

    .btn--primary:hover {
      background: #cf8165;
    }

    .btn--secondary {
      background: var(--card);
      color: var(--white);
      border-color: var(--border);
    }

    .btn--secondary:hover {
      background: var(--card-hover);
      border-color: #2e3b3e;
    }

    .btn--ghost {
      background: transparent;
      color: #9ca3af;
      border-color: var(--border);
    }

    .btn--ghost:hover {
      background: var(--surface-elevated);
      color: var(--white);
    }

    .btn--danger {
      background: var(--danger-bg);
      color: var(--danger);
      border-color: rgba(255, 85, 85, 0.3);
    }

    .btn--danger:hover {
      background: var(--danger);
      color: #fff;
    }

    .btn--sm {
      height: 30px;
      padding: 0 10px;
      font-size: 12px;
    }

    /* ── METRIC TILES (Dashboard Home) ── */
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
    }

    .metric-card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      position: relative;
    }

    .metric-card__num {
      font-size: 32px;
      font-weight: 800;
      color: var(--white);
      font-family: var(--mono);
    }

    .metric-card__label {
      font-size: 12px;
      font-weight: 600;
      color: var(--mist);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    /* ── PROJECT TILES GRID (Visual Project Manager) ── */
    .project-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 20px;
    }

    .project-tile {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 14px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: transform 0.15s ease, border-color 0.15s ease;
    }

    .project-tile:hover {
      border-color: #2e3e42;
      transform: translateY(-2px);
    }

    .project-tile__banner {
      width: 100%;
      height: 160px;
      background: #000;
      position: relative;
      overflow: hidden;
    }

    .project-tile__banner img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .project-tile__badge {
      position: absolute;
      top: 10px;
      left: 10px;
      background: rgba(0, 13, 16, 0.85);
      backdrop-filter: blur(6px);
      color: var(--sienna);
      font-family: var(--mono);
      font-size: 11px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 6px;
      border: 1px solid rgba(188, 113, 85, 0.3);
    }

    .project-tile__featured {
      position: absolute;
      top: 10px;
      right: 10px;
      background: rgba(0, 13, 16, 0.85);
      color: #f59e0b;
      font-size: 11px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 6px;
      border: 1px solid rgba(245, 158, 11, 0.3);
    }

    .project-tile__body {
      padding: 18px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      flex: 1;
    }

    .project-tile__title {
      font-size: 18px;
      font-weight: 700;
      color: var(--white);
    }

    .project-tile__tag {
      font-size: 11px;
      font-weight: 600;
      color: var(--mist);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .project-tile__desc {
      font-size: 13px;
      color: #9ca3af;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .project-tile__footer {
      padding: 12px 18px;
      border-top: 1px solid var(--border);
      background: var(--surface-elevated);
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
    }

    /* ── FORMS & CARDS ── */
    .form-card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .form-card__title {
      font-size: 16px;
      font-weight: 700;
      color: var(--white);
      padding-bottom: 12px;
      border-bottom: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 16px;
    }

    .form-grid--full {
      grid-template-columns: 1fr;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .form-group--full {
      grid-column: 1 / -1;
    }

    .form-label {
      font-size: 12px;
      font-weight: 600;
      color: #9ca3af;
    }

    .form-input, .form-textarea, .form-select {
      width: 100%;
      background: var(--input-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 10px 14px;
      color: var(--white);
      font-family: var(--font);
      font-size: 13px;
      outline: none;
      transition: border-color 0.15s ease;
    }

    .form-input:focus, .form-textarea:focus, .form-select:focus {
      border-color: var(--border-focus);
      box-shadow: 0 0 0 2px rgba(188, 113, 85, 0.2);
    }

    .form-textarea {
      resize: vertical;
      line-height: 1.5;
    }

    /* ── PROJECT DRAWER / MODAL ── */
    .drawer {
      position: fixed;
      inset: 0;
      z-index: 300;
      display: flex;
      justify-content: flex-end;
      background: rgba(0, 13, 16, 0.8);
      backdrop-filter: blur(8px);
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.25s ease;
    }

    .drawer.is-open {
      opacity: 1;
      pointer-events: auto;
    }

    .drawer__panel {
      width: 100%;
      max-width: 780px;
      height: 100vh;
      background: #0c1113;
      border-left: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      transform: translateX(100%);
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .drawer.is-open .drawer__panel {
      transform: translateX(0);
    }

    .drawer__header {
      padding: 20px 24px;
      border-bottom: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .drawer__tabs {
      display: flex;
      gap: 4px;
      padding: 0 24px;
      border-bottom: 1px solid var(--border);
      background: #090e10;
    }

    .drawer__tab {
      padding: 12px 16px;
      font-size: 13px;
      font-weight: 600;
      color: var(--mist);
      cursor: pointer;
      border-bottom: 2px solid transparent;
      transition: all 0.15s ease;
    }

    .drawer__tab:hover { color: var(--white); }
    .drawer__tab.active {
      color: var(--sienna);
      border-bottom-color: var(--sienna);
    }

    .drawer__body {
      padding: 24px;
      overflow-y: auto;
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .drawer__tab-content {
      display: none;
      flex-direction: column;
      gap: 16px;
    }

    .drawer__tab-content.active {
      display: flex;
    }

    .drawer__footer {
      padding: 16px 24px;
      border-top: 1px solid var(--border);
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      background: #090e10;
    }

    /* Multi-Image Gallery Manager */
    .gallery-manager {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 12px;
      margin-top: 8px;
    }

    .gallery-card {
      position: relative;
      aspect-ratio: 16/10;
      border-radius: 8px;
      overflow: hidden;
      background: #000;
      border: 1px solid var(--border);
    }

    .gallery-card img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .gallery-card__del {
      position: absolute;
      top: 4px;
      right: 4px;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.8);
      color: var(--danger);
      border: none;
      cursor: pointer;
      display: grid;
      place-items: center;
      font-size: 14px;
    }

    .gallery-card__cover {
      position: absolute;
      bottom: 4px;
      left: 4px;
      background: var(--sienna);
      color: #fff;
      font-size: 9px;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
    }

    .dropzone {
      border: 2px dashed var(--border);
      border-radius: 10px;
      padding: 24px;
      text-align: center;
      cursor: pointer;
      transition: all 0.15s ease;
      background: var(--input-bg);
    }

    .dropzone:hover {
      border-color: var(--sienna);
      background: var(--sienna-15);
    }

    /* Toast */
    .toast {
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: var(--card);
      border: 1px solid var(--border);
      color: var(--white);
      padding: 12px 20px;
      border-radius: 10px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      z-index: 500;
      display: flex;
      align-items: center;
      gap: 10px;
      transform: translateY(100px);
      opacity: 0;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .toast.show {
      transform: translateY(0);
      opacity: 1;
    }

    .toast--success { border-color: var(--success); }
    .toast--error { border-color: var(--danger); }
  </style>
</head>

<body>
  <!-- TOPBAR -->
  <header class="topbar">
    <div class="topbar__left">
      <div class="topbar__brand">
        <span>ZENITH KANDEL</span>
        <span class="topbar__badge">CMS v2.2</span>
      </div>
    </div>

    <div class="topbar__right">
      <div class="save-indicator">
        <span class="save-indicator__dot" id="saveDot"></span>
        <span id="saveStatus">All saved</span>
      </div>
      <a href="../projects/index.html" target="_blank" class="btn btn--ghost btn--sm">
        <span>👁 Projects Archive ↗</span>
      </a>
      <a href="../index.html" target="_blank" class="btn btn--ghost btn--sm">
        <span>👁 Live Portfolio ↗</span>
      </a>
      <button class="btn btn--primary btn--sm" onclick="saveAllChanges()">
        <span>💾 Save Data</span>
      </button>
      <button class="btn btn--ghost btn--sm" onclick="logout()">Sign Out</button>
    </div>
  </header>

  <div class="layout">
    <!-- SIDEBAR -->
    <aside class="sidebar">
      <div class="sidebar__group">Overview</div>
      <div class="sidebar__item active" data-panel="overview"><span class="sidebar__icon">📊</span> Dashboard</div>

      <div class="sidebar__group">Content Modules</div>
      <div class="sidebar__item" data-panel="projects"><span class="sidebar__icon">🚀</span> Projects &amp; Archive</div>
      <div class="sidebar__item" data-panel="hero"><span class="sidebar__icon">✦</span> Hero &amp; Brand</div>
      <div class="sidebar__item" data-panel="about"><span class="sidebar__icon">✎</span> About &amp; Story</div>
      <div class="sidebar__item" data-panel="stack"><span class="sidebar__icon">🛠</span> Tech Stack</div>
      <div class="sidebar__item" data-panel="research"><span class="sidebar__icon">🛡</span> Research &amp; Security</div>
      <div class="sidebar__item" data-panel="contact"><span class="sidebar__icon">✉</span> Contact &amp; Socials</div>
      <div class="sidebar__item" data-panel="footer"><span class="sidebar__icon">◈</span> Footer &amp; Nav</div>

      <div class="sidebar__group">System &amp; Data</div>
      <div class="sidebar__item" data-panel="files"><span class="sidebar__icon">📁</span> Media Storage</div>
      <div class="sidebar__item" data-panel="json"><span class="sidebar__icon">{ }</span> Raw JSON</div>
    </aside>

    <!-- MAIN PANELS -->
    <main class="main">

      <!-- ─── 0. OVERVIEW ─── -->
      <section class="panel active" id="panel-overview">
        <div class="panel__header">
          <div>
            <h1 class="panel__title">Dashboard Overview</h1>
            <p class="panel__desc">Instant summary and quick actions for your portfolio content</p>
          </div>
          <button class="btn btn--primary" onclick="openNewProjectDrawer()">+ New Project</button>
        </div>

        <div class="metrics-grid">
          <div class="metric-card">
            <span class="metric-card__num" id="statProjectsCount">0</span>
            <span class="metric-card__label">Total Projects</span>
          </div>
          <div class="metric-card">
            <span class="metric-card__num" id="statFeaturedCount">0</span>
            <span class="metric-card__label">Featured in Carousel</span>
          </div>
          <div class="metric-card">
            <span class="metric-card__num" id="statStackCount">0</span>
            <span class="metric-card__label">Stack Skill Rows</span>
          </div>
          <div class="metric-card">
            <span class="metric-card__num" id="statDisclosuresCount">0</span>
            <span class="metric-card__label">Security Disclosures</span>
          </div>
        </div>

        <div class="form-card">
          <div class="form-card__title">
            <span>Quick Actions</span>
          </div>
          <div style="display:flex;gap:12px;flex-wrap:wrap;">
            <button class="btn btn--secondary" onclick="switchPanel('projects')">🚀 Manage Projects Archive</button>
            <button class="btn btn--secondary" onclick="switchPanel('files')">📁 Browse Uploaded Images</button>
            <button class="btn btn--secondary" onclick="switchPanel('json')">{ } Direct data.json Editor</button>
          </div>
        </div>
      </section>

      <!-- ─── 1. PROJECTS & ARCHIVE (Visual Project Manager) ─── -->
      <section class="panel" id="panel-projects">
        <div class="panel__header">
          <div>
            <h1 class="panel__title">Projects &amp; Archive</h1>
            <p class="panel__desc">Manage all projects, high-res image galleries, categories, and carousel visibility</p>
          </div>
          <div style="display:flex;gap:10px;">
            <input type="text" id="projectSearchInput" class="form-input" style="width:240px;" placeholder="Filter projects..." oninput="filterProjectCards(this.value)">
            <button class="btn btn--primary" onclick="openNewProjectDrawer()">+ Add Project</button>
          </div>
        </div>

        <div class="project-grid" id="projectCardGrid">
          <!-- Populated by JS -->
        </div>
      </section>

      <!-- ─── 2. HERO & BRAND ─── -->
      <section class="panel" id="panel-hero">
        <div class="panel__header">
          <div>
            <h1 class="panel__title">Hero &amp; Brand</h1>
            <p class="panel__desc">Name, role, hero headlines, portrait photo, and marquee lines</p>
          </div>
        </div>

        <div class="form-card">
          <div class="form-card__title">Brand &amp; Identity</div>
          <div class="form-grid">
            <div class="form-group"><label class="form-label">Full Name</label><input class="form-input" data-path="brand.name"></div>
            <div class="form-group"><label class="form-label">Short Name / Monogram</label><input class="form-input" data-path="brand.short"></div>
            <div class="form-group"><label class="form-label">Location Tag</label><input class="form-input" data-path="brand.location"></div>
            <div class="form-group"><label class="form-label">Primary Role</label><input class="form-input" data-path="brand.role"></div>
          </div>
        </div>

        <div class="form-card">
          <div class="form-card__title">Hero Section</div>
          <div class="form-grid">
            <div class="form-group"><label class="form-label">Kicker Badge</label><input class="form-input" data-path="hero.index"></div>
            <div class="form-group"><label class="form-label">Hero Badge Text</label><input class="form-input" data-path="hero.badge"></div>
            <div class="form-group form-group--full"><label class="form-label">Subtitle / Hook</label><textarea class="form-textarea" rows="3" data-path="hero.sub"></textarea></div>
            <div class="form-group form-group--full">
              <label class="form-label">Portrait Photo</label>
              <input type="text" class="form-input" data-path="hero.portrait.src" id="heroPortraitSrc">
              <div style="margin-top:8px;">
                <input type="file" id="heroPortraitUploader" accept="image/*" onchange="uploadSingleFile(this, 'heroPortraitSrc', 'images')">
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ─── 3. ABOUT & STORY ─── -->
      <section class="panel" id="panel-about">
        <div class="panel__header">
          <div>
            <h1 class="panel__title">About &amp; Story</h1>
            <p class="panel__desc">Intro paragraphs and editorial feature cards</p>
          </div>
        </div>

        <div class="form-card">
          <div class="form-card__title">About Content</div>
          <div class="form-grid form-grid--full">
            <div class="form-group"><label class="form-label">Section Index</label><input class="form-input" data-path="about.index"></div>
            <div class="form-group"><label class="form-label">Bio Paragraphs (JSON array)</label><textarea class="form-textarea" rows="6" id="aboutParasEditor"></textarea></div>
          </div>
        </div>
      </section>

      <!-- ─── 4. TECH STACK ─── -->
      <section class="panel" id="panel-stack">
        <div class="panel__header">
          <div>
            <h1 class="panel__title">Tech Stack</h1>
            <p class="panel__desc">Skill categories and tool lists</p>
          </div>
          <button class="btn btn--primary btn--sm" onclick="addStackRow()">+ Add Row</button>
        </div>

        <div class="form-card">
          <div class="form-card__title">Stack Header</div>
          <div class="form-grid form-grid--full">
            <div class="form-group"><label class="form-label">Intro Description</label><textarea class="form-textarea" rows="2" data-path="stack.intro"></textarea></div>
          </div>
        </div>

        <div id="stackRowsContainer" style="display:flex;flex-direction:column;gap:12px;"></div>
      </section>

      <!-- ─── 5. RESEARCH & SECURITY ─── -->
      <section class="panel" id="panel-research">
        <div class="panel__header">
          <div>
            <h1 class="panel__title">Research &amp; Security</h1>
            <p class="panel__desc">Security disclosures and responsible vulnerability findings</p>
          </div>
          <button class="btn btn--primary btn--sm" onclick="addDisclosure()">+ Add Disclosure</button>
        </div>

        <div id="disclosuresContainer" style="display:flex;flex-direction:column;gap:12px;"></div>
      </section>

      <!-- ─── 6. CONTACT ─── -->
      <section class="panel" id="panel-contact">
        <div class="panel__header">
          <div>
            <h1 class="panel__title">Contact &amp; Socials</h1>
            <p class="panel__desc">Email, handles, and direct reachout links</p>
          </div>
        </div>

        <div class="form-card">
          <div class="form-card__title">Direct Channels</div>
          <div class="form-grid" id="contactFieldsGrid"></div>
        </div>
      </section>

      <!-- ─── 7. FOOTER ─── -->
      <section class="panel" id="panel-footer">
        <div class="panel__header">
          <div>
            <h1 class="panel__title">Footer &amp; Meta</h1>
            <p class="panel__desc">Meta tags and footer information</p>
          </div>
        </div>

        <div class="form-card">
          <div class="form-card__title">Meta / SEO</div>
          <div class="form-grid">
            <div class="form-group"><label class="form-label">Site Title</label><input class="form-input" data-path="meta.title"></div>
            <div class="form-group form-group--full"><label class="form-label">Meta Description</label><textarea class="form-textarea" rows="2" data-path="meta.description"></textarea></div>
          </div>
        </div>
      </section>

      <!-- ─── 8. MEDIA STORAGE ─── -->
      <section class="panel" id="panel-files">
        <div class="panel__header">
          <div>
            <h1 class="panel__title">Media Storage</h1>
            <p class="panel__desc">Browse, upload, and inspect assets</p>
          </div>
        </div>

        <div class="form-card">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <div id="fbBreadcrumb" style="font-family:var(--mono);font-size:13px;color:var(--sienna);">assets/</div>
            <button class="btn btn--secondary btn--sm" onclick="fbNavigate(fbCurrent)">Refresh Folder</button>
          </div>
          <div id="fileGrid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:12px;margin-top:16px;"></div>
        </div>
      </section>

      <!-- ─── 9. RAW JSON ─── -->
      <section class="panel" id="panel-json">
        <div class="panel__header">
          <div>
            <h1 class="panel__title">Raw data.json</h1>
            <p class="panel__desc">Directly view and edit master data (auto-backups are created on save)</p>
          </div>
          <button class="btn btn--primary" onclick="saveRawJson()">Save JSON</button>
        </div>

        <textarea id="jsonEditor" class="form-textarea" style="height:550px;font-family:var(--mono);font-size:12px;background:#050809;" spellcheck="false"></textarea>
      </section>

    </main>
  </div>

  <!-- ─── PROJECT SLIDE-OVER DRAWER ─── -->
  <div class="drawer" id="projectDrawer">
    <div class="drawer__panel">
      <div class="drawer__header">
        <div>
          <h2 id="drawerTitle" style="font-size:18px;font-weight:700;color:#fff;">Edit Project</h2>
          <span style="font-size:12px;color:var(--mist);">Manage details, images &amp; links</span>
        </div>
        <button class="btn btn--ghost btn--sm" onclick="closeProjectDrawer()">&times; Close</button>
      </div>

      <div class="drawer__tabs">
        <div class="drawer__tab active" onclick="switchDrawerTab(0)">1. Core Info</div>
        <div class="drawer__tab" onclick="switchDrawerTab(1)">2. Story &amp; Tech</div>
        <div class="drawer__tab" onclick="switchDrawerTab(2)">3. Image Gallery</div>
        <div class="drawer__tab" onclick="switchDrawerTab(3)">4. Links &amp; Code</div>
      </div>

      <div class="drawer__body">
        <!-- Tab 0: Core Info -->
        <div class="drawer__tab-content active" id="drawerTab0">
          <input type="hidden" id="editProjIndex" value="-1">
          <div class="form-group"><label class="form-label">Project Title</label><input type="text" id="editProjTitle" class="form-input"></div>
          <div class="form-grid">
            <div class="form-group"><label class="form-label">Category</label>
              <select id="editProjCategory" class="form-select">
                <option value="Civic Tech">Civic Tech</option>
                <option value="Hardware & IoT">Hardware & IoT</option>
                <option value="Transit">Transit</option>
                <option value="EdTech">EdTech</option>
                <option value="Security Research">Security Research</option>
                <option value="Web Apps">Web Apps</option>
              </select>
            </div>
            <div class="form-group"><label class="form-label">Tagline (e.g. Civic Tech · Web)</label><input type="text" id="editProjTag" class="form-input"></div>
          </div>
          <div class="form-grid">
            <div class="form-group"><label class="form-label">Year</label><input type="text" id="editProjYear" class="form-input" placeholder="2025"></div>
            <div class="form-group"><label class="form-label">Show in Home Carousel?</label>
              <select id="editProjFeatured" class="form-select">
                <option value="true">★ Yes (Featured in Home Carousel)</option>
                <option value="false">☆ No (Projects Archive Only)</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Tab 1: Story & Tech -->
        <div class="drawer__tab-content" id="drawerTab1">
          <div class="form-group"><label class="form-label">Card Summary (Short Description)</label><textarea id="editProjDesc" class="form-textarea" rows="3"></textarea></div>
          <div class="form-group"><label class="form-label">Overview &amp; Problem Statement (Modal Full Details)</label><textarea id="editProjLongDesc" class="form-textarea" rows="5"></textarea></div>
          <div class="form-group"><label class="form-label">Tech Stack Chips (comma separated)</label><input type="text" id="editProjChips" class="form-input" placeholder="PHP, MySQL, Hardware"></div>
        </div>

        <!-- Tab 2: Image Gallery -->
        <div class="drawer__tab-content" id="drawerTab2">
          <div class="form-group">
            <label class="form-label">Primary Cover Image URL</label>
            <input type="text" id="editProjCover" class="form-input">
          </div>

          <div class="dropzone" onclick="document.getElementById('multiImagePicker').click()">
            <div style="font-size:24px;margin-bottom:6px;">📸</div>
            <div style="font-weight:600;color:#fff;">Click or Drag images to upload to Gallery</div>
            <div style="font-size:12px;color:var(--mist);margin-top:4px;">Supports JPG, PNG, WEBP, SVG up to 10MB</div>
            <input type="file" id="multiImagePicker" multiple accept="image/*" style="display:none;" onchange="handleGalleryUpload(this)">
          </div>

          <div class="form-group">
            <label class="form-label">Gallery Images (Browse / Reorder)</label>
            <div class="gallery-manager" id="drawerGalleryManager"></div>
          </div>
        </div>

        <!-- Tab 3: Links & Code -->
        <div class="drawer__tab-content" id="drawerTab3">
          <div class="form-group"><label class="form-label">GitHub Repository URL</label><input type="text" id="editProjGithub" class="form-input" placeholder="https://github.com/..."></div>
          <div class="form-group"><label class="form-label">Live Demo / Website URL</label><input type="text" id="editProjLive" class="form-input" placeholder="https://..."></div>
        </div>
      </div>

      <div class="drawer__footer">
        <button class="btn btn--ghost" onclick="closeProjectDrawer()">Cancel</button>
        <button class="btn btn--primary" onclick="saveProjectFromDrawer()">Save Project</button>
      </div>
    </div>
  </div>

  <!-- TOAST NOTIFICATION -->
  <div class="toast" id="toast">
    <span id="toastIcon">✓</span>
    <span id="toastMsg">Operation completed</span>
  </div>

  <script>
    const CSRF = '<?= htmlspecialchars($csrf) ?>';
    const API = 'api.php';
    let DATA = {};
    let isDirty = false;

    function hdrs(json) {
      const h = { 'X-CSRF-TOKEN': CSRF };
      if (json) h['Content-Type'] = 'application/json';
      return h;
    }

    function toast(msg, isSuccess = true) {
      const el = document.getElementById('toast');
      const icon = document.getElementById('toastIcon');
      const text = document.getElementById('toastMsg');
      el.className = 'toast ' + (isSuccess ? 'toast--success' : 'toast--error') + ' show';
      icon.textContent = isSuccess ? '✓' : '✕';
      text.textContent = msg;
      clearTimeout(el._t);
      el._t = setTimeout(() => el.classList.remove('show'), 3500);
    }

    function setDirty(dirty = true) {
      isDirty = dirty;
      const dot = document.getElementById('saveDot');
      const text = document.getElementById('saveStatus');
      if (dot && text) {
        dot.className = 'save-indicator__dot' + (dirty ? ' save-indicator__dot--unsaved' : '');
        text.textContent = dirty ? 'Unsaved changes' : 'All saved';
      }
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
      setDirty(true);
    }

    /* ── Load Data ── */
    async function loadData() {
      try {
        const r = await fetch(API + '?action=get');
        const d = await r.json();
        if (!d.ok) throw new Error(d.error);
        DATA = d.data;
        populateAll();
        setDirty(false);
      } catch (e) { toast('Failed to load data: ' + e.message, false); }
    }

    function populateAll() {
      // Inputs with data-path
      document.querySelectorAll('[data-path]').forEach(el => {
        const v = get(el.dataset.path);
        if (v != null) el.value = v;
      });

      // Bio paras
      const paras = get('about.paragraphs') || [];
      const parasEl = document.getElementById('aboutParasEditor');
      if (parasEl) parasEl.value = JSON.stringify(paras, null, 2);

      renderOverviewStats();
      renderProjectCards();
      renderStackRows();
      renderDisclosures();
      renderContactFields();
      populateRawJson();
    }

    /* ── Overview Stats ── */
    function renderOverviewStats() {
      const projects = DATA.projects || (DATA.work && DATA.work.projects) || [];
      const featured = projects.filter(p => p.featured).length;
      const stack = (DATA.stack && DATA.stack.rows) ? DATA.stack.rows.length : 0;
      const disc = (DATA.research && DATA.research.disclosures) ? DATA.research.disclosures.length : 0;

      document.getElementById('statProjectsCount').textContent = projects.length;
      document.getElementById('statFeaturedCount').textContent = featured;
      document.getElementById('statStackCount').textContent = stack;
      document.getElementById('statDisclosuresCount').textContent = disc;
    }

    /* ── Project Cards Manager ── */
    function renderProjectCards() {
      const container = document.getElementById('projectCardGrid');
      if (!container) return;

      const projects = DATA.projects || [];
      container.innerHTML = projects.map((p, i) => {
        const img = p.coverImage || p.image || (p.images && p.images[0]) || p.illustration || 'assets/svg/emblems/work.svg';
        const imgCount = (p.images && p.images.length) || 1;

        return `
          <div class="project-tile" data-index="${i}" data-title="${esc(p.title || '')}" data-cat="${esc(p.category || '')}">
            <div class="project-tile__banner">
              <img src="../${esc(img)}" alt="" onerror="this.src='../assets/svg/emblems/work.svg'" />
              <span class="project-tile__badge">${esc(p.num || String(i+1).padStart(2,'0'))} · ${esc(p.category || 'General')}</span>
              ${p.featured ? '<span class="project-tile__featured">★ Featured</span>' : ''}
            </div>
            <div class="project-tile__body">
              <h3 class="project-tile__title">${esc(p.title || 'Untitled Project')}</h3>
              <span class="project-tile__tag">${esc(p.tag || '')} · ${esc(p.year || '')}</span>
              <p class="project-tile__desc">${esc(p.description || '')}</p>
            </div>
            <div class="project-tile__footer">
              <div style="display:flex;gap:4px;">
                <button class="btn btn--ghost btn--sm" onclick="moveProjectTile(${i}, -1)" ${i === 0 ? 'disabled' : ''}>↑</button>
                <button class="btn btn--ghost btn--sm" onclick="moveProjectTile(${i}, 1)" ${i === projects.length - 1 ? 'disabled' : ''}>↓</button>
              </div>
              <div style="display:flex;gap:6px;">
                <button class="btn btn--danger btn--sm" onclick="deleteProject(${i})">🗑</button>
                <button class="btn btn--secondary btn--sm" onclick="openProjectDrawer(${i})">✎ Edit</button>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }

    function filterProjectCards(q) {
      const query = (q || '').trim().toLowerCase();
      document.querySelectorAll('#projectCardGrid .project-tile').forEach(tile => {
        const title = (tile.dataset.title || '').toLowerCase();
        const cat = (tile.dataset.cat || '').toLowerCase();
        tile.style.display = (!query || title.includes(query) || cat.includes(query)) ? '' : 'none';
      });
    }

    function moveProjectTile(i, dir) {
      const target = i + dir;
      if (target < 0 || target >= DATA.projects.length) return;
      const temp = DATA.projects[i];
      DATA.projects[i] = DATA.projects[target];
      DATA.projects[target] = temp;
      setDirty(true);
      renderProjectCards();
    }

    function deleteProject(i) {
      if (confirm('Are you sure you want to delete this project?')) {
        DATA.projects.splice(i, 1);
        setDirty(true);
        renderProjectCards();
        renderOverviewStats();
      }
    }

    /* ── Project Drawer Management ── */
    let currentDrawerGallery = [];

    function openNewProjectDrawer() {
      document.getElementById('editProjIndex').value = '-1';
      document.getElementById('drawerTitle').textContent = 'New Project';
      document.getElementById('editProjTitle').value = 'New Project';
      document.getElementById('editProjCategory').value = 'Civic Tech';
      document.getElementById('editProjTag').value = 'Civic Tech · Web';
      document.getElementById('editProjYear').value = '2025';
      document.getElementById('editProjFeatured').value = 'true';
      document.getElementById('editProjDesc').value = '';
      document.getElementById('editProjLongDesc').value = '';
      document.getElementById('editProjChips').value = '';
      document.getElementById('editProjCover').value = 'assets/svg/emblems/work.svg';
      document.getElementById('editProjGithub').value = '';
      document.getElementById('editProjLive').value = '';

      currentDrawerGallery = ['assets/svg/emblems/work.svg'];
      renderDrawerGallery();
      switchDrawerTab(0);

      document.getElementById('projectDrawer').classList.add('is-open');
    }

    function openProjectDrawer(i) {
      const p = DATA.projects[i];
      if (!p) return;

      document.getElementById('editProjIndex').value = String(i);
      document.getElementById('drawerTitle').textContent = 'Edit: ' + (p.title || 'Project');
      document.getElementById('editProjTitle').value = p.title || '';
      document.getElementById('editProjCategory').value = p.category || 'Civic Tech';
      document.getElementById('editProjTag').value = p.tag || '';
      document.getElementById('editProjYear').value = p.year || '2025';
      document.getElementById('editProjFeatured').value = p.featured ? 'true' : 'false';
      document.getElementById('editProjDesc').value = p.description || '';
      document.getElementById('editProjLongDesc').value = p.longDescription || p.description || '';
      document.getElementById('editProjChips').value = Array.isArray(p.chips) ? p.chips.join(', ') : (p.chips || '');
      document.getElementById('editProjCover').value = p.coverImage || p.image || p.illustration || '';
      document.getElementById('editProjGithub').value = p.githubUrl || '';
      document.getElementById('editProjLive').value = p.liveUrl || '';

      currentDrawerGallery = Array.isArray(p.images) && p.images.length ? [...p.images] : [p.coverImage || p.image || 'assets/svg/emblems/work.svg'];
      renderDrawerGallery();
      switchDrawerTab(0);

      document.getElementById('projectDrawer').classList.add('is-open');
    }

    function closeProjectDrawer() {
      document.getElementById('projectDrawer').classList.remove('is-open');
    }

    function switchDrawerTab(index) {
      document.querySelectorAll('.drawer__tab').forEach((t, i) => t.classList.toggle('active', i === index));
      document.querySelectorAll('.drawer__tab-content').forEach((c, i) => c.classList.toggle('active', i === index));
    }

    function renderDrawerGallery() {
      const container = document.getElementById('drawerGalleryManager');
      const cover = document.getElementById('editProjCover').value;
      if (!container) return;

      container.innerHTML = currentDrawerGallery.map((img, idx) => `
        <div class="gallery-card">
          <img src="../${esc(img)}" alt="" onerror="this.src='../assets/svg/emblems/work.svg'" />
          <button type="button" class="gallery-card__del" onclick="removeGalleryImage(${idx})">&times;</button>
          ${img === cover ? '<span class="gallery-card__cover">Cover</span>' : `<button type="button" onclick="setAsCoverImage('${esc(img)}')" style="position:absolute;bottom:4px;left:4px;background:rgba(0,0,0,0.8);color:#fff;border:none;padding:2px 6px;border-radius:4px;font-size:9px;cursor:pointer;">Set Cover</button>`}
        </div>
      `).join('');
    }

    function setAsCoverImage(src) {
      document.getElementById('editProjCover').value = src;
      renderDrawerGallery();
    }

    function removeGalleryImage(idx) {
      currentDrawerGallery.splice(idx, 1);
      if (!currentDrawerGallery.length) currentDrawerGallery.push('assets/svg/emblems/work.svg');
      document.getElementById('editProjCover').value = currentDrawerGallery[0];
      renderDrawerGallery();
    }

    async function handleGalleryUpload(input) {
      if (!input.files || !input.files.length) return;
      const formData = new FormData();
      formData.append('folder', 'images/projects');
      for (let i = 0; i < input.files.length; i++) {
        formData.append('files[]', input.files[i]);
      }

      toast('Uploading ' + input.files.length + ' images...', true);

      try {
        const r = await fetch(API + '?action=upload', {
          method: 'POST',
          headers: hdrs(false),
          body: formData
        });
        const d = await r.json();
        if (d.ok) {
          const files = d.files || [{ path: d.path }];
          files.forEach(f => {
            if (!currentDrawerGallery.includes(f.path)) currentDrawerGallery.push(f.path);
          });
          document.getElementById('editProjCover').value = currentDrawerGallery[0];
          renderDrawerGallery();
          toast('Images uploaded successfully!');
        } else {
          toast('Upload failed: ' + (d.error || 'Unknown error'), false);
        }
      } catch (e) { toast('Upload error: ' + e.message, false); }
      input.value = '';
    }

    function saveProjectFromDrawer() {
      const idx = parseInt(document.getElementById('editProjIndex').value);
      const title = document.getElementById('editProjTitle').value.trim();
      if (!title) { alert('Title is required'); return; }

      const chipsRaw = document.getElementById('editProjChips').value;
      const chips = chipsRaw.split(',').map(s => s.trim()).filter(Boolean);
      const cover = document.getElementById('editProjCover').value.trim() || currentDrawerGallery[0];

      const projData = {
        id: idx >= 0 && DATA.projects[idx] ? DATA.projects[idx].id : 'proj-' + Date.now(),
        num: String(idx >= 0 ? idx + 1 : DATA.projects.length + 1).padStart(2, '0'),
        title: title,
        tag: document.getElementById('editProjTag').value.trim(),
        category: document.getElementById('editProjCategory').value,
        year: document.getElementById('editProjYear').value.trim(),
        featured: document.getElementById('editProjFeatured').value === 'true',
        description: document.getElementById('editProjDesc').value.trim(),
        longDescription: document.getElementById('editProjLongDesc').value.trim(),
        chips: chips,
        coverImage: cover,
        image: cover,
        illustration: cover,
        images: currentDrawerGallery.length ? [...currentDrawerGallery] : [cover],
        githubUrl: document.getElementById('editProjGithub').value.trim(),
        liveUrl: document.getElementById('editProjLive').value.trim()
      };

      if (idx >= 0) {
        DATA.projects[idx] = projData;
      } else {
        DATA.projects.push(projData);
      }

      // Synchronize featured projects with landing page carousel DATA.work.projects
      syncWorkProjects();

      setDirty(true);
      closeProjectDrawer();
      renderProjectCards();
      renderOverviewStats();
      saveAllChanges();
    }

    function syncWorkProjects() {
      if (!DATA.projects) return;
      const featured = DATA.projects.filter(p => p.featured);
      if (featured.length > 0) {
        DATA.work.projects = featured.map((p, idx) => ({
          num: String(idx + 1).padStart(2, '0'),
          title: p.title,
          tag: p.tag,
          description: p.description,
          chips: p.chips,
          year: p.year,
          illustration: p.coverImage || p.illustration
        }));
      }
    }

    /* ── Single File Uploader ── */
    async function uploadSingleFile(input, targetInputId, folder = 'images') {
      if (!input.files || !input.files[0]) return;
      const fd = new FormData();
      fd.append('file', input.files[0]);
      fd.append('folder', folder);

      toast('Uploading image...', true);
      try {
        const r = await fetch(API + '?action=upload', {
          method: 'POST',
          headers: hdrs(false),
          body: fd
        });
        const d = await r.json();
        if (d.ok) {
          document.getElementById(targetInputId).value = d.path;
          set(targetInputId.replace('Src', '.src'), d.path);
          toast('Uploaded: ' + d.name);
        } else {
          toast('Upload failed: ' + d.error, false);
        }
      } catch (e) { toast('Error: ' + e.message, false); }
      input.value = '';
    }

    /* ── Stack & Disclosures ── */
    function renderStackRows() {
      const container = document.getElementById('stackRowsContainer');
      const rows = (DATA.stack && DATA.stack.rows) || [];
      if (!container) return;

      container.innerHTML = rows.map((r, i) => `
        <div class="form-card" style="padding:16px;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span style="font-weight:700;color:#fff;">Row ${r.num || i+1}: ${esc(r.label || '')}</span>
            <button class="btn btn--danger btn--sm" onclick="removeStackRow(${i})">&times;</button>
          </div>
          <div class="form-grid" style="margin-top:12px;">
            <div class="form-group"><label class="form-label">Label</label><input class="form-input" value="${esc(r.label || '')}" oninput="DATA.stack.rows[${i}].label=this.value;setDirty(true);"></div>
            <div class="form-group"><label class="form-label">Tools (comma separated)</label><input class="form-input" value="${esc(Array.isArray(r.tools) ? r.tools.join(', ') : '')}" oninput="DATA.stack.rows[${i}].tools=this.value.split(',').map(s=>s.trim()).filter(Boolean);setDirty(true);"></div>
          </div>
        </div>
      `).join('');
    }

    function addStackRow() {
      if (!DATA.stack) DATA.stack = {};
      if (!DATA.stack.rows) DATA.stack.rows = [];
      DATA.stack.rows.push({ num: String(DATA.stack.rows.length + 1).padStart(2, '0'), label: 'New Category', tools: [] });
      setDirty(true);
      renderStackRows();
    }

    function removeStackRow(i) {
      DATA.stack.rows.splice(i, 1);
      setDirty(true);
      renderStackRows();
    }

    function renderDisclosures() {
      const container = document.getElementById('disclosuresContainer');
      const disclosures = (DATA.research && DATA.research.disclosures) || [];
      if (!container) return;

      container.innerHTML = disclosures.map((d, i) => `
        <div class="form-card" style="padding:16px;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span style="font-weight:700;color:#fff;">${esc(d.title || 'Disclosure')}</span>
            <button class="btn btn--danger btn--sm" onclick="removeDisclosure(${i})">&times;</button>
          </div>
          <div class="form-grid" style="margin-top:12px;">
            <div class="form-group"><label class="form-label">Title</label><input class="form-input" value="${esc(d.title || '')}" oninput="DATA.research.disclosures[${i}].title=this.value;setDirty(true);"></div>
            <div class="form-group"><label class="form-label">Status Badge</label><input class="form-input" value="${esc(d.badge || '')}" oninput="DATA.research.disclosures[${i}].badge=this.value;setDirty(true);"></div>
            <div class="form-group form-group--full"><label class="form-label">Description</label><textarea class="form-textarea" rows="2" oninput="DATA.research.disclosures[${i}].description=this.value;setDirty(true);">${esc(d.description || '')}</textarea></div>
          </div>
        </div>
      `).join('');
    }

    function addDisclosure() {
      if (!DATA.research) DATA.research = {};
      if (!DATA.research.disclosures) DATA.research.disclosures = [];
      DATA.research.disclosures.push({ title: 'New Vulnerability', badge: 'Resolved', description: '', year: '2025' });
      setDirty(true);
      renderDisclosures();
    }

    function removeDisclosure(i) {
      DATA.research.disclosures.splice(i, 1);
      setDirty(true);
      renderDisclosures();
    }

    function renderContactFields() {
      const grid = document.getElementById('contactFieldsGrid');
      const fields = (DATA.contact && DATA.contact.fields) || [];
      if (!grid) return;

      grid.innerHTML = fields.map((f, i) => `
        <div class="form-group">
          <label class="form-label">${esc(f.label || 'Field')}</label>
          <input class="form-input" value="${esc(f.value || '')}" oninput="DATA.contact.fields[${i}].value=this.value;setDirty(true);">
        </div>
      `).join('');
    }

    /* ── Global Save ── */
    async function saveAllChanges() {
      // Gather inputs
      document.querySelectorAll('[data-path]').forEach(el => {
        set(el.dataset.path, el.value);
      });

      const parasEl = document.getElementById('aboutParasEditor');
      if (parasEl) {
        try { DATA.about.paragraphs = JSON.parse(parasEl.value); } catch (_) {}
      }

      toast('Saving changes...', true);
      try {
        const r = await fetch(API + '?action=save', {
          method: 'POST',
          headers: hdrs(true),
          body: JSON.stringify({ data: DATA })
        });
        const d = await r.json();
        if (d.ok) {
          setDirty(false);
          toast('All changes saved to data.json!');
          populateRawJson();
        } else {
          toast('Save failed: ' + d.error, false);
        }
      } catch (e) { toast('Save error: ' + e.message, false); }
    }

    /* ── Raw JSON Editor ── */
    function populateRawJson() {
      const el = document.getElementById('jsonEditor');
      if (el) el.value = JSON.stringify(DATA, null, 2);
    }

    async function saveRawJson() {
      const raw = document.getElementById('jsonEditor').value;
      try {
        const parsed = JSON.parse(raw);
        DATA = parsed;
        await saveAllChanges();
        populateAll();
      } catch (e) {
        toast('Invalid JSON syntax: ' + e.message, false);
      }
    }

    /* ── File Browser ── */
    let fbCurrent = '';
    async function fbNavigate(dir) {
      fbCurrent = dir;
      const el = document.getElementById('fileGrid');
      const bc = document.getElementById('fbBreadcrumb');
      if (bc) bc.textContent = 'assets/' + dir;
      if (!el) return;

      el.innerHTML = '<div style="color:var(--mist);font-size:12px;">Loading...</div>';
      try {
        const r = await fetch(API + '?action=list&dir=' + encodeURIComponent(dir));
        const d = await r.json();
        if (d.ok) {
          el.innerHTML = d.files.map(f => {
            if (f.is_dir) {
              return `<div style="background:var(--card);border:1px solid var(--border);border-radius:8px;padding:12px;cursor:pointer;" onclick="fbNavigate('${esc(f.path.replace(/^assets\//, ''))}')">📁 <strong>${esc(f.name)}/</strong></div>`;
            }
            return `
              <div style="background:var(--card);border:1px solid var(--border);border-radius:8px;padding:10px;display:flex;flex-direction:column;gap:6px;">
                <div style="height:70px;background:#000;border-radius:4px;overflow:hidden;display:grid;place-items:center;">
                  <img src="../assets/${esc(f.path)}" alt="" style="max-width:100%;max-height:100%;object-fit:contain;" onerror="this.parentElement.innerHTML='📄'" />
                </div>
                <span style="font-size:11px;color:#fff;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${esc(f.name)}">${esc(f.name)}</span>
              </div>
            `;
          }).join('');
        }
      } catch (_) {}
    }

    /* ── Sidebar Switching ── */
    function switchPanel(panelName) {
      document.querySelectorAll('.sidebar__item').forEach(i => i.classList.toggle('active', i.dataset.panel === panelName));
      document.querySelectorAll('.panel').forEach(p => p.classList.toggle('active', p.id === 'panel-' + panelName));
      if (panelName === 'files') fbNavigate('');
    }

    document.querySelectorAll('.sidebar__item').forEach(item => {
      item.addEventListener('click', () => switchPanel(item.dataset.panel));
    });

    async function logout() {
      try { await fetch('auth.php?action=logout'); } catch (_) {}
      window.location = 'index.php';
    }

    document.addEventListener('DOMContentLoaded', () => {
      loadData();
    });
  </script>
</body>
</html>