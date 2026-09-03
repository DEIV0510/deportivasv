/* Genera catalogo.html, bajo-pedido.html, tallas.html y rastrear.html
   reutilizando el encabezado, la cinta y el pie de index.html, para que
   las cinco páginas no se desincronicen nunca.

   Uso:  node build-pages.js
   (index.html se edita a mano; es la fuente del encabezado y del pie)
*/
const fs = require('fs');
const path = require('path');

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

/* ---------------- Productos reales (los mismos del inicio) ---------------- */
const P = {
  argLocal: {
    tt: 'Argentina Local · #10', meta: 'Selección · Actual', cat: 'actuales', top: true,
    buscar: 'argentina local 10 seleccion actual albiceleste campeon mundo',
    a: 'arg-local', b: 'arg-local-det', w: 612, h: 851,
    altA: 'Camiseta Argentina local blanca y celeste número 10 con parche FIFA World Champions 2022',
    altB: 'Detalle del parche dorado FIFA World Champions 2022 sobre la camiseta de Argentina',
    msg: 'Hola, estoy interesado en la camiseta Argentina Local #10. ¿Está disponible?'
  },
  argNegra: {
    tt: 'Argentina Edición Negra · #10', meta: 'Selección · Edición especial', cat: 'actuales', top: false,
    buscar: 'argentina negra edicion especial 10 seleccion actual',
    a: 'arg-negra', b: null, w: 615, h: 836,
    altA: 'Camiseta de Argentina edición especial negra con estampado ornamental azul, número 10 y parche de campeón del mundo',
    msg: 'Hola, estoy interesado en la camiseta Argentina Edición Negra #10. ¿Está disponible?'
  },
  portugalLocal: {
    tt: 'Portugal Local · #7', meta: 'Selección · Actual', cat: 'actuales', top: false,
    buscar: 'portugal local 7 ronaldo seleccion actual roja',
    a: 'portugal-local', b: 'portugal-det', w: 585, h: 888,
    altA: 'Camiseta de Portugal local roja con verde y el número 7, marca Puma',
    altB: 'Espalda de la camiseta roja de Portugal con el nombre Ronaldo y el número 7',
    msg: 'Hola, estoy interesado en la camiseta Portugal Local #7. ¿Está disponible?'
  },
  portugalAway: {
    tt: 'Portugal Visitante · #7', meta: 'Selección · Actual', cat: 'actuales', top: true,
    buscar: 'portugal visitante 7 ronaldo seleccion actual verde blanca',
    a: 'portugal-away', b: 'portugal-away-det', w: 582, h: 886,
    altA: 'Camiseta visitante de Portugal blanca y verde con estampado, número 7, marca Puma',
    altB: 'Espalda de la camiseta visitante de Portugal con el nombre Ronaldo y el número 7 en color vino tinto',
    msg: 'Hola, estoy interesado en la camiseta Portugal Visitante #7. ¿Está disponible?'
  },
  colombia: {
    tt: 'Selección Colombia', meta: 'Selección · Actual', cat: 'actuales', top: false,
    buscar: 'colombia seleccion actual amarilla cafetera',
    a: 'colombia', b: 'colombia-det', w: 622, h: 852,
    altA: 'Camiseta de la Selección Colombia amarilla con detalles rojos y azules y escudo de la Federación',
    altB: 'Detalle del escudo y el tejido de la camiseta de la Selección Colombia',
    msg: 'Hola, estoy interesado en la camiseta de la Selección Colombia. ¿Está disponible?'
  },
  chelsea: {
    tt: 'Chelsea Retro · Negra', meta: 'Club · Retro', cat: 'retro', top: true,
    buscar: 'chelsea retro negra nike club clasica',
    a: 'chelsea-retro', b: 'chelsea-det', w: 597, h: 887,
    altA: 'Camiseta retro del Chelsea negra con ribetes azules y cuello gris, marca Nike',
    altB: 'Detalle de la textura del tejido y el logo de la camiseta retro del Chelsea',
    msg: 'Hola, estoy interesado en la camiseta Chelsea Retro. ¿Está disponible?'
  },
  englandShorts: {
    tt: 'Pantaloneta Inglaterra', meta: 'Selección · Pantaloneta', cat: 'shorts', top: false,
    buscar: 'pantaloneta short shorts inglaterra england blanca nike seleccion tres leones',
    a: 'england-shorts', b: 'england-shorts-back', w: 600, h: 800,
    altA: 'Pantaloneta de fútbol de Inglaterra blanca con laterales rojos, escudo de los tres leones y logo de Nike',
    altB: 'Reverso de la pantaloneta de Inglaterra blanca con los laterales rojos y vivo negro',
    msg: 'Hola, estoy interesado en la pantaloneta de Inglaterra. ¿Está disponible?'
  }
};

const ESTRELLA = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l-5-4.87 6.91-1.01z"/></svg>';
const SIZES = '(min-width:1000px) 290px, (min-width:640px) 30vw, 45vw';

