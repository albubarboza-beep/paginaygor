/**
 * animations.js
 * Orquestração GSAP + SplitType + ScrollTrigger.
 * Com reduced motion: fades suaves sem translateY.
 */
(() => {
  const boot = () => {
    if (!window.gsap) {
      requestAnimationFrame(boot);
      return;
    }

    const { gsap } = window;
    const ST = window.ScrollTrigger;
    const SPT = window.SplitType;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (ST) gsap.registerPlugin(ST);

    // ============================================
    // SPLIT TYPE
    // ============================================
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

    // Durations ajustadas para reduced motion
    const dur = prefersReduced ? 0.4 : 1;
    const revealY = prefersReduced ? 0 : 40;
    const charY = prefersReduced ? 0 : 110;
    const stag = prefersReduced ? 0 : 0.025;

    // ============================================
    // HERO ENTRANCE
    // ============================================
    try {
      const hero = document.querySelector('.hero');
      if (hero) {
        const tl = gsap.timeline({ defaults: { ease: 'expo.out' }, delay: 0.3 });

        const kicker = hero.querySelector('.hero__kicker');
        const chars = hero.querySelectorAll('[data-split] .char');
        const actions = hero.querySelectorAll('.hero__actions > *');
        const scroll = hero.querySelector('.hero__scroll');
        const marquee = hero.querySelector('.hero__marquee');

        if (kicker) tl.from(kicker, { opacity: 0, y: prefersReduced ? 0 : 16, duration: dur * 0.9 });

        if (chars && chars.length > 0) {
          tl.from(chars, { yPercent: charY, opacity: 0, duration: dur * 1.1, stagger: stag }, kicker ? '-=0.5' : 0);
        }

        if (actions && actions.length > 0) {
          tl.from(actions, { opacity: 0, y: prefersReduced ? 0 : 20, duration: dur * 0.9, stagger: 0.1 }, '-=0.7');
        }

        if (scroll) tl.from(scroll, { opacity: 0, duration: dur * 0.8 }, '-=0.5');
        if (marquee) tl.from(marquee, { opacity: 0, duration: dur * 0.8 }, '-=0.6');

        hero.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-visible'));
      }
    } catch (e) {}

    // ============================================
    // SPLIT LINES
    // ============================================
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
          scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none', once: true }
        });
      });
    }

    // ============================================
    // GENERIC REVEAL
    // ============================================
    if (ST) {
      gsap.utils.toArray('[data-reveal]').forEach((el) => {
        if (el.closest('.hero')) { el.classList.add('is-visible'); return; }
        const delay = parseFloat(el.dataset.revealDelay || '0');
        gsap.fromTo(el,
          { opacity: 0, y: revealY },
          { opacity: 1, y: 0, duration: dur, delay, ease: 'expo.out',
            scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none', once: true },
            onComplete: () => el.classList.add('is-visible') }
        );
      });
    }

    // ============================================
    // COUNTERS (sempre roda, é informativo)
    // ============================================
    if (ST) {
      document.querySelectorAll('[data-counter]').forEach((el) => {
        const target = parseInt(el.dataset.counter, 10);
        if (isNaN(target)) return;
        const obj = { val: 0 };
        gsap.to(obj, {
          val: target, duration: prefersReduced ? 0.8 : 2, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 90%', once: true },
          onUpdate: () => { el.textContent = Math.round(obj.val).toLocaleString('pt-BR'); }
        });
      });
    }

    // ============================================
    // HERO PARALLAX (desliga em reduced motion e mobile — causa jank)
    // ============================================
    const isMobile = window.matchMedia('(max-width: 767px)').matches;
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

    if (ST) {
      window.addEventListener('themechange', () => { setTimeout(() => ST.refresh(), 200); });
    }
  };

  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', boot); }
  else { boot(); }
})();
