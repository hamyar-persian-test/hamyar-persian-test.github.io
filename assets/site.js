/* Hamyar Persian IT-Service — small, dependency-free controls for the static pages. */
(() => {
  'use strict';
  const page = document.documentElement;
  const nightKey = 'hamyar-static-color-mode';
  const isDark = () => page.dataset.theme === 'dark';
  try {
    page.dataset.theme = localStorage.getItem(nightKey) === 'dark' ? 'dark' : 'light';
  } catch {
    page.dataset.theme = 'light';
  }

  const header = document.querySelector('[data-site-header]');
  if (!header) return; // The standalone legal pages only share the color mode.
  const toggle = header.querySelector('[data-theme-toggle]');
  const menu = header.querySelector('[data-menu-toggle]');
  const panel = header.querySelector('[data-menu-panel]');
  const mobileNav = panel.querySelector('nav');
  const desktopNav = [...header.querySelectorAll('[data-desktop-link]')];
  const logoTitle = header.querySelector('[data-logo-title]');
  const logoCaption = header.querySelector('[data-logo-caption]');
  const languages = header.querySelector('[data-lang-switch]');
  const otherLanguage = languages.querySelector('a:not([aria-current])');
  const floating = document.querySelector('[data-floating-contact]');

  function useClasses(node, selected, ...options) {
    for (const option of options) node.classList.remove(...option.split(' '));
    node.classList.add(...selected.split(' '));
  }

  const skins = {
    header: ['bg-transparent', 'bg-white/90 backdrop-blur-xl shadow-[0_10px_40px_-18px_rgba(0,30,80,0.35)]', 'bg-[#000d29]/95 backdrop-blur-xl shadow-[0_10px_40px_-18px_rgba(0,0,0,0.6)]'],
    nav: ['text-white/90 hover:text-white', 'text-navy-800 hover:text-brand-600'],
    group: ['bg-white/10 border-white/20 backdrop-blur', 'bg-brand-50 border-brand-100'],
    language: ['text-white/85 hover:text-white', 'text-navy-800 hover:text-brand-600'],
    theme: ['border-white/20 bg-white/10 text-white hover:bg-white/20', 'border-brand-100 bg-brand-50 text-navy-800 hover:bg-brand-100', 'border-white/20 bg-white/10 text-amber-200 hover:bg-white/15'],
    mobileButton: ['border-white/25 text-white bg-white/10', 'border-brand-100 text-navy-800 bg-white'],
    mobileNav: ['bg-white/60', 'bg-[#101a2a]'],
  };

  let lastSkin = -1;
  let lastFloating = null;
  function renderHeader() {
    const solid = window.scrollY > 24 || menu.getAttribute('aria-expanded') === 'true';
    const skin = solid ? (isDark() ? 2 : 1) : 0;
    if (lastSkin !== skin) {
      lastSkin = skin;
      const lightSurface = skin === 1 ? 1 : 0;
      useClasses(header, skins.header[skin], ...skins.header);
      useClasses(logoTitle, lightSurface ? 'text-navy-800' : 'text-white', 'text-navy-800', 'text-white');
      useClasses(logoCaption, lightSurface ? 'text-slate-600' : 'text-slate-300', 'text-slate-600', 'text-slate-300');
      for (const a of desktopNav) useClasses(a, skins.nav[lightSurface], ...skins.nav);
      useClasses(languages, skins.group[lightSurface], ...skins.group);
      useClasses(otherLanguage, skins.language[lightSurface], ...skins.language);
      useClasses(toggle, skins.theme[skin], ...skins.theme);
      useClasses(menu, skins.mobileButton[lightSurface], ...skins.mobileButton);
      useClasses(mobileNav, skins.mobileNav[skin === 2 ? 1 : 0], ...skins.mobileNav);
    }
    const showContact = window.scrollY > 650;
    if (showContact !== lastFloating) {
      lastFloating = showContact;
      const shown = 'opacity-100 translate-y-0';
      const hidden = 'opacity-0 translate-y-6 pointer-events-none';
      useClasses(floating, showContact ? shown : hidden, shown, hidden);
      floating.setAttribute('aria-hidden', String(!showContact));
      floating.tabIndex = showContact ? 0 : -1;
    }
  }

  function syncThemeButton() {
    const label = isDark() ? toggle.dataset.switchLight : toggle.dataset.switchDark;
    toggle.setAttribute('aria-pressed', String(isDark()));
    toggle.setAttribute('aria-label', label);
    toggle.title = label;
  }
  toggle.addEventListener('click', () => {
    page.dataset.theme = isDark() ? 'light' : 'dark';
    try { localStorage.setItem(nightKey, page.dataset.theme); } catch { /* optional storage */ }
    syncThemeButton();
    renderHeader();
  });

  function setMenu(open) {
    menu.setAttribute('aria-expanded', String(open));
    panel.inert = !open;
    const expanded = 'max-h-[26rem] opacity-100';
    const collapsed = 'max-h-0 opacity-0';
    useClasses(panel, open ? expanded : collapsed, expanded, collapsed);
    renderHeader();
  }
  menu.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
  panel.addEventListener('click', event => { if (event.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true' && !document.querySelector('dialog[open]')) {
      setMenu(false);
      menu.focus();
    }
  });
  const desktop = matchMedia('(min-width: 64rem)');
  desktop.addEventListener('change', event => { if (event.matches) setMenu(false); });
  let scrollQueued = false;
  window.addEventListener('scroll', () => {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(() => { renderHeader(); scrollQueued = false; });
  }, { passive: true });
  setMenu(false);
  syncThemeButton();

  const faqItems = [...document.querySelectorAll('[data-faq-item]')];
  const activeCard = 'border-brand-100 bg-brand-50/50 shadow-[0_20px_45px_-24px_rgba(9,88,212,0.4)]';
  const inactiveCard = 'border-slate-100 bg-white hover:border-brand-100';
  const activeNumber = 'bg-gradient-to-br from-navy-800 to-brand-600 text-white';
  const inactiveNumber = 'bg-brand-50 text-brand-600';
  const activePanel = 'grid-rows-[1fr] opacity-100';
  const inactivePanel = 'grid-rows-[0fr] opacity-0';
  function setFaq(item, open) {
    const question = item.querySelector('button');
    const answer = item.querySelector('[data-faq-panel]');
    question.setAttribute('aria-expanded', String(open));
    question.querySelector(':scope > svg').classList.toggle('rotate-180', open);
    answer.inert = !open;
    useClasses(item, open ? activeCard : inactiveCard, activeCard, inactiveCard);
    useClasses(item.querySelector('[data-faq-number]'), open ? activeNumber : inactiveNumber, activeNumber, inactiveNumber);
    useClasses(answer, open ? activePanel : inactivePanel, activePanel, inactivePanel);
  }
  for (const item of faqItems) {
    const question = item.querySelector('button');
    setFaq(item, question.getAttribute('aria-expanded') === 'true');
    question.addEventListener('click', () => {
      const open = question.getAttribute('aria-expanded') !== 'true';
      for (const candidate of faqItems) setFaq(candidate, candidate === item && open);
    });
  }

  for (const dialog of document.querySelectorAll('dialog[data-tip-dialog]')) {
    const opener = document.getElementById(`${dialog.id}-open`);
    opener.addEventListener('click', () => {
      if (dialog.open) return;
      dialog.showModal();
      document.body.classList.add('tip-is-open');
    });
    for (const closer of dialog.querySelectorAll('[data-tip-close]')) {
      closer.addEventListener('click', () => dialog.close());
    }
    dialog.addEventListener('close', () => {
      document.body.classList.remove('tip-is-open');
      opener.focus({ preventScroll: true });
    });
  }

  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      }
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    for (const el of reveals) observer.observe(el);
  } else {
    for (const el of reveals) el.classList.add('is-visible');
  }
  // Desktop-only ticker: one measured copy of the text list per loop.
  function setupTicker() {
    const strip = document.querySelector('[data-ticker]');
    if (!strip) return;
    const viewport = strip.querySelector('[data-ticker-viewport]');
    const track = strip.querySelector('[data-ticker-track]');
    const original = track.querySelector('[data-ticker-list]');
    const button = strip.querySelector('[data-ticker-toggle]');
    const desktopTicker = matchMedia('(hover: hover) and (pointer: fine)');
    const reduce = matchMedia('(prefers-reduced-motion: reduce)');
    const mouseHover = matchMedia('(hover: hover)');
    const speed = 18; // CSS pixels per second, independent of text length and language.
    let movement = null;
    let distance = 0;
    let cycle = 0;
    let manualPause = false;
    let hovered = false;
    let visible = !('IntersectionObserver' in window);
    let scheduled = false;

    function copyList() {
      const clone = original.cloneNode(true);
      clone.removeAttribute('data-ticker-list');
      clone.removeAttribute('aria-label');
      clone.setAttribute('aria-hidden', 'true');
      clone.setAttribute('data-ticker-copy', '');
      return clone;
    }
    function playback() {
      if (!movement) return;
      const stop = manualPause || hovered || !visible || document.hidden;
      if (stop && movement.playState !== 'paused') movement.pause();
      else if (!stop && movement.playState !== 'running') movement.play();
    }
    function layout() {
      scheduled = false;
      if (!desktopTicker.matches || reduce.matches || typeof track.animate !== 'function') {
        movement?.cancel();
        movement = null;
        track.querySelectorAll('[data-ticker-copy]').forEach(copy => copy.remove());
        strip.classList.remove('ticker-animated');
        button.hidden = true;
        return;
      }
      strip.classList.add('ticker-animated');
      button.hidden = false;
      const nextDistance = original.getBoundingClientRect().width;
      const windowWidth = viewport.getBoundingClientRect().width;
      if (windowWidth < 1 || nextDistance < 1) return;
      const copies = Math.ceil((windowWidth + 1) / nextDistance);
      const existing = [...track.querySelectorAll('[data-ticker-copy]')];
      for (let i = existing.length; i < copies; i++) track.append(copyList());
      for (let i = copies; i < existing.length; i++) existing[i].remove();
      if (!movement || Math.abs(nextDistance - distance) > 0.1) {
        const phase = movement ? ((Number(movement.currentTime) || 0) % cycle) / cycle : 0;
        movement?.cancel();
        distance = nextDistance;
        cycle = distance / speed * 1000;
        const end = strip.dir === 'rtl' ? distance : -distance;
        movement = track.animate([
          { transform: 'translateX(0)' },
          { transform: `translateX(${end}px)` },
        ], { duration: cycle, iterations: Infinity, easing: 'linear' });
        movement.currentTime = phase * cycle;
      }
      playback();
    }
    function queueLayout() {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(layout);
    }

    button.addEventListener('click', () => {
      manualPause = !manualPause;
      button.setAttribute('aria-label', manualPause ? button.dataset.playLabel : button.dataset.pauseLabel);
      button.title = button.getAttribute('aria-label');
      button.querySelector('[data-ticker-button-text]').textContent = manualPause ? button.dataset.playText : button.dataset.pauseText;
      button.querySelector('[data-ticker-pause-icon]').toggleAttribute('hidden', manualPause);
      button.querySelector('[data-ticker-play-icon]').toggleAttribute('hidden', !manualPause);
      playback();
    });
    viewport.addEventListener('pointerenter', event => {
      hovered = mouseHover.matches && event.pointerType === 'mouse';
      playback();
    });
    viewport.addEventListener('pointerleave', () => { hovered = false; playback(); });
    document.addEventListener('visibilitychange', playback);
    reduce.addEventListener('change', queueLayout);
    desktopTicker.addEventListener('change', queueLayout);
    window.addEventListener('resize', queueLayout, { passive: true });
    if ('ResizeObserver' in window) {
      const resize = new ResizeObserver(queueLayout);
      resize.observe(viewport);
      resize.observe(original);
    }
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; playback(); });
      observer.observe(strip);
    }
    if (document.fonts) document.fonts.ready.then(queueLayout);
    queueLayout();
  }

  setupTicker();
  page.classList.add('ui-ready');
})();
