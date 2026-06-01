/* ═══════════════════════════════════════════════════════
   ZENITH KANDEL — PORTFOLIO INTERACTIONS
   Three.js 3D scene, scroll animations, custom cursor
   ═══════════════════════════════════════════════════════ */

import '../styles/main.css';

document.addEventListener('DOMContentLoaded', () => {
  initCursor();
  initScrollProgress();
  initNavBehavior();
  initScrollObservers();
  initCounterAnimations();
  initAvatarParallax();

  // Wait for Three.js to load via CDN
  if (typeof THREE !== 'undefined') {
    initParticleField();
  } else {
    // Retry after a brief delay for CDN load
    const checkThree = setInterval(() => {
      if (typeof THREE !== 'undefined') {
        clearInterval(checkThree);
        initParticleField();
      }
    }, 100);

    // Give up after 5 seconds
    setTimeout(() => clearInterval(checkThree), 5000);
  }
});

/* ═══════════════════════════════════════════════════════
   THREE.JS 3D PARTICLE CONSTELLATION
   Interactive depth field that responds to mouse movement
   ═══════════════════════════════════════════════════════ */
function initParticleField() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true
  });

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Particle system
  const particleCount = 800;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);
  const speeds = new Float32Array(particleCount * 3);

  // Color palette for particles
  const colorPalette = [
    { r: 0.91, g: 0.34, b: 0.16 },  // ember
    { r: 0.79, g: 1.0, b: 0.34 },   // signal
    { r: 0.94, g: 0.93, b: 0.89 },  // bone
    { r: 0.42, g: 0.42, b: 0.42 },  // ash
  ];

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;

    // Distribute in a sphere-like volume
    positions[i3] = (Math.random() - 0.5) * 20;
    positions[i3 + 1] = (Math.random() - 0.5) * 20;
    positions[i3 + 2] = (Math.random() - 0.5) * 15;

    // Random drift speeds
    speeds[i3] = (Math.random() - 0.5) * 0.003;
    speeds[i3 + 1] = (Math.random() - 0.5) * 0.003;
    speeds[i3 + 2] = (Math.random() - 0.5) * 0.002;

    // Assign colors from palette
    const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
    colors[i3] = color.r;
    colors[i3 + 1] = color.g;
    colors[i3 + 2] = color.b;

    sizes[i] = Math.random() * 2.5 + 0.5;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  // Custom shader material for particles
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) }
    },
    vertexShader: `
      attribute float size;
      attribute vec3 color;
      varying vec3 vColor;
      varying float vAlpha;
      uniform float uTime;
      uniform vec2 uMouse;
      uniform float uPixelRatio;

      void main() {
        vColor = color;
        
        vec3 pos = position;
        
        // Gentle wave motion
        pos.x += sin(uTime * 0.3 + position.y * 0.5) * 0.1;
        pos.y += cos(uTime * 0.2 + position.x * 0.4) * 0.1;
        pos.z += sin(uTime * 0.15 + position.x * 0.3) * 0.05;

        // Mouse influence - subtle push/pull
        float mouseInfluence = 2.0;
        pos.x += uMouse.x * mouseInfluence * (1.0 / (1.0 + abs(position.z)));
        pos.y += uMouse.y * mouseInfluence * (1.0 / (1.0 + abs(position.z)));
        
        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        
        // Size attenuation
        gl_PointSize = size * uPixelRatio * (80.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
        
        // Depth-based alpha
        vAlpha = smoothstep(-15.0, 5.0, position.z) * 0.6;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      varying float vAlpha;
      
      void main() {
        // Circular particles with soft edge
        float dist = length(gl_PointCoord - vec2(0.5));
        if (dist > 0.5) discard;
        
        float alpha = vAlpha * (1.0 - smoothstep(0.2, 0.5, dist));
        gl_FragColor = vec4(vColor, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  const particles = new THREE.Points(geometry, material);
  scene.add(particles);

  // Connection lines between nearby particles
  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0x333333,
    transparent: true,
    opacity: 0.08,
    blending: THREE.AdditiveBlending
  });

  camera.position.z = 8;

  // Mouse tracking
  const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

  document.addEventListener('mousemove', (e) => {
    mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouse.targetY = -(e.clientY / window.innerHeight - 0.5) * 2;
  });

  // Resize handler
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    material.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2);
  });

  // Animation loop
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const elapsed = clock.getElapsedTime();

    // Smooth mouse follow
    mouse.x += (mouse.targetX - mouse.x) * 0.05;
    mouse.y += (mouse.targetY - mouse.y) * 0.05;

    material.uniforms.uTime.value = elapsed;
    material.uniforms.uMouse.value.set(mouse.x, mouse.y);

    // Slow rotation
    particles.rotation.y = elapsed * 0.02;
    particles.rotation.x = Math.sin(elapsed * 0.01) * 0.05;

    // Drift particles
    const posArray = geometry.attributes.position.array;
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      posArray[i3] += speeds[i3];
      posArray[i3 + 1] += speeds[i3 + 1];
      posArray[i3 + 2] += speeds[i3 + 2];

      // Wrap around boundaries
      if (posArray[i3] > 10) posArray[i3] = -10;
      if (posArray[i3] < -10) posArray[i3] = 10;
      if (posArray[i3 + 1] > 10) posArray[i3 + 1] = -10;
      if (posArray[i3 + 1] < -10) posArray[i3 + 1] = 10;
      if (posArray[i3 + 2] > 8) posArray[i3 + 2] = -8;
      if (posArray[i3 + 2] < -8) posArray[i3 + 2] = 8;
    }
    geometry.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
  }

  animate();
}

/* ═══════════════════════════════════════════════════════
   CUSTOM CURSOR
   Magnetic cursor with trail effect
   ═══════════════════════════════════════════════════════ */
function initCursor() {
  const cursor = document.getElementById('cursor');
  const trail = document.getElementById('cursor-trail');

  if (!cursor || !trail || window.innerWidth < 768) return;

  let cursorX = 0, cursorY = 0;
  let trailX = 0, trailY = 0;

  document.addEventListener('mousemove', (e) => {
    cursorX = e.clientX;
    cursorY = e.clientY;
    cursor.classList.add('visible');
    trail.classList.add('visible');
  });

  // Smooth cursor follow
  function updateCursor() {
    cursor.style.left = cursorX + 'px';
    cursor.style.top = cursorY + 'px';

    // Trail lags behind
    trailX += (cursorX - trailX) * 0.15;
    trailY += (cursorY - trailY) * 0.15;
    trail.style.left = trailX + 'px';
    trail.style.top = trailY + 'px';

    requestAnimationFrame(updateCursor);
  }
  updateCursor();

  // Hover effects on interactive elements
  const hoverTargets = document.querySelectorAll(
    'a, button, .project-card, .skill-chip, .contact-card, .vuln-item, .tech-tag'
  );

  hoverTargets.forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
  });

  // Hide cursor when leaving window
  document.addEventListener('mouseleave', () => {
    cursor.classList.remove('visible');
    trail.classList.remove('visible');
  });
  document.addEventListener('mouseenter', () => {
    cursor.classList.add('visible');
    trail.classList.add('visible');
  });
}

/* ═══════════════════════════════════════════════════════
   SCROLL PROGRESS BAR
   ═══════════════════════════════════════════════════════ */
function initScrollProgress() {
  const progressBar = document.getElementById('scroll-progress');
  if (!progressBar) return;

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (scrollTop / docHeight) * 100;
    progressBar.style.width = progress + '%';
  }, { passive: true });
}

/* ═══════════════════════════════════════════════════════
   NAVIGATION BEHAVIOR
   Show/hide on scroll direction, add background on scroll
   ═══════════════════════════════════════════════════════ */
function initNavBehavior() {
  const nav = document.getElementById('main-nav');
  if (!nav) return;

  let lastScrollY = 0;
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const currentScroll = window.scrollY;

        // Add scrolled class for background
        if (currentScroll > 50) {
          nav.classList.add('scrolled');
        } else {
          nav.classList.remove('scrolled');
        }

        // Hide/show based on scroll direction
        if (currentScroll > lastScrollY && currentScroll > 200) {
          nav.classList.add('hidden');
        } else {
          nav.classList.remove('hidden');
        }

        lastScrollY = currentScroll;
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  // Smooth scroll for nav links
  const navLinks = document.querySelectorAll('.nav-link, .nav-logo, .hero-cta');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });
}

/* ═══════════════════════════════════════════════════════
   SCROLL REVEAL ANIMATIONS
   IntersectionObserver-based reveal with staggered delays
   ═══════════════════════════════════════════════════════ */
function initScrollObservers() {
  const reveals = document.querySelectorAll('.reveal-up');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.delay || 0;
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay * 150); // 150ms stagger between elements
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -80px 0px'
  });

  reveals.forEach(el => observer.observe(el));
}

/* ═══════════════════════════════════════════════════════
   COUNTER ANIMATIONS
   Animates numbers counting up when they scroll into view
   ═══════════════════════════════════════════════════════ */
function initCounterAnimations() {
  const counters = document.querySelectorAll('.counter-value');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.target);
        const suffix = el.dataset.suffix || '';
        const duration = 2000;
        const start = performance.now();

        function updateCounter(currentTime) {
          const elapsed = currentTime - start;
          const progress = Math.min(elapsed / duration, 1);

          // Ease-out quad
          const eased = 1 - (1 - progress) * (1 - progress);
          const current = Math.floor(eased * target);

          el.textContent = current + suffix;

          if (progress < 1) {
            requestAnimationFrame(updateCounter);
          } else {
            el.textContent = target + suffix;
          }
        }

        requestAnimationFrame(updateCounter);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
}

/* ═══════════════════════════════════════════════════════
   AVATAR PARALLAX
   Subtle parallax movement on the hero avatar
   ═══════════════════════════════════════════════════════ */
function initAvatarParallax() {
  const avatar = document.getElementById('hero-avatar');
  if (!avatar || window.innerWidth < 768) return;

  document.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 20;
    const y = (e.clientY / window.innerHeight - 0.5) * 10;

    avatar.style.transform = `translateY(${-15 + y}px) rotateY(${x * 0.3}deg) rotateX(${-y * 0.3}deg)`;
  });
}
