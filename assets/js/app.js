/* TiendaDeportivaSV — interacciones mínimas, sin librerías. */
(function () {
  'use strict';

  var WA = 'https://wa.me/573146430972?text=';
  var PASO = 24;          // productos que se muestran de golpe en el catálogo
  var IMG = 'assets/catalogo/';

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
  var sinTildes = function (t) {
    return String(t).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
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

    var CAT = window.SV_CATALOGO || { equipos: [], productos: [] };
    var PORID = {};
    CAT.equipos.forEach(function (e) { PORID[e.id] = e; });

    /* ---------- Año del pie ---------- */
    $$('.yr').forEach(function (el) { el.textContent = new Date().getFullYear(); });

    /* ---------- Cifras reales del catálogo ---------- */
    $$('[data-cuenta]').forEach(function (el) {
      var q = el.dataset.cuenta;
      el.textContent = q === 'equipos' ? CAT.equipos.length
        : q === 'retro' ? CAT.productos.filter(function (p) { return p.cat === 'retro'; }).length
        : q === 'shorts' ? CAT.productos.filter(function (p) { return p.cat === 'shorts'; }).length
        : CAT.productos.length;
    });

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

    /* ================= PRODUCTOS ================= */

    // "Japón 1998 · Arquero" — la variante va en el título para que dos
    // modelos de la misma temporada no se vean iguales en el listado.
    function nombre(p) {
      var e = PORID[p.eq];
      var base = [e ? e.n : '', p.t].filter(Boolean).join(' ');
      return p.v && p.v !== 'Retro' ? base + ' · ' + p.v : base;
    }
    function detalle(p) {
      var e = PORID[p.eq];
      var tipo = p.cat === 'shorts' ? 'Pantaloneta'
        : (e && e.tipo === 'seleccion') ? 'Selección' : 'Club';
      return tipo + ' · ' + (p.cat === 'shorts' ? 'Versión jugador' : 'Retro');
    }
    function alt(p, cara) {
      var e = PORID[p.eq];
      var prenda = p.cat === 'shorts' ? 'Pantaloneta de fútbol' : 'Camiseta de fútbol';
      return prenda + ' de ' + (e ? e.n : '') + (p.t ? ' temporada ' + p.t : '') +
             (p.v ? ' ' + p.v : '') + (cara === 2 ? ', vista por detrás' : '');
    }
    function enlace(p) {
      return WA + encodeURIComponent('Hola, estoy interesado en: ' + p.n + '. ¿Está disponible?');
    }
    function foto(p, cara, clase, sizes) {
      var b = IMG + p.img + '-' + cara;
      return '<picture>' +
        '<source type="image/avif" srcset="' + b + '-340.avif 340w, ' + b + '-600.avif 600w" sizes="' + sizes + '">' +
        '<source type="image/webp" srcset="' + b + '-340.webp 340w, ' + b + '-600.webp 600w" sizes="' + sizes + '">' +
        '<img class="' + clase + '" src="' + b + '-340.webp" width="600" height="800" loading="lazy" decoding="async" alt="' + esc(alt(p, cara)) + '">' +
        '</picture>';
    }

    // Tarjeta grande (catálogo)
    function tarjetaProducto(p) {
      var url = enlace(p);
      var sizes = '(min-width:1000px) 290px, (min-width:640px) 30vw, 45vw';
      return '<article class="pcard reveal">' +
        '<a class="pcard-media" href="' + url + '" target="_blank" rel="noopener" tabindex="-1" aria-hidden="true">' +
          foto(p, 1, 'im-a', sizes) +
          (p.f > 1 ? foto(p, 2, 'im-b', sizes) : '') +
        '</a>' +
        '<div class="pcard-bd">' +
          '<h3 class="pcard-tt">' + esc(nombre(p)) + '</h3>' +
          '<p class="pcard-meta">' + esc(detalle(p)) + '</p>' +
          '<p class="pcard-price">Consultar precio</p>' +
          '<a class="btn btn-dark btn-sm btn-block" href="' + url + '" target="_blank" rel="noopener">PEDIR</a>' +
        '</div></article>';
    }

    // Tarjeta pequeña (dentro del panel de un equipo)
    function tarjetaModelo(p) {
      var url = enlace(p);
      var sizes = '(min-width:900px) 200px, 44vw';
      return '<article class="mcard">' +
        '<a class="mcard-media" href="' + url + '" target="_blank" rel="noopener" tabindex="-1" aria-hidden="true">' +
          foto(p, 1, 'im-a', sizes) +
        '</a>' +
        '<div class="mcard-bd">' +
          '<h4>' + esc([p.t, p.v && p.v !== 'Retro' ? p.v : ''].filter(Boolean).join(' · ') || 'Retro') + '</h4>' +
          '<p class="mcard-meta">' + esc(detalle(p)) + '</p>' +
          '<p class="mcard-estado ask">Consultar disponibilidad</p>' +
          '<a class="btn btn-dark btn-sm btn-block" href="' + url + '" target="_blank" rel="noopener">PEDIR</a>' +
        '</div></article>';
    }

    /* ================= GRILLAS DE EQUIPOS ================= */

    function modelosDe(e) {
      return CAT.productos.filter(function (p) { return p.eq === e.id; });
    }

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

    function panelEquipo(e) {
      var modelos = modelosDe(e);
      var pedirGenerico = WA + encodeURIComponent(
        'Hola, quiero una camiseta de ' + e.n + '. ¿Qué temporadas pueden conseguir?'
      );

      var publicados = modelos.length
        ? '<p class="panel-sub">' + modelos.length + (modelos.length === 1 ? ' modelo publicado' : ' modelos publicados') +
          ' de ' + esc(e.n) + '. ¿Buscas otra temporada? Pídela abajo.</p>' +
          '<div class="mgrid">' + modelos.map(tarjetaModelo).join('') + '</div>'
        : '<p class="panel-sub">Todavía no tenemos fotos publicadas de ' + esc(e.n) + '. ' +
          'Dinos qué temporada buscas y te confirmamos si la conseguimos.</p>';

      return '<div class="tpanel" role="region" aria-label="Camisetas de ' + esc(e.n) + '">' +
        '<div class="tpanel-in">' +
          '<div class="tpanel-hd">' +
            '<span class="tpanel-mark" style="--c1:' + e.c[0] + ';--c2:' + e.c[1] + ';--c3:' + e.c[2] + '" aria-hidden="true">' + esc(e.s) + '</span>' +
            '<div class="tpanel-tt">' +
              '<p class="kicker">' + (e.tipo === 'seleccion' ? 'SELECCIÓN' : 'CLUB') + '</p>' +
              '<h3>' + esc(e.n) + '</h3>' +
            '</div>' +
            '<button type="button" class="tpanel-close" aria-label="Cerrar ' + esc(e.n) + '">Cerrar</button>' +
          '</div>' +
          publicados +
          '<form class="panel-form" data-equipo="' + esc(e.n) + '">' +
            '<label for="temp-' + esc(e.id) + '">¿Buscas otra temporada?</label>' +
            '<div class="panel-form-row">' +
              '<input id="temp-' + esc(e.id) + '" type="text" name="temporada" placeholder="Ej: 1998/99, visitante, manga larga" autocomplete="off">' +
              '<button class="btn btn-wa" type="submit">PEDIR POR WHATSAPP</button>' +
            '</div>' +
          '</form>' +
          '<div class="panel-pie">' +
            (modelos.length > 4
              ? '<a class="link-more" href="catalogo.html?eq=' + e.id + '">Ver los ' + modelos.length + ' de ' + esc(e.n) + ' →</a>'
              : '') +
            '<a class="panel-alt" href="' + pedirGenerico + '" target="_blank" rel="noopener">O escríbenos sin especificar temporada →</a>' +
          '</div>' +
        '</div></div>';
    }

    function columnas(grid) {
      var t = getComputedStyle(grid).gridTemplateColumns;
      return t ? t.split(' ').filter(Boolean).length : 1;
    }

    function montarGrilla(box, lista) {
      box.innerHTML = lista.map(tarjetaEquipo).join('');
      var tarjetas = $$('.tcard', box);
      var abierto = null;
      var cols0 = columnas(box);

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

      window.addEventListener('resize', function () {
        if (abierto && columnas(box) !== cols0) cerrar();
      }, { passive: true });
    }

    $$('[data-equipos]').forEach(function (box) {
      var tipo = box.dataset.equipos;
      var lista = CAT.equipos.filter(function (e) {
        return tipo === 'todos' || e.tipo === tipo;
      });
      var tope = parseInt(box.dataset.limite, 10);
      if (tope > 0) {
        lista = lista.slice().sort(function (a, b) { return modelosDe(b).length - modelosDe(a).length; }).slice(0, tope);
        lista.sort(function (a, b) { return a.n.localeCompare(b.n, 'es'); });
      }
      montarGrilla(box, lista);
    });

    /* ================= CATÁLOGO ================= */
    var rejilla = document.getElementById('catalogo-grid');
    if (rejilla) {
      var buscador = document.getElementById('filtro-texto');
      var selEquipo = document.getElementById('filtro-equipo');
      var btnMas = document.getElementById('ver-mas');
      var cuenta = document.getElementById('cuenta-resultados');
      var vacio = document.getElementById('sin-resultados');
      var chips = $$('.chip');
      var filtro = 'all';
      var visibles = PASO;
      var resultado = [];

      // El selector de equipos se llena desde el catálogo
      if (selEquipo) {
        var grupos = [['seleccion', 'Selecciones'], ['club', 'Clubes']];
        selEquipo.innerHTML = '<option value="">Todos los equipos</option>' +
          grupos.map(function (g) {
            var ops = CAT.equipos.filter(function (e) { return e.tipo === g[0]; })
              .map(function (e) {
                return '<option value="' + e.id + '">' + esc(e.n) + ' (' + modelosDe(e).length + ')</option>';
              }).join('');
            return '<optgroup label="' + g[1] + '">' + ops + '</optgroup>';
          }).join('');
      }

      function calcular() {
        var q = sinTildes(buscador ? buscador.value.trim() : '');
        var eqId = selEquipo ? selEquipo.value : '';
        resultado = CAT.productos.filter(function (p) {
          if (filtro !== 'all' && p.cat !== filtro) return false;
          if (eqId && p.eq !== eqId) return false;
          if (q) {
            var e = PORID[p.eq];
            var texto = sinTildes(p.n + ' ' + (e ? e.n + ' ' + e.tipo : '') + ' ' + p.cat + ' ' + p.v);
            if (texto.indexOf(q) === -1) return false;
          }
          return true;
        });
      }

      function pintar() {
        var trozo = resultado.slice(0, visibles);
        rejilla.innerHTML = trozo.map(tarjetaProducto).join('');
        $$('.reveal', rejilla).forEach(function (el) { el.classList.add('is-in'); });

        if (cuenta) {
          cuenta.textContent = resultado.length +
            (resultado.length === 1 ? ' modelo' : ' modelos') +
            (resultado.length > trozo.length ? ' · mostrando ' + trozo.length : '');
        }
        if (btnMas) {
          btnMas.hidden = resultado.length <= visibles;
          btnMas.textContent = 'VER MÁS (' + Math.min(PASO, resultado.length - visibles) + ')';
        }
        if (vacio) {
          vacio.hidden = resultado.length > 0;
          var q = buscador ? buscador.value.trim() : '';
          var eco = document.getElementById('eco-busqueda');
          if (eco) eco.textContent = q || 'esa combinación';
          var waVacio = document.getElementById('wa-sin-resultados');
          if (waVacio) {
            waVacio.href = WA + encodeURIComponent(
              q ? 'Hola, busco esta referencia: ' + q + '. ¿La pueden conseguir?'
                : 'Hola, busco una referencia. ¿Me ayudan?'
            );
          }
        }
      }

      function refrescar(reiniciar) {
        if (reiniciar !== false) visibles = PASO;
        calcular();
        pintar();
      }

      chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
          filtro = chip.dataset.filter;
          chips.forEach(function (c) { c.classList.toggle('is-on', c === chip); });
          refrescar();
        });
      });

      if (selEquipo) selEquipo.addEventListener('change', function () { refrescar(); });

      if (buscador) {
        var t;
        buscador.addEventListener('input', function () {
          clearTimeout(t);
          t = setTimeout(function () { refrescar(); }, 160);
        });
      }

      if (btnMas) {
        btnMas.addEventListener('click', function () {
          visibles += PASO;
          pintar();
        });
      }

      // Búsqueda o equipo que llegan por la URL: catalogo.html?q=…&eq=…
      var params = new URLSearchParams(location.search);
      if (params.get('q') && buscador) buscador.value = params.get('q');
      if (params.get('eq') && selEquipo) selEquipo.value = params.get('eq');
      refrescar();
    }

    /* ---------- Rastrear pedido -> WhatsApp ---------- */
    var formRastreo = document.getElementById('form-rastreo');
    if (formRastreo) {
      formRastreo.addEventListener('submit', function (e) {
        e.preventDefault();
        var pedido = $('#pedido', formRastreo).value.trim();
        var nom = $('#nombre', formRastreo).value.trim();
        var msg = 'Hola, quiero saber el estado de mi pedido.'
                + (pedido ? ' Número o referencia: ' + pedido + '.' : '')
                + (nom ? ' Está a nombre de ' + nom + '.' : '');
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
