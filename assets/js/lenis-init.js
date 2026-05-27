/**
 * lenis-init.js
 * Smooth scroll APENAS desktop. Mobile usa scroll nativo.
 * 
 * CORREÇÕES:
 * - Proteção contra múltiplos tickers do GSAP (flag `_integrated`)
 * - RAF único garantido
 */
(() => {
  if (!window.Lenis) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

  if (isTouch || prefersReduced) return;

  const lenis = new window.Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    smoothTouch: false,
    touchMultiplier: 2,
    wheelMultiplier: 1,
  });

  let rafId = null;
  let integrated = false; // flag para evitar múltiplos tickers

  const tick = (time) => {
    lenis.raf(time);
    rafId = requestAnimationFrame(tick);
  };
  rafId = requestAnimationFrame(tick);

  const tryIntegrate = (attempts) => {
    attempts = attempts || 0;
    if (attempts > 60) return;
    if (integrated) return; // já integrado

    if (window.gsap && window.ScrollTrigger) {
      integrated = true;
      // Cancela o RAF standalone e usa o ticker do GSAP
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

  // Anchor links com smooth scroll
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
