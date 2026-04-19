/* skills.js */
import { injectNav, injectFooter, injectCursor, injectScrollProgress, initReveal, initGlassCardGlow, injectPreloader } from './shared.js';
injectPreloader(); injectCursor(); injectScrollProgress();
injectNav('skills'); injectFooter(); initReveal(); initGlassCardGlow();
const bars = document.querySelectorAll('.skill-bar');
const obs = new IntersectionObserver(entries => { entries.forEach(e => { if (e.isIntersecting) { setTimeout(() => { e.target.style.width = e.target.dataset.w + '%'; }, 200); obs.unobserve(e.target); } }); }, { threshold: .3 });
bars.forEach(b => obs.observe(b));
