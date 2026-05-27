/**
 * animations.js
 * Orquestracao reveal + GSAP + SplitType + counters.
 *
 * ESTRATEGIA:
 * - IntersectionObserver e o trigger PRIMARIO para reveals (funciona sempre, mobile incluido)
 * - GSAP entra como enhancement (split text, counters, hero entrance)
 * - Safety net: se nada funcionar em 3s, forca tudo visivel
 *
 * Isso resolve o bug onde ScrollTrigger+Lenis nao disparava no touch mobile,
 * deixando [data-reveal] preso em opacity:0.
 */
(() => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.matchMedia('(max-width: 767px)').matches;

  // ============================================
  // 1. REVEAL VIA INTERSECTION OBSERVER (PRIMARIO, BULLETPROOF)
  // ============================================
  const revealEls = document.querySelectorAll('[data-reveal]');

  // Marca reveals do hero como visiveis imediatamente (sao animados pelo GSAP timeline)
  revealEls.forEach((el) => {
    if (el.closest('.hero')) el.classList.add('is-visible');
  });

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const delay = parseFloat(el.dataset.revealDelay || '0') * 1000;
          if (delay > 0) {
            setTimeout(() => el.classList.add('is-visible'), delay);
          } else {
            el.classList.add('is-visible');
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

  // ============================================
  // 2. SAFETY NETS — escalonados para nao deixar conteudo invisivel
  // ============================================
  // 1.5s: SplitType (hero precisa aparecer rapido — LCP)
  setTimeout(() => {
    document.querySelectorAll('[data-split]:not(.split-ready), [data-split-lines]:not(.split-ready)').forEach((el) => {
      el.classList.add('split-ready');
    });
  }, 1500);

  // 2.5s: reveals fora do viewport caso IntersectionObserver/scroll nao funcione
  setTimeout(() => {
    document.querySelectorAll('[data-reveal]:not(.is-visible)').forEach((el) => {
      el.classList.add('is-visible');
    });
  }, 2500);

  // ============================================
  // 3. GSAP ENHANCEMENT (quando disponivel)
  // ============================================
  const boot = (attempts) => {
    attempts = attempts || 0;
    if (!window.gsap) {
      if (attempts > 30) return; // 1.5s max espera
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

    // ---- SPLIT TYPE ----
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

    // ---- HERO ENTRANCE TIMELINE ----
    // Anima chars do tagline, kicker, actions, scroll, marquee.
    // Sem afetar LCP: tagline ja esta visivel desde o inicio.
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

        // Anima chars se SplitType processou (do contrario fica como texto normal — sem flicker)
        if (chars && chars.length > 0) {
          tl.from(chars, {
            yPercent: charY,
            opacity: 0,
            duration: dur * 1.1,
            stagger: stag,
            immediateRender: false // nao define chars como opacity:0 inicialmente — evita flash
          }, kicker ? '-=0.5' : 0);
        }

        if (actions && actions.length > 0) {
          tl.from(actions, { opacity: 0, y: prefersReduced ? 0 : 20, duration: dur * 0.9, stagger: 0.1 }, '-=0.7');
        }

        if (scroll) tl.from(scroll, { opacity: 0, duration: dur * 0.8 }, '-=0.5');
        if (marquee) tl.from(marquee, { opacity: 0, duration: dur * 0.8 }, '-=0.6');
      }
    } catch (e) {}

    // ---- SPLIT LINES SCROLL (apenas quando ST disponivel) ----
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
          scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none', once: true }
        });
      });
    }

    // ---- COUNTERS (IntersectionObserver-based, robusto) ----
    const counters = document.querySelectorAll('[data-counter]');
    if (counters.length && 'IntersectionObserver' in window) {
      const countIO = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
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
      // Sem GSAP/IO: mostra o numero final direto
      counters.forEach((el) => {
        const t = parseInt(el.dataset.counter, 10);
        if (!isNaN(t)) el.textContent = t.toLocaleString('pt-BR');
      });
    }

    // ---- HERO PARALLAX (desktop apenas, com reduced motion respeitado) ----
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

  // SAFETY NET para counters caso GSAP nao carregue em 4s
  setTimeout(() => {
    document.querySelectorAll('[data-counter]').forEach((el) => {
      if (el.textContent === '0' || el.textContent.trim() === '') {
        const t = parseInt(el.dataset.counter, 10);
        if (!isNaN(t)) el.textContent = t.toLocaleString('pt-BR');
      }
    });
  }, 4000);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => boot(0));
  } else {
    boot(0);
  }
})();
