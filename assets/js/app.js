/* TiendaDeportivaSV — interacciones mínimas, sin librerías. */
(function () {
  'use strict';

  var WA = 'https://wa.me/573146430972?text=';

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
  var esc = function (t) {
    return String(t).replace(/[&<>"]/g, function (m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m];
    });
  };

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
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 350);
    };
    var finish = function () { setTimeout(hide, Math.max(0, 500 - (Date.now() - start))); };
    if (document.readyState === 'complete') finish();
    else window.addEventListener('load', finish, { once: true });
    setTimeout(hide, 1100); // tope duro
  })();

  document.addEventListener('DOMContentLoaded', function () {

    /* ---------- Año del pie ---------- */
    $$('.yr').forEach(function (el) { el.textContent = new Date().getFullYear(); });

    /* ---------- Barra: sombra al hacer scroll ---------- */
    var topbar = document.getElementById('topbar');
    if (topbar) {
      var ticking = false;
      var onScroll = function () {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function () {
          topbar.classList.toggle('is-stuck', window.scrollY > 8);
          ticking = false;
        });
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }

    /* ---------- Menú móvil ---------- */
    var burger = document.getElementById('burger');
    var nav = document.getElementById('nav');
    var scrim = document.getElementById('scrim');

    if (burger && nav && scrim) {
      var setMenu = function (open) {
        nav.classList.toggle('is-open', open);
        burger.setAttribute('aria-expanded', String(open));
        burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
        scrim.hidden = !open;
        document.body.style.overflow = open ? 'hidden' : '';
      };
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
      var mq = window.matchMedia('(min-width:1120px)');
      var onMq = function () { if (mq.matches) setMenu(false); };
      if (mq.addEventListener) mq.addEventListener('change', onMq); else mq.addListener(onMq);
    }

    /* ---------- Grillas de equipos (bajo pedido) ---------- */
    var EQ = window.SV_EQUIPOS || {};
    var PROD = window.SV_PRODUCTOS || [];

    var ESTADOS = {
      ok:     { txt: 'Disponible', cls: 'ok' },
      pedido: { txt: 'Bajo pedido', cls: 'pedido' },
      ask:    { txt: 'Consultar disponibilidad', cls: 'ask' }
    };

    function modelosDe(e) {
      return e.id ? PROD.filter(function (p) { return p.eq === e.id; }) : [];
    }

    // Tarjeta de equipo: botón que despliega el panel del equipo
    function tarjetaEquipo(e, i) {
      var n = modelosDe(e).length;
      return '<button type="button" class="tcard reveal" data-eq="' + i + '"' +
             ' style="--c1:' + e.c[0] + ';--c2:' + e.c[1] + ';--c3:' + e.c[2] + '"' +
             ' aria-expanded="false">' +
             '<span class="tcard-mark" aria-hidden="true">' + esc(e.s) + '</span>' +
             '<b>' + esc(e.n) + '</b>' +
             '<i>' + (n ? n + (n === 1 ? ' modelo' : ' modelos') : 'Bajo pedido') + '</i>' +
             '<span class="tcard-go" aria-hidden="true">+</span></button>';
    }

    function tarjetaModelo(p) {
      var est = ESTADOS[p.estado] || ESTADOS.ask;
      var enlace = WA + encodeURIComponent(
        'Hola, estoy interesado en: ' + p.tt + '. ¿Está disponible?'
      );
      return '<article class="mcard">' +
        '<a class="mcard-media" href="' + enlace + '" target="_blank" rel="noopener" tabindex="-1" aria-hidden="true">' +
          '<picture>' +
            '<source type="image/avif" srcset="assets/img/' + p.img + '-340.avif 340w, assets/img/' + p.img + '-600.avif 600w" sizes="(min-width:900px) 220px, 44vw">' +
            '<source type="image/webp" srcset="assets/img/' + p.img + '-340.webp 340w, assets/img/' + p.img + '-600.webp 600w" sizes="(min-width:900px) 220px, 44vw">' +
            '<img src="assets/img/' + p.img + '-340.webp" width="' + p.w + '" height="' + p.h + '" loading="lazy" decoding="async" alt="' + esc(p.alt) + '">' +
          '</picture></a>' +
        '<div class="mcard-bd">' +
          '<h4>' + esc(p.tt) + '</h4>' +
          '<p class="mcard-meta">' + esc(p.meta) + '</p>' +
          '<p class="mcard-estado ' + est.cls + '">' + est.txt + '</p>' +
          '<a class="btn btn-dark btn-sm btn-block" href="' + enlace + '" target="_blank" rel="noopener">PEDIR</a>' +
        '</div></article>';
    }

    // Panel que se despliega debajo de la fila del equipo escogido
    function panelEquipo(e) {
      var modelos = modelosDe(e);
      var pedirGenerico = WA + encodeURIComponent(
        'Hola, quiero una camiseta de ' + e.n + '. ¿Qué temporadas pueden conseguir?'
      );

      var publicados = modelos.length
        ? '<p class="panel-sub">Publicadas de ' + esc(e.n) + '</p>' +
          '<div class="mgrid">' + modelos.map(tarjetaModelo).join('') + '</div>'
        : '<p class="panel-sub">Todavía no tenemos fotos publicadas de ' + esc(e.n) + '. ' +
          'Dinos qué temporada buscas y te confirmamos si la conseguimos.</p>';

      return '<div class="tpanel" role="region" aria-label="Camisetas de ' + esc(e.n) + '">' +
        '<div class="tpanel-in">' +
          '<div class="tpanel-hd">' +
            '<span class="tpanel-mark" style="--c1:' + e.c[0] + ';--c2:' + e.c[1] + ';--c3:' + e.c[2] + '" aria-hidden="true">' + esc(e.s) + '</span>' +
            '<div class="tpanel-tt">' +
              '<p class="kicker">BAJO PEDIDO</p>' +
              '<h3>' + esc(e.n) + '</h3>' +
            '</div>' +
            '<button type="button" class="tpanel-close" aria-label="Cerrar ' + esc(e.n) + '">Cerrar</button>' +
          '</div>' +
          publicados +
          '<form class="panel-form" data-equipo="' + esc(e.n) + '">' +
            '<label for="temp-' + esc(e.s) + '">¿Qué temporada buscas?</label>' +
            '<div class="panel-form-row">' +
              '<input id="temp-' + esc(e.s) + '" type="text" name="temporada" placeholder="Ej: 1998/99, local, manga larga" autocomplete="off">' +
              '<button class="btn btn-wa" type="submit">PEDIR POR WHATSAPP</button>' +
            '</div>' +
          '</form>' +
          '<a class="panel-alt" href="' + pedirGenerico + '" target="_blank" rel="noopener">O escríbenos sin especificar temporada →</a>' +
        '</div></div>';
    }

    // Cuántas columnas tiene la grilla ahora mismo
    function columnas(grid) {
      var t = getComputedStyle(grid).gridTemplateColumns;
      return t ? t.split(' ').filter(Boolean).length : 1;
    }

    function montarGrilla(box, lista) {
      box.innerHTML = lista.map(tarjetaEquipo).join('');
      var tarjetas = $$('.tcard', box);
      var abierto = null; // { panel, boton }

      function cerrar() {
        if (!abierto) return;
        var p = abierto.panel;
        abierto.boton.setAttribute('aria-expanded', 'false');
        abierto.boton.classList.remove('is-open');
        p.classList.remove('is-open');
        setTimeout(function () { if (p.parentNode) p.parentNode.removeChild(p); }, 260);
        abierto = null;
      }

      function abrir(boton, i) {
        var yaEstaba = abierto && abierto.boton === boton;
        cerrar();
        if (yaEstaba) return;

        var panel = document.createElement('div');
        panel.className = 'tpanel-slot';
        panel.innerHTML = panelEquipo(lista[i]);

        // Inserta el panel al final de la fila donde está la tarjeta,
        // para que se despliegue debajo sin partir la cuadrícula.
        var cols = columnas(box);
        var finFila = Math.min(Math.floor(i / cols) * cols + cols - 1, tarjetas.length - 1);
        box.insertBefore(panel, tarjetas[finFila].nextSibling);

        boton.setAttribute('aria-expanded', 'true');
        boton.classList.add('is-open');
        abierto = { panel: panel, boton: boton };

        // Fuerza el reflow para que la transición arranque desde 0fr.
        // (No usamos requestAnimationFrame: no se dispara en pestañas ocultas.)
        void panel.offsetHeight;
        panel.classList.add('is-open');

        $('.tpanel-close', panel).addEventListener('click', function () {
          cerrar();
          boton.focus();
        });

        var form = $('.panel-form', panel);
        form.addEventListener('submit', function (ev) {
          ev.preventDefault();
          var temporada = $('input', form).value.trim();
          var msg = 'Hola, quiero una camiseta de ' + form.dataset.equipo + '.'
                  + (temporada ? ' Busco esta temporada o versión: ' + temporada + '.'
                               : ' ¿Qué temporadas pueden conseguir?');
          window.open(WA + encodeURIComponent(msg), '_blank', 'noopener');
        });
      }

      tarjetas.forEach(function (t, i) {
        t.addEventListener('click', function () { abrir(t, i); });
      });

      box.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && abierto) {
          var b = abierto.boton;
          cerrar();
          b.focus();
        }
      });

      // Si cambia el número de columnas, el panel quedaría mal ubicado
      window.addEventListener('resize', function () {
        if (abierto && columnas(box) !== cols0) cerrar();
      }, { passive: true });
      var cols0 = columnas(box);
    }

    $$('[data-equipos]').forEach(function (box) {
      var lista = EQ[box.dataset.equipos] || [];
      var tope = parseInt(box.dataset.limite, 10);
      if (tope > 0) lista = lista.slice(0, tope);
      montarGrilla(box, lista);
    });

    // Adelanto de la portada: selecciones y clubes más pedidos
    var home = document.getElementById('tgrid-home');
    if (home && EQ.selecciones) {
      montarGrilla(home, EQ.selecciones.slice(0, 6).concat(EQ.clubes.slice(0, 6)));
    }

    /* ---------- Catálogo: filtros y búsqueda ---------- */
    var cards = $$('[data-cat]');

    function aplicar(filtro, texto) {
      var q = (texto || '').trim().toLowerCase();
      var visibles = 0;
      cards.forEach(function (card) {
        var okCat = filtro === 'all' || card.dataset.cat === filtro;
        var okTxt = !q || (card.dataset.buscar || '').toLowerCase().indexOf(q) !== -1;
        var ver = okCat && okTxt;
        card.classList.toggle('is-hidden', !ver);
        if (ver) visibles++;
      });
      // Oculta los grupos que se quedaron sin tarjetas visibles
      $$('.group').forEach(function (g) {
        var quedan = $$('[data-cat]:not(.is-hidden)', g).length;
        g.hidden = quedan === 0;
      });
      var vacio = document.getElementById('sin-resultados');
      if (vacio) {
        vacio.hidden = visibles > 0;
        var eco = document.getElementById('eco-busqueda');
        if (eco) eco.textContent = q;
        var waVacio = document.getElementById('wa-sin-resultados');
        if (waVacio) {
          waVacio.href = WA + encodeURIComponent(
            q ? 'Hola, busco esta referencia: ' + texto + '. ¿La pueden conseguir?'
              : 'Hola, busco una referencia. ¿Me ayudan?'
          );
        }
      }
      var cuenta = document.getElementById('cuenta-resultados');
      if (cuenta) cuenta.textContent = visibles + (visibles === 1 ? ' modelo' : ' modelos');
      return visibles;
    }

    if (cards.length) {
      var chips = $$('.chip');
      var buscador = document.getElementById('filtro-texto');
      var filtroActual = 'all';

      chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
          filtroActual = chip.dataset.filter;
          chips.forEach(function (c) { c.classList.toggle('is-on', c === chip); });
          aplicar(filtroActual, buscador ? buscador.value : '');
        });
      });

      if (buscador) {
        var t;
        buscador.addEventListener('input', function () {
          clearTimeout(t);
          t = setTimeout(function () { aplicar(filtroActual, buscador.value); }, 160);
        });
        // Búsqueda que llega desde la barra superior: catalogo.html?q=...
        var q = new URLSearchParams(location.search).get('q');
        if (q) {
          buscador.value = q;
          aplicar(filtroActual, q);
        } else {
          aplicar(filtroActual, '');
        }
      } else {
        aplicar(filtroActual, '');
      }
    }

    /* ---------- Rastrear pedido -> WhatsApp ---------- */
    var formRastreo = document.getElementById('form-rastreo');
    if (formRastreo) {
      formRastreo.addEventListener('submit', function (e) {
        e.preventDefault();
        var pedido = $('#pedido', formRastreo).value.trim();
        var nombre = $('#nombre', formRastreo).value.trim();
        var msg = 'Hola, quiero saber el estado de mi pedido.'
                + (pedido ? ' Número o referencia: ' + pedido + '.' : '')
                + (nombre ? ' Está a nombre de ' + nombre + '.' : '');
        window.open(WA + encodeURIComponent(msg), '_blank', 'noopener');
      });
    }

    /* ---------- Reseñas ---------- */
    var box = document.getElementById('reviews');
    var vacioRev = document.getElementById('reviews-empty');
    if (box && REVIEWS.length) {
      box.innerHTML = REVIEWS.map(function (r) {
        return '<blockquote class="rev reveal"><p>' + esc(r.texto) + '</p>' +
               '<footer>' + esc(r.nombre) + (r.ciudad ? ' · ' + esc(r.ciudad) : '') + '</footer></blockquote>';
      }).join('');
      box.hidden = false;
      if (vacioRev) vacioRev.remove();
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
      }, { rootMargin: '0px 0px -6% 0px', threshold: 0.04 });
      els.forEach(function (el) { io.observe(el); });
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
