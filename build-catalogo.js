/* Lee la carpeta del catálogo del cliente, genera las imágenes optimizadas
   y escribe assets/js/catalogo.js con todos los productos.

   Uso:  node build-catalogo.js [ruta/a/catalogosv]
         node build-catalogo.js --solo-datos    (no toca las imágenes: sirve para
                                                 cambiar nombres, colores o siglas)

   Estructura que espera:
     RETROS/SELECCIONES/<Selección>/<Modelo>/*.jpg
     RETROS/CLUBES/<Club>/<Modelo>/*.jpg
     RETROS/CLUBES/<Grupo>/<Club>/<Modelo>/*.jpg     (Grupo = agrupador, no club)
     SHORTS PLAYER/<Equipo Temporada Variante>.jpg   (un archivo = un producto)

   Dentro de cada carpeta de modelo, el primer archivo por orden alfabético es
   el frente y el segundo la espalda.
*/
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SOLO_DATOS = process.argv.includes('--solo-datos');
const RAIZ = process.argv.slice(2).find(a => !a.startsWith('--')) || 'C:/Users/Lenovo/Desktop/catalogosv';
const OUT_IMG = path.join(__dirname, 'assets', 'catalogo');
const OUT_JS = path.join(__dirname, 'assets', 'js', 'catalogo.js');

const WIDTHS = [340, 600];
const RATIO = 4 / 3;    // marco vertical del catálogo
const MARGEN = 0.06;    // aire alrededor de la prenda
const MAX_FOTOS = 2;    // frente y espalda

/* Carpetas que solo agrupan y no son un equipo */
const AGRUPADORES = new Set(['Clubes Sudamericanos', 'OTROS CLUBES']);

/* Selecciones nacionales: en SHORTS PLAYER no hay carpeta que lo indique */
const SELECCIONES = new Set([
  'Alemania', 'Argentina', 'Bélgica', 'Brasil', 'Colombia', 'España', 'Francia',
  'Inglaterra', 'Italia', 'Japón', 'Países Bajos', 'Portugal', 'Uruguay', 'México'
]);

/* Nombre de carpeta -> nombre público (corrige erratas y unifica) */
const NOMBRES = {
  'Ajax FC': 'Ajax', 'Arsenal FC': 'Arsenal', 'Chelsea FC': 'Chelsea',
  'FC Barcelona': 'Barcelona', 'Florentina': 'Fiorentina',
  'Inter de Milan': 'Inter de Milán', 'Juventus FC': 'Juventus',
  'Liverpool FC': 'Liverpool', 'Newcastle United': 'Newcastle',
  'PSG': 'Paris Saint-Germain', 'Real Madrid CF': 'Real Madrid',
  'Corinthias FC': 'Corinthians', 'Santos FC': 'Santos',
  'Bayer Munich': 'Bayern Múnich', 'Lazio FC': 'Lazio', 'Roma FC': 'Roma',
  'Sporting Club': 'Sporting', 'Japon': 'Japón',
  'Paises Bajos': 'Países Bajos', 'Holanda': 'Países Bajos',
  'Atletico Madrid': 'Atlético de Madrid', 'Belgica': 'Bélgica',
  'Borussia Dormundt': 'Borussia Dortmund', 'Bayer Munich 26-27': 'Bayern Múnich',
  'Fc Barcelona': 'Barcelona', 'FC Barcelona 26-27': 'Barcelona',
  'Inter de Milan 26-27': 'Inter de Milán',
};

