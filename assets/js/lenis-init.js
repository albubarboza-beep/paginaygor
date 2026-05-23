/**
 * lenis-init.js
 * Smooth scroll FORÇADO (ignorando restrições do SO).
 */
(() => {
  // TRAVA DE REDUÇÃO DE ANIMAÇÕES REMOVIDA DAQUI!
  if (!window.Lenis) return;

  const lenis = new window.Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    smoothTouch: false,
    touchMultiplier: 2,
    wheelMultiplier: 1,
  });

  let rafId = null;
  function raf(time) {
    lenis.raf(time);
    rafId = requestAnimationFrame(raf);
  }
  rafId = requestAnimationFrame(raf);

  const tryIntegrate = (attempts) => {
    attempts = attempts || 0;
    if (attempts > 60) return;

    if (window.gsap && window.ScrollTrigger) {
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

  window.lenis = lenis;

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
