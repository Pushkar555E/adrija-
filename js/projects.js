/* projects.js */
import { injectNav, injectFooter, injectCursor, injectScrollProgress, initReveal, initGlassCardGlow, injectPreloader } from './shared.js';
injectPreloader(); injectCursor(); injectScrollProgress();
injectNav('projects'); injectFooter(); initReveal(); initGlassCardGlow();
document.querySelectorAll('.project-card').forEach(card => {
  let active = false;
  card.addEventListener('mouseenter', () => { active = true; card.style.transition = 'box-shadow .3s,border-color .3s'; });
  card.addEventListener('mousemove', e => {
    if (!active) return;
    const b = card.getBoundingClientRect();
    const rx = ((e.clientY-b.top-b.height/2)/(b.height/2))*-8, ry = ((e.clientX-b.left-b.width/2)/(b.width/2))*8;
    card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(6px)`;
  });
  card.addEventListener('mouseleave', () => {
    active = false;
    card.style.transition = 'transform .5s cubic-bezier(.22,1,.36,1),box-shadow .3s,border-color .3s';
    card.style.transform = 'perspective(900px) rotateX(0) rotateY(0) translateZ(0)';
  });
});
