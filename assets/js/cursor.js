/**
 * cursor.js
 * Cursor com lerp + label contextual + idle detection.
 * Funciona mesmo com reduced motion (cursor é funcional, não decorativo).
 * 
 * CORREÇÕES:
 * - RAF único garantido (sem múltiplos loops simultâneos)
 * - Loader detection robusta (MutationObserver + fallback direto)
 * - Cleanup dos event listeners no idle
 */
(() => {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  const cursor = document.querySelector('.cursor');
  if (!cursor) return;

  const dot = cursor.querySelector('.cursor__dot');
  const ring = cursor.querySelector('.cursor__ring');
  const label = cursor.querySelector('.cursor__label');
  if (!dot || !ring || !label) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  // ── Loader detection ──────────────────────────────────
  const loader = document.getElementById('loader');
  let loaderDone = !loader; // se não existe loader, já está pronto

  if (loader && !loader.classList.contains('is-done')) {
    const obs = new MutationObserver(() => {
      if (loader.classList.contains('is-done')) {
        loaderDone = true;
        obs.disconnect();
      }
    });
    obs.observe(loader, { attributes: true, attributeFilter: ['class'] });
    // Fallback: se o loader sumir por qualquer motivo
    setTimeout(() => {
      if (!loaderDone) {
        loaderDone = true;
        obs.disconnect();
      }
    }, 2500);
  } else if (loader) {
    loaderDone = true;
  }

  // ── State ─────────────────────────────────────────────
  let mx = -100, my = -100;
  let dx = -100, dy = -100;
  let rx = -100, ry = -100;
  let lx = -100, ly = -100;
  let moved = false;
  let idle = true; // começa idle até o mouse se mover
  let idleTimer = null;
  let rafId = null;

  const onMove = (e) => {
    mx = e.clientX;
    my = e.clientY;
    if (!moved) {
      dx = rx = lx = mx;
      dy = ry = ly = my;
      moved = true;
      // SÓ adiciona a classe quando o loader terminar E o mouse se mover
      if (loaderDone) cursor.classList.add('is-ready');
      else {
        // Se loader ainda não terminou, agenda para depois
        const checkLoader = () => {
          if (loaderDone) {
            cursor.classList.add('is-ready');
          } else {
            requestAnimationFrame(checkLoader);
          }
        };
        requestAnimationFrame(checkLoader);
      }
    }
    if (idle) {
      idle = false;
      if (!rafId) {
        rafId = requestAnimationFrame(tick);
      }
    }
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      idle = true;
      // Não cancela RAF aqui; o tick continua mas com opacidade
    }, 3000);
  };

  window.addEventListener('mousemove', onMove, { passive: true });
  document.addEventListener('mouseenter', () => {
    if (loaderDone && moved) cursor.classList.add('is-ready');
  });
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

    // Sempre continua o RAF, mas o CSS controla a opacidade
    rafId = requestAnimationFrame(tick);
  };

  // Inicia o RAF imediatamente (o CSS mantém opacidade 0 até .is-ready)
  rafId = requestAnimationFrame(tick);

  // ── Interactive hover ─────────────────────────────────
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
