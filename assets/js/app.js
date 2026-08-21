/* TiendaDeportivaSV — interacciones mínimas, sin librerías. */
(function () {
  'use strict';

  /* ------------------------------------------------------------------
     RESEÑAS REALES
     Vacío a propósito: no se publican testimonios inventados.
     Cuando tengas reseñas verificadas de clientes, agrégalas así:

       { nombre: 'Juan P.', ciudad: 'Villavicencio', texto: 'Excelente...' }

     Se renderizan solas y el bloque de invitación se oculta.
  ------------------------------------------------------------------ */
  var REVIEWS = [];

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- Loader: rápido (0.5s mín. – 1.1s máx.) ---------- */
  (function loader() {
    var el = document.getElementById('loader');
    if (!el) return;
    var start = Date.now();
    var done = false;
    var hide = function () {
      if (done) return;
      done = true;
      el.classList.add('is-done');
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 400);
    };
    var finish = function () { setTimeout(hide, Math.max(0, 500 - (Date.now() - start))); };
    if (document.readyState === 'complete') finish();
    else window.addEventListener('load', finish, { once: true });
    setTimeout(hide, 1100); // tope duro
  })();

  document.addEventListener('DOMContentLoaded', function () {

    /* ---------- Año del footer ---------- */
    var yr = document.getElementById('yr');
    if (yr) yr.textContent = new Date().getFullYear();

    /* ---------- Header: borde al hacer scroll ---------- */
    var hdr = document.getElementById('hdr');
    var ticking = false;
    var onScroll = function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        hdr.classList.toggle('is-stuck', window.scrollY > 8);
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* ---------- Menú móvil ---------- */
    var burger = document.getElementById('burger');
    var nav = document.getElementById('nav');
    var scrim = document.getElementById('scrim');

    function setMenu(open) {
      nav.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
      scrim.hidden = !open;
      document.body.style.overflow = open ? 'hidden' : '';
    }
    burger.addEventListener('click', function () {
      setMenu(burger.getAttribute('aria-expanded') !== 'true');
    });
    scrim.addEventListener('click', function () { setMenu(false); });
    $$('#nav a').forEach(function (a) {
      a.addEventListener('click', function () { setMenu(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) { setMenu(false); burger.focus(); }
    });
    // Al pasar a escritorio, deja el menú en estado neutro
    var mq = window.matchMedia('(min-width:1024px)');
    (mq.addEventListener ? mq.addEventListener.bind(mq, 'change') : mq.addListener.bind(mq))(function () {
      if (mq.matches) setMenu(false);
    });

    /* ---------- Filtros de catálogo ---------- */
    var chips = $$('.chip');
    var cards = $$('#grid .card');
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        var f = chip.dataset.filter;
        chips.forEach(function (c) { c.classList.toggle('is-on', c === chip); });
        cards.forEach(function (card) {
          card.classList.toggle('is-hidden', f !== 'all' && card.dataset.cat !== f);
        });
      });
    });

    /* ---------- Reseñas ---------- */
    var box = document.getElementById('reviews');
    var empty = document.getElementById('reviews-empty');
    if (box && REVIEWS.length) {
      box.innerHTML = REVIEWS.map(function (r) {
        var esc = function (t) { return String(t).replace(/[&<>"]/g, function (m) {
          return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m];
        }); };
        return '<blockquote class="rev reveal"><p>' + esc(r.texto) + '</p>' +
               '<footer>' + esc(r.nombre) + (r.ciudad ? ' · ' + esc(r.ciudad) : '') + '</footer></blockquote>';
      }).join('');
      box.hidden = false;
      if (empty) empty.remove();
    }

    /* ---------- Reveal al entrar en pantalla ---------- */
    var els = $$('.reveal');
    if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion:reduce)').matches) {
      els.forEach(function (el) { el.classList.add('is-in'); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
      els.forEach(function (el) { io.observe(el); });
    }

    /* ---------- Enlace activo en la navegación ---------- */
    var links = $$('#nav a[href^="#"]');
    var targets = links.map(function (a) { return document.querySelector(a.getAttribute('href')); });
    if ('IntersectionObserver' in window) {
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          var i = targets.indexOf(e.target);
          if (i < 0) return;
          links.forEach(function (l, j) { l.classList.toggle('is-active', i === j); });
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      targets.forEach(function (t) { if (t) spy.observe(t); });
    }

    /* ---------- Un solo video reproduciéndose a la vez ---------- */
    var vids = $$('.clip video');
    vids.forEach(function (v) {
      v.addEventListener('play', function () {
        vids.forEach(function (o) { if (o !== v) o.pause(); });
      });
    });
  });
})();
