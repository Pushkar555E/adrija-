/* journey.js */
import { injectNav, injectFooter, injectCursor, injectScrollProgress, initReveal, initGlassCardGlow, injectPreloader } from './shared.js';
injectPreloader(); injectCursor(); injectScrollProgress();
injectNav('journey'); injectFooter(); initReveal(); initGlassCardGlow();
const bars = document.querySelectorAll('.goal-bar-fill');
const obs = new IntersectionObserver(entries => { entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('animated'); obs.unobserve(e.target); } }); }, { threshold: .3 });
bars.forEach(b => obs.observe(b));
