/**
 * animations.js
 * Orquestração GSAP + ScrollTrigger.
 * Hero entrance + reveal-on-scroll com stagger orquestrado.
 */
(() => {
  // —— aguarda GSAP estar carregado (defer pode atrasar) ——
  const start = () => {
    if (!window.gsap) {
      requestAnimationFrame(start);
      return;
    }

    const { gsap } = window;
    const ScrollTrigger = window.ScrollTrigger;
    if (ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduced) {
      // —— sem animações, apenas revela tudo ——
      document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-visible'));
      return;
    }

    // ============================================
    // 1. HERO — entrada cinemática orquestrada
    // ============================================
    const hero = document.querySelector('.hero');
    if (hero) {
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });

      // split simples sem plugin pago: dividimos por palavra com regex
      const title = hero.querySelector('[data-split]');
      if (title && !title.dataset.splitDone) {
        const html = title.innerHTML;
        const wrapped = html.replace(/(\S+)/g, '<span class="word"><span class="word__inner">$1</span></span>');
        title.innerHTML = wrapped;
        title.dataset.splitDone = 'true';

        // garante CSS inline necessário (caso o build não importe)
        title.querySelectorAll('.word').forEach((w) => {
          w.style.display = 'inline-block';
          w.style.overflow = 'hidden';
        });
        title.querySelectorAll('.word__inner').forEach((w) => {
          w.style.display = 'inline-block';
          w.style.willChange = 'transform';
        });
      }

      tl
        .from(hero.querySelector('.hero__meta'), {
          opacity: 0, y: 16, duration: 0.9
        })
        .from(hero.querySelectorAll('.word__inner'), {
          yPercent: 110, duration: 1.1, stagger: 0.04
        }, '-=0.5')
        .from(hero.querySelector('.hero__lead'), {
          opacity: 0, y: 24, duration: 1
        }, '-=0.7')
        .from(hero.querySelectorAll('.hero__cta > *'), {
          opacity: 0, y: 16, duration: 0.8, stagger: 0.08
        }, '-=0.6')
        .from(hero.querySelectorAll('.hero__proof-item'), {
          opacity: 0, y: 16, duration: 0.8, stagger: 0.1
        }, '-=0.5')
        .from(hero.querySelector('.hero__scroll'), {
          opacity: 0, duration: 0.6
        }, '-=0.3');
    }

    // ============================================
    // 2. REVEAL ON SCROLL — generic com stagger
    // ============================================
    if (ScrollTrigger) {
      gsap.utils.toArray('[data-reveal]').forEach((el) => {
        // pula elementos do hero (já tratados pela timeline)
        if (el.closest('.hero')) {
          el.classList.add('is-visible');
          return;
        }

        const delay = parseFloat(el.dataset.revealDelay || '0');

        gsap.fromTo(
          el,
          { opacity: 0, y: 32 },
          {
            opacity: 1,
            y: 0,
            duration: 0.95,
            delay,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
              toggleActions: 'play none none none',
              once: true,
            },
            onComplete: () => el.classList.add('is-visible'),
          }
        );
      });

      // ============================================
      // 3. PARALLAX SUTIL no hero__aurora
      // ============================================
      const aurora = document.querySelector('.hero__aurora');
      if (aurora) {
        gsap.to(aurora, {
          yPercent: 30,
          ease: 'none',
          scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: 'bottom top',
            scrub: 1,
          },
        });
      }

      // ============================================
      // 4. ScrollTrigger refresh quando tema muda
      // (caso a mudança altere alturas/layout)
      // ============================================
      window.addEventListener('themechange', () => {
        setTimeout(() => ScrollTrigger.refresh(), 100);
      });
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