/* Colores de la franja de cada equipo. Los que falten usan un gris neutro. */
const COLORES = {
  'ac-milan': ['#FB090B', '#000000', '#FB090B'],
  'ajax': ['#ffffff', '#D2122E', '#ffffff'],
  'arsenal': ['#EF0107', '#ffffff', '#063672'],
  'chelsea': ['#034694', '#ffffff', '#DBA111'],
  'barcelona': ['#A50044', '#004D98', '#EDBB00'],
  'fiorentina': ['#592C82', '#ffffff', '#592C82'],
  'inter-de-milan': ['#0068A8', '#000000', '#0068A8'],
  'juventus': ['#000000', '#ffffff', '#000000'],
  'liverpool': ['#C8102E', '#00B2A9', '#F6EB61'],
  'manchester-city': ['#6CABDD', '#ffffff', '#1C2C5B'],
  'manchester-united': ['#DA291C', '#FBE122', '#000000'],
  'newcastle': ['#000000', '#ffffff', '#000000'],
  'paris-saint-germain': ['#004170', '#ffffff', '#DA291C'],
  'real-madrid': ['#ffffff', '#FEBE10', '#00529F'],
  'boca-juniors': ['#16336E', '#FFC72C', '#16336E'],
  'corinthians': ['#ffffff', '#000000', '#ffffff'],
  'flamengo': ['#C52613', '#000000', '#C52613'],
  'santos': ['#ffffff', '#000000', '#ffffff'],
  'bayern-munich': ['#DC052D', '#0066B2', '#ffffff'],
  'lazio': ['#87D8F7', '#ffffff', '#87D8F7'],
  'roma': ['#8E1F2F', '#F0BC42', '#8E1F2F'],
  'sporting': ['#008057', '#ffffff', '#008057'],
  'borussia-dortmund': ['#FDE100', '#000000', '#FDE100'],
  'atletico-de-madrid': ['#CB3524', '#ffffff', '#262E62'],
  'al-hilal': ['#0066B3', '#ffffff', '#0066B3'],
  'river-plate': ['#ffffff', '#E1122C', '#ffffff'],
  'alemania': ['#000000', '#DD0000', '#FFCE00'],
  'argentina': ['#75AADB', '#ffffff', '#75AADB'],
  'brasil': ['#FFDF00', '#009C3B', '#002776'],
  'espana': ['#AA151B', '#F1BF00', '#AA151B'],
  'francia': ['#002395', '#ffffff', '#ED2939'],
  'inglaterra': ['#ffffff', '#CE1124', '#ffffff'],
  'italia': ['#0064AA', '#ffffff', '#009246'],
  'japon': ['#0B1F5E', '#ffffff', '#BC002D'],
  'paises-bajos': ['#F36C21', '#ffffff', '#21468B'],
  'portugal': ['#006600', '#FF0000', '#006600'],
  'colombia': ['#FCD116', '#003893', '#CE1126'],
  'belgica': ['#C8102E', '#000000', '#FDDA24'],
};
const COLOR_POR_DEFECTO = ['#d4d4d8', '#a1a1aa', '#d4d4d8'];

const slug = (s) => s.toString().toLowerCase()
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const publico = (s) => NOMBRES[s] || s;

/* Siglas reconocibles; el resto se deducen del nombre */
const SIGLAS = {
  'real-madrid': 'RMA', 'barcelona': 'BAR', 'atletico-de-madrid': 'ATM',
  'manchester-united': 'MUN', 'manchester-city': 'MCI', 'liverpool': 'LIV',
  'arsenal': 'ARS', 'chelsea': 'CHE', 'newcastle': 'NEW', 'ajax': 'AJA',
  'juventus': 'JUV', 'ac-milan': 'MIL', 'inter-de-milan': 'INT', 'roma': 'ROM',
  'lazio': 'LAZ', 'fiorentina': 'FIO', 'napoli': 'NAP', 'bayern-munich': 'BAY',
  'borussia-dortmund': 'BVB', 'paris-saint-germain': 'PSG', 'sporting': 'SPO',
  'boca-juniors': 'BOC', 'river-plate': 'RIV', 'santos': 'SAN',
  'flamengo': 'FLA', 'corinthians': 'COR', 'al-hilal': 'HIL',
  'alemania': 'ALE', 'argentina': 'ARG', 'belgica': 'BEL', 'brasil': 'BRA',
  'colombia': 'COL', 'espana': 'ESP', 'francia': 'FRA', 'inglaterra': 'ING',
  'italia': 'ITA', 'japon': 'JAP', 'paises-bajos': 'HOL', 'portugal': 'POR',
};

