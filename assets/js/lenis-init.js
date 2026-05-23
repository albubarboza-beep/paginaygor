/**
 * lenis-init.js
 * Smooth scroll com Lenis corrigido para máxima fluidez.
 * Sem travamentos ou conflitos com o GSAP Ticker.
 */
(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!window.Lenis) return;

  const lenis = new window.Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 2,
  });

  // Loop de RAF limpo e nativo (Extremamente seguro contra travamentos)
  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // Sincroniza ScrollTrigger suavemente assim que ele carregar
  const syncST = setInterval(() => {
    if (window.ScrollTrigger) {
      lenis.on('scroll', window.ScrollTrigger.update);
      clearInterval(syncST);
    }
  }, 100);

  window.lenis = lenis;

  // Smooth scroll para âncoras e botões
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id && id.length > 1 && id !== '#') {
        const target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          lenis.scrollTo(target, { offset: -80, duration: 1.4 });
        }
      }
    });
  });
})();
