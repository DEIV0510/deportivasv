/* Genera catalogo.html, bajo-pedido.html, tallas.html y rastrear.html
   reutilizando el encabezado, la cinta y el pie de index.html, para que
   las cinco páginas no se desincronicen nunca.

   Uso:  node build-pages.js
   (index.html se edita a mano; es la fuente del encabezado y del pie)
*/
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const raiz = __dirname;
const index = fs.readFileSync(path.join(raiz, 'index.html'), 'utf8');

function entre(txt, desde, hasta, etiqueta) {
  const a = txt.indexOf(desde);
  const b = txt.indexOf(hasta, a);
  if (a < 0 || b < 0) throw new Error('No se pudo extraer ' + etiqueta + ' de index.html');
  return txt.slice(a, b + hasta.length);
}

const LOADER   = entre(index, '<div id="loader"', '</div>\n</div>', 'el loader');
const CABEZA   = entre(index, '<a class="skip"', '</div>\n</div>\n', 'el encabezado + cinta');
const PIE      = entre(index, '<!-- ===== PIE ===== -->', '</a>\n\n<script', 'el pie').replace(/\n\n<script$/, '');
const CRITICO  = entre(index, '<!-- CSS crítico', '</style>', 'el CSS crítico');

const WA = 'https://wa.me/573146430972?text=';
const wa = (t) => WA + encodeURIComponent(t);

/* ---------------- Plantilla común ----------------
   `base` antepone '../' a las rutas cuando la página vive en una subcarpeta
   (las fichas de producto están en p/). */