/* Iniciales para la marca de agua de la tarjeta */
function iniciales(nombre, id) {
  if (SIGLAS[id]) return SIGLAS[id];
  const sin = nombre.normalize('NFD').replace(/[̀-ͯ]/g, '');
  const limpio = sin.replace(/\b(de|del|la|el|fc|cf|united|club)\b/gi, ' ').trim();
  const partes = limpio.split(/\s+/).filter(Boolean);
  if (partes.length >= 2) return (partes[0][0] + partes[1][0] + (partes[2] ? partes[2][0] : partes[1][1] || '')).toUpperCase().slice(0, 3);
  return sin.replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase();
}

/* "AC Milan 1997 - 1998 3Kit" -> { temporada:'1997-1998', variante:'Tercera' }
   alias: nombres con los que puede empezar la carpeta del modelo
   ("Arsenal FC" además de "Arsenal"), del más largo al más corto. */
function partirModelo(carpeta, alias) {
  let resto = carpeta;
  // "Corinthias FC" también debe probarse como "Corinthias"
  const conVariantes = alias.filter(Boolean).flatMap(a => [a, a.replace(/\s+(FC|CF|SC|United|Club)$/i, '')]);
  const orden = [...new Set(conVariantes)].sort((a, b) => b.length - a.length);
  for (const p of orden) {
    if (resto.toLowerCase().startsWith(p.toLowerCase())) { resto = resto.slice(p.length); break; }
  }
  resto = resto.replace(/^[\s\-–]+/, '').trim();
  // restos del nombre del club que quedan sueltos delante del año
  resto = resto.replace(/^(FC|CF|Fc|SC|United|Club)\b[\s\-–]*/i, '').trim();

  const mTemp = resto.match(/^(\d{4})\s*[-–]\s*(\d{2,4})|^(\d{4})/);
  let temporada = '';
  if (mTemp) {
    temporada = mTemp[0].replace(/\s*[-–]\s*/, '-').trim();
    resto = resto.slice(mTemp[0].length).trim();
  }
  resto = resto.replace(/^[\s\-–]+/, '').trim();

  const v = resto.toLowerCase();
  let variante = resto;
  if (/3\s*kit|tercera/.test(v)) variante = 'Tercera';
  else if (/visitante|visita/.test(v)) variante = 'Visitante';
  else if (/^local$/.test(v)) variante = 'Local';
  else if (/especial/.test(v)) variante = 'Edición especial';
  else if (/arquero|portero/.test(v)) variante = 'Arquero';
  else if (!resto) variante = '';

  return { temporada, variante, extra: resto && variante === resto ? resto : '' };
}

/* "Chelsea 3 KIT - 25-26.jpg" -> equipo, temporada, variante */
function partirShort(archivo) {
  let base = archivo.replace(/\.[^.]+$/, '').replace(/[}\]]/g, '').trim();
  const mTemp = base.match(/(\d{4}\s*-\s*\d{2,4}|\d{2}\s*-\s*\d{2})/);
  let temporada = '';
  if (mTemp) {
    temporada = mTemp[0].replace(/\s+/g, '');
    base = (base.slice(0, mTemp.index) + ' ' + base.slice(mTemp.index + mTemp[0].length)).trim();
  }
  base = base.replace(/\s*-\s*$/, '').replace(/^\s*-\s*/, '').trim();

  let variante = '';
  const mv = base.match(/\b(3\s*KIT|Visita|Visitante|Local|Mamba)\b/i);
  if (mv) {
    const t = mv[0].toLowerCase();
    variante = /3\s*kit/.test(t) ? 'Tercera' : /visit/.test(t) ? 'Visitante' : /local/.test(t) ? 'Local' : 'Mamba';
    base = (base.slice(0, mv.index) + ' ' + base.slice(mv.index + mv[0].length)).replace(/\s+/g, ' ').trim();
  }
  base = base.replace(/\s*-\s*$/, '').trim();
  return { equipo: publico(base), temporada, variante };
}

