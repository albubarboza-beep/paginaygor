/**
 * animations.js
 * Orquestracao reveal + GSAP + SplitType + counters.
 * 
 * CORREÇÕES:
 * - Proteção contra dupla inicialização (flag `_booted`)
 * - Counters: verificação `_counted` para evitar reanimação
 * - will-change removido após animação para liberar VRAM
 * - Safety nets mantidos como fallback
 */
(() => {
  // ── Guard: previne dupla inicialização ─────────────────
  if (window.__animationsBooted) return;
  window.__animationsBooted = true;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.matchMedia('(max-width: 767px)').matches;

  // ════════════════════════════════════════════════════════
  // 1. REVEAL VIA INTERSECTION OBSERVER (PRIMARIO)
  // ════════════════════════════════════════════════════════
  const revealEls = document.querySelectorAll('[data-reveal]');

  // Marca reveals do hero como visiveis imediatamente
  revealEls.forEach((el) => {
    if (el.closest('.hero')) {
      el.classList.add('is-visible');
      el.setAttribute('data-revealed', 'hero');
    }
  });

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          // Skip: já visível
          if (el.classList.contains('is-visible')) {
            io.unobserve(el);
            return;
          }
          const delay = parseFloat(el.dataset.revealDelay || '0') * 1000;
          const reveal = () => {
            el.classList.add('is-visible');
            // Cleanup will-change após transição (libera VRAM)
            el.addEventListener('transitionend', () => {
              el.style.willChange = 'auto';
            }, { once: true });
          };
          if (delay > 0) {
            setTimeout(reveal, delay);
          } else {
            reveal();
          }
          io.unobserve(el);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });

    revealEls.forEach((el) => {
      if (!el.classList.contains('is-visible')) io.observe(el);
    });
  } else {
    // Sem IntersectionObserver: tudo visivel imediatamente
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  // ════════════════════════════════════════════════════════
  // 2. SAFETY NETS
  // ════════════════════════════════════════════════════════
  setTimeout(() => {
    document.querySelectorAll('[data-split]:not(.split-ready), [data-split-lines]:not(.split-ready)').forEach((el) => {
      el.classList.add('split-ready');
    });
  }, 1500);

  setTimeout(() => {
    document.querySelectorAll('[data-reveal]:not(.is-visible)').forEach((el) => {
      el.classList.add('is-visible');
    });
  }, 2500);

  // ════════════════════════════════════════════════════════
  // 3. GSAP ENHANCEMENT
  // ════════════════════════════════════════════════════════
  const boot = (attempts) => {
    attempts = attempts || 0;
    if (!window.gsap) {
      if (attempts > 30) return;
      setTimeout(() => boot(attempts + 1), 50);
      return;
    }

    const { gsap } = window;
    const ST = window.ScrollTrigger;
    const SPT = window.SplitType;

    if (ST) gsap.registerPlugin(ST);

    const dur = prefersReduced ? 0.4 : 1;
    const charY = prefersReduced ? 0 : 110;
    const stag = prefersReduced ? 0 : 0.025;

    // ── SPLIT TYPE ──────────────────────────────────────
    if (SPT) {
      document.querySelectorAll('[data-split]').forEach((el) => {
        try {
          new SPT(el, { types: 'words, chars' });
          el.classList.add('split-ready');
        } catch (e) { el.classList.add('split-ready'); }
      });

      document.querySelectorAll('[data-split-lines]').forEach((el) => {
        try {
          new SPT(el, { types: 'lines, words' });
          el.classList.add('split-ready');
          el.querySelectorAll('.line').forEach((line) => {
            const inner = document.createElement('span');
            inner.className = 'line__inner';
            inner.style.display = 'inline-block';
            while (line.firstChild) inner.appendChild(line.firstChild);
            line.appendChild(inner);
          });
        } catch (e) { el.classList.add('split-ready'); }
      });
    } else {
      document.querySelectorAll('[data-split], [data-split-lines]').forEach((el) => {
        el.classList.add('split-ready');
      });
    }

    // ── HERO ENTRANCE TIMELINE ──────────────────────────
    try {
      const hero = document.querySelector('.hero');
      if (hero) {
        const tl = gsap.timeline({ defaults: { ease: 'expo.out' }, delay: 0.15 });

        const kicker = hero.querySelector('.hero__kicker');
        const chars = hero.querySelectorAll('[data-split] .char');
        const actions = hero.querySelectorAll('.hero__actions > *');
        const scroll = hero.querySelector('.hero__scroll');
        const marquee = hero.querySelector('.hero__marquee');

        if (kicker) tl.from(kicker, { opacity: 0, y: prefersReduced ? 0 : 16, duration: dur * 0.9 });

        if (chars && chars.length > 0) {
          tl.from(chars, {
            yPercent: charY,
            opacity: 0,
            duration: dur * 1.1,
            stagger: stag,
            immediateRender: false,
            onComplete: () => {
              // Libera will-change dos chars após animação
              chars.forEach((c) => { c.style.willChange = 'auto'; });
            }
          }, kicker ? '-=0.5' : 0);
        }

        if (actions && actions.length > 0) {
          tl.from(actions, { opacity: 0, y: prefersReduced ? 0 : 20, duration: dur * 0.9, stagger: 0.1 }, '-=0.7');
        }

        if (scroll) tl.from(scroll, { opacity: 0, duration: dur * 0.8 }, '-=0.5');
        if (marquee) tl.from(marquee, { opacity: 0, duration: dur * 0.8 }, '-=0.6');
      }
    } catch (e) { /* silent */ }

    // ── SPLIT LINES SCROLL ──────────────────────────────
    if (ST) {
      document.querySelectorAll('[data-split-lines]').forEach((el) => {
        const lines = el.querySelectorAll('.line__inner');
        if (!lines.length) return;
        gsap.from(lines, {
          yPercent: prefersReduced ? 0 : 105,
          opacity: 0,
          duration: dur * 1.1,
          ease: 'expo.out',
          stagger: prefersReduced ? 0.05 : 0.1,
          scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none', once: true },
          onComplete: () => {
            lines.forEach((l) => { l.style.willChange = 'auto'; });
          }
        });
      });
    }

    // ── COUNTERS ────────────────────────────────────────
    const counters = document.querySelectorAll('[data-counter]');
    if (counters.length && 'IntersectionObserver' in window) {
      const countIO = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          if (el.dataset.counted === 'true') {
            countIO.unobserve(el);
            return;
          }
          el.dataset.counted = 'true';
          const target = parseInt(el.dataset.counter, 10);
          if (isNaN(target)) return;
          const obj = { val: 0 };
          gsap.to(obj, {
            val: target,
            duration: prefersReduced ? 0.8 : 2,
            ease: 'power3.out',
            onUpdate: () => { el.textContent = Math.round(obj.val).toLocaleString('pt-BR'); }
          });
          countIO.unobserve(el);
        });
      }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });

      counters.forEach((el) => countIO.observe(el));
    } else {
      counters.forEach((el) => {
        if (el.dataset.counted === 'true') return;
        el.dataset.counted = 'true';
        const t = parseInt(el.dataset.counter, 10);
        if (!isNaN(t)) el.textContent = t.toLocaleString('pt-BR');
      });
    }

    // ── HERO PARALLAX (desktop apenas) ──────────────────
    if (ST && !prefersReduced && !isMobile) {
      const heroImg = document.querySelector('.hero__media img');
      if (heroImg) {
        gsap.to(heroImg, {
          yPercent: 12, ease: 'none',
          scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 }
        });
      }

      const tagline = document.querySelector('.hero__tagline');
      if (tagline) {
        gsap.to(tagline, {
          y: -40, opacity: 0.6, ease: 'none',
          scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom 60%', scrub: 1 }
        });
      }
    }
  };

  // ════════════════════════════════════════════════════════
  // 4. SAFETY NET PARA COUNTERS
  // ════════════════════════════════════════════════════════
  setTimeout(() => {
    document.querySelectorAll('[data-counter]').forEach((el) => {
      if (el.dataset.counted === 'true') return;
      const t = parseInt(el.dataset.counter, 10);
      if (!isNaN(t) && (el.textContent === '0' || el.textContent.trim() === '')) {
        el.textContent = t.toLocaleString('pt-BR');
        el.dataset.counted = 'true';
      }
    });
  }, 4000);

  // ── BOOT ──────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => boot(0), { once: true });
  } else {
    boot(0);
  }
})();
