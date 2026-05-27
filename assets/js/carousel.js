/**
 * carousel.js
 * Carrossel de certificados.
 * Mobile (<1024px): scroll horizontal nativo com scroll-snap (CSS).
 * Desktop (>=1024px): drag, mouse, botoes prev/next via transform.
 * Progressive enhancement: se JS falhar, scroll nativo funciona em todas telas.
 */
(() => {
  const wrapper = document.querySelector('.metodo__carousel');
  const track = document.querySelector('.metodo__carousel-track');
  const prevBtn = document.querySelector('.metodo__carousel-btn--prev');
  const nextBtn = document.querySelector('.metodo__carousel-btn--next');

  if (!wrapper || !track) return;

  const cards = track.querySelectorAll('.cert-card');
  if (!cards.length) return;

  const desktopQuery = window.matchMedia('(min-width: 1024px) and (hover: hover) and (pointer: fine)');

  let isDesktop = desktopQuery.matches;
  let isDragging = false;
  let startX = 0;
  let scrollLeft = 0;
  let currentTranslate = 0;
  let velocity = 0;
  let lastX = 0;
  let lastTime = 0;

  const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

  const getMaxScroll = () => {
    const trackWidth = track.scrollWidth;
    const wrapperWidth = wrapper.clientWidth;
    return Math.max(0, trackWidth - wrapperWidth);
  };

  const getCardWidth = () => {
    if (!cards[0]) return 280;
    const style = getComputedStyle(track);
    const gap = parseFloat(style.gap) || 16;
    return cards[0].offsetWidth + gap;
  };

  const updateButtons = () => {
    if (!prevBtn || !nextBtn) return;
    prevBtn.disabled = currentTranslate >= 0;
    nextBtn.disabled = currentTranslate <= -getMaxScroll();
  };

  const setTranslate = (x) => {
    currentTranslate = clamp(x, -getMaxScroll(), 0);
    track.style.transform = `translateX(${currentTranslate}px)`;
    updateButtons();
  };

  const enableDesktop = () => {
    wrapper.classList.add('js-carousel');
    setTranslate(0);
    updateButtons();
  };

  const enableMobile = () => {
    wrapper.classList.remove('js-carousel');
    track.style.transform = '';
    currentTranslate = 0;
  };

  if (isDesktop) enableDesktop();
  else enableMobile();

  const onMediaChange = (e) => {
    isDesktop = e.matches;
    if (isDesktop) enableDesktop();
    else enableMobile();
  };

  if (desktopQuery.addEventListener) {
    desktopQuery.addEventListener('change', onMediaChange);
  } else if (desktopQuery.addListener) {
    desktopQuery.addListener(onMediaChange);
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (!isDesktop) return;
      setTranslate(currentTranslate + getCardWidth());
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (!isDesktop) return;
      setTranslate(currentTranslate - getCardWidth());
    });
  }

  track.addEventListener('mousedown', (e) => {
    if (!isDesktop) return;
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
    if (!isDragging || !isDesktop) return;
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
    const momentum = velocity * 150;
    setTranslate(currentTranslate + momentum);
    velocity = 0;
  });

  track.addEventListener('click', (e) => {
    if (!isDesktop) return;
    if (Math.abs(currentTranslate - scrollLeft) > 5) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, true);

  window.addEventListener('resize', () => {
    if (isDesktop) setTranslate(clamp(currentTranslate, -getMaxScroll(), 0));
  });
})();
