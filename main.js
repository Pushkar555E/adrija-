/* =====================================================================
   PUSHKAR BISWAS — ULTIMATE PORTFOLIO
   Merging: WebGL Particle Engine (Three.js) + Full Portfolio Logic
   Three.js · GSAP · Magnetic Cursor · Typewriter · Scroll Reveals
   ===================================================================== */

import * as THREE from 'three';
import { gsap } from 'gsap';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { RGBShiftShader } from 'three/examples/jsm/shaders/RGBShiftShader.js';

'use strict';

/* ─── Utility ─────────────────────────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const raf = requestAnimationFrame;

/* ══════════════════════════════════════════════════════════════════════
   1. PRELOADER (Terminal Style)
══════════════════════════════════════════════════════════════════════ */
(function initPreloader() {
  const loader   = $('#preloader');
  const bar      = $('#pre-bar');
  const pct      = $('#pre-pct');
  const terminal = $('#pre-terminal');

  const steps = [
    'initializing quantum core...',
    'spawning particle universe...',
    'loading three.js engine...',
    'compiling portfolio matrix...',
    'ready to launch 🚀',
  ];

  let progress = 0;
  let stepIdx  = 0;
  const interval = 55;

  terminal.textContent = steps[0];

  const tick = setInterval(() => {
    progress = Math.min(100, progress + Math.random() * 6 + 2);
    bar.style.width = progress + '%';
    pct.textContent = Math.floor(progress) + '%';

    const s = Math.floor((progress / 100) * (steps.length - 1));
    if (s > stepIdx) { stepIdx = s; terminal.textContent = steps[stepIdx]; }

    if (progress >= 100) {
      clearInterval(tick);
      setTimeout(() => {
        loader.classList.add('hidden');
        setTimeout(() => loader.remove(), 700);
      }, 400);
    }
  }, interval);
})();

/* ══════════════════════════════════════════════════════════════════════
   2. LIVE CLOCK
══════════════════════════════════════════════════════════════════════ */
(function initClock() {
  const el = $('#navTime');
  if (!el) return;
  const update = () => {
    const now = new Date();
    el.textContent = [now.getHours(), now.getMinutes(), now.getSeconds()]
      .map(n => String(n).padStart(2,'0')).join(':');
  };
  update();
  setInterval(update, 1000);
})();

/* ══════════════════════════════════════════════════════════════════════
   3. CUSTOM MAGNETIC CURSOR
══════════════════════════════════════════════════════════════════════ */
(function initCursor() {
  const dotEl  = $('#cdot');
  const ringEl = $('#cring');
  const dotWrap  = $('#cursorDot');
  const ringWrap = $('#cursorRing');
  if (!dotEl) return;

  let mx = -200, my = -200;
  let rx = -200, ry = -200;

  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  document.addEventListener('mousemove', e => {
    dotWrap.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
  });

  (function loop() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ringWrap.style.transform = `translate(${rx}px, ${ry}px)`;
    raf(loop);
  })();

  $$('a, button, [data-cursor]').forEach(el => {
    el.addEventListener('mouseenter', () => { dotEl.classList.add('hovered'); ringEl.classList.add('hovered'); });
    el.addEventListener('mouseleave', () => { dotEl.classList.remove('hovered'); ringEl.classList.remove('hovered'); });
  });
})();

/* ══════════════════════════════════════════════════════════════════════
   4. SCROLL PROGRESS BAR
══════════════════════════════════════════════════════════════════════ */
(function initScrollProgress() {
  const bar = $('#scroll-progress');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = (scrollY / max * 100) + '%';
  }, { passive: true });
})();

