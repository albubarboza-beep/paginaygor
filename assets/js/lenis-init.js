/**
 * lenis-init.js
 * Smooth scroll com Lenis (usado por 90% dos sites Awwwards SOTD).
 * Integra com GSAP ScrollTrigger.
 *
 * MELHORIA: Integração mais robusta, evita RAF duplo
 * quando GSAP ticker assume controle.
 */
(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!window.Lenis) return;

  const lenis = new window.Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    smoothTouch: false,
    touchMultiplier: 2,
    wheelMultiplier: 1,
  });

  // RAF loop (fallback — substituído quando GSAP assume)
  let rafId = null;
  function raf(time) {
    lenis.raf(time);
    rafId = requestAnimationFrame(raf);
  }
  rafId = requestAnimationFrame(raf);

  // Integração com GSAP ScrollTrigger (sincronia)
  const tryIntegrate = (attempts) => {
    attempts = attempts || 0;
    if (attempts > 60) return; // desiste após 3s

    if (window.gsap && window.ScrollTrigger) {
      // Para o RAF manual — GSAP ticker cuida disso agora
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }

      lenis.on('scroll', window.ScrollTrigger.update);
      window.gsap.ticker.add((time) => lenis.raf(time * 1000));
      window.gsap.ticker.lagSmoothing(0);
    } else {
      setTimeout(() => tryIntegrate(attempts + 1), 50);
    }
  };
  tryIntegrate(0);

  // Expor para outros módulos
  window.lenis = lenis;

  // Smooth scroll para âncoras
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
