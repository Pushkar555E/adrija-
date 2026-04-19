/* home.js — Adrija Home Page */
import { injectNav, injectFooter, injectCursor, injectScrollProgress, initReveal, initGlassCardGlow, injectPreloader } from './shared.js';

injectPreloader();
injectCursor();
injectScrollProgress();
injectNav('home');
injectFooter();
initReveal();
initGlassCardGlow();

/* ── Hero particle canvas: rose + ms blue + lavender particles ── */
(function initParticles() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [], mouse = { x: -9999, y: -9999 };
  const COUNT = 65;
  const CONNECT = 120;
  // Feminine palette: rose, ms-blue, lavender, blush-gold
  const PALETTE = ['rgba(244,63,142,', 'rgba(0,120,212,', 'rgba(196,181,253,', 'rgba(251,191,36,'];

  class Particle {
    constructor() { this.reset(true); }
    reset(init) {
      this.x = Math.random() * W; this.y = init ? Math.random() * H : H + 10;
      this.vx = (Math.random()-.5)*.28; this.vy = (Math.random()-.5)*.28;
      this.r = Math.random()*1.5+.35; this.alpha = Math.random()*.35+.12;
      this.col = PALETTE[Math.floor(Math.random()*PALETTE.length)];
    }
    update() {
      this.x += this.vx; this.y += this.vy;
      const dx = this.x-mouse.x, dy = this.y-mouse.y, d = Math.sqrt(dx*dx+dy*dy);
      if (d < 75) { const f=(75-d)/75*1.3; this.x+=(dx/d)*f; this.y+=(dy/d)*f; }
      if (this.x<0) this.x=W; if (this.x>W) this.x=0;
      if (this.y<0) this.y=H; if (this.y>H) this.y=0;
    }
    draw() { ctx.beginPath(); ctx.arc(this.x,this.y,this.r,0,Math.PI*2); ctx.fillStyle=this.col+this.alpha+')'; ctx.fill(); }
  }

  const resize = () => { W=canvas.width=innerWidth; H=canvas.height=innerHeight; };
  const init = () => { resize(); particles=Array.from({length:COUNT},()=>new Particle()); };
  const drawLines = () => {
    for (let i=0;i<particles.length;i++) for (let j=i+1;j<particles.length;j++) {
      const a=particles[i],b=particles[j],dx=a.x-b.x,dy=a.y-b.y,d=Math.sqrt(dx*dx+dy*dy);
      if (d<CONNECT) { const al=(1-d/CONNECT)*.1; ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.strokeStyle='rgba(244,63,142,'+al+')'; ctx.lineWidth=.5; ctx.stroke(); }
    }
  };
  const loop = () => { ctx.clearRect(0,0,W,H); particles.forEach(p=>{p.update();p.draw();}); drawLines(); requestAnimationFrame(loop); };
  window.addEventListener('resize', resize, {passive:true});
  document.addEventListener('mousemove', e=>{mouse.x=e.clientX;mouse.y=e.clientY;});
  init(); loop();
})();

/* ── Typewriter ── */
(function() {
  const el = document.getElementById('typedText');
  if (!el) return;
  const roles = ['beautiful UIs.', 'Azure cloud apps.', 'AI-powered tools.', 'skincare tracking apps. 🌸', 'the future. 💜', 'Google + Microsoft magic.'];
  let ri=0, ci=0, del=false;
  const type = () => {
    const cur = roles[ri];
    if (!del) { el.textContent=cur.slice(0,++ci); if(ci===cur.length){del=true;setTimeout(type,1800);return;} }
    else { el.textContent=cur.slice(0,--ci); if(ci===0){del=false;ri=(ri+1)%roles.length;setTimeout(type,350);return;} }
    setTimeout(type, del?32:72);
  };
  setTimeout(type, 1200);
})();

/* ── Counter animation ── */
(function() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el=e.target, target=parseInt(el.dataset.count), start=performance.now();
      const step=now=>{const p=Math.min((now-start)/1000,1),eased=1-Math.pow(1-p,3);el.textContent=Math.round(eased*target)+'+';if(p<1)requestAnimationFrame(step);};
      requestAnimationFrame(step); obs.unobserve(el);
    });
  },{threshold:.5});
  document.querySelectorAll('[data-count]').forEach(el=>obs.observe(el));
})();

console.log('%c🌸 Adrija — Portfolio', 'background:linear-gradient(90deg,#F43F8E,#A78BFA,#0078D4);color:white;padding:8px 18px;border-radius:100px;font-weight:700;font-size:13px;');
