/**
 * theme-switcher.js
 * Alterna entre 4 temas, persiste em localStorage,
 * comunica mudança para outros módulos via custom event.
 */
(() => {
  const STORAGE_KEY = 'ygor-theme';
  const VALID_THEMES = ['electric', 'corporate', 'midnight', 'aurora'];
  const DEFAULT_THEME = 'midnight';

  const root = document.documentElement;
  const switcher = document.querySelector('.theme-switcher');
  const toggle = switcher?.querySelector('.theme-switcher__toggle');
  const panel = switcher?.querySelector('.theme-switcher__panel');
  const options = switcher?.querySelectorAll('.theme-option');

  if (!switcher || !toggle || !panel || !options) return;

  // —— aplica tema salvo (ou default) na inicialização ——
  const saved = localStorage.getItem(STORAGE_KEY);
  const initial = VALID_THEMES.includes(saved) ? saved : DEFAULT_THEME;
  applyTheme(initial, false);

  // —— toggle do painel ——
  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = switcher.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  // —— fecha ao clicar fora ——
  document.addEventListener('click', (e) => {
    if (!switcher.contains(e.target)) {
      switcher.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });

  // —— fecha com Esc ——
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && switcher.classList.contains('is-open')) {
      switcher.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.focus();
    }
  });

  // —— clique nas opções ——
  options.forEach((opt) => {
    opt.addEventListener('click', () => {
      const theme = opt.dataset.theme;
      if (!VALID_THEMES.includes(theme)) return;
      applyTheme(theme, true);
      switcher.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });

  /**
   * Aplica o tema ao :root, marca opção ativa, persiste e emite evento.
   * @param {string} theme
   * @param {boolean} persist
   */
  function applyTheme(theme, persist) {
    root.setAttribute('data-theme', theme);

    // atualiza meta theme-color para refletir tema (PWA / browser chrome)
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      const themeColors = {
        electric:  '#0F1117',
        corporate: '#0A0A0A',
        midnight:  '#0A1628',
        aurora:    '#0E1B3A',
      };
      metaThemeColor.setAttribute('content', themeColors[theme] || '#0A1628');
    }

    options.forEach((opt) => {
      const isActive = opt.dataset.theme === theme;
      opt.setAttribute('aria-checked', String(isActive));
    });

    if (persist) localStorage.setItem(STORAGE_KEY, theme);

    // —— emite evento para outros módulos (ex: animações que dependem de cor) ——
    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
  }
})();
