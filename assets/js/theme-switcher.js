/**
 * theme-switcher.js
 * Troca de tema com View Transitions API (Chrome 111+).
 * Fallback gracioso para browsers sem suporte.
 * Navegacao por setas (WCAG 2.1.1 - keyboard operable).
 */
(() => {
  const STORAGE_KEY = 'ygor-theme';
  const VALID = ['obsidian', 'steel', 'abyss', 'storm', 'heritage'];
  const DEFAULT = 'obsidian';
  const NAMES = {
    obsidian: 'Obsidian',
    steel: 'Steel',
    abyss: 'Abyss',
    storm: 'Storm',
    heritage: 'Heritage',
  };

  const root = document.documentElement;
  const switcher = document.querySelector('.theme-switcher');
  const toggle = switcher?.querySelector('.theme-switcher__toggle');
  const panel = switcher?.querySelector('.theme-switcher__panel');
  const options = switcher?.querySelectorAll('.theme-option');
  const currentLabel = switcher?.querySelector('.theme-switcher__current');

  if (!switcher || !toggle || !panel || !options) return;

  const saved = localStorage.getItem(STORAGE_KEY);
  const initial = VALID.includes(saved) ? saved : DEFAULT;
  applyTheme(initial, false, false);

  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = switcher.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
    if (open) {
      // Foca na opcao ativa ao abrir
      const active = panel.querySelector('[aria-checked="true"]');
      if (active) active.focus();
    }
  });

  document.addEventListener('click', (e) => {
    if (!switcher.contains(e.target)) close();
  });

  document.addEventListener('touchstart', (e) => {
    if (!switcher.contains(e.target)) close();
  }, { passive: true });

  window.addEventListener('scroll', () => {
    if (switcher.classList.contains('is-open')) close();
  }, { passive: true });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && switcher.classList.contains('is-open')) {
      close();
      toggle.focus();
    }
  });

  // Arrow key navigation dentro do menu (WCAG 2.1.1)
  panel.addEventListener('keydown', (e) => {
    if (!['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key)) return;
    e.preventDefault();
    const items = [...options];
    const idx = items.indexOf(document.activeElement);
    let next;

    if (e.key === 'ArrowDown') next = items[(idx + 1) % items.length];
    else if (e.key === 'ArrowUp') next = items[(idx - 1 + items.length) % items.length];
    else if (e.key === 'Home') next = items[0];
    else if (e.key === 'End') next = items[items.length - 1];

    if (next) next.focus();
  });

  options.forEach((opt) => {
    opt.addEventListener('click', () => {
      const theme = opt.dataset.theme;
      if (!VALID.includes(theme)) return;
      applyTheme(theme, true, true);
      close();
    });
  });

  function close() {
    switcher.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  }

  function applyTheme(theme, persist, withTransition) {
    const update = () => {
      root.setAttribute('data-theme', theme);
      if (currentLabel) currentLabel.textContent = NAMES[theme];

      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) {
        const colors = {
          obsidian: '#0A0C10',
          steel:    '#0A0A0A',
          abyss:    '#0C0E16',
          storm:    '#0A0E1A',
          heritage: '#0A0807',
        };
        meta.setAttribute('content', colors[theme] || colors.obsidian);
      }

      options.forEach((o) => {
        const checked = o.dataset.theme === theme;
        o.setAttribute('aria-checked', String(checked));
        // Roving tabindex pattern (WCAG)
        o.setAttribute('tabindex', checked ? '0' : '-1');
      });

      if (persist) localStorage.setItem(STORAGE_KEY, theme);
      window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
    };

    // View Transitions API (Chrome 111+, Edge 111+)
    if (withTransition && document.startViewTransition) {
      document.startViewTransition(() => update());
    } else {
      update();
    }
  }
})();
