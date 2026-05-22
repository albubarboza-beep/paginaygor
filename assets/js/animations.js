/**
 * animations.js
 * Orquestração GSAP + SplitType + ScrollTrigger.
 * - Hero entrance cinemático
 * - Split text por linhas e palavras
 * - Reveal generic com stagger
 * - Counter animations
 * - Parallax sutil no hero
 */
(() => {
  const boot = () => {
    if (!window.gsap || !window.SplitType) {
      requestAnimationFrame(boot);
      return;
    }

    const { gsap, ScrollTrigger, SplitType } = window;
    if (ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduced) {
      document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-visible'));
      document.querySelectorAll('[data-split], [data-split-lines]').forEach((el) => el.classList.add('split-ready'));
      return;
    }

    // ============================================
    // SPLIT TYPE — prepara textos para animação
    // ============================================
    const splits = {};

    document.querySelectorAll('[data-split]').forEach((el) => {
      splits[el.dataset.splitId || Math.random()] = new SplitType(el, { types: 'words, chars' });
      el.classList.add('split-ready');
    });

    document.querySelectorAll('[data-split-lines]').forEach((el) => {
      new SplitType(el, { types: 'lines, words' });
      el.classList.add('split-ready');

      // wrap each line for overflow:hidden trick
      el.querySelectorAll('.line').forEach((line) => {
        const inner = document.createElement('span');
        inner.className = 'line__inner';
        inner.style.display = 'inline-block';
        while (line.firstChild) inner.appendChild(line.firstChild);
        line.appendChild(inner);
      });
    });

    // ============================================
    // HERO ENTRANCE
    // ============================================
    const hero = document.querySelector('.hero');
    if (hero) {
      const tl = gsap.timeline({
        defaults: { ease: 'expo.out' },
        delay: 0.3, // dá tempo do loader sair
      });

      tl.from(hero.querySelector('.hero__kicker'), {
        opacity: 0, y: 16, duration: 0.9,
      })
      .from(hero.querySelectorAll('[data-split] .char'), {
        yPercent: 110,
        opacity: 0,
        duration: 1.1,
        stagger: 0.025,
      }, '-=0.5')
      .from(hero.querySelectorAll('.hero__actions > *'), {
        opacity: 0, y: 20, duration: 0.9, stagger: 0.1,
      }, '-=0.7')
      .from(hero.querySelector('.hero__scroll'), {
        opacity: 0, y: 10, duration: 0.8,
      }, '-=0.5')
      .from(hero.querySelector('.hero__marquee'), {
        opacity: 0, duration: 0.8,
      }, '-=0.6');
    }

    // ============================================
    // SPLIT LINES — anima por linha em scroll
    // ============================================
    document.querySelectorAll('[data-split-lines]').forEach((el) => {
      const lines = el.querySelectorAll('.line__inner');
      gsap.from(lines, {
        yPercent: 105,
        opacity: 0,
        duration: 1.1,
        ease: 'expo.out',
        stagger: 0.1,
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none',
          once: true,
        },
      });
    });

    // ============================================
    // GENERIC REVEAL
    // ============================================
    if (ScrollTrigger) {
      gsap.utils.toArray('[data-reveal]').forEach((el) => {
        if (el.closest('.hero')) {
          el.classList.add('is-visible');
          return;
        }

        const delay = parseFloat(el.dataset.revealDelay || '0');

        gsap.fromTo(el,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            delay,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 88%',
              toggleActions: 'play none none none',
              once: true,
            },
            onComplete: () => el.classList.add('is-visible'),
          }
        );
      });

      // ============================================
      // COUNTERS — anima números das estatísticas e planos
      // ============================================
      document.querySelectorAll('[data-counter]').forEach((el) => {
        const target = parseInt(el.dataset.counter, 10);
        if (isNaN(target)) return;

        const obj = { val: 0 };
        gsap.to(obj, {
          val: target,
          duration: 2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            once: true,
          },
          onUpdate: () => {
            el.textContent = Math.round(obj.val).toLocaleString('pt-BR');
          },
        });
      });

      // ============================================
      // HERO PARALLAX (imagem + overlay)
      // ============================================
      const heroImg = document.querySelector('.hero__media img');
      if (heroImg) {
        gsap.to(heroImg, {
          yPercent: 12,
          ease: 'none',
          scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: 'bottom top',
            scrub: 1,
          },
        });
      }

      // Tagline sutil parallax
      const tagline = document.querySelector('.hero__tagline');
      if (tagline) {
        gsap.to(tagline, {
          y: -40,
          opacity: 0.6,
          ease: 'none',
          scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: 'bottom 60%',
            scrub: 1,
          },
        });
      }

      // ============================================
      // Refresh ScrollTrigger quando tema muda
      // ============================================
      window.addEventListener('themechange', () => {
        setTimeout(() => ScrollTrigger.refresh(), 200);
      });
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
