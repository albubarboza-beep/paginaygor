/**
 * cursor.js
 * Cursor avançado com lerp + label contextual via [data-cursor-label].
 */
(() => {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const cursor = document.querySelector('.cursor');
  if (!cursor) return;

  const dot = cursor.querySelector('.cursor__dot');
  const ring = cursor.querySelector('.cursor__ring');
  const label = cursor.querySelector('.cursor__label');
  if (!dot || !ring || !label) return;

  let mx = -100, my = -100;
  let dx = -100, dy = -100;
  let rx = -100, ry = -100;
  let lx = -100, ly = -100;
  let moved = false;

  const onMove = (e) => {
    mx = e.clientX; my = e.clientY;
    if (!moved) {
      dx = rx = lx = mx;
      dy = ry = ly = my;
      moved = true;
      cursor.classList.add('is-ready');
    }
  };

  window.addEventListener('mousemove', onMove, { passive: true });
  document.addEventListener('mouseenter', () => cursor.classList.add('is-ready'));
  document.addEventListener('mouseleave', () => cursor.classList.remove('is-ready'));

  const lerp = (a, b, n) => a + (b - a) * n;

  const tick = () => {
    dx = lerp(dx, mx, 0.6);
    dy = lerp(dy, my, 0.6);
    rx = lerp(rx, mx, 0.18);
    ry = lerp(ry, my, 0.18);
    lx = lerp(lx, mx, 0.22);
    ly = lerp(ly, my, 0.22);

    dot.style.setProperty('--x', `${dx}px`);
    dot.style.setProperty('--y', `${dy}px`);
    ring.style.setProperty('--x', `${rx}px`);
    ring.style.setProperty('--y', `${ry}px`);
    label.style.setProperty('--x', `${lx}px`);
    label.style.setProperty('--y', `${ly}px`);

    requestAnimationFrame(tick);
  };
  tick();

  // Hover state em interativos
  const interactives = 'a, button, [data-magnetic], summary, input, textarea, select, details';
  document.querySelectorAll(interactives).forEach((el) => {
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('is-hover');
      const text = el.getAttribute('data-cursor-label');
      if (text) {
        label.textContent = text;
        cursor.classList.add('has-label');
      }
    });
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('is-hover');
      cursor.classList.remove('has-label');
    });
  });
})();