function pcard(p) {
  const enlace = wa(p.msg);
  const segunda = p.b
    ? `\n          <picture>
            <source type="image/avif" srcset="assets/img/${p.b}-340.avif">
            <img class="im-b" src="assets/img/${p.b}-340.webp" width="600" height="860" loading="lazy" decoding="async" alt="${p.altB}">
          </picture>`
    : '';
  const badge = p.top
    ? `\n          <span class="badge badge-top">${ESTRELLA}TOP</span>`
    : '';
  return `      <article class="pcard reveal" data-cat="${p.cat}" data-buscar="${p.tt} ${p.buscar}">
        <a class="pcard-media" href="${enlace}" target="_blank" rel="noopener" tabindex="-1" aria-hidden="true">
          <picture>
            <source type="image/avif" srcset="assets/img/${p.a}-340.avif 340w, assets/img/${p.a}-600.avif 600w" sizes="${SIZES}">
            <source type="image/webp" srcset="assets/img/${p.a}-340.webp 340w, assets/img/${p.a}-600.webp 600w" sizes="${SIZES}">
            <img class="im-a" src="assets/img/${p.a}-340.webp" width="${p.w}" height="${p.h}" loading="lazy" decoding="async" alt="${p.altA}">
          </picture>${segunda}${badge}
        </a>
        <div class="pcard-bd">
          <h3 class="pcard-tt">${p.tt}</h3>
          <p class="pcard-meta">${p.meta}</p>
          <p class="pcard-price">Consultar precio</p>
          <a class="btn btn-dark btn-sm btn-block" href="${enlace}" target="_blank" rel="noopener">PEDIR</a>
        </div>
      </article>`;
}

function grupo(titulo, equipo, productos) {
  const n = productos.length;
  return `    <section class="group reveal">
      <header class="group-hd">
        <div>
          <p class="kicker">${n} ${n === 1 ? 'MODELO' : 'MODELOS'}</p>
          <h2>${titulo}</h2>
        </div>
        <a class="link-more" href="${wa('Hola, quiero ver todo lo que tienen de ' + equipo + '.')}" target="_blank" rel="noopener">Ver todo de ${equipo} →</a>
      </header>
      <div class="pgrid">
${productos.map(pcard).join('\n\n')}
      </div>
    </section>`;
}

/* ---------------- Plantilla común ---------------- */
function pagina({ archivo, titulo, descripcion, actual, main }) {
  const cabeza = CABEZA
    .replace('<a href="index.html" aria-current="page">Inicio</a>', '<a href="index.html">Inicio</a>')
    .replace(`<a href="${actual}">`, `<a href="${actual}" aria-current="page">`);

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
<meta property="og:image" content="assets/img/og-tiendadeportivasv.jpg">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="assets/img/og-tiendadeportivasv.jpg">

<link rel="icon" type="image/png" href="assets/img/favicon-sv.png">
<link rel="apple-touch-icon" href="assets/img/favicon-sv.png">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="image" href="assets/img/logo-sv-lockup-dark-560.png" fetchpriority="high">
<link href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">

${CRITICO}
<link rel="stylesheet" href="assets/css/styles.css">
</head>
<body>

${LOADER}

${cabeza}
<main id="main">

${main}

</main>

${PIE}

<script src="assets/js/equipos.js" defer></script>
<script src="assets/js/productos.js" defer></script>
<script src="assets/js/app.js" defer></script>
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
    <p class="kicker">TIENDADEPORTIVASV · DISPONIBLES</p>
    <h1>CATÁLOGO SV</h1>
    <p class="lead">Camisetas actuales y retro. Escribe por WhatsApp para confirmar disponibilidad, talla y precio.</p>
  </div>
</section>

<section class="sec sec-grey">
  <div class="wrap">
    <div class="sec-hd sec-hd-row reveal">
      <div class="field" style="max-width:340px;width:100%">
        <label for="filtro-texto">Buscar en el catálogo</label>
        <input id="filtro-texto" type="search" placeholder="Argentina, retro, Portugal…" autocomplete="off">
      </div>
      <div class="chips" role="group" aria-label="Filtrar por tipo">
        <button class="chip is-on" data-filter="all" type="button">TODO</button>
        <button class="chip" data-filter="actuales" type="button">ACTUALES</button>
        <button class="chip" data-filter="retro" type="button">RETRO</button>
        <button class="chip" data-filter="shorts" type="button">SHORTS</button>
      </div>
    </div>
    <p class="kicker kicker-mute" id="cuenta-resultados" aria-live="polite" style="margin-bottom:clamp(28px,4vw,44px)">7 modelos</p>

${grupo('ARGENTINA', 'Argentina', [P.argLocal, P.argNegra])}

${grupo('PORTUGAL', 'Portugal', [P.portugalLocal, P.portugalAway])}

${grupo('COLOMBIA', 'la Selección Colombia', [P.colombia])}

${grupo('CHELSEA', 'Chelsea', [P.chelsea])}

${grupo('INGLATERRA', 'Inglaterra', [P.englandShorts])}

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
    <p class="lead">Camisetas clásicas por equipo y temporada. Escoge tu equipo y te confirmamos qué podemos conseguir.</p>
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
    <div class="tgrid" data-equipos="selecciones"></div>
  </div>
</section>

<section class="sec sec-grey">
  <div class="wrap">
    <header class="sec-hd reveal">
      <p class="kicker">ESCOGE UN EQUIPO</p>
      <h2>CLUBES RETRO</h2>
      <p class="lead" style="margin-top:12px;max-width:56ch">Toca un equipo y se despliegan sus camisetas.</p>
    </header>
    <div class="tgrid" data-equipos="clubes"></div>
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
    descripcion: 'Catálogo de camisetas de fútbol actuales y retro de TiendaDeportivaSV. Argentina, Portugal, Colombia y Chelsea. Pide por WhatsApp desde Villavicencio.' },

  { archivo: 'bajo-pedido.html', actual: 'bajo-pedido.html', main: bajoPedido,
    titulo: 'Bajo pedido | Camisetas retro por equipo · TiendaDeportivaSV',
    descripcion: 'Camisetas retro y actuales bajo pedido: selecciones, clubes europeos y fútbol colombiano. Escoge tu equipo y te confirmamos por WhatsApp.' },

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
console.log('listo');
