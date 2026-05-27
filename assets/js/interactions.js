/**
 * interactions.js
 * Loader, navbar, mobile menu, FAQ, scroll progress, scroll spy.
 * Vanilla JS, mobile-first, ~3kb.
 */
(() => {
  'use strict';

  // ============ LOADER ============
  // Esconde quando pagina carrega + failsafe duplo
  const loader = document.getElementById('loader');
  const hideLoader = () => {
    if (loader) loader.classList.add('is-done');
  };

  if (document.readyState === 'complete') {
    setTimeout(hideLoader, 100);
  } else {
    window.addEventListener('load', () => setTimeout(hideLoader, 100));
  }
  setTimeout(hideLoader, 1500); // failsafe

  // ============ NAVBAR SCROLLED ============
  const nav = document.getElementById('nav');
  if (nav) {
    let navTicking = false;
    const onNavScroll = () => {
      if (!navTicking) {
        requestAnimationFrame(() => {
          nav.classList.toggle('scrolled', window.scrollY > 32);
          navTicking = false;
        });
        navTicking = true;
      }
    };
    window.addEventListener('scroll', onNavScroll, { passive: true });
    onNavScroll();
  }

  // ============ MOBILE MENU (focus trap WCAG 2.4.3) ============
  const burger = document.querySelector('.nav__burger');
  const mobileMenu = document.getElementById('mobileMenu');

  if (burger && mobileMenu) {
    const focusableSelector = 'a[href], button, [tabindex]:not([tabindex="-1"])';

    const trapFocus = (e) => {
      if (e.key !== 'Tab') return;
      const focusables = mobileMenu.querySelectorAll(focusableSelector);
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    const close = () => {
      mobileMenu.classList.remove('is-open');
      mobileMenu.setAttribute('aria-hidden', 'true');
      burger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      if (window.lenis) window.lenis.start();
      document.removeEventListener('keydown', trapFocus);
      burger.focus();
    };

    const open = () => {
      mobileMenu.classList.add('is-open');
      mobileMenu.setAttribute('aria-hidden', 'false');
      burger.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      if (window.lenis) window.lenis.stop();
      document.addEventListener('keydown', trapFocus);
      const firstLink = mobileMenu.querySelector(focusableSelector);
      if (firstLink) firstLink.focus();
    };

    burger.addEventListener('click', () => {
      burger.getAttribute('aria-expanded') === 'true' ? close() : open();
    });

    mobileMenu.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', close);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('is-open')) close();
    });
  }

  // ============ FAQ — SINGLE OPEN ============
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach((item) => {
    item.addEventListener('toggle', () => {
      if (item.open) {
        faqItems.forEach((o) => { if (o !== item) o.open = false; });
      }
    });
  });

  // ============ SCROLL PROGRESS (GPU via scaleX) ============
  const progress = document.querySelector('.scroll-progress__fill');
  if (progress) {
    let progressTicking = false;
    const updateProgress = () => {
      const h = document.documentElement;
      const total = h.scrollHeight - h.clientHeight;
      const pct = total > 0 ? h.scrollTop / total : 0;
      progress.style.transform = `scaleX(${pct})`;
      progressTicking = false;
    };
    window.addEventListener('scroll', () => {
      if (!progressTicking) {
        requestAnimationFrame(updateProgress);
        progressTicking = true;
      }
    }, { passive: true });
    updateProgress();
  }

  // ============ SCROLL SPY — active nav link ============
  const spyLinks = document.querySelectorAll('.nav__links a[href^="#"]');
  const spySections = [];
  const spySectionIds = new Set();

  spyLinks.forEach((link) => {
    const id = link.getAttribute('href').slice(1);
    const section = document.getElementById(id);
    if (section && !spySectionIds.has(id)) {
      spySections.push({ el: section, id });
      spySectionIds.add(id);
    }
  });

  if (spySections.length) {
    let spyTicking = false;
    const allSpyLinks = document.querySelectorAll('.nav__links a[href^="#"], .mobile-menu__nav a[href^="#"]');

    const updateSpy = () => {
      const scrollY = window.scrollY + window.innerHeight * 0.35;
      let currentId = null;

      for (let i = spySections.length - 1; i >= 0; i--) {
        if (spySections[i].el.offsetTop <= scrollY) {
          currentId = spySections[i].id;
          break;
        }
      }

      allSpyLinks.forEach((l) => {
        const href = l.getAttribute('href');
        l.classList.toggle('is-active', currentId !== null && href === '#' + currentId);
      });
      spyTicking = false;
    };

    window.addEventListener('scroll', () => {
      if (!spyTicking) {
        requestAnimationFrame(updateSpy);
        spyTicking = true;
      }
    }, { passive: true });
    updateSpy();
  }

  // ============ NATIVE SMOOTH SCROLL (mobile) ============
  // Quando Lenis nao esta presente (mobile/touch), anchor links usam scroll nativo suave
  if (!window.lenis) {
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href');
        if (!id || id === '#' || id.length <= 1) return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        const navHeight = 80;
        const targetY = target.getBoundingClientRect().top + window.scrollY - navHeight;
        window.scrollTo({ top: targetY, behavior: 'smooth' });
      });
    });
  }
})();
