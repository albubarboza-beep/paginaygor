/**
 * magnetic.js
 * Botoes magneticos — delegate pattern com RAF singleton.
 * Usa CSS custom properties para nao sobrescrever transforms do CSS hover.
 * Funciona mesmo com reduced motion (e feedback de interacao, nao animacao decorativa).
 */
(() => {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  const STRENGTH = 0.22;
  const RADIUS = 90;
  const magnetics = document.querySelectorAll('[data-magnetic]');
  if (!magnetics.length) return;

  let rafId = null;
  let mx = 0, my = 0;

  const update = () => {
    magnetics.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = mx - cx;
      const dy = my - cy;
      const dist = Math.hypot(dx, dy);
      const threshold = rect.width / 2 + RADIUS;

      if (dist < threshold) {
        // CSS custom properties: nao conflitam com transform do hover
        el.style.setProperty('--mag-x', `${dx * STRENGTH}px`);
        el.style.setProperty('--mag-y', `${dy * STRENGTH}px`);
      } else {
        el.style.removeProperty('--mag-x');
        el.style.removeProperty('--mag-y');
      }
    });
    rafId = null;
  };

  window.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
    if (!rafId) rafId = requestAnimationFrame(update);
  }, { passive: true });
})();
