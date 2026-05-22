/**
 * cursor.js
 * Cursor customizado com lerp para suavidade.
 * Desativado em pointer:coarse (touch) automaticamente.
 *
 * FIX: usa CSS variables (--x, --y) para evitar conflito com translate(-50%, -50%)
 * FIX: posição inicial fora da tela até primeiro movimento (evita flash em 0,0)
 * FIX: detecta posição via mouseenter no document para casos de mouse já presente
 */
(() => {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const cursor = document.querySelector('.cursor');
  if (!cursor) return;

  const dot = cursor.querySelector('.cursor__dot');
  const ring = cursor.querySelector('.cursor__ring');
  if (!dot || !ring) return;

  // —— posição inicial fora da tela (evita flash no 0,0) ——
  let mouseX = -100;
  let mouseY = -100;
  let dotX = -100, dotY = -100;
  let ringX = -100, ringY = -100;

  let hasMoved = false;

  const onMove = (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (!hasMoved) {
      // primeiro movimento: snap (sem lerp) para evitar animação esquisita da borda
      dotX = ringX = mouseX;
      dotY = ringY = mouseY;
      hasMoved = true;
    }

    // CORREÇÃO: Garante que o cursor volte a aparecer sempre que o mouse se mover dentro da tela
    if (!cursor.classList.contains('is-ready')) {
      cursor.classList.add('is-ready');
    }
  };

  window.addEventListener('mousemove', onMove, { passive: true });
  window.addEventListener('mouseenter', onMove, { passive: true });
  document.addEventListener('mouseenter', onMove, { passive: true });

  // —— esconde cursor quando sai da janela ——
  document.addEventListener('mouseleave', () => {
    cursor.classList.remove('is-ready');
  });
  
  document.addEventListener('mouseenter', () => {
    cursor.classList.add('is-ready');
  });

  const lerp = (a, b, n) => a + (b - a) * n;

  const tick = () => {
    dotX = lerp(dotX, mouseX, 0.55);
    dotY = lerp(dotY, mouseY, 0.55);
    ringX = lerp(ringX, mouseX, 0.18);
    ringY = lerp(ringY, mouseY, 0.18);

    // usa CSS custom props — não conflita com translate(-50%, -50%) do CSS
    dot.style.setProperty('--x', `${dotX}px`);
    dot.style.setProperty('--y', `${dotY}px`);
    ring.style.setProperty('--x', `${ringX}px`);
    ring.style.setProperty('--y', `${ringY}px`);

    requestAnimationFrame(tick);
  };
  tick();

  // —— hover state em interativos ——
  const interactives = 'a, button, [data-magnetic], summary, input, textarea, select, details';
  document.querySelectorAll(interactives).forEach((el) => {
    el.addEventListener('mouseenter', () => cursor.classList.add('is-hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('is-hover'));
  });
})();
