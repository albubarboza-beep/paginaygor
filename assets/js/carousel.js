/**
 * carousel.js
 * Carrossel de certificados — drag, touch, botoes.
 * Sem dependencias, progressive enhancement.
 */
(() => {
  const wrapper = document.querySelector('.metodo__carousel');
  const track = document.querySelector('.metodo__carousel-track');
  const prevBtn = document.querySelector('.metodo__carousel-btn--prev');
  const nextBtn = document.querySelector('.metodo__carousel-btn--next');

  if (!wrapper || !track) return;

  const cards = track.querySelectorAll('.cert-card');
  if (!cards.length) return;

  let isDragging = false;
  let startX = 0;
  let scrollLeft = 0;
  let currentTranslate = 0;
  let velocity = 0;
  let lastX = 0;
  let lastTime = 0;

  // Calcula limites
  const getMaxScroll = () => {
    const trackWidth = track.scrollWidth;
    const wrapperWidth = wrapper.clientWidth;
    return Math.max(0, trackWidth - wrapperWidth);
  };

  const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

  const setTranslate = (x) => {
    currentTranslate = clamp(x, -getMaxScroll(), 0);
    track.style.transform = `translateX(${currentTranslate}px)`;
    updateButtons();
  };

  const updateButtons = () => {
    if (!prevBtn || !nextBtn) return;
    prevBtn.disabled = currentTranslate >= 0;
    nextBtn.disabled = currentTranslate <= -getMaxScroll();
  };

  // Botoes
  const getCardWidth = () => {
    if (!cards[0]) return 280;
    const style = getComputedStyle(track);
    const gap = parseFloat(style.gap) || 16;
    return cards[0].offsetWidth + gap;
  };

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      setTranslate(currentTranslate + getCardWidth());
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      setTranslate(currentTranslate - getCardWidth());
    });
  }

  // Mouse drag
  track.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX;
    scrollLeft = currentTranslate;
    lastX = e.clientX;
    lastTime = Date.now();
    track.style.transition = 'none';
    track.style.cursor = 'grabbing';
    e.preventDefault();
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const now = Date.now();
    const dt = now - lastTime;
    if (dt > 0) velocity = (e.clientX - lastX) / dt;
    lastX = e.clientX;
    lastTime = now;
    setTranslate(scrollLeft + dx);
  });

  window.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    track.style.transition = '';
    track.style.cursor = '';

    // Momentum
    const momentum = velocity * 150;
    setTranslate(currentTranslate + momentum);
    velocity = 0;
  });

  // Touch
  track.addEventListener('touchstart', (e) => {
    isDragging = true;
    startX = e.touches[0].clientX;
    scrollLeft = currentTranslate;
    lastX = startX;
    lastTime = Date.now();
    track.style.transition = 'none';
  }, { passive: true });

  track.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    const dx = e.touches[0].clientX - startX;
    const now = Date.now();
    const dt = now - lastTime;
    if (dt > 0) velocity = (e.touches[0].clientX - lastX) / dt;
    lastX = e.touches[0].clientX;
    lastTime = now;
    setTranslate(scrollLeft + dx);
  }, { passive: true });

  track.addEventListener('touchend', () => {
    if (!isDragging) return;
    isDragging = false;
    track.style.transition = '';
    const momentum = velocity * 150;
    setTranslate(currentTranslate + momentum);
    velocity = 0;
  });

  // Previne cliques apos drag
  track.addEventListener('click', (e) => {
    if (Math.abs(currentTranslate - scrollLeft) > 5) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, true);

  // Init
  updateButtons();

  // Recalcula ao redimensionar
  window.addEventListener('resize', () => {
    setTranslate(clamp(currentTranslate, -getMaxScroll(), 0));
  });
})();
