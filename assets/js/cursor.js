/**
 * cursor.js
 * Cursor customizado com lerp (linear interpolation) para suavidade.
 * Desativado em pointer:coarse (touch) automaticamente via CSS.
 */
(() => {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const cursor = document.querySelector('.cursor');
  if (!cursor) return;

  const dot = cursor.querySelector('.cursor__dot');
  const ring = cursor.querySelector('.cursor__ring');

  let mouseX = 0, mouseY = 0;
  let dotX = 0, dotY = 0;
  let ringX = 0, ringY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  const lerp = (a, b, n) => a + (b - a) * n;

  const tick = () => {
    dotX = lerp(dotX, mouseX, 0.5);
    dotY = lerp(dotY, mouseY, 0.5);
    ringX = lerp(ringX, mouseX, 0.18);
    ringY = lerp(ringY, mouseY, 0.18);

    dot.style.transform = `translate(${dotX}px, ${dotY}px)`;
    ring.style.transform = `translate(${ringX}px, ${ringY}px)`;

    requestAnimationFrame(tick);
  };
  tick();

  // —— estado hover sobre interativos ——
  const interactives = 'a, button, [data-magnetic], summary, input, textarea, select';
  document.querySelectorAll(interactives).forEach((el) => {
    el.addEventListener('mouseenter', () => cursor.classList.add('is-hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('is-hover'));
  });
})();
