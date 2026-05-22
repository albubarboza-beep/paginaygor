/**
 * cursor.js
 * Cursor customizado com Lerp e Sistema de Segurança (Fail-safe).
 */
(() => {
  // 1. Aborta se for touch ou não suportar mouse
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  // 2. Aborta se o sistema operacional pedir redução de animações
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const cursor = document.querySelector('.cursor');
  const dot = cursor?.querySelector('.cursor__dot');
  const ring = cursor?.querySelector('.cursor__ring');

  if (!cursor || !dot || !ring) return;

  // 3. SUCESSO! JS rodou perfeito. Adicionamos a classe no HTML que esconde o mouse padrão
  document.documentElement.classList.add('custom-cursor-active');

  let mouseX = -100, mouseY = -100;
  let dotX = -100, dotY = -100;
  let ringX = -100, ringY = -100;
  let hasMoved = false;

  const onMove = (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (!hasMoved) {
      dotX = ringX = mouseX;
      dotY = ringY = mouseY;
      hasMoved = true;
      cursor.classList.add('is-ready');
    } else if (!cursor.classList.contains('is-ready')) {
      cursor.classList.add('is-ready');
    }
  };

  window.addEventListener('mousemove', onMove, { passive: true });
  document.addEventListener('mouseenter', () => cursor.classList.add('is-ready'));
  document.addEventListener('mouseleave', () => cursor.classList.remove('is-ready'));

  const lerp = (a, b, n) => a + (b - a) * n;

  const tick = () => {
    if (hasMoved) {
      dotX = lerp(dotX, mouseX, 0.55);
      dotY = lerp(dotY, mouseY, 0.55);
      ringX = lerp(ringX, mouseX, 0.18);
      ringY = lerp(ringY, mouseY, 0.18);

      dot.style.setProperty('--x', `${dotX}px`);
      dot.style.setProperty('--y', `${dotY}px`);
      ring.style.setProperty('--x', `${ringX}px`);
      ring.style.setProperty('--y', `${ringY}px`);
    }
    requestAnimationFrame(tick);
  };
  tick();

  const interactives = 'a, button, [data-magnetic], summary, input, textarea, select, details';
  document.querySelectorAll(interactives).forEach((el) => {
    el.addEventListener('mouseenter', () => cursor.classList.add('is-hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('is-hover'));
  });
})();
