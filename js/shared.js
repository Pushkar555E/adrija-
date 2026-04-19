/* =====================================================================
   SHARED — Adrija Portfolio
   Nav, Footer, Cursor, Scroll Progress, Utilities
   ===================================================================== */

export function injectNav(activePage = '') {
  const nav = document.createElement('nav');
  nav.className = 'nav'; nav.id = 'nav';
  const isRoot = !window.location.pathname.includes('/pages/');

  const pages = [
    { key: 'home',     label: 'Home' },
    { key: 'about',    label: 'About' },
    { key: 'skills',   label: 'Skills' },
    { key: 'projects', label: 'Projects' },
    { key: 'lab',      label: '✦ 3D Lab' },
    { key: 'journey',  label: 'Journey' },
    { key: 'contact',  label: 'Contact', cta: true },
  ];

  const link = (key) => isRoot
    ? (key === 'home' ? './' : `./pages/${key}.html`)
    : (key === 'home' ? '../index.html' : `./${key}.html`);

  const linksHTML = pages.map(p =>
    `<li><a href="${link(p.key)}" class="${[activePage === p.key ? 'active' : '', p.cta ? 'nav-cta' : ''].join(' ').trim()}">${p.label}</a></li>`
  ).join('');

  nav.innerHTML = `
    <div class="nav-inner">
      <a href="${isRoot ? './' : '../index.html'}" class="nav-logo">
        <div class="ms-squares"><span></span><span></span><span></span><span></span></div>
        <span class="nav-logo-text">Adrija</span>
      </a>
      <ul class="nav-links" id="navLinks">${linksHTML}</ul>
      <div class="nav-status">
        <div class="nav-status-dot"></div>
        <span id="navTime">00:00:00</span>
      </div>
      <button class="hamburger" id="hamburger" aria-label="Menu">
        <span></span><span></span><span></span>
      </button>
    </div>
    <div class="mobile-menu" id="mobileMenu"><ul>${linksHTML}</ul></div>
  `;
  document.body.prepend(nav);

  // Clock
  const clockEl = document.getElementById('navTime');
  const tick = () => { if (clockEl) clockEl.textContent = [new Date().getHours(), new Date().getMinutes(), new Date().getSeconds()].map(x => String(x).padStart(2,'0')).join(':'); };
  tick(); setInterval(tick, 1000);

  // Scrolled
  const onScroll = () => nav.classList.toggle('scrolled', scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // Hamburger
  const ham = document.getElementById('hamburger'), mob = document.getElementById('mobileMenu');
  ham?.addEventListener('click', () => { ham.classList.toggle('open'); mob.classList.toggle('open'); });
  mob?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { ham.classList.remove('open'); mob.classList.remove('open'); }));
}

export function injectFooter() {
  const footer = document.createElement('footer');
  footer.innerHTML = `
    <div class="footer-inner">
      <div class="footer-logo">Adrija</div>
      <div style="display:flex;gap:1rem;align-items:center;margin:.25rem 0">
        <div class="ms-squares" style="width:20px;height:20px"><span></span><span></span><span></span><span></span></div>
        <span style="font-size:.8rem;color:var(--text-dim)">×</span>
        <div class="google-dots"><span style="width:9px;height:9px"></span><span style="width:9px;height:9px"></span><span style="width:9px;height:9px"></span><span style="width:9px;height:9px"></span></div>
      </div>
      <p class="footer-tagline">Student · Developer · Skincare Geek · <span style="color:var(--ms-blue)">Microsoft</span> &amp; <strong style="color:#4285F4">G</strong><strong style="color:#EA4335">o</strong><strong style="color:#FBBC05">o</strong><strong style="color:#4285F4">g</strong><strong style="color:#34A853">l</strong><strong style="color:#EA4335">e</strong> Lover</p>
      <p class="footer-meta">© 2025 · Adrija · Built with 💖 and lots of moisturiser</p>
      <div class="footer-links">
        <a href="https://github.com/" target="_blank">GitHub</a>
        <a href="https://linkedin.com/" target="_blank">LinkedIn</a>
        <a href="mailto:adrija@example.com">Email</a>
      </div>
      <div class="footer-brand-bar">
        <span></span><span></span><span></span><span></span><span></span><span></span>
      </div>
    </div>
  `;
  document.body.appendChild(footer);
}

export function injectCursor() {
  const dot = document.createElement('div'); dot.className = 'cursor'; dot.id = 'cursorDot';
  dot.innerHTML = '<div class="cursor-dot" id="cdot"></div>';
  const ring = document.createElement('div'); ring.className = 'cursor'; ring.id = 'cursorRing';
  ring.innerHTML = '<div class="cursor-ring" id="cring"></div>';
  document.body.prepend(ring); document.body.prepend(dot);
  const dotEl = document.getElementById('cdot'), ringEl = document.getElementById('cring');
  const dotWrap = document.getElementById('cursorDot'), ringWrap = document.getElementById('cursorRing');
  let mx = -200, my = -200, rx = -200, ry = -200;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; dotWrap.style.transform = `translate(${e.clientX}px,${e.clientY}px)`; });
  (function loop() { rx += (mx-rx)*.12; ry += (my-ry)*.12; ringWrap.style.transform = `translate(${rx}px,${ry}px)`; requestAnimationFrame(loop); })();
  document.querySelectorAll('a,button,[data-cursor]').forEach(el => {
    el.addEventListener('mouseenter', () => { dotEl.classList.add('hovered'); ringEl.classList.add('hovered'); });
    el.addEventListener('mouseleave', () => { dotEl.classList.remove('hovered'); ringEl.classList.remove('hovered'); });
  });
}

export function injectScrollProgress() {
  const bar = document.createElement('div'); bar.id = 'scroll-progress';
  document.body.prepend(bar);
  window.addEventListener('scroll', () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = (scrollY / max * 100) + '%';
  }, { passive: true });
}

export function initReveal() {
  const els = document.querySelectorAll('.reveal,.reveal-left');
  if (!els.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.08, rootMargin: '0px 0px -50px 0px' });
  els.forEach(el => obs.observe(el));
}

export function initGlassCardGlow() {
  document.querySelectorAll('.glass-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = ((e.clientX-r.left)/r.width)*100, y = ((e.clientY-r.top)/r.height)*100;
      card.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(244,63,142,0.07) 0%, rgba(255,255,255,0.03) 60%), linear-gradient(145deg,rgba(255,255,255,0.065),rgba(255,255,255,0.02))`;
    });
    card.addEventListener('mouseleave', () => { card.style.background = ''; });
  });
}

export function injectPreloader() {
  const loader = document.createElement('div'); loader.id = 'preloader';
  loader.innerHTML = `
    <div class="pre-logo">Adrija</div>
    <div class="pre-sub">loading portfolio</div>
    <div class="pre-dots-row">
      <span></span><span></span><span></span><span></span><span></span>
    </div>
  `;
  document.body.prepend(loader);
  setTimeout(() => { loader.classList.add('hidden'); setTimeout(() => loader.remove(), 700); }, 950);
}
