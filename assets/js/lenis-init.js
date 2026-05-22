/**
 * lenis-init.js
 * Smooth scroll com Lenis (usado por 90% dos sites Awwwards SOTD).
 * Integra com GSAP ScrollTrigger.
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

  // RAF loop
  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // Integração com GSAP ScrollTrigger (sincronia)
  const tryIntegrate = () => {
    if (window.gsap && window.ScrollTrigger) {
      lenis.on('scroll', window.ScrollTrigger.update);
      window.gsap.ticker.add((time) => lenis.raf(time * 1000));
      window.gsap.ticker.lagSmoothing(0);
    } else {
      setTimeout(tryIntegrate, 50);
    }
  };
  tryIntegrate();

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
