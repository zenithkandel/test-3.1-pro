import '../styles/main.css';

document.addEventListener('DOMContentLoaded', () => {
  initCursor();
  initCanvas();
  initScrollObservers();
});

// Custom Cursor
function initCursor() {
  const cursor = document.getElementById('cursor');
  if (!cursor || window.innerWidth < 768) return;

  document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
  });

  const hoverables = document.querySelectorAll('a, button, .cyber-box, .project-dossier, .bounty-badge');
  hoverables.forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
  });
}

// Minimalistic Canvas Data Particles Background
function initCanvas() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  let width, height;
  let particles = [];

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  
  window.addEventListener('resize', resize);
  resize();

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = (Math.random() - 0.5) * 0.5;
      this.size = Math.random() * 2;
      this.alpha = Math.random() * 0.5 + 0.1;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      
      if (this.x < 0) this.x = width;
      if (this.x > width) this.x = 0;
      if (this.y < 0) this.y = height;
      if (this.y > height) this.y = 0;
    }
    draw() {
      ctx.fillStyle = `rgba(0, 240, 255, ${this.alpha})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  for (let i = 0; i < 100; i++) {
    particles.push(new Particle());
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    
    // Draw connections
    for(let i=0; i<particles.length; i++) {
      particles[i].update();
      particles[i].draw();
      
      for(let j=i+1; j<particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        if (dist < 100) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(0, 240, 255, ${0.1 - dist/1000})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(animate);
  }
  animate();
}

// Scroll Intersections and Reveal Effects
function initScrollObservers() {
  // Reveal Text Elements
  const revealElements = document.querySelectorAll('.reveal-text');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  revealElements.forEach(el => revealObserver.observe(el));

  // Projects Dossier Reveal
  const dossiers = document.querySelectorAll('.project-dossier');
  const dossierObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      } else {
        // Optional: fade out when scrolling past
        // entry.target.classList.remove('active');
      }
    });
  }, { threshold: 0.2, rootMargin: "0px 0px -100px 0px" });

  dossiers.forEach(el => dossierObserver.observe(el));
}
