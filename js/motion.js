/* Movimiento de la página: entrada del hero, aparición al bajar, parallax,
   menú móvil e indicador de categorías. Solo transform y opacity.
   Con "reducir movimiento" todo queda quieto y visible. */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------- entrada del hero */
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('is-ready')));

  /* ------------------------------------------- aparición al hacer scroll */
  const reveal = () => {
    const els = $$('[data-reveal]:not(.is-in)');
    if (reduce || !('IntersectionObserver' in window)) { els.forEach(el => el.classList.add('is-in')); return; }
    const io = new IntersectionObserver(es => es.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
    }), { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    els.forEach(el => io.observe(el));
  };
  reveal();
  // los favoritos se crean desde app.js: revisar otra vez cuando existan
  setTimeout(reveal, 50);

  /* ------------------------------------------------------------ parallax
     Cada elemento se mueve según qué tan lejos está su centro del centro de
     la pantalla. Un solo listener pasivo y un rAF por cuadro. */
  const items = [];
  if (!reduce) {
    $$('[data-parallax]').forEach(el => items.push({ el, k: parseFloat(el.dataset.parallax) || 0, img: false }));
    $$('[data-parallax-img]').forEach(el => items.push({ el, k: parseFloat(el.dataset.parallaxImg) || 0, img: true }));
  }
  let ticking = false;
  const vis = new Set();
  const update = () => {
    ticking = false;
    const vh = innerHeight;
    for (const it of items) {
      if (!vis.has(it.el)) continue;
      const box = (it.img ? it.el.parentElement : it.el).getBoundingClientRect();
      const off = (box.top + box.height / 2 - vh / 2);
      const y = -off * it.k;
      it.el.style.transform = it.img ? `translate3d(0, ${y.toFixed(1)}px, 0) scale(1.22)` : `translate3d(0, ${y.toFixed(1)}px, 0)`;
    }
  };
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  if (items.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => { es.forEach(en => en.isIntersecting ? vis.add(en.target) : vis.delete(en.target)); onScroll(); }, { rootMargin: '20% 0px' });
    items.forEach(it => io.observe(it.el));
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll, { passive: true });
  }

  /* ------------------------------------------------- encabezado al bajar */
  const top = $('[data-top]');
  const markTop = () => top && top.classList.toggle('is-scrolled', scrollY > 24);
  addEventListener('scroll', markTop, { passive: true }); markTop();

  /* ------------------------------------------------------------ menú móvil */
  const btn = $('[data-menu-btn]'), menu = $('#menu-movil');
  if (btn && menu) {
    const set = open => {
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      menu.hidden = !open;
      root.classList.toggle('menu-open', open);
      btn.querySelector('.sr').textContent = open ? 'Cerrar menú de navegación' : 'Abrir menú de navegación';
    };
    btn.addEventListener('click', () => set(btn.getAttribute('aria-expanded') !== 'true'));
    menu.addEventListener('click', e => { if (e.target.closest('a')) set(false); });
    addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) { set(false); btn.focus(); } });
    matchMedia('(min-width: 1024px)').addEventListener('change', e => { if (e.matches) set(false); });
  }

  /* --------------------------------- indicador bajo la categoría activa */
  const placeInk = () => {
    const tabs = $('[data-chips]'); if (!tabs) return;
    const ink = $('.tabs__ink', tabs), on = $('.chip.is-on', tabs);
    if (!ink) return;
    if (!on) { ink.style.opacity = 0; return; }
    ink.style.opacity = 1;
    ink.style.width = on.offsetWidth + 'px';
    ink.style.transform = `translateX(${on.offsetLeft}px)`;
    // mantener visible la pestaña activa en celulares (desplazamiento horizontal)
    const l = on.offsetLeft - tabs.scrollLeft, r = l + on.offsetWidth;
    if (l < 0 || r > tabs.clientWidth) tabs.scrollTo({ left: on.offsetLeft - 16, behavior: reduce ? 'auto' : 'smooth' });
  };
  const tabsEl = $('[data-chips]');
  if (tabsEl) new MutationObserver(placeInk).observe(tabsEl, { subtree: true, attributes: true, attributeFilter: ['class'] });
  addEventListener('resize', placeInk, { passive: true });

  /* ---------------------------- la insignia que gira se detiene fuera de vista */
  const badge = $('.badge');
  if (badge && 'IntersectionObserver' in window) {
    new IntersectionObserver(([en]) => badge.classList.toggle('is-off', !en.isIntersecting)).observe(badge);
  }
})();
