/**
 * animations.js
 * BLINDADO: Animações GSAP forçadas (ignora configurações do Windows que travam animações).
 */
(() => {
  const start = () => {
    if (!window.gsap || !window.ScrollTrigger) {
      requestAnimationFrame(start);
      return;
    }

    const { gsap } = window;
    const ST = window.ScrollTrigger;
    const SPT = window.SplitType;

    gsap.registerPlugin(ST);

    // ============================================
    // 1. TEXT SPLITTING (Corta os textos para animar)
    // ============================================
    if (SPT) {
      document.querySelectorAll('[data-split]').forEach((el) => {
        new SPT(el, { types: 'words, chars' });
        el.classList.add('split-ready');
      });

      document.querySelectorAll('[data-split-lines]').forEach((el) => {
        new SPT(el, { types: 'lines, words' });
        el.classList.add('split-ready');
        el.querySelectorAll('.line').forEach((line) => {
          const inner = document.createElement('span');
          inner.className = 'line__inner';
          inner.style.display = 'inline-block';
          while (line.firstChild) inner.appendChild(line.firstChild);
          line.appendChild(inner);
        });
      });
    }

    // ============================================
    // 2. HERO ENTRANCE (Animação de entrada principal)
    // ============================================
    const hero = document.querySelector('.hero');
    if (hero) {
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' }, delay: 0.2 });

      const topElements = hero.querySelectorAll('.hero__top [data-reveal]');
      const bottomElements = hero.querySelectorAll('.hero__bottom [data-reveal]');

      if (topElements.length) {
        tl.fromTo(topElements, 
          { opacity: 0, y: 30 }, 
          { opacity: 1, y: 0, duration: 1.2, stagger: 0.15 }
        );
      }

      if (bottomElements.length) {
        tl.fromTo(bottomElements, 
          { opacity: 0, y: 30 }, 
          { opacity: 1, y: 0, duration: 1.2, stagger: 0.15 }, 
          "-=0.8" // Começa antes do topo terminar
        );
      }

      // Marca como visível para evitar bugs do CSS
      setTimeout(() => {
        hero.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('is-visible'));
      }, 2000);
    }

    // ============================================
    // 3. REVEAL SCROLL (Elementos aparecem ao rolar)
    // ============================================
    gsap.utils.toArray('[data-reveal]').forEach((el) => {
      if (el.closest('.hero')) return; // Pula o Hero que já foi animado

      const delay = parseFloat(el.dataset.revealDelay || '0');

      gsap.fromTo(el,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          delay: delay,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none none',
            once: true,
          },
          onComplete: () => el.classList.add('is-visible')
        }
      );
    });

    // ============================================
    // 4. ANIMAR LINHAS DE TEXTO NO SCROLL
    // ============================================
    gsap.utils.toArray('[data-split-lines]').forEach((el) => {
      const lines = el.querySelectorAll('.line__inner');
      if (!lines.length) return;

      gsap.fromTo(lines, 
        { yPercent: 105, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 1.2,
          ease: 'expo.out',
          stagger: 0.1,
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none none',
            once: true,
          }
        }
      );
    });

    // ============================================
    // 5. NÚMEROS ANIMADOS (Contadores)
    // ============================================
    document.querySelectorAll('[data-counter]').forEach((el) => {
      const target = parseInt(el.dataset.counter, 10);
      if (isNaN(target)) return;

      const obj = { val: 0 };
      gsap.to(obj, {
        val: target,
        duration: 2.5,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 90%',
          once: true,
        },
        onUpdate: () => {
          el.textContent = Math.round(obj.val).toLocaleString('pt-BR');
        }
      });
    });

    // ============================================
    // 6. Atualiza o ScrollTrigger quando o tema mudar
    // ============================================
    window.addEventListener('themechange', () => {
      setTimeout(() => ST.refresh(), 200);
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