/* ══════════════════════════════════════════════════════════════════════
   5. NAVIGATION (Scrolled, Mobile, Active Link)
══════════════════════════════════════════════════════════════════════ */
(function initNav() {
  const nav      = $('#nav');
  const ham      = $('#hamburger');
  const mob      = $('#mobileMenu');
  const navLinks = $$('#navLinks a');

  const onScroll = () => nav.classList.toggle('scrolled', scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  ham?.addEventListener('click', () => {
    ham.classList.toggle('open');
    mob.classList.toggle('open');
  });
  $$('.mob-link').forEach(a => a.addEventListener('click', () => {
    ham.classList.remove('open');
    mob.classList.remove('open');
  }));

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(a => {
          a.classList.toggle('active', a.getAttribute('href').includes('#' + entry.target.id));
        });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  $$('section[id]').forEach(s => observer.observe(s));
})();

/* ══════════════════════════════════════════════════════════════════════
   6. HERO PARTICLE CONSTELLATION CANVAS (2D - Background)
══════════════════════════════════════════════════════════════════════ */
(function initHeroParticles() {
  const canvas = $('#bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles = [], mouse = { x: -9999, y: -9999 };
  const COUNT   = 70;
  const CONNECT = 130;
  const PALETTE = ['rgba(0,255,213,', 'rgba(79,140,255,', 'rgba(0,229,255,', 'rgba(124,58,237,'];

  class Particle {
    constructor() { this.reset(true); }
    reset(init = false) {
      this.x  = Math.random() * W;
      this.y  = init ? Math.random() * H : H + 10;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = (Math.random() - 0.5) * 0.3;
      this.r  = Math.random() * 1.5 + 0.4;
      this.alpha = Math.random() * 0.45 + 0.2;
      this.col = PALETTE[Math.floor(Math.random() * PALETTE.length)];
    }
    update() {
      this.x += this.vx; this.y += this.vy;
      const dx = this.x - mouse.x, dy = this.y - mouse.y;
      const dist = Math.sqrt(dx*dx+dy*dy);
      if (dist < 80) {
        const force = (80 - dist) / 80 * 1.5;
        this.x += (dx/dist)*force;
        this.y += (dy/dist)*force;
      }
      if (this.x < 0) this.x = W;
      if (this.x > W) this.x = 0;
      if (this.y < 0) this.y = H;
      if (this.y > H) this.y = 0;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI*2);
      ctx.fillStyle = this.col + this.alpha + ')';
      ctx.fill();
    }
  }

  const resize = () => { W = canvas.width = innerWidth; H = canvas.height = innerHeight; };
  const init = () => { resize(); particles = Array.from({ length: COUNT }, () => new Particle()); };
  const drawLines = () => {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i+1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = a.x-b.x, dy = a.y-b.y;
        const dist = Math.sqrt(dx*dx+dy*dy);
        if (dist < CONNECT) {
          const alpha = (1 - dist/CONNECT) * 0.15;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = 'rgba(0,255,213,' + alpha + ')';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  };
  const loop = () => { ctx.clearRect(0, 0, W, H); particles.forEach(p => { p.update(); p.draw(); }); drawLines(); raf(loop); };

  window.addEventListener('resize', resize, { passive: true });

  // Only track mouse inside hero section
  const heroSection = $('#hero');
  document.addEventListener('mousemove', e => {
    if (heroSection && heroSection.getBoundingClientRect().bottom > 0) {
      mouse.x = e.clientX; mouse.y = e.clientY;
    }
  });

  init(); loop();
})();

/* ══════════════════════════════════════════════════════════════════════
   7. TYPEWRITER EFFECT
══════════════════════════════════════════════════════════════════════ */
(function initTypewriter() {
  const el = $('#typedText');
  if (!el) return;

  const roles = [
    'AI-driven apps.',
    'modern web experiences.',
    '3D WebGL universes.',
    'scalable systems.',
    'beautiful UIs.',
    'the future. ⚡',
  ];

  let roleIdx = 0, charIdx = 0, deleting = false;
  const PAUSE_END   = 1800;
  const PAUSE_START = 350;
  const TYPE_SPEED  = 70;
  const DEL_SPEED   = 35;

  const type = () => {
    const current = roles[roleIdx];
    if (!deleting) {
      el.textContent = current.slice(0, ++charIdx);
      if (charIdx === current.length) { deleting = true; setTimeout(type, PAUSE_END); return; }
    } else {
      el.textContent = current.slice(0, --charIdx);
      if (charIdx === 0) { deleting = false; roleIdx = (roleIdx + 1) % roles.length; setTimeout(type, PAUSE_START); return; }
    }
    setTimeout(type, deleting ? DEL_SPEED : TYPE_SPEED);
  };
  setTimeout(type, 1200);
})();

/* ══════════════════════════════════════════════════════════════════════
   8. SCROLL REVEAL OBSERVER
══════════════════════════════════════════════════════════════════════ */
(function initReveal() {
  const els = $$('.reveal, .reveal-left');
  if (!els.length) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -60px 0px' });
  els.forEach(el => observer.observe(el));
})();

/* ══════════════════════════════════════════════════════════════════════
   9. SKILL BAR ANIMATIONS
══════════════════════════════════════════════════════════════════════ */
(function initSkillBars() {
  const bars = $$('.skill-bar');
  if (!bars.length) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bar = entry.target;
        const w   = bar.dataset.w || '0';
        setTimeout(() => { bar.style.width = w + '%'; }, 200);
        observer.unobserve(bar);
      }
    });
  }, { threshold: 0.3 });
  bars.forEach(b => observer.observe(b));
})();

