/**
 * magnetic.js
 * Efeito magnético sutil em elementos com [data-magnetic].
 * Desktop only, respeita prefers-reduced-motion.
 */
(() => {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const STRENGTH = 0.25;     // 0 = nenhum, 1 = grudado no mouse
  const RADIUS = 80;         // distância em px que ativa o efeito

  const elements = document.querySelectorAll('[data-magnetic]');

  elements.forEach((el) => {
    let rafId = null;
    let isHovering = false;

    const onMouseMove = (e) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);

      if (dist < rect.width / 2 + RADIUS) {
        isHovering = true;
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          el.style.transform = `translate(${dx * STRENGTH}px, ${dy * STRENGTH}px)`;
        });
      } else if (isHovering) {
        isHovering = false;
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          el.style.transform = '';
        });
      }
    };

    const onMouseLeave = () => {
      isHovering = false;
      if (rafId) cancelAnimationFrame(rafId);
      el.style.transform = '';
    };

    window.addEventListener('mousemove', onMouseMove);
    el.addEventListener('mouseleave', onMouseLeave);
  });
})();
