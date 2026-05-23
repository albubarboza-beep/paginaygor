/**
 * interactions.js
 * Loader, navbar, mobile menu, FAQ, scroll progress.
 */
(() => {
  // ============ LOADER (Com Trava de Segurança) ============
  const loader = document.getElementById('loader');
  const hideLoader = () => loader?.classList.add('is-done');
  
  // Libera a página quando carregar ou força a liberação após 1.5s
  window.addEventListener('load', () => setTimeout(hideLoader, 200));
  setTimeout(hideLoader, 1500);

  // ============ NAVBAR SCROLLED ============
  const nav = document.getElementById('nav');
  if (nav) {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          nav.classList.toggle('scrolled', window.scrollY > 32);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ============ MOBILE MENU ============
  const burger = document.querySelector('.nav__burger');
  const mobileMenu = document.getElementById('mobileMenu');

  if (burger && mobileMenu) {
    const close = () => {
      mobileMenu.classList.remove('is-open');
      mobileMenu.setAttribute('aria-hidden', 'true');
      burger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      if (window.lenis) window.lenis.start();
    };

    const open = () => {
      mobileMenu.classList.add('is-open');
      mobileMenu.setAttribute('aria-hidden', 'false');
      burger.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      if (window.lenis) window.lenis.stop();
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

  // ============ SCROLL PROGRESS ============
  const progress = document.querySelector('.scroll-progress__fill');
  if (progress) {
    const onScroll = () => {
      const h = document.documentElement;
      const total = h.scrollHeight - h.clientHeight;
      const pct = total > 0 ? (h.scrollTop / total) * 100 : 0;
      progress.style.width = pct + '%';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
})();