/* ══════════════════════════════════════════════════════════════════════
   10. COUNTER ANIMATION
══════════════════════════════════════════════════════════════════════ */
(function initCounters() {
  const els = $$('[data-count]');
  if (!els.length) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.count);
      const dur = 1000;
      const start = performance.now();
      const step = now => {
        const progress = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target) + '+';
        if (progress < 1) raf(step);
      };
      raf(step);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });
  els.forEach(el => observer.observe(el));
})();

/* ══════════════════════════════════════════════════════════════════════
   11. GOAL PROGRESS BARS
══════════════════════════════════════════════════════════════════════ */
(function initGoalBars() {
  const bars = $$('.goal-bar');
  if (!bars.length) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('animated'); observer.unobserve(entry.target); }
    });
  }, { threshold: 0.4 });
  bars.forEach(b => observer.observe(b));
})();

/* ══════════════════════════════════════════════════════════════════════
   12. MAGNETIC 3D TILT ON PROJECT CARDS
══════════════════════════════════════════════════════════════════════ */
(function initTiltCards() {
  $$('.project-card').forEach(card => {
    let active = false;
    card.addEventListener('mouseenter', () => { active = true; card.style.transition = 'box-shadow 0.3s, border-color 0.3s'; });
    card.addEventListener('mousemove', e => {
      if (!active) return;
      const b = card.getBoundingClientRect();
      const rotX = ((e.clientY - b.top  - b.height/2) / (b.height/2)) * -9;
      const rotY = ((e.clientX - b.left - b.width/2)  / (b.width/2))  *  9;
      card.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(8px)`;
    });
    card.addEventListener('mouseleave', () => {
      active = false;
      card.style.transition = 'transform 0.55s cubic-bezier(0.22,1,0.36,1), box-shadow 0.3s, border-color 0.3s';
      card.style.transform  = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
    });
  });
})();

/* ══════════════════════════════════════════════════════════════════════
   13. CONTACT FORM
══════════════════════════════════════════════════════════════════════ */
(function initContactForm() {
  const form    = $('#contactForm');
  const success = $('#formSuccess');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = $('#contact-submit');
    btn.disabled = true;
    btn.querySelector('span').textContent = 'Sending...';
    setTimeout(() => {
      form.reset();
      success.style.display = 'block';
      btn.disabled = false;
      btn.querySelector('span').textContent = 'Send Message';
      setTimeout(() => { success.style.display = 'none'; }, 4000);
    }, 1200);
  });
})();

/* ══════════════════════════════════════════════════════════════════════
   14. SMOOTH SCROLL FOR ALL ANCHOR LINKS
══════════════════════════════════════════════════════════════════════ */
(function initSmoothScroll() {
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
})();

/* ══════════════════════════════════════════════════════════════════════
   15. GLASS CARD HOVER GLOW (Radial gradient follows mouse)
══════════════════════════════════════════════════════════════════════ */
(function initCardHoverGlow() {
  $$('.glass-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width)  * 100;
      const y = ((e.clientY - rect.top)  / rect.height) * 100;
      card.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(0,255,213,0.06) 0%, rgba(255,255,255,0.03) 60%), linear-gradient(145deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))`;
    });
    card.addEventListener('mouseleave', () => { card.style.background = ''; });
  });
})();

