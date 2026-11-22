// Copia el menú y el horario de js/config.js dentro de index.html,
// para que se vean sin JavaScript y Google los lea. Uso: node tools/render.mjs
import fs from 'node:fs';
import vm from 'node:vm';
const root = new URL('..', import.meta.url);
const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(new URL('js/config.js', root), 'utf8'), ctx);
const C = ctx.window.RINCONCITO;
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const money = n => C.moneda + fmt.format(n);
const card = p => `<li class="dish" data-id="${p.id}"><div class="dish__btn"><span class="dish__img"><img src="img/menu/${p.foto}.webp" alt="" width="188" height="188" loading="lazy" decoding="async"></span><span class="dish__body"><span class="dish__name">${esc(p.nombre)}</span>${p.descripcion ? `<span class="dish__desc">${esc(p.descripcion)}</span>` : ''}<span class="dish__foot"><span class="dish__price">${money(p.precio)}</span></span></span></div></li>`;
const menu = C.categorias.map(cat => `<section class="menu-group" id="cat-${cat.id}" aria-labelledby="cat-${cat.id}-h"><h3 class="menu-group__h" id="cat-${cat.id}-h">${esc(cat.nombre)} <span class="menu-group__n">${cat.platillos.length} platillos</span></h3><ul class="dishes">${cat.platillos.map(card).join('')}</ul></section>`).join('\n');
const chips = C.categorias.map(cat => `<a class="chip" href="#cat-${cat.id}">${esc(cat.nombre)}</a>`).join('');
const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const h12 = s => { let [h, m] = s.split(':').map(Number); const suf = h < 12 ? 'a.\u00a0m.' : 'p.\u00a0m.'; h = h % 12 || 12; return `${h}:${String(m).padStart(2, '0')}\u00a0${suf}`; };
const horario = [1, 2, 3, 4, 5, 6, 0].map(d => { const t = (C.horario[d] || []); const txt = t.length ? t.map(([a, b]) => `${h12(a)} a ${h12(b)}`).join(' y ') : 'Cerrado'; return `<div class="hrow" data-dia="${d}"><dt>${DIAS[d][0].toUpperCase() + DIAS[d].slice(1)}</dt><dd>${txt}</dd></div>`; }).join('');
const file = new URL('index.html', root);
let html = fs.readFileSync(file, 'utf8');
const put = (name, body) => { html = html.replace(new RegExp(`<!--${name}:start-->[\\s\\S]*?<!--${name}:end-->`), `<!--${name}:start-->${body}<!--${name}:end-->`); };
put('menu', menu); put('chips', chips); put('horario', horario);
fs.writeFileSync(file, html);
console.log(`listo: ${C.categorias.reduce((s, c) => s + c.platillos.length, 0)} platillos en ${C.categorias.length} categorías`);