function pagina({ archivo, titulo, descripcion, actual, main, base = '', imagen, jsonld = '' }) {
  let cabeza = CABEZA
    .replace('<a href="index.html" aria-current="page">Inicio</a>', '<a href="index.html">Inicio</a>')
    .replace(`<a href="${actual}">`, `<a href="${actual}" aria-current="page">`);

  let pie = PIE, loader = LOADER, critico = CRITICO;
  if (base) {
    const reescribir = (s) => s
      .replace(/(src|href|action)="(?!https?:|#|data:|\/)/g, `$1="${base}`)
      .replace(/srcset="(?!https?:)/g, `srcset="${base}`);
    cabeza = reescribir(cabeza);
    pie = reescribir(pie);
    loader = reescribir(loader);
  }
  const og = imagen || `${base}assets/img/og-tiendadeportivasv.jpg`;

  return `<!DOCTYPE html>
<html lang="es-CO">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#ffffff">

<title>${titulo}</title>
<meta name="description" content="${descripcion}">
<meta name="robots" content="index, follow">
<link rel="canonical" href="https://tiendadeportivasv.com/${archivo}">

<meta property="og:type" content="website">
<meta property="og:site_name" content="TiendaDeportivaSV">
<meta property="og:locale" content="es_CO">
<meta property="og:title" content="${titulo}">
<meta property="og:description" content="${descripcion}">
<meta property="og:url" content="https://tiendadeportivasv.com/${archivo}">
<meta property="og:image" content="${og}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="${og}">

<link rel="icon" type="image/png" href="${base}assets/img/favicon-sv.png">
<link rel="apple-touch-icon" href="${base}assets/img/favicon-sv.png">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="image" href="${base}assets/img/logo-sv-lockup-dark-560.png" fetchpriority="high">
<link href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">

${critico}
<link rel="stylesheet" href="${base}assets/css/styles.css">
${jsonld}</head>
<body>

${loader}

${cabeza}
<main id="main">

${main}

</main>

${pie}

<script src="${base}assets/js/catalogo.js" defer></script>
<script src="${base}assets/js/app.js" defer></script>
</body>
</html>
`;
}

/* ---------------- CTA final reutilizable ---------------- */
const CTA_WA = `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.28-1.38a9.9 9.9 0 0 0 4.76 1.21h.01c5.46 0 9.9-4.45 9.9-9.91C21.95 6.45 17.5 2 12.04 2m5.52 13.99c-.25-.12-1.47-.72-1.69-.81s-.39-.12-.56.13-.64.8-.79.97-.29.19-.54.06a6.7 6.7 0 0 1-1.98-1.22 7.4 7.4 0 0 1-1.37-1.7c-.14-.25-.01-.38.11-.5s.25-.29.37-.44.17-.25.25-.42a.46.46 0 0 0-.02-.44c-.06-.12-.56-1.35-.76-1.85s-.41-.42-.56-.43h-.48a.92.92 0 0 0-.66.31 2.78 2.78 0 0 0-.87 2.07c0 1.22.89 2.4 1.02 2.57s1.76 2.68 4.26 3.76c.6.26 1.06.41 1.42.53.6.19 1.14.16 1.57.1.48-.07 1.47-.6 1.68-1.18s.21-1.09.15-1.19-.23-.19-.48-.31"/></svg>`;

function cta(titulo, texto, mensaje) {
  return `<section class="cta on-dark">
  <div class="wrap cta-in reveal">
    <h2>${titulo}</h2>
    <p>${texto}</p>
    <a class="btn btn-wa btn-lg" href="${wa(mensaje)}" target="_blank" rel="noopener">${CTA_WA}ESCRÍBENOS POR WHATSAPP</a>
  </div>
</section>`;
}

/* ================= CATÁLOGO ================= */
const catalogo = `<section class="page-head">
  <div class="wrap">
    <p class="kicker">TIENDADEPORTIVASV · CATÁLOGO</p>
    <h1>CATÁLOGO SV</h1>
    <p class="lead">Camisetas retro y pantalonetas versión jugador. Escribe por WhatsApp para confirmar
      disponibilidad, talla y precio.</p>
  </div>
</section>

<section class="sec sec-grey">
  <div class="wrap">
    <div class="filtros reveal">
      <div class="field">
        <label for="filtro-texto">Buscar</label>
        <input id="filtro-texto" type="search" placeholder="Barcelona, 1998, visitante…" autocomplete="off">
      </div>
      <div class="field">
        <label for="filtro-equipo">Equipo</label>
        <select id="filtro-equipo"><option value="">Todos los equipos</option></select>
      </div>
      <div class="chips" role="group" aria-label="Filtrar por tipo">
        <button class="chip is-on" data-filter="all" type="button">TODO</button>
        <button class="chip" data-filter="retro" type="button">RETRO</button>
        <button class="chip" data-filter="shorts" type="button">PANTALONETAS</button>
      </div>
    </div>

    <p class="kicker kicker-mute" id="cuenta-resultados" aria-live="polite" style="margin-bottom:clamp(20px,3vw,32px)">Cargando…</p>

    <div class="pgrid" id="catalogo-grid"></div>

    <div class="ver-mas-wrap">
      <button class="btn btn-line btn-lg" id="ver-mas" type="button" hidden>VER MÁS</button>
    </div>

    <div class="empty" id="sin-resultados" hidden>
      <h3>No encontramos “<span id="eco-busqueda"></span>” en el catálogo</h3>
      <p>Trabajamos también bajo pedido: dinos qué equipo y temporada buscas y te confirmamos si la conseguimos.</p>
      <a class="btn btn-wa" id="wa-sin-resultados" href="${wa('Hola, busco una referencia. ¿Me ayudan?')}" target="_blank" rel="noopener">PEDIR ESTA REFERENCIA</a>
    </div>
  </div>
</section>

${cta('¿NO VES TU EQUIPO?', 'Conseguimos referencias bajo pedido. Dinos equipo y temporada.', 'Hola, busco una referencia que no vi en el catálogo. ¿La pueden conseguir?')}`;

/* ================= BAJO PEDIDO ================= */
const bajoPedido = `<section class="page-head">
  <div class="wrap">
    <p class="kicker">RETRO · BAJO PEDIDO</p>
    <h1>BAJO PEDIDO</h1>
    <p class="lead">Camisetas clásicas por equipo y temporada: <b data-cuenta="productos">…</b> modelos
      de <b data-cuenta="equipos">…</b> equipos. Escoge el tuyo y se despliegan sus camisetas.</p>
  </div>
</section>

<section class="sec sec-grey">
  <div class="wrap">
    <header class="sec-hd reveal">
      <p class="kicker">CÓMO FUNCIONA</p>
      <h2>TRES PASOS</h2>
    </header>
    <div class="steps">
      <article class="step reveal">
        <h3>Escoge tu equipo</h3>
        <p>Toca el equipo que buscas y se abre WhatsApp con el mensaje listo.</p>
      </article>
      <article class="step reveal">
        <h3>Confirmamos</h3>
        <p>Te decimos qué temporadas conseguimos, tallas, precio y tiempos.</p>
      </article>
      <article class="step reveal">
        <h3>Haces el pedido</h3>
        <p>Encargamos tu camiseta y te avisamos apenas llegue.</p>
      </article>
    </div>
  </div>
</section>

<section class="sec">
  <div class="wrap">
    <header class="sec-hd reveal">
      <p class="kicker">ESCOGE UN EQUIPO</p>
      <h2>SELECCIONES RETRO</h2>
      <p class="lead" style="margin-top:12px;max-width:56ch">Toca un equipo y se despliegan sus camisetas.</p>
    </header>
    <div class="tgrid" data-equipos="seleccion"></div>
  </div>
</section>

<section class="sec sec-grey">
  <div class="wrap">
    <header class="sec-hd reveal">
      <p class="kicker">ESCOGE UN EQUIPO</p>
      <h2>CLUBES RETRO</h2>
      <p class="lead" style="margin-top:12px;max-width:56ch">Toca un equipo y se despliegan sus camisetas.</p>
    </header>
    <div class="tgrid" data-equipos="club"></div>
  </div>
</section>

${cta('¿TU EQUIPO NO ESTÁ<br>EN LA LISTA?', 'Pídenos cualquier equipo y temporada. Si se consigue, lo conseguimos.', 'Hola, quiero encargar una camiseta de un equipo que no está en la lista.')}`;

/* ================= GUÍA DE TALLAS ================= */
const tallas = `<section class="page-head">
  <div class="wrap">
    <p class="kicker">ANTES DE PEDIR</p>
    <h1>GUÍA DE TALLAS</h1>
    <p class="lead">Las camisetas de fútbol tallan distinto según la versión. Confirma siempre tu talla con nosotros antes de pedir.</p>
  </div>
</section>

<section class="sec sec-grey">
  <div class="wrap">
    <header class="sec-hd reveal">
      <p class="kicker">MEDIDAS ORIENTATIVAS</p>
      <h2>TABLA DE TALLAS</h2>
    </header>

    <!--
      IMPORTANTE: esta tabla es una referencia general de camiseta de fútbol.
      Reemplaza los valores por las medidas reales de tus prendas cuando las tengas.
    -->
    <div class="table-wrap reveal">
      <table>
        <caption>Medidas de la prenda en centímetros (no del cuerpo)</caption>
        <thead>
          <tr><th scope="col">Talla</th><th scope="col">Ancho de pecho</th><th scope="col">Largo</th><th scope="col">Equivale a</th></tr>
        </thead>
        <tbody>
          <tr><th scope="row">S</th><td>48 – 50 cm</td><td>68 – 70 cm</td><td>Delgado</td></tr>
          <tr><th scope="row">M</th><td>51 – 53 cm</td><td>70 – 72 cm</td><td>Promedio</td></tr>
          <tr><th scope="row">L</th><td>54 – 56 cm</td><td>72 – 74 cm</td><td>Contextura media</td></tr>
          <tr><th scope="row">XL</th><td>57 – 59 cm</td><td>74 – 76 cm</td><td>Contextura grande</td></tr>
          <tr><th scope="row">XXL</th><td>60 – 62 cm</td><td>76 – 78 cm</td><td>Holgado</td></tr>
        </tbody>
      </table>
    </div>

    <p class="lead reveal" style="margin-top:22px;max-width:62ch">
      Son medidas de referencia: cada referencia y cada versión (jugador o hincha) puede variar
      un par de centímetros. Escríbenos con tu estatura, tu peso y cómo te gusta que te quede
      y te decimos qué talla pedir.
    </p>
    <a class="btn btn-wa reveal" style="margin-top:20px" href="${wa('Hola, necesito ayuda para escoger la talla de una camiseta.')}" target="_blank" rel="noopener">${CTA_WA}CONSULTAR MI TALLA</a>
  </div>
</section>

<section class="sec">
  <div class="wrap">
    <header class="sec-hd reveal">
      <p class="kicker">CÓMO MEDIR</p>
      <h2>MIDE UNA CAMISETA TUYA</h2>
    </header>
    <div class="steps">
      <article class="step reveal">
        <h3>Extiéndela</h3>
        <p>Pon sobre una mesa una camiseta que te quede como te gusta, bien estirada.</p>
      </article>
      <article class="step reveal">
        <h3>Mide el pecho</h3>
        <p>De axila a axila, en línea recta. Ese es el ancho de pecho de la tabla.</p>
      </article>
      <article class="step reveal">
        <h3>Mide el largo</h3>
        <p>Desde el hombro, junto al cuello, hasta el borde inferior de la prenda.</p>
      </article>
    </div>
  </div>
</section>

${cta('¿DUDAS CON<br>LA TALLA?', 'Mándanos tus medidas y te decimos exactamente cuál pedir.', 'Hola, tengo dudas con la talla. ¿Me ayudan a escoger?')}`;

/* ================= RASTREAR PEDIDO ================= */
const rastrear = `<section class="page-head">
  <div class="wrap">
    <p class="kicker">TU PEDIDO</p>
    <h1>RASTREAR PEDIDO</h1>
    <p class="lead">El seguimiento lo hacemos por WhatsApp, la misma conversación donde hiciste el pedido. Llena estos datos y te respondemos con el estado.</p>
  </div>
</section>

<section class="sec sec-grey">
  <div class="wrap">
    <header class="sec-hd reveal">
      <p class="kicker">CONSULTA TU ESTADO</p>
      <h2>DINOS QUÉ PEDISTE</h2>
    </header>

    <form class="form reveal" id="form-rastreo">
      <div class="field">
        <label for="pedido">Número de pedido o referencia</label>
        <input id="pedido" name="pedido" type="text" placeholder="Ej: Portugal visitante talla L" autocomplete="off" required>
        <small>Si no tienes número, escribe qué camiseta pediste.</small>
      </div>
      <div class="field">
        <label for="nombre">Nombre de quien hizo el pedido</label>
        <input id="nombre" name="nombre" type="text" placeholder="Tu nombre" autocomplete="name">
      </div>
      <button class="btn btn-wa btn-lg" type="submit">${CTA_WA}CONSULTAR POR WHATSAPP</button>
      <small style="color:var(--muted)">Se abrirá WhatsApp con el mensaje escrito. No guardamos ningún dato en esta página.</small>
    </form>
  </div>
</section>

<section class="sec">
  <div class="wrap">
    <header class="sec-hd reveal">
      <p class="kicker">TIEMPOS</p>
      <h2>QUÉ ESPERAR</h2>
    </header>
    <div class="steps">
      <article class="step reveal">
        <h3>Entrega inmediata</h3>
        <p>Si la referencia está disponible, coordinamos la entrega apenas confirmes.</p>
      </article>
      <article class="step reveal">
        <h3>Bajo pedido</h3>
        <p>Te damos el tiempo estimado al confirmar el encargo, antes de que pagues.</p>
      </article>
      <article class="step reveal">
        <h3>Siempre por WhatsApp</h3>
        <p>Te avisamos por el mismo chat en cada paso, sin que tengas que preguntar.</p>
      </article>
    </div>
  </div>
</section>

${cta('¿ALGO NO CUADRA<br>CON TU PEDIDO?', 'Escríbenos y lo revisamos contigo de una vez.', 'Hola, tengo una duda con mi pedido.')}`;

/* ---------------- Escritura ---------------- */
const paginas = [
  { archivo: 'catalogo.html', actual: 'catalogo.html', main: catalogo,
    titulo: 'Catálogo | Camisetas de fútbol actuales y retro · TiendaDeportivaSV',
    descripcion: 'Más de 200 camisetas de fútbol retro y pantalonetas versión jugador: Barcelona, Real Madrid, AC Milan, Argentina, Brasil y más. Pide por WhatsApp desde Villavicencio.' },

  { archivo: 'bajo-pedido.html', actual: 'bajo-pedido.html', main: bajoPedido,
    titulo: 'Bajo pedido | Camisetas retro por equipo · TiendaDeportivaSV',
    descripcion: 'Camisetas retro bajo pedido por equipo y temporada: selecciones y clubes europeos y sudamericanos. Escoge tu equipo y se despliegan sus camisetas.' },

  { archivo: 'tallas.html', actual: 'tallas.html', main: tallas,
    titulo: 'Guía de tallas | Camisetas de fútbol · TiendaDeportivaSV',
    descripcion: 'Tabla de tallas orientativa para camisetas de fútbol y cómo medir la tuya. Consulta tu talla por WhatsApp antes de pedir.' },

  { archivo: 'rastrear.html', actual: 'rastrear.html', main: rastrear,
    titulo: 'Rastrear pedido | TiendaDeportivaSV',
    descripcion: 'Consulta el estado de tu pedido de TiendaDeportivaSV por WhatsApp. Entrega inmediata y pedidos bajo pedido.' }
];

for (const p of paginas) {
  const html = pagina(p);
  fs.writeFileSync(path.join(raiz, p.archivo), html, 'utf8');
  console.log(p.archivo, Math.round(Buffer.byteLength(html) / 1024) + 'KB');
}

/* ================= FICHAS DE PRODUCTO ================= */
/* Una página por producto en p/<id>.html, generada desde catalogo.js.
   Son páginas reales: se pueden compartir, indexar y volver atrás. */

const esc = (t) => String(t).replace(/[&<>"]/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]));
const TALLAS = ['S', 'M', 'L', 'XL', 'XXL'];

const catalogoJs = path.join(raiz, 'assets', 'js', 'catalogo.js');
if (!fs.existsSync(catalogoJs)) {
  console.log('\nassets/js/catalogo.js no existe: ejecuta antes  node build-catalogo.js');
} else {
  global.window = {};
  eval(fs.readFileSync(catalogoJs, 'utf8'));
  const CAT = global.window.SV_CATALOGO;
  const PORID = {};
  CAT.equipos.forEach((e) => { PORID[e.id] = e; });

  const dirP = path.join(raiz, 'p');
  fs.rmSync(dirP, { recursive: true, force: true });
  fs.mkdirSync(dirP, { recursive: true });

  const esShort = (p) => p.cat === 'shorts';
  const prenda = (p) => (esShort(p) ? 'Pantaloneta' : 'Camiseta');
  const nombreProducto = (p) => {
    const e = PORID[p.eq];
    const base = [e.n, p.t].filter(Boolean).join(' ');
    return p.v && p.v !== 'Retro' ? `${base} · ${p.v}` : base;
  };
  const tituloLargo = (p) =>
    `${prenda(p)} ${esShort(p) ? 'versión jugador' : 'de fútbol'} ${nombreProducto(p)}`;

  /* Tamaño real de cada foto grande. No todos los originales llegan a 1600 px y
     no se amplían, así que el width/height del HTML se lee del archivo.
     Se rellena antes de generar las fichas (ver «precalcular» más abajo). */
  const ladoG = {};
  const lado = (img, cara) => ladoG[`${img}-${cara}`] || 1600;

  function galeria(p) {
    const caras = [];
    for (let i = 1; i <= p.f; i++) caras.push(i);
    const src = (i, w, ext) => `../assets/catalogo/${p.img}-${i}-${w}.${ext}`;
    const altTxt = (i) =>
      `${tituloLargo(p)}${i === 2 ? ', vista por detrás' : ''}`;

    /* El visor usa la variante grande (-g, cuadrada de hasta 1600 px): a 520 CSS px
       de ancho hace falta el doble (o el triple, en DPR3) de píxeles en pantallas retina. */
    const grande = caras.map((i) => `
        <picture class="pdp-foto${i === 1 ? ' is-on' : ''}" data-cara="${i}">
          <source type="image/avif" srcset="${src(i, 'g', 'avif')}">
          <img src="${src(i, 'g', 'webp')}" width="${lado(p.img, i)}" height="${lado(p.img, i)}" ${i === 1 ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" alt="${esc(altTxt(i))}">
        </picture>`).join('');

    const minis = caras.length > 1 ? `
      <div class="pdp-minis" role="tablist" aria-label="Fotos del producto">
        ${caras.map((i) => `<button type="button" class="pdp-mini${i === 1 ? ' is-on' : ''}" data-cara="${i}" role="tab" aria-selected="${i === 1}" aria-label="Foto ${i} de ${caras.length}">
          <img src="${src(i, 340, 'webp')}" width="340" height="453" loading="lazy" decoding="async" alt="">
        </button>`).join('\n        ')}
      </div>` : '';

    return `<div class="pdp-galeria">${minis}
      <div class="pdp-visor">${grande}
      </div>
    </div>`;
  }

  function relacionados(p) {
    const mismos = CAT.productos.filter((o) => o.eq === p.eq && o.id !== p.id);
    const otros = CAT.productos.filter((o) => o.eq !== p.eq && o.cat === p.cat);
    const lista = mismos.concat(otros.sort(() => 0.5 - Math.random())).slice(0, 6);
    if (!lista.length) return '';
    return `
<section class="sec sec-tight">
  <div class="wrap">
    <header class="sec-hd reveal"><p class="kicker">TE PUEDE INTERESAR</p><h2>MÁS MODELOS</h2></header>
    <div class="pgrid">
${lista.map((o) => `      <article class="pcard reveal">
        <a class="pcard-media" href="${o.id}.html">
          <picture>
            <source type="image/avif" srcset="../assets/catalogo/${o.img}-1-340.avif 340w, ../assets/catalogo/${o.img}-1-600.avif 600w" sizes="(min-width:1000px) 290px, (min-width:640px) 30vw, 45vw">
            <source type="image/webp" srcset="../assets/catalogo/${o.img}-1-340.webp 340w, ../assets/catalogo/${o.img}-1-600.webp 600w" sizes="(min-width:1000px) 290px, (min-width:640px) 30vw, 45vw">
            <img src="../assets/catalogo/${o.img}-1-600.webp" width="600" height="800" loading="lazy" decoding="async" alt="${esc(tituloLargo(o))}">
          </picture>
        </a>
        <div class="pcard-bd">
          <h3 class="pcard-tt"><a href="${o.id}.html">${esc(nombreProducto(o))}</a></h3>
          <p class="pcard-meta">${PORID[o.eq].tipo === 'seleccion' ? 'Selección' : 'Club'} · ${esShort(o) ? 'Versión jugador' : 'Retro'}</p>
          <p class="pcard-price">Consultar precio</p>
          <a class="btn btn-dark btn-sm btn-block" href="${o.id}.html">VER</a>
        </div>
      </article>`).join('\n')}
    </div>
  </div>
</section>`;
  }

  function fichaProducto(p) {
    const e = PORID[p.eq];
    const nom = nombreProducto(p);
    const tipoEq = e.tipo === 'seleccion' ? 'Selección' : 'Club';
    const msg = `Hola, estoy interesado en: ${prenda(p)} ${nom}.`;

    const descripcion = esShort(p)
      ? `Pantaloneta de fútbol de ${e.n}${p.t ? `, temporada ${p.t}` : ''}${p.v ? `, versión ${p.v.toLowerCase()}` : ''}. Versión jugador.`
      : `Camiseta retro de ${e.n}${p.t ? `, temporada ${p.t}` : ''}${p.v && p.v !== 'Retro' ? `, versión ${p.v.toLowerCase()}` : ''}.`;

    const main = `<nav class="crumbs" aria-label="Ruta">
  <div class="wrap">
    <a href="../index.html">Inicio</a> <span>/</span>
    <a href="../catalogo.html">Catálogo</a> <span>/</span>
    <a href="../catalogo.html?eq=${e.id}">${esc(e.n)}</a> <span>/</span>
    <b>${esc(nom)}</b>
  </div>
</nav>

<section class="pdp">
  <div class="wrap pdp-in">
    ${galeria(p)}

    <div class="pdp-compra">
      <p class="pdp-marca">${esc(e.n)}</p>
      <h1 class="pdp-tt">${esc(tituloLargo(p))}</h1>
      <p class="pdp-vendedor">Vendido y entregado por <b>TiendaDeportivaSV</b> · Villavicencio</p>

      <p class="pdp-precio">Consultar precio</p>
      <p class="pdp-nota">Te confirmamos precio y disponibilidad por WhatsApp.</p>

      <div class="pdp-tallas">
        <div class="pdp-tallas-hd">
          <span>TALLA</span>
          <a href="../tallas.html">Ver tabla de tallas</a>
        </div>
        <div class="tallas-grid" role="group" aria-label="Escoge tu talla">
          ${TALLAS.map((t) => `<button type="button" class="talla" data-talla="${t}">${t}</button>`).join('\n          ')}
        </div>
        <small>Escoge una talla y la incluimos en el mensaje. Confirmamos existencias al escribirnos.</small>
      </div>

      <a class="btn btn-wa btn-lg btn-block pdp-cta" id="pdp-pedir"
         data-msg="${esc(msg)}" href="${wa(msg + ' ¿Está disponible?')}" target="_blank" rel="noopener">
        ${CTA_WA}PEDIR POR WHATSAPP
      </a>
      <a class="btn btn-line btn-block" href="${wa(`Hola, ¿tienen más fotos o detalles de: ${prenda(p)} ${nom}?`)}" target="_blank" rel="noopener">PEDIR MÁS FOTOS</a>

      <ul class="pdp-plus">
        <li>Atención por WhatsApp</li>
        <li>Entrega inmediata en referencias disponibles</li>
        <li>También trabajamos bajo pedido</li>
      </ul>
    </div>
  </div>
</section>

<section class="sec sec-grey">
  <div class="wrap pdp-abajo">
    <div>
      <h2 class="pdp-h2">DETALLES DEL PRODUCTO</h2>
      <p class="pdp-desc">${esc(descripcion)}</p>
      <dl class="pdp-specs">
        <dt>Equipo</dt><dd>${esc(e.n)}</dd>
        <dt>Tipo</dt><dd>${tipoEq}</dd>
        ${p.t ? `<dt>Temporada</dt><dd>${esc(p.t)}</dd>` : ''}
        ${p.v ? `<dt>Versión</dt><dd>${esc(p.v)}</dd>` : ''}
        <dt>Prenda</dt><dd>${prenda(p)}${esShort(p) ? ' versión jugador' : ' retro'}</dd>
        <dt>Disponibilidad</dt><dd>Consultar por WhatsApp</dd>
      </dl>
    </div>
    <div>
      <h2 class="pdp-h2">BUSCAR MÁS</h2>
      <div class="pdp-chips">
        <a href="../catalogo.html?eq=${e.id}">${esc(e.n)}</a>
        <a href="../catalogo.html?q=${encodeURIComponent(p.t || '')}">${esc(p.t || 'Retro')}</a>
        <a href="../catalogo.html">${esShort(p) ? 'Pantalonetas' : 'Camisetas retro'}</a>
        <a href="../bajo-pedido.html">Bajo pedido</a>
      </div>

      <h2 class="pdp-h2" style="margin-top:32px">CÓMO PEDIR</h2>
      <ol class="pdp-pasos">
        <li>Escoge tu talla y toca «Pedir por WhatsApp».</li>
        <li>Te confirmamos precio, disponibilidad y tiempo de entrega.</li>
        <li>Coordinamos el pago y el envío por el mismo chat.</li>
      </ol>
    </div>
  </div>
</section>

${relacionados(p)}`;

    const desc = `${descripcion} Pide por WhatsApp en TiendaDeportivaSV, Villavicencio.`;
    const RAIZ_URL = 'https://tiendadeportivasv.com/';
    const fotos = [];
    for (let i = 1; i <= p.f; i++) fotos.push(`${RAIZ_URL}assets/catalogo/${p.img}-${i}-g.webp`);

    /* Datos estructurados: solo hechos comprobables. Sin precio ni existencias,
       porque la tienda no los publica todavía. */
    const jsonld = `<script type="application/ld+json">
${JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Product',
          name: tituloLargo(p),
          description: descripcion,
          image: fotos,
          category: esShort(p) ? 'Pantalonetas de fútbol' : 'Camisetas de fútbol retro',
          brand: { '@type': 'Brand', name: e.n },
          sku: p.id,
          seller: { '@type': 'Organization', name: 'TiendaDeportivaSV' }
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Inicio', item: RAIZ_URL },
            { '@type': 'ListItem', position: 2, name: 'Catálogo', item: `${RAIZ_URL}catalogo.html` },
            { '@type': 'ListItem', position: 3, name: e.n, item: `${RAIZ_URL}catalogo.html?eq=${e.id}` },
            { '@type': 'ListItem', position: 4, name: nom, item: `${RAIZ_URL}p/${p.id}.html` }
          ]
        }
      ]
    }, null, 0)}
</script>
`;

    return pagina({
      archivo: `p/${p.id}.html`,
      titulo: `${tituloLargo(p)} | TiendaDeportivaSV`,
      descripcion: desc,
      actual: 'catalogo.html',
      base: '../',
      imagen: `${RAIZ_URL}assets/catalogo/${p.img}-1-g.webp`,
      jsonld,
      main
    });
  }

  // precalcular: mide cada foto grande una sola vez
  (async () => {
    for (const p of CAT.productos) {
      for (let i = 1; i <= p.f; i++) {
        const f = path.join(raiz, 'assets', 'catalogo', `${p.img}-${i}-g.webp`);
        try { ladoG[`${p.img}-${i}`] = (await sharp(f).metadata()).width; } catch { /* usa 1600 */ }
      }
    }

    let peso = 0;
    for (const p of CAT.productos) {
      const html = fichaProducto(p);
      fs.writeFileSync(path.join(dirP, `${p.id}.html`), html, 'utf8');
      peso += Buffer.byteLength(html);
    }
    console.log(`p/*.html  ${CAT.productos.length} fichas · ${(peso / 1024 / 1024).toFixed(1)} MB`);
    const distintos = [...new Set(Object.values(ladoG))].sort((a, b) => a - b);
    console.log(`          anchos reales de la foto grande: ${distintos[0]}–${distintos[distintos.length - 1]} px`);
    console.log('listo');
  })();

  /* Sitemap con las 5 páginas + todas las fichas */
  const urls = [
    ['', 'weekly', '1.0'], ['catalogo.html', 'weekly', '0.9'],
    ['bajo-pedido.html', 'monthly', '0.8'], ['tallas.html', 'yearly', '0.5'],
    ['rastrear.html', 'yearly', '0.4']
  ].map(([u, f, pr]) => `  <url><loc>https://tiendadeportivasv.com/${u}</loc><changefreq>${f}</changefreq><priority>${pr}</priority></url>`)
    .concat(CAT.productos.map((p) =>
      `  <url><loc>https://tiendadeportivasv.com/p/${p.id}.html</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>`));

  fs.writeFileSync(path.join(raiz, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`, 'utf8');
  console.log('sitemap.xml', urls.length, 'URLs');
}


