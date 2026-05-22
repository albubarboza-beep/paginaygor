/**
 * magnetic.js
 * Botões magnéticos. Mantido — funciona perfeitamente.
 */
(() => {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const STRENGTH = 0.22;
  const RADIUS = 90;

  document.querySelectorAll('[data-magnetic]').forEach((el) => {
    let rafId = null;
    let hover = false;

    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);

      if (dist < rect.width / 2 + RADIUS) {
        hover = true;
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          el.style.transform = `translate(${dx * STRENGTH}px, ${dy * STRENGTH}px)`;
        });
      } else if (hover) {
        hover = false;
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => { el.style.transform = ''; });
      }
    };

    const onLeave = () => {
      hover = false;
      if (rafId) cancelAnimationFrame(rafId);
      el.style.transform = '';
    };

    window.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
  });
})();