/* ---------------- Procesado de imágenes ---------------- */
async function generar(origen, destinoBase) {
  if (SOLO_DATOS) return;
  const plana = await sharp(origen).flatten({ background: '#ffffff' }).toBuffer();
  let recortada;
  try {
    recortada = await sharp(plana).trim({ threshold: 8 }).toBuffer();
  } catch { recortada = plana; }

  for (const w of WIDTHS) {
    const alto = Math.round(w * RATIO);
    const encajada = await sharp(recortada)
      .resize({
        width: Math.round(w * (1 - MARGEN * 2)),
        height: Math.round(alto * (1 - MARGEN * 2)),
        fit: 'inside'
      })
      .toBuffer();
    const lienzo = await sharp(encajada)
      .resize({ width: w, height: alto, fit: 'contain', background: '#ffffff' })
      .toBuffer();
    await sharp(lienzo).webp({ quality: 80, effort: 5 }).toFile(`${destinoBase}-${w}.webp`);
    await sharp(lienzo).avif({ quality: 58, effort: 5 }).toFile(`${destinoBase}-${w}.avif`);
  }
}

/* ---------------- Recorrido ---------------- */
const dirs = (d) => fs.readdirSync(d, { withFileTypes: true }).filter(e => e.isDirectory()).map(e => e.name).sort();
const imgs = (d) => fs.readdirSync(d, { withFileTypes: true })
  .filter(e => e.isFile() && /\.(jpe?g|png|webp)$/i.test(e.name)).map(e => e.name).sort();

