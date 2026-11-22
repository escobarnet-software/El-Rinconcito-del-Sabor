/* El Rinconcito del Sabor: menú, horario en vivo, pedido y envío por WhatsApp.
   Los datos editables viven en js/config.js (window.RINCONCITO). */
(() => {
  'use strict';
  const C = window.RINCONCITO;
  if (!C) return;
  document.documentElement.classList.add('js');

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const fmt = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const money = n => C.moneda + fmt.format(n);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* Solo para pruebas (break-ui): ?datos=peor mete el peor caso realista por la misma
     puerta que los datos reales. No afecta a nadie que abra la página normal. */
  const prueba = new URLSearchParams(location.search).get('datos');
  if (prueba === 'peor') {
    C.categorias[0].platillos.unshift(
      { id: 'prueba-largo', nombre: 'Parrillada familiar especial de la casa con camarones jumbo, chorizo artesanal y costilla para 6 personas', descripcion: 'Incluye arroz, frijoles volteados, ensalada fresca, plátano frito, crema, queso duro y tortillas recién hechas a mano en comal de barro.', precio: 104.99, foto: 'parrillada-2' },
      { id: 'prueba-corto', nombre: 'Té', descripcion: '', precio: 0.5, foto: 'cheesecake' },
    );
    try {
      localStorage.setItem('rinconcito-pedido-v1', JSON.stringify([
        { id: 'prueba-largo', qty: 30, nota: 'Sin cebolla ni cilantro, la carne bien cocida, salsa aparte y por favor cubiertos para seis personas 🙏🔥' },
        { id: 'azulito', qty: 30, nota: '' },
        { id: 'prueba-corto', qty: 1, nota: '🌶️🌶️🌶️' },
        { id: 'comal-mexicano', qty: 12, nota: '' },
      ]));
      localStorage.setItem('rinconcito-pedido-v1-nombre', 'María Fernanda de los Ángeles Hernández Quintanilla 👩🏽‍🍳✨');
    } catch (e) { /* nada */ }
  } else if (prueba === 'vacio') {
    try { localStorage.removeItem('rinconcito-pedido-v1'); } catch (e) { /* nada */ }
  }

  /* ------------------------------------------------------------ catálogo */
  const byId = new Map();
  C.categorias.forEach(cat => cat.platillos.forEach(p => byId.set(p.id, { ...p, cat: cat.id })));

  /* -------------------------------------------------------------- horario */
  const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const toMin = hhmm => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };
  const hora12 = min => {
    min = ((min % 1440) + 1440) % 1440;
    let h = Math.floor(min / 60); const m = min % 60;
    const suf = h < 12 ? 'a.\u00a0m.' : 'p.\u00a0m.';
    h = h % 12 || 12;
    return `${h}:${String(m).padStart(2, '0')}\u00a0${suf}`;
  };
  // "Ahora" en El Salvador, sin importar la zona del teléfono
  function ahora() {
    const parts = new Intl.DateTimeFormat('en-US', { timeZone: C.zonaHoraria, weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' })
      .formatToParts(new Date());
    const get = t => parts.find(p => p.type === t)?.value;
    const dia = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
    return { dia, min: (+get('hour')) * 60 + (+get('minute')) };
  }
  const turnos = d => (C.horario[d] || []).map(([a, b]) => [toMin(a), toMin(b) <= toMin(a) ? toMin(b) + 1440 : toMin(b)]);

  function estado(now = ahora()) {
    for (const [a, b] of turnos(now.dia)) if (now.min >= a && now.min < b) return { abierto: true, abre: a, cierra: b, now };
    // turno de ayer que pasa de medianoche
    const ayer = (now.dia + 6) % 7;
    for (const [a, b] of turnos(ayer)) if (b > 1440 && now.min < b - 1440) return { abierto: true, abre: a - 1440, cierra: b - 1440, now };
    for (let k = 0; k < 8; k++) {
      const d = (now.dia + k) % 7;
      for (const [a, b] of turnos(d)) if (k > 0 || a > now.min) return { abierto: false, abreDia: k, abreMin: a, cierraMin: b, abreNombre: d, now };
    }
    return { abierto: false };
  }

  function textoEstado(e) {
    if (e.abierto) return {
      corto: 'Abierto ahora', largo: `Abierto ahora · cierra a las ${hora12(e.cierra)}`,
      titulo: 'Estamos abiertos', detalle: `Hoy de ${hora12(e.abre)} a ${hora12(e.cierra)}`,
    };
    if (e.abreDia == null) return { corto: 'Cerrado', largo: 'Cerrado por ahora', titulo: 'Estamos cerrados', detalle: 'Escríbenos por WhatsApp' };
    const cuando = e.abreDia === 0 ? 'hoy' : e.abreDia === 1 ? 'mañana' : `el ${DIAS[e.abreNombre]}`;
    return {
      corto: 'Cerrado', largo: `Cerrado · abre ${cuando} a las ${hora12(e.abreMin)}`,
      titulo: 'Estamos cerrados', detalle: `Abre ${cuando} a las ${hora12(e.abreMin)}, hasta las ${hora12(e.cierraMin)}`,
    };
  }

  function pintarEstado() {
    const e = estado();
    const t = textoEstado(e);
    $$('[data-estado]').forEach(el => {
      el.dataset.abierto = e.abierto ? 'si' : 'no';
      const txt = el.querySelector('[data-estado-texto]');
      if (txt) txt.textContent = el.hasAttribute('data-estado-corto') ? t.corto : t.largo;
    });
    $$('[data-estado-titulo]').forEach(el => { el.textContent = t.titulo; });
    $$('[data-estado-detalle]').forEach(el => { el.textContent = t.detalle; });
    pintarReloj(e);
    const hoy = ahora().dia;
    $$('[data-dia]').forEach(row => row.classList.toggle('is-today', +row.dataset.dia === hoy));
    document.documentElement.dataset.abierto = e.abierto ? 'si' : 'no';
  }

  // Reloj en vivo, barra del día y cuánto falta para abrir o cerrar
  const dur = m => { const h = Math.floor(m / 60), r = m % 60; return h ? `${h} h${r ? ` ${r} min` : ''}` : `${r} min`; };
  function pintarReloj(e) {
    const now = e.now || ahora();
    $$('[data-reloj]').forEach(el => { el.textContent = hora12(now.min); });
    const barra = $('[data-dia-barra]');
    if (barra) {
      const t = turnos(now.dia)[0];
      const ab = $('[data-barra-abierto]', barra), ah = $('[data-barra-ahora]', barra);
      if (t) { ab.style.left = (t[0] / 1440 * 100) + '%'; ab.style.width = ((Math.min(t[1], 1440) - t[0]) / 1440 * 100) + '%'; ab.hidden = false; }
      else ab.hidden = true;
      ah.style.left = (now.min / 1440 * 100) + '%';
    }
    const falta = $('[data-falta]');
    if (falta) {
      if (e.abierto) falta.textContent = `Cerramos en ${dur(e.cierra - now.min)}.`;
      else if (e.abreDia != null) falta.textContent = `Abrimos en ${dur(e.abreDia * 1440 + e.abreMin - now.min)}.`;
      else falta.textContent = '';
    }
    const ph = $('[data-panel-hora]');
    if (ph) ph.textContent = e.abierto ? `Listo en unos ${C.minutosPreparacion} minutos.` : `Ahora estamos cerrados: tu pedido queda para ${e.abreDia === 1 ? 'mañana' : e.abreDia === 0 ? 'hoy' : 'la siguiente apertura'} desde las ${hora12(e.abreMin + C.intervaloRecogida)}.`;
  }

  // Filas del horario, agrupando días seguidos con el mismo horario
  function filasHorario() {
    const orden = [1, 2, 3, 4, 5, 6, 0];
    const txt = d => (C.horario[d] || []).length ? C.horario[d].map(([a, b]) => `${hora12(toMin(a))} a ${hora12(toMin(b))}`).join(' y ') : 'Cerrado';
    return orden.map(d => ({ dia: d, nombre: DIAS[d][0].toUpperCase() + DIAS[d].slice(1), horas: txt(d) }));
  }
  function renderHorario() {
    $$('[data-horario]').forEach(dl => {
      dl.innerHTML = filasHorario().map(f => `<div class="hrow" data-dia="${f.dia}"><dt>${f.nombre}</dt><dd>${f.horas}</dd></div>`).join('');
    });
  }

  // Horas de recogida: hoy desde ahora + preparación; si no hay, el siguiente día abierto
  function horasRecogida() {
    const now = ahora();
    const out = [];
    for (let k = 0; k < 8 && out.length < 2; k++) {
      const d = (now.dia + k) % 7;
      const slots = [];
      for (const [a, b] of turnos(d)) {
        const desde = Math.max(a + C.intervaloRecogida, k === 0 ? now.min + C.minutosPreparacion : 0);
        const ini = Math.ceil(desde / C.intervaloRecogida) * C.intervaloRecogida;
        for (let m = ini; m <= b - C.ultimoPedidoAntesDeCerrar; m += C.intervaloRecogida) slots.push(m);
      }
      if (slots.length) {
        const etiqueta = k === 0 ? 'Hoy' : k === 1 ? 'Mañana' : DIAS[d][0].toUpperCase() + DIAS[d].slice(1);
        out.push({ k, etiqueta, slots });
      }
    }
    return out;
  }

  /* -------------------------------------------------------------- carrito */
  const KEY = 'rinconcito-pedido-v1';
  let cart = [];
  try { cart = JSON.parse(localStorage.getItem(KEY) || '[]').filter(l => byId.has(l.id) && l.qty > 0); } catch (e) { cart = []; }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch (e) { /* modo privado */ } };
  const totalQty = () => cart.reduce((s, l) => s + l.qty, 0);
  const total = () => cart.reduce((s, l) => s + l.qty * byId.get(l.id).precio, 0);
  const qtyOf = id => cart.filter(l => l.id === id).reduce((s, l) => s + l.qty, 0);

  function addToCart(id, qty, nota) {
    nota = (nota || '').trim().slice(0, 140);
    const line = cart.find(l => l.id === id && l.nota === nota);
    if (line) line.qty = Math.min(C.maximoPorPlatillo, line.qty + qty);
    else cart.push({ id, qty: Math.min(C.maximoPorPlatillo, qty), nota });
    save(); syncCart();
  }

  /* --------------------------------------------------------------- menú */
  function cardHTML(p) {
    return `<li class="dish" data-id="${p.id}">
      <button class="dish__btn" type="button" aria-haspopup="dialog" aria-label="Agregar ${esc(p.nombre)}, ${money(p.precio)}">
        <span class="dish__img"><img src="img/menu/${p.foto}.webp" alt="" width="188" height="188" loading="lazy" decoding="async"></span>
        <span class="dish__body">
          <span class="dish__name">${esc(p.nombre)}</span>
          ${p.descripcion ? `<span class="dish__desc">${esc(p.descripcion)}</span>` : ''}
          <span class="dish__foot"><span class="dish__price">${money(p.precio)}</span><span class="dish__count" data-count hidden></span></span>
        </span>
        <span class="dish__add" aria-hidden="true"><svg><use href="#g-plus"/></svg></span>
      </button>
    </li>`;
  }
  function renderMenu() {
    const root = $('[data-menu]');
    if (!root) return;
    root.innerHTML = C.categorias.map(cat => `
      <section class="menu-group" id="cat-${cat.id}" aria-labelledby="cat-${cat.id}-h">
        <h3 class="menu-group__h" id="cat-${cat.id}-h">${esc(cat.nombre)} <span class="menu-group__n">${cat.platillos.length} platillos</span></h3>
        <ul class="dishes">${cat.platillos.map(cardHTML).join('')}</ul>
      </section>`).join('');
    const chips = $('[data-chips]');
    if (chips) chips.innerHTML = C.categorias.map(cat => `<a class="chip" href="#cat-${cat.id}">${esc(cat.nombre)}</a>`).join('') + '<span class="tabs__ink" aria-hidden="true"></span>';
    const favs = $('[data-favs]');
    if (favs) favs.innerHTML = (C.destacados || []).map(id => byId.get(id)).filter(Boolean).map((p, i) => `
      <li class="fav fav--${i % 4}" data-id="${p.id}" data-reveal style="--d:${[0, 90, 160, 220][i % 4]}ms">
        <button class="fav__btn" type="button" aria-haspopup="dialog" aria-label="Agregar ${esc(p.nombre)}, ${money(p.precio)}">
          <span class="fav__plate"><img src="img/menu/${p.foto}.webp" alt="" width="188" height="188" loading="lazy" decoding="async"></span>
          <span class="fav__name">${esc(p.nombre)}</span>
          ${p.descripcion ? `<span class="fav__desc">${esc(p.descripcion)}</span>` : ''}
          <span class="fav__foot"><span class="fav__price">${money(p.precio)}</span><span class="fav__add"><svg aria-hidden="true"><use href="#g-plus"/></svg>Agregar</span></span>
          <span class="dish__count" data-count hidden></span>
        </button>
      </li>`).join('');
  }

  /* ------------------------------------------------------ hoja inferior
     Sigue al dedo 1:1 mientras está presionado; al soltar, un resorte
     sembrado con la velocidad del gesto termina el movimiento. Se puede
     atrapar a medio camino. Solo transform y opacity. */
  const openSheets = new Set();
  class Sheet {
    constructor(dialog) {
      this.d = dialog;
      this.panel = $('.sheet__panel', dialog);
      this.scrim = $('.sheet__scrim', dialog);
      this.y = 0; this.v = 0; this.target = 0; this.raf = 0; this.h = 1;
      this.onClosed = null;
      dialog.addEventListener('cancel', e => { e.preventDefault(); this.close(); });
      this.scrim.addEventListener('click', () => this.close());
      $$('[data-close]', dialog).forEach(b => b.addEventListener('click', () => this.close()));
      $$('[data-drag]', dialog).forEach(h => this.bindDrag(h));
    }
    set(y) {
      this.y = y;
      this.panel.style.transform = `translate3d(0, ${y}px, 0)`;
      // el velo sigue al panel: una sola fuente de verdad
      const p = Math.min(1, Math.max(0, 1 - y / this.h));
      this.scrim.style.opacity = p;
    }
    // Resorte con los dos parámetros de Apple: amortiguamiento (1 = sin rebote) y respuesta (s)
    spring(target, velocity = 0, damping = 1, done, response = 0.4) {
      cancelAnimationFrame(this.raf);
      this.target = target; this.v = velocity * 1000; // px/ms -> px/s
      if (reduce.matches) { this.set(target); done && done(); return; }
      const k = Math.pow(2 * Math.PI / response, 2);
      const c = 2 * damping * Math.sqrt(k);
      let last = performance.now();
      const step = now => {
        const dt = Math.min(0.032, (now - last) / 1000); last = now;
        const a = -k * (this.y - this.target) - c * this.v;
        this.v += a * dt;
        this.set(this.y + this.v * dt);
        if (Math.abs(this.v) < 8 && Math.abs(this.y - this.target) < 0.5) { this.set(this.target); this.raf = 0; done && done(); return; }
        this.raf = requestAnimationFrame(step);
      };
      this.raf = requestAnimationFrame(step);
    }
    open() {
      if (this.d.open) return;
      this.lastFocus = document.activeElement;
      this.d.showModal();
      openSheets.add(this);
      document.documentElement.classList.add('sheet-open');
      this.h = this.panel.offsetHeight || window.innerHeight;
      if (reduce.matches) {
        this.set(0);
        this.panel.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 160, easing: 'ease-out' });
        this.scrim.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 160, easing: 'ease-out' });
        return;
      }
      if (!this.raf) this.set(this.h);
      this.spring(0, 0, 1, null, 0.42); // abierto con un botón: sin rebote
    }
    close(velocity = 0) {
      if (!this.d.open || this.closing) return;
      this.closing = true;
      const fin = () => {
        this.closing = false;
        this.d.close();
        openSheets.delete(this);
        if (!openSheets.size) document.documentElement.classList.remove('sheet-open');
        if (this.lastFocus && document.contains(this.lastFocus)) this.lastFocus.focus({ preventScroll: true });
        this.onClosed && this.onClosed();
      };
      this.h = this.panel.offsetHeight || this.h;
      if (reduce.matches) {
        const a = this.panel.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 120, easing: 'ease-out' });
        this.scrim.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 120, easing: 'ease-out' });
        a.onfinish = fin; return;
      }
      this.spring(this.h, velocity, 1, fin, velocity > 0 ? 0.32 : 0.36);
    }
    bindDrag(handle) {
      let id = null, y0 = 0, start = 0, samples = [];
      handle.addEventListener('pointerdown', e => {
        if (id !== null || (e.pointerType === 'mouse' && e.button !== 0)) return; // un solo dedo
        if (e.target.closest('button, a, input, textarea, select')) return;
        id = e.pointerId;
        cancelAnimationFrame(this.raf); this.raf = 0; this.closing = false; // atrapar a medio vuelo
        this.h = this.panel.offsetHeight;
        y0 = e.clientY; start = this.y; samples = [[e.timeStamp, e.clientY]];
        handle.setPointerCapture(id);
        this.panel.classList.add('is-dragging');
      });
      handle.addEventListener('pointermove', e => {
        if (e.pointerId !== id) return;
        let y = start + (e.clientY - y0);
        if (y < 0) { const o = -y, d = this.h; y = -(o * d * 0.2) / (d + 0.2 * o); } // rubber-band arriba
        this.set(y);
        samples.push([e.timeStamp, e.clientY]);
        if (samples.length > 5) samples.shift();
      });
      const end = e => {
        if (e.pointerId !== id) return;
        id = null;
        this.panel.classList.remove('is-dragging');
        const [t0, a] = samples[0], [t1, b] = samples[samples.length - 1];
        const v = t1 > t0 ? (b - a) / (t1 - t0) : 0; // px/ms
        // proyectar a dónde iría con la inercia (fórmula de Apple) y decidir desde ahí
        const proyectado = this.y + (v * 0.998) / (1 - 0.998);
        if (proyectado > this.h * 0.5 && this.y > 4) this.close(Math.max(v, 0));
        else this.spring(0, v, 0.8, null, 0.3); // hubo fuerza: un leve rebote
      };
      handle.addEventListener('pointerup', end);
      handle.addEventListener('pointercancel', end);
    }
  }

  /* ------------------------------------------------- hoja del platillo */
  const itemDlg = $('#hoja-platillo');
  const cartDlg = $('#hoja-pedido');
  if (!itemDlg || !cartDlg) return;
  const itemSheet = new Sheet(itemDlg);
  const cartSheet = new Sheet(cartDlg);
  let current = null, qty = 1;

  function openItem(id, from) {
    const p = byId.get(id); if (!p) return;
    current = p; qty = 1;
    $('[data-item-img]', itemDlg).src = `img/menu/${p.foto}.webp`;
    $('[data-item-name]', itemDlg).textContent = p.nombre;
    const d = $('[data-item-desc]', itemDlg); d.textContent = p.descripcion || ''; d.hidden = !p.descripcion;
    $('[data-item-price]', itemDlg).textContent = money(p.precio);
    $('#nota-platillo').value = '';
    updateItemQty();
    itemSheet.open();
  }
  function updateItemQty() {
    $('[data-item-qty]', itemDlg).textContent = qty;
    $('[data-item-minus]', itemDlg).disabled = qty <= 1;
    $('[data-item-plus]', itemDlg).disabled = qty >= C.maximoPorPlatillo;
    $('[data-item-total]', itemDlg).textContent = money(qty * current.precio);
    $('[data-item-cta]', itemDlg).firstChild.textContent = qty === 1 ? 'Agregar 1 al pedido' : `Agregar ${qty} al pedido`;
  }
  $('[data-item-minus]', itemDlg).addEventListener('click', () => { if (qty > 1) { qty--; updateItemQty(); } });
  $('[data-item-plus]', itemDlg).addEventListener('click', () => { if (qty < C.maximoPorPlatillo) { qty++; updateItemQty(); } });
  $('[data-item-form]', itemDlg).addEventListener('submit', e => {
    e.preventDefault();
    const img = $('[data-item-img]', itemDlg);
    const r = img.getBoundingClientRect();
    const wasEmpty = totalQty() === 0;
    addToCart(current.id, qty, $('#nota-platillo').value);
    itemSheet.close();
    fly(img.currentSrc || img.src, r, wasEmpty);
    announce(`${qty} ${current.nombre} agregado al pedido. Total ${money(total())}.`);
  });

  document.addEventListener('click', e => {
    const btn = e.target.closest('button.dish__btn, .fav__btn, .oplate'); if (!btn) return;
    openItem(btn.closest('[data-id]').dataset.id, btn);
  });

  /* El platillo vuela hacia la barra del pedido: muestra a dónde fue.
     X avanza con ease-out y Y con ease-in en capas separadas: un arco. */
  function fly(src, r, wasEmpty) {
    const panel = $('[data-panel]');
    const enPanel = !!panel && getComputedStyle(panel).display !== 'none';
    const target = enPanel ? $('[data-panel-total]') : $('.cartbar__count');
    if (reduce.matches || !target || !r.width) { bump(); return; }
    const go = () => {
      const t = target.getBoundingClientRect();
      const size = 56;
      const sx = r.left + r.width / 2 - size / 2, sy = r.top + r.height / 2 - size / 2;
      const dx = t.left + t.width / 2 - (sx + size / 2), dy = t.top + t.height / 2 - (sy + size / 2);
      const outer = document.createElement('div');
      outer.className = 'fly';
      outer.style.cssText = `left:${sx}px;top:${sy}px;width:${size}px;height:${size}px`;
      outer.innerHTML = `<div class="fly__y"><img src="${src}" alt=""></div>`;
      document.body.appendChild(outer);
      const dur = 560;
      outer.animate([{ transform: 'translateX(0)' }, { transform: `translateX(${dx}px)` }], { duration: dur, easing: 'cubic-bezier(.22,.8,.3,1)', fill: 'forwards' });
      outer.firstChild.animate([
        { transform: 'translateY(0) scale(1.25)', opacity: 1 },
        { transform: `translateY(${dy}px) scale(.42)`, opacity: .9 },
      ], { duration: dur, easing: 'cubic-bezier(.55,0,.85,.35)', fill: 'forwards' })
        .onfinish = () => { outer.remove(); bump(); };
    };
    // la barra recién aparece: esperar a que esté en su sitio
    if (wasEmpty && !enPanel) setTimeout(go, 140); else go();
  }
  function bump() {
    $$('.cartbar__count, [data-panel-total]').forEach(c => { c.classList.remove('is-bump'); void c.offsetWidth; c.classList.add('is-bump'); });
  }

  /* ------------------------------------------------------- barra y hoja */
  function syncCart() {
    const n = totalQty();
    document.documentElement.dataset.cart = n ? 'full' : 'empty';
    $$('[data-cart-count]').forEach(el => { el.textContent = n; });
    $$('[data-cart-total]').forEach(el => { el.textContent = money(total()); });
    $$('[data-cart-label]').forEach(el => { el.textContent = n === 1 ? '1 platillo' : `${n} platillos`; });
    const bar = $('.cartbar');
    if (bar) { bar.inert = !n; bar.setAttribute('aria-hidden', n ? 'false' : 'true'); }
    renderPanel();
    $$('.dish, .fav').forEach(li => {
      const q = qtyOf(li.dataset.id); const c = $('[data-count]', li);
      if (!c) return;
      c.hidden = !q; c.textContent = q ? `${q} en tu pedido` : '';
      li.classList.toggle('is-in', !!q);
    });
    if (cartDlg.open) renderLines();
  }

  function renderPanel() {
    const ul = $('[data-panel-lines]'); if (!ul) return;
    $('[data-panel-empty]').hidden = cart.length > 0;
    ul.innerHTML = cart.map(l => { const p = byId.get(l.id); return `<li><span class="panel__q">${l.qty}×</span><span class="panel__n">${esc(p.nombre)}${l.nota ? `<small>${esc(l.nota)}</small>` : ''}</span><span class="panel__p">${money(p.precio * l.qty)}</span></li>`; }).join('');
    const b = $('[data-panel] [data-open-cart]'); if (b) b.disabled = !cart.length;
  }

  function lineHTML(l, i) {
    const p = byId.get(l.id);
    return `<li class="line" data-i="${i}">
      <img class="line__img" src="img/menu/${p.foto}.webp" alt="" width="56" height="56">
      <div class="line__body">
        <p class="line__name">${esc(p.nombre)}</p>
        ${l.nota ? `<p class="line__note">Nota: ${esc(l.nota)}</p>` : ''}
        <p class="line__price">${money(p.precio * l.qty)}</p>
      </div>
      <div class="stepper stepper--sm" role="group" aria-label="Cantidad de ${esc(p.nombre)}">
        <button type="button" class="stepper__b" data-line-minus aria-label="${l.qty === 1 ? 'Quitar' : 'Uno menos de'} ${esc(p.nombre)}">${l.qty === 1
          ? '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.6 8.5h5.8l.6-8.5"/></svg>'
          : '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10"/></svg>'}</button>
        <span class="stepper__n" aria-live="polite">${l.qty}</span>
        <button type="button" class="stepper__b" data-line-plus aria-label="Uno más de ${esc(p.nombre)}" ${l.qty >= C.maximoPorPlatillo ? 'disabled' : ''}><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 3v10M3 8h10"/></svg></button>
      </div>
    </li>`;
  }
  function renderLines() {
    const list = $('[data-lines]', cartDlg);
    const empty = !cart.length;
    cartDlg.dataset.empty = empty ? 'si' : 'no';
    list.innerHTML = cart.map(lineHTML).join('');
    $('[data-sheet-count]', cartDlg).textContent = empty ? '' : `· ${totalQty() === 1 ? '1 platillo' : totalQty() + ' platillos'}`;
  }

  // FLIP: al quitar una fila, las demás se deslizan al hueco mientras se va
  function removeLine(i) {
    const list = $('[data-lines]', cartDlg);
    const rows = $$('.line', list);
    const before = new Map(rows.map(r => [r.dataset.i, r.getBoundingClientRect().top]));
    cart.splice(i, 1); save(); syncCart();
    if (reduce.matches) return;
    $$('.line', list).forEach((r, j) => {
      const oldKey = String(j >= i ? j + 1 : j);
      const dy = (before.get(oldKey) ?? 0) - r.getBoundingClientRect().top;
      if (dy) r.animate([{ transform: `translateY(${dy}px)` }, { transform: 'none' }], { duration: 220, easing: 'cubic-bezier(.23,1,.32,1)' });
    });
  }
  $('[data-lines]', cartDlg).addEventListener('click', e => {
    const li = e.target.closest('.line'); if (!li) return;
    const i = +li.dataset.i; const l = cart[i]; if (!l) return;
    if (e.target.closest('[data-line-plus]')) { l.qty = Math.min(C.maximoPorPlatillo, l.qty + 1); save(); syncCart(); refocus(i, 'plus'); }
    else if (e.target.closest('[data-line-minus]')) {
      if (l.qty > 1) { l.qty--; save(); syncCart(); refocus(i, 'minus'); }
      else { const name = byId.get(l.id).nombre; removeLine(i); announce(`${name} quitado del pedido.`); const next = $$('.line [data-line-minus]', cartDlg)[Math.min(i, cart.length - 1)]; (next || $('[data-close]', cartDlg)).focus(); }
    }
  });
  function refocus(i, which) { const b = $(`.line[data-i="${i}"] [data-line-${which}]`, cartDlg); b && !b.disabled ? b.focus() : $(`.line[data-i="${i}"] [data-line-minus]`, cartDlg)?.focus(); }

  function renderSlots() {
    const sel = $('#hora-recogida');
    const prev = sel.value;
    const grupos = horasRecogida();
    const e = estado();
    const aviso = $('[data-closed-note]', cartDlg);
    if (!grupos.length) { sel.innerHTML = '<option value="">No hay horas disponibles</option>'; aviso.hidden = false; aviso.textContent = 'No encontramos un horario de atención. Escríbenos por WhatsApp.'; return; }
    sel.innerHTML = '<option value="">Escoge una hora</option>' + grupos.map(g => `<optgroup label="${g.etiqueta}">${g.slots.map(m => {
      const v = `${g.etiqueta.toLowerCase()}|${m}`;
      return `<option value="${v}">${g.etiqueta}, ${hora12(m)}</option>`;
    }).join('')}</optgroup>`).join('');
    if ([...sel.options].some(o => o.value === prev)) sel.value = prev;
    const hoySinHoras = grupos[0].k !== 0;
    if (!e.abierto || hoySinHoras) {
      aviso.hidden = false;
      const g = grupos[0];
      aviso.textContent = `${e.abierto ? 'Ya no alcanzamos a preparar pedidos para hoy.' : 'Ahora estamos cerrados.'} Puedes programar tu pedido para ${g.etiqueta.toLowerCase()} desde las ${hora12(g.slots[0])}`;
    } else aviso.hidden = true;
  }

  function openCart() { renderLines(); renderSlots(); cartSheet.open(); }
  $$('[data-open-cart]').forEach(b => b.addEventListener('click', openCart));
  cartDlg.addEventListener('click', e => {
    if (e.target.closest('[data-to-menu]')) { e.preventDefault(); cartSheet.onClosed = () => { cartSheet.onClosed = null; $('#menu')?.scrollIntoView({ behavior: reduce.matches ? 'auto' : 'smooth' }); }; cartSheet.close(); }
  });

  /* ------------------------------------------------------- enviar pedido */
  const form = $('[data-order-form]', cartDlg);
  const nameIn = $('#nombre-cliente');
  try { nameIn.value = localStorage.getItem(KEY + '-nombre') || ''; } catch (e) { /* nada */ }
  function fieldError(input, msg) {
    const err = $('#' + input.getAttribute('aria-describedby'));
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    err.hidden = !msg; err.textContent = msg || '';
  }
  [nameIn, $('#hora-recogida')].forEach(i => i.addEventListener('input', () => fieldError(i, '')));

  function mensaje(nombre, slotValue) {
    const [dia, m] = slotValue.split('|');
    const lines = cart.map(l => {
      const p = byId.get(l.id);
      return `• ${l.qty} × ${p.nombre}: ${money(p.precio * l.qty)}` + (l.nota ? `\n   Nota: ${l.nota}` : '');
    });
    return [
      `Hola, quiero hacer un *pedido para llevar* en ${C.nombre}.`,
      '',
      ...lines,
      '',
      `*Total: ${money(total())}*`,
      `Nombre: ${nombre}`,
      `Recojo: ${dia} a las ${hora12(+m)}`,
    ].join('\n');
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    const nombre = nameIn.value.replace(/\s+/g, ' ').trim();
    const sel = $('#hora-recogida');
    let bad = null;
    if (!cart.length) { announce('Tu pedido está vacío.'); return; }
    if (!sel.value) { fieldError(sel, 'Escoge la hora a la que pasas a recoger.'); bad = sel; }
    if (!nombre) { fieldError(nameIn, 'Escribe el nombre con el que recoges el pedido.'); bad = nameIn; }
    if (bad) { bad.focus(); return; }
    try { localStorage.setItem(KEY + '-nombre', nombre); } catch (err) { /* nada */ }
    const url = `https://wa.me/${C.whatsapp}?text=${encodeURIComponent(mensaje(nombre, sel.value))}`;
    $('[data-sent-note]', cartDlg).hidden = false;
    window.open(url, '_blank', 'noopener') || (location.href = url);
  });

  /* ------------------------------------------------------------ varios */
  const live = $('#avisos');
  function announce(t) { if (!live) return; live.textContent = ''; setTimeout(() => { live.textContent = t; }, 30); }

  // Enlaces simples de WhatsApp (sin pedido) con un saludo listo
  $$('[data-wa]').forEach(a => { a.href = `https://wa.me/${C.whatsapp}?text=${encodeURIComponent(a.dataset.wa)}`; });

  const chips = () => $$('.chip');

  // Platos de la portada: nombre accesible y precio desde la configuración
  $$('.oplate').forEach(b => {
    const p = byId.get(b.dataset.id); if (!p) { b.hidden = true; return; }
    b.setAttribute('aria-label', `Agregar ${p.nombre}, ${money(p.precio)}`);
    b.setAttribute('aria-haspopup', 'dialog');
    const t = $('[data-oplate-precio]', b); if (t) t.textContent = money(p.precio);
  });

  /* ------------------------------------------------------------ inicio */
  renderMenu();
  renderHorario();
  pintarEstado();
  syncCart();
  // Chips de categoría: marcar la que está en pantalla (se crean en renderMenu)
  if ('IntersectionObserver' in window) {
    const io2 = new IntersectionObserver(es => {
      es.forEach(en => { if (en.isIntersecting) chips().forEach(c => c.classList.toggle('is-on', c.getAttribute('href') === '#' + en.target.id)); });
    }, { rootMargin: '-40% 0px -55% 0px' });
    $$('.menu-group').forEach(g => io2.observe(g));
  }
  setInterval(() => { pintarEstado(); if (cartDlg.open) renderSlots(); }, 20000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) pintarEstado(); });
})();