/* ══════════════════════════════════════════════════════════════════════
   16. THREE.JS WEBGL ENGINE — THE QUANTUM MIRROR
══════════════════════════════════════════════════════════════════════ */

// ─── Three.js Setup ────────────────────────────────────────────────
const canvas3d = document.querySelector('#canvas3d');
const scene = new THREE.Scene();
scene.background = new THREE.Color('#010103');
scene.fog = new THREE.FogExp2('#010103', 0.012);

const camera = new THREE.PerspectiveCamera(55, canvas3d.parentElement.clientWidth / canvas3d.parentElement.clientHeight, 0.1, 1000);
camera.position.set(0, 0, 80);

const renderer = new THREE.WebGLRenderer({ canvas: canvas3d, antialias: false, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// ─── Post Processing ───────────────────────────────────────────────
const renderPass = new RenderPass(scene, camera);
const bloomPass  = new UnrealBloomPass(new THREE.Vector2(800, 600), 2.8, 0.5, 0.1);
const rgbPass    = new ShaderPass(RGBShiftShader);
rgbPass.uniforms['amount'].value = 0.0015;

const composer = new EffectComposer(renderer);
composer.addPass(renderPass);
composer.addPass(bloomPass);
composer.addPass(rgbPass);

// Resize 3D canvas to frame
function resize3D() {
  const frame = canvas3d.parentElement;
  const w = frame.clientWidth;
  const h = frame.clientHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  composer.setSize(w, h);
}
resize3D();

// ─── Audio System ─────────────────────────────────────────────────
let audioCtx, analyser, dataArray;

function initAudioSystems(stream) {
  if (audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  
  const osc = audioCtx.createOscillator();
  osc.type = 'triangle';
  osc.frequency.value = 55;
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 200;
  const gain = audioCtx.createGain();
  gain.gain.value = 0.12;
  osc.connect(filter); filter.connect(gain); gain.connect(audioCtx.destination);
  osc.start();

  window.addEventListener('mousemove', (e) => {
    const my = e.clientY / window.innerHeight;
    if (audioCtx.state === 'running') {
      filter.frequency.linearRampToValueAtTime(100 + (1.0 - my)*800, audioCtx.currentTime + 0.1);
    }
  });

  if (stream && stream.getAudioTracks().length > 0) {
    const source = audioCtx.createMediaStreamSource(stream);
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    dataArray = new Uint8Array(analyser.frequencyBinCount);
  }
}

// ─── Webcam Integration ───────────────────────────────────────────
const video = document.getElementById('webcam');
const vCanvas = document.getElementById('vCanvas');
const vCtx = vCanvas.getContext('2d', { willReadFrequently: true });
let webcamActive = false;
let engineRunning = false;

// ─── Particle System ──────────────────────────────────────────────
const particleCount = 10000;

function generateShape(type) {
  const arrPos = new Float32Array(particleCount * 3);
  const arrCol = new Float32Array(particleCount * 3);
  
  for (let i = 0; i < particleCount; i++) {
    let x = 0, y = 0, z = 0;
    let r = 0, g = 1, b = 0.8;

    if (type === 'dna') {
      const t = (i / particleCount) * Math.PI * 40;
      const height = (i / particleCount) * 100 - 50;
      const rBase = 12;
      const offset = (i % 2 === 0) ? 0 : Math.PI;
      x = Math.cos(t + offset) * rBase + (Math.random() - 0.5) * 2;
      y = height + (Math.random() - 0.5) * 2;
      z = Math.sin(t + offset) * rBase + (Math.random() - 0.5) * 2;
      if (Math.random() > 0.96) { x *= Math.random() * 2; z *= Math.random() * 2; }
      r = 0.2; g = 0.5; b = 1.0;
    }
    else if (type === 'knot') {
      const t = (i / particleCount) * Math.PI * 2 * 120;
      const p = 3, q = 4, rConf = 15;
      x = rConf * (Math.cos(p*t) + 2) * Math.cos(q*t) * 0.4 + (Math.random()-0.5)*3;
      y = rConf * (Math.cos(p*t) + 2) * Math.sin(q*t) * 0.4 + (Math.random()-0.5)*3;
      z = rConf * Math.sin(p*t) * 0.4 + (Math.random()-0.5)*3;
      r = 1.0; g = 0.0; b = 1.0;
    }
    else if (type === 'grid') {
      const row = 20;
      x = (Math.floor(Math.random() * row) - row/2) * 5 + (Math.random()-0.5);
      y = (Math.floor(Math.random() * row) - row/2) * 5 + (Math.random()-0.5);
      z = (Math.floor(Math.random() * row) - row/2) * 5 + (Math.random()-0.5);
      r = 0.0; g = 1.0; b = 0.53; // Quantum cyan
    }
    else if (type === 'sphere') {
      const u = Math.random(), v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const radius = 30;
      x = radius * Math.sin(phi) * Math.cos(theta);
      y = radius * Math.sin(phi) * Math.sin(theta);
      z = radius * Math.cos(phi);
      r = 0.0; g = 0.9; b = 0.8;
    }
    
    arrPos[i*3] = x; arrPos[i*3+1] = y; arrPos[i*3+2] = z;
    arrCol[i*3] = r; arrCol[i*3+1] = g; arrCol[i*3+2] = b;
  }
  return { pos: arrPos, col: arrCol };
}

const shapes = {
  dna:    generateShape('dna'),
  knot:   generateShape('knot'),
  grid:   generateShape('grid'),
  sphere: generateShape('sphere')
};

const basePos = new Float32Array(shapes.sphere.pos);
const baseCol = new Float32Array(shapes.sphere.col);
const rendPos = new Float32Array(shapes.sphere.pos);
const rendCol = new Float32Array(shapes.sphere.col);
const snapPos = new Float32Array(particleCount * 3);
const snapCol = new Float32Array(particleCount * 3);

const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', new THREE.BufferAttribute(rendPos, 3));
geometry.setAttribute('color',    new THREE.BufferAttribute(rendCol, 3));

const material = new THREE.PointsMaterial({
  size: 0.35,
  vertexColors: true,
  transparent: true,
  opacity: 0.9,
  blending: THREE.AdditiveBlending,
  depthWrite: false
});

const particles = new THREE.Points(geometry, material);
particles.position.x = 10;
scene.add(particles);

// ─── Morph Logic ──────────────────────────────────────────────────
let activeShape = 'sphere';
let transitionState = { progress: 0 };

function morphTo(targetId) {
  if (targetId === 'mirror' && !webcamActive) targetId = 'sphere';
  activeShape = targetId;

  gsap.to(rgbPass.uniforms['amount'], { value: 0.03, duration: 0.1, yoyo: true, repeat: 5, ease: "rough" });
  gsap.to(camera.position, {
    x: (Math.random() - 0.5) * 40,
    y: (Math.random() - 0.5) * 20,
    z: 60 + Math.random() * 30,
    duration: 3,
    ease: "power2.inOut",
    onUpdate: () => camera.lookAt(new THREE.Vector3(10, 0, 0))
  });

  if (activeShape === 'mirror') return;

  const targetPos = shapes[targetId]?.pos || shapes.sphere.pos;
  const targetCol = shapes[targetId]?.col || shapes.sphere.col;

  snapPos.set(basePos);
  snapCol.set(baseCol);
  transitionState.progress = 0;
  gsap.killTweensOf(transitionState);

  gsap.to(transitionState, {
    progress: 1,
    duration: 3.5,
    ease: "expo.inOut",
    onUpdate: () => {
      for (let i = 0; i < particleCount*3; i++) {
        basePos[i] = THREE.MathUtils.lerp(snapPos[i], targetPos[i], transitionState.progress);
        baseCol[i] = THREE.MathUtils.lerp(snapCol[i], targetCol[i], transitionState.progress);
      }
    }
  });
}

// ─── Raycaster (Mouse Repulsion) ──────────────────────────────────
const raycaster = new THREE.Raycaster();
const mouse3D = new THREE.Vector2();
const invisiblePlane = new THREE.Mesh(new THREE.PlaneGeometry(2000, 2000), new THREE.MeshBasicMaterial({visible:false}));
scene.add(invisiblePlane);

// Only track mouse inside the hologram frame
const holoFrame = document.getElementById('hologram-frame');
if (holoFrame) {
  holoFrame.addEventListener('mousemove', (e) => {
    const rect = holoFrame.getBoundingClientRect();
    mouse3D.x = ((e.clientX - rect.left) / rect.width)  *  2 - 1;
    mouse3D.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1;
  });
  holoFrame.addEventListener('mouseleave', () => { mouse3D.set(0, 0); });
}

// ─── Holo UI Navigation ───────────────────────────────────────────
let holoReady = false;

function startHologram(initialTarget) {
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  const launch = $('#holo-launch');
  if (launch) {
    launch.classList.add('hidden');
    setTimeout(() => { launch.style.display = 'none'; }, 1100);
  }
  const ui = $('#holo-ui');
  if (ui) { ui.style.opacity = '1'; ui.style.pointerEvents = 'auto'; }
  morphTo(initialTarget);
  holoReady = true;
  engineRunning = true;
}

$('#holo-start')?.addEventListener('click', () => {
  navigator.mediaDevices.getUserMedia({ video: { width: 100, height: 100 }, audio: true })
    .then(stream => {
      video.srcObject = stream; video.play();
      webcamActive = true;
      initAudioSystems(stream);
      startHologram('mirror');
    }).catch(err => {
      navigator.mediaDevices.getUserMedia({ video: { width: 100, height: 100 } })
        .then(stream => {
          video.srcObject = stream; video.play();
          webcamActive = true;
          initAudioSystems(null);
          startHologram('mirror');
        }).catch(() => {
          initAudioSystems(null);
          startHologram('dna');
        });
    });
});

$('#holo-skip')?.addEventListener('click', () => {
  initAudioSystems(null);
  startHologram('dna');
});

// Holo nav items
const holoNavItems = $$('.holo-nav-item');
const holoPanels   = $$('.holo-panel');

holoNavItems.forEach(item => {
  item.addEventListener('click', () => {
    if (!holoReady) return;

    // Sound blip
    if (audioCtx && audioCtx.state === 'running') {
      const blip = audioCtx.createOscillator();
      blip.type = 'square';
      blip.frequency.setValueAtTime(800, audioCtx.currentTime);
      blip.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.1);
      const blipGain = audioCtx.createGain();
      blipGain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      blipGain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
      blip.connect(blipGain); blipGain.connect(audioCtx.destination);
      blip.start(); blip.stop(audioCtx.currentTime + 0.1);
    }

    holoNavItems.forEach(nav => nav.classList.remove('active'));
    item.classList.add('active');
    const target = item.getAttribute('data-target');
    morphTo(target);
    holoPanels.forEach(p => p.classList.remove('active'));
    const panel = document.getElementById(`holo-content-${target}`);
    if (panel) panel.classList.add('active');
  });
});

// ─── Core Render Loop ─────────────────────────────────────────────
const clock = new THREE.Clock();

function animate3D() {
  requestAnimationFrame(animate3D);
  if (!engineRunning) return;

  const dt = Math.min(clock.getDelta(), 0.1);

  // Audio reactivity
  let audioBump = 0;
  if (analyser) {
    analyser.getByteFrequencyData(dataArray);
    let sum = 0;
    for (let i = 0; i < 40; i++) sum += dataArray[i];
    audioBump = (sum / 40) / 255;
  }
  const envScale = 1.0 + (audioBump * 0.8);

  // Webcam mirror mode
  if (activeShape === 'mirror' && webcamActive) {
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      vCtx.drawImage(video, 0, 0, 100, 100);
      const data = vCtx.getImageData(0, 0, 100, 100).data;
      
      for (let i = 0; i < particleCount; i++) {
        const xIndex = i % 100;
        const yIndex = Math.floor(i / 100);
        const mx = ((100 - xIndex) - 50) * 0.8;
        const my = (-(yIndex - 50)) * 0.8;
        const pIdx = i * 4;
        const r = data[pIdx] / 255, g = data[pIdx+1] / 255, b = data[pIdx+2] / 255;
        const bright = (r+g+b)/3;
        const mz = ((bright * 30) - 15);
        const idx = i*3;
        basePos[idx]   += (mx - basePos[idx]) * 0.1;
        basePos[idx+1] += (my - basePos[idx+1]) * 0.1;
        basePos[idx+2] += (mz - basePos[idx+2]) * 0.1;
        baseCol[idx]   += (r - baseCol[idx]) * 0.1;
        baseCol[idx+1] += (g - baseCol[idx+1]) * 0.1;
        baseCol[idx+2] += (b - baseCol[idx+2]) * 0.1;
      }
    }
  } else {
    particles.rotation.y += 0.001;
  }

  // Mouse repulsion on 3D particles
  raycaster.setFromCamera(mouse3D, camera);
  const intersects = raycaster.intersectObject(invisiblePlane);
  let mousePoint = null;
  if (intersects.length > 0) mousePoint = intersects[0].point;

  for (let i = 0; i < particleCount; i++) {
    const idx = i * 3;
    let dx = 0, dy = 0, dz = 0;

    if (mousePoint) {
      const mx = mousePoint.x - particles.position.x;
      const my = mousePoint.y;
      const diffX = rendPos[idx] - mx;
      const diffY = rendPos[idx+1] - my;
      const distSq = diffX*diffX + diffY*diffY;
      if (distSq < 200) {
        const force = (200 - distSq) / 200;
        dx = diffX * force * 0.3;
        dy = diffY * force * 0.3;
        dz = force * 20;
      }
    }

    const targetX = basePos[idx]   * (activeShape === 'mirror' ? 1 : envScale);
    const targetY = basePos[idx+1] * (activeShape === 'mirror' ? 1 : envScale);
    const targetZ = basePos[idx+2] * (activeShape === 'mirror' ? 1 : envScale);

    rendPos[idx]   += ((targetX + dx) - rendPos[idx])   * 0.15;
    rendPos[idx+1] += ((targetY + dy) - rendPos[idx+1]) * 0.15;
    rendPos[idx+2] += ((targetZ + dz) - rendPos[idx+2]) * 0.15;

    rendCol[idx]   = THREE.MathUtils.lerp(baseCol[idx],   1.0, audioBump * 0.8);
    rendCol[idx+1] = THREE.MathUtils.lerp(baseCol[idx+1], 1.0, audioBump * 0.8);
    rendCol[idx+2] = THREE.MathUtils.lerp(baseCol[idx+2], 1.0, audioBump * 0.8);
  }

  bloomPass.strength = 2.8 + (audioBump * 2.0);
  rgbPass.uniforms['amount'].value = 0.0015 + (Math.abs(mouse3D.x) * 0.001);

  geometry.attributes.position.needsUpdate = true;
  geometry.attributes.color.needsUpdate    = true;

  composer.render();
}

// Start engine (only renders canvas3d inside frame, uses IntersectionObserver)
const hologramSection = document.getElementById('hologram');
if (hologramSection) {
  const engineObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (!engineRunning && !holoReady) {
          // Pre-render so the particle sphere is ready to go
          engineRunning = true;
          animate3D();
        }
      }
    });
  }, { threshold: 0.05 });
  engineObserver.observe(hologramSection);
}

// Also resize 3D canvas on window resize
window.addEventListener('resize', resize3D, { passive: true });

/* ══════════════════════════════════════════════════════════════════════
   17. SMOOTH SCROLL PROGRESS & REVEAL ON SECTION CHANGE
══════════════════════════════════════════════════════════════════════ */
console.log('%c⚡ Pushkar Biswas — Ultimate Portfolio', 'background:linear-gradient(135deg,#7c3aed,#00ffd5);color:white;padding:8px 16px;border-radius:6px;font-weight:700;font-size:14px;');
console.log('%cBuilt with Three.js · GSAP · Quantum Particles · Lots of ☕', 'color:#00ffd5;font-size:12px;');
