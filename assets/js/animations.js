/**
 * animations.js
 * Animacoes nivel NASA, 100% mobile-first, ~5kb.
 *
 * ESTRATEGIA:
 * - CSS keyframes para hero entrance + image (ja roda)
 * - IntersectionObserver para reveals (universal, leve)
 * - SplitType opcional para chars do tagline (se disponivel)
 * - Counters via requestAnimationFrame (sem GSAP)
 * - Hero parallax 3D mouse-driven (desktop only)
 * - Section number reveal via IO
 *
 * Sem GSAP/ScrollTrigger no caminho critico = carrega instantaneo.
 */
(() => {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isDesktop = window.matchMedia('(min-width: 1024px) and (hover: hover) and (pointer: fine)').matches;
  const hasIO = 'IntersectionObserver' in window;

  // ============================================
  // 1. SPLIT TAGLINE CHARS — vanilla, sem SplitType
  // ============================================
  const splitTaglineChars = () => {
    const tagline = document.querySelector('.hero__tagline[data-split]');
    if (!tagline || tagline.classList.contains('split-ready')) return;

    const walkTextNodes = (node, callback) => {
      if (node.nodeType === 3) {
        callback(node);
      } else if (node.nodeType === 1 && node.tagName !== 'BR') {
        Array.from(node.childNodes).forEach((child) => walkTextNodes(child, callback));
      }
    };

    let charIndex = 0;
    walkTextNodes(tagline, (textNode) => {
      const text = textNode.textContent;
      if (!text || !text.trim()) return;

      const fragment = document.createDocumentFragment();
      for (const ch of text) {
        if (ch === ' ') {
          fragment.appendChild(document.createTextNode(' '));
        } else {
          const span = document.createElement('span');
          span.className = 'char';
          span.textContent = ch;
          span.style.setProperty('--char-i', charIndex++);
          fragment.appendChild(span);
        }
      }
      textNode.parentNode.replaceChild(fragment, textNode);
    });

    tagline.classList.add('split-ready');
  };

  // Roda imediatamente — antes do paint
  splitTaglineChars();

  // ============================================
  // 2. SPLIT-LINES para titulos via SplitType (se disponivel) ou fallback
  // ============================================
  const splitLines = () => {
    document.querySelectorAll('[data-split-lines]').forEach((el) => {
      if (el.classList.contains('split-ready')) return;

      // Fallback simples: cada linha = wrapper inline
      const html = el.innerHTML;
      const lines = html.split(/<br\s*\/?>/i);
      el.innerHTML = lines.map((line) =>
        `<span class="line"><span class="line__inner">${line.trim()}</span></span>`
      ).join('');
      el.classList.add('split-ready');
    });
  };

  splitLines();

  // ============================================
  // 3. REVEAL VIA INTERSECTION OBSERVER (bulletproof)
  // ============================================
  if (hasIO) {
    const revealIO = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const delay = parseFloat(el.dataset.revealDelay || '0');
        if (delay > 0) el.style.setProperty('--reveal-delay', `${delay}s`);
        el.classList.add('is-visible');
        revealIO.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });

    document.querySelectorAll('[data-reveal]').forEach((el) => {
      // Hero data-reveal e instantaneo (animacao CSS cuida)
      if (el.closest('.hero')) {
        el.classList.add('is-visible');
        return;
      }
      revealIO.observe(el);
    });

    // Reveal de titulos split-lines (anima linhas)
    const linesIO = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible-lines');
        linesIO.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });

    document.querySelectorAll('[data-split-lines]').forEach((el) => linesIO.observe(el));

    // Section numbers (::before)
    const sectionIO = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible-section');
        sectionIO.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -15% 0px', threshold: 0.1 });

    document.querySelectorAll('[data-section-num]').forEach((el) => sectionIO.observe(el));
  } else {
    // Fallback: tudo visivel
    document.querySelectorAll('[data-reveal], [data-split-lines], [data-section-num]').forEach((el) => {
      el.classList.add('is-visible', 'is-visible-lines', 'is-visible-section');
    });
  }

  // ============================================
  // 4. SAFETY NETS (caso IO falhe)
  // ============================================
  setTimeout(() => {
    document.querySelectorAll('[data-reveal]:not(.is-visible)').forEach((el) => el.classList.add('is-visible'));
    document.querySelectorAll('[data-split-lines]:not(.is-visible-lines)').forEach((el) => el.classList.add('is-visible-lines'));
    document.querySelectorAll('[data-section-num]:not(.is-visible-section)').forEach((el) => el.classList.add('is-visible-section'));
  }, 2500);

  // ============================================
  // 5. COUNTERS — vanilla RAF, sem GSAP
  // ============================================
  const animateCounter = (el, target, duration = 2000) => {
    const start = performance.now();
    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const value = target * easeOutCubic(progress);
      el.textContent = Math.round(value).toLocaleString('pt-BR');

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.classList.add('counted');
      }
    };

    requestAnimationFrame(tick);
  };

  if (hasIO) {
    const counterIO = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.counter, 10);
        if (!isNaN(target)) {
          animateCounter(el, target, prefersReduced ? 600 : 1800);
        }
        counterIO.unobserve(el);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.3 });

    document.querySelectorAll('[data-counter]').forEach((el) => counterIO.observe(el));
  } else {
    document.querySelectorAll('[data-counter]').forEach((el) => {
      const t = parseInt(el.dataset.counter, 10);
      if (!isNaN(t)) el.textContent = t.toLocaleString('pt-BR');
    });
  }

  // Safety: se counter nao animou em 4s, mostra valor final
  setTimeout(() => {
    document.querySelectorAll('[data-counter]').forEach((el) => {
      if (el.textContent === '0' || el.textContent.trim() === '') {
        const t = parseInt(el.dataset.counter, 10);
        if (!isNaN(t)) el.textContent = t.toLocaleString('pt-BR');
      }
    });
  }, 4000);

  // ============================================
  // 6. HERO PARALLAX 3D — desktop only, mouse-driven
  // ============================================
  if (isDesktop && !prefersReduced) {
    const hero = document.querySelector('.hero');
    if (hero) {
      let rafId = null;
      let targetX = 0, targetY = 0;
      let currentX = 0, currentY = 0;

      const updateParallax = () => {
        currentX += (targetX - currentX) * 0.08;
        currentY += (targetY - currentY) * 0.08;

        hero.style.setProperty('--mouse-x', currentX.toFixed(3));
        hero.style.setProperty('--mouse-y', currentY.toFixed(3));

        if (Math.abs(targetX - currentX) > 0.001 || Math.abs(targetY - currentY) > 0.001) {
          rafId = requestAnimationFrame(updateParallax);
        } else {
          rafId = null;
        }
      };

      hero.addEventListener('mousemove', (e) => {
        const rect = hero.getBoundingClientRect();
        targetX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        targetY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
        hero.setAttribute('data-mouse-active', '');
        if (!rafId) rafId = requestAnimationFrame(updateParallax);
      }, { passive: true });

      hero.addEventListener('mouseleave', () => {
        targetX = 0;
        targetY = 0;
        if (!rafId) rafId = requestAnimationFrame(updateParallax);
        setTimeout(() => hero.removeAttribute('data-mouse-active'), 600);
      });
    }
  }

  // ============================================
  // 7. SCROLL PARALLAX HERO IMAGE — translate Y suave
  // ============================================
  if (!prefersReduced && hasIO) {
    const heroImg = document.querySelector('.hero__media img');
    const hero = document.querySelector('.hero');
    if (heroImg && hero) {
      let heroInView = false;
      const heroVisibilityIO = new IntersectionObserver((entries) => {
        heroInView = entries[0].isIntersecting;
      });
      heroVisibilityIO.observe(hero);

      let scrollRafId = null;
      const updateScrollParallax = () => {
        if (heroInView) {
          const scrollY = window.scrollY;
          const heroHeight = hero.offsetHeight;
          const progress = Math.min(scrollY / heroHeight, 1);
          heroImg.style.setProperty('--scroll-progress', progress.toFixed(3));
        }
        scrollRafId = null;
      };

      window.addEventListener('scroll', () => {
        if (!scrollRafId) scrollRafId = requestAnimationFrame(updateScrollParallax);
      }, { passive: true });
    }
  }
})();