(async () => {
  if (!SOLO_DATOS) fs.rmSync(OUT_IMG, { recursive: true, force: true });
  fs.mkdirSync(OUT_IMG, { recursive: true });

  const equipos = new Map();   // id -> { id, n, tipo, s, c }
  const productos = [];
  const vistos = new Set();    // nombres de archivo ya usados (evita duplicados anidados)
  const bases = new Set();     // rutas de imagen ya usadas (evita sobrescribir)
  let fotosHechas = 0;

  /* Dos carpetas distintas pueden dar la misma ruta (p. ej. "Holanda 26-27" y
     "Paises Bajos 26-27" se unifican en el mismo equipo): se numera la segunda. */
  function baseLibre(eqId, base) {
    let b = base, n = 2;
    while (bases.has(eqId + '/' + b)) b = base + '-' + n++;
    bases.add(eqId + '/' + b);
    return b;
  }

  function equipo(nombre, tipo) {
    const nom = publico(nombre);
    const id = slug(nom);
    if (!equipos.has(id)) {
      const real = SELECCIONES.has(nom) ? 'seleccion' : tipo;
      equipos.set(id, { id, n: nom, tipo: real, s: iniciales(nom, id), c: COLORES[id] || COLOR_POR_DEFECTO });
    }
    return equipos.get(id);
  }

  async function modelo(carpeta, eq, categoria, aliasCarpeta) {
    const archivos = imgs(carpeta).filter(f => !vistos.has(f));
    if (!archivos.length) return;
    archivos.forEach(f => vistos.add(f));

    const nombreCarpeta = path.basename(carpeta);
    let { temporada, variante } = partirModelo(nombreCarpeta, [aliasCarpeta, eq.n]);
    if (!temporada && !variante) variante = 'Retro';   // p. ej. la carpeta "Paises Bajos"
    const id = slug(`${eq.id}-${temporada || variante}-${variante}`);
    const dir = path.join(OUT_IMG, eq.id);
    fs.mkdirSync(dir, { recursive: true });

    const base = baseLibre(eq.id, slug(`${temporada || variante}-${variante}`));
    const usar = archivos.slice(0, MAX_FOTOS);
    for (let i = 0; i < usar.length; i++) {
      await generar(path.join(carpeta, usar[i]), path.join(dir, `${base}-${i + 1}`));
      fotosHechas++;
    }

    productos.push({
      id, eq: eq.id, n: [eq.n, temporada, variante].filter(Boolean).join(' '),
      t: temporada, v: variante, cat: categoria,
      img: `${eq.id}/${base}`, f: usar.length
    });
    process.stdout.write(`\r${productos.length} productos · ${fotosHechas} fotos   `);
  }

  /* --- RETROS --- */
  for (const [seccion, tipo] of [['SELECCIONES', 'seleccion'], ['CLUBES', 'club']]) {
    const raizSeccion = path.join(RAIZ, 'RETROS', seccion);
    if (!fs.existsSync(raizSeccion)) continue;

    for (const nombre of dirs(raizSeccion)) {
      const carpeta = path.join(raizSeccion, nombre);

      if (AGRUPADORES.has(nombre)) {                 // agrupador: un nivel más
        for (const club of dirs(carpeta)) {
          const eq = equipo(club, tipo);
          for (const m of dirs(path.join(carpeta, club))) {
            await modelo(path.join(carpeta, club, m), eq, 'retro', club);
          }
        }
        continue;
      }

      const eq = equipo(nombre, tipo);
      const sub = dirs(carpeta);
      if (imgs(carpeta).length) await modelo(carpeta, eq, 'retro', nombre);   // fotos sueltas
      for (const m of sub) await modelo(path.join(carpeta, m), eq, 'retro', nombre);
    }
  }

  /* --- SHORTS PLAYER: un archivo = un producto --- */
  const carpetaShorts = path.join(RAIZ, 'SHORTS PLAYER');
  if (fs.existsSync(carpetaShorts)) {
    for (const archivo of imgs(carpetaShorts)) {
      const { equipo: nomEq, temporada, variante } = partirShort(archivo);
      const eq = equipo(nomEq, 'club');
      const dir = path.join(OUT_IMG, eq.id);
      fs.mkdirSync(dir, { recursive: true });
      const base = baseLibre(eq.id, slug(`short-${temporada}-${variante}`));
      await generar(path.join(carpetaShorts, archivo), path.join(dir, `${base}-1`));
      fotosHechas++;
      productos.push({
        id: slug(`${eq.id}-${base}`), eq: eq.id,
        n: `Pantaloneta ${eq.n} ${temporada}`.trim(), t: temporada, v: variante,
        cat: 'shorts', img: `${eq.id}/${base}`, f: 1
      });
      process.stdout.write(`\r${productos.length} productos · ${fotosHechas} fotos   `);
    }
  }

  /* --- Salida --- */
  const lista = [...equipos.values()].sort((a, b) => a.n.localeCompare(b.n, 'es'));
  for (const e of lista) e.total = productos.filter(p => p.eq === e.id).length;

  productos.sort((a, b) => a.n.localeCompare(b.n, 'es'));

  const js = `/* GENERADO POR build-catalogo.js — no editar a mano.
   Para regenerar:  node build-catalogo.js
   ${lista.length} equipos · ${productos.length} productos · ${fotosHechas} fotos */
window.SV_CATALOGO = {
  equipos: ${JSON.stringify(lista, null, 0).replace(/\},\{/g, '},\n    {').replace(/^\[/, '[\n    ').replace(/\]$/, '\n  ]')},
  productos: ${JSON.stringify(productos, null, 0).replace(/\},\{/g, '},\n    {').replace(/^\[/, '[\n    ').replace(/\]$/, '\n  ]')}
};
`;
  fs.writeFileSync(OUT_JS, js, 'utf8');

  const peso = (d) => fs.readdirSync(d, { withFileTypes: true })
    .reduce((a, e) => a + (e.isDirectory() ? peso(path.join(d, e.name)) : fs.statSync(path.join(d, e.name)).size), 0);

  console.log('\n');
  console.log('equipos    :', lista.length);
  console.log('productos  :', productos.length);
  console.log('fotos      :', fotosHechas, '(x4 variantes)');
  console.log('assets/catalogo:', (peso(OUT_IMG) / 1024 / 1024).toFixed(1) + ' MB');
  console.log('catalogo.js:', (fs.statSync(OUT_JS).size / 1024).toFixed(0) + ' KB');
  console.log('\nselecciones:', lista.filter(e => e.tipo === 'seleccion').map(e => `${e.n}(${e.total})`).join(', '));
  console.log('\nclubes     :', lista.filter(e => e.tipo === 'club').map(e => `${e.n}(${e.total})`).join(', '));
})();
