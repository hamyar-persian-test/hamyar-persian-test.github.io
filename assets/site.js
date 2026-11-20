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

  setupTicker();
  page.classList.add('ui-ready');
})();
