/* contact.js */
import { injectNav, injectFooter, injectCursor, injectScrollProgress, initReveal, initGlassCardGlow, injectPreloader } from './shared.js';
injectPreloader(); injectCursor(); injectScrollProgress();
injectNav('contact'); injectFooter(); initReveal(); initGlassCardGlow();
const form = document.getElementById('contactForm'), success = document.getElementById('formSuccess');
if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = document.getElementById('contact-submit');
    btn.disabled = true; btn.querySelector('span').textContent = 'Sending... 🌸';
    setTimeout(() => { form.reset(); success.style.display = 'block'; btn.disabled = false; btn.querySelector('span').textContent = 'Send Message'; setTimeout(() => { success.style.display = 'none'; }, 4000); }, 1200);
  });
}
