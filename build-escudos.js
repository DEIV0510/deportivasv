/* Genera los escudos oficiales de equipo en AVIF + WebP.

   Fuente: assets/brand/escudos-raw/<id>.{svg,jpg,png} — originales sin tocar
   (37 vectores de footylogos.com + 1 raster de 64x64 para Paris Saint-Germain,
   que footylogos.com no tiene). El <id> es el mismo slug que usa catalogo.js.

   Uso:  node build-escudos.js

   Nota sobre marcas: son los escudos oficiales de cada club/selección. Se usan
   aquí por decisión explícita del cliente, quien entendió y aceptó que esto es
   distinto de usar solo colores + iniciales (la opción sin marcas de terceros
   que tenía el sitio antes).
*/
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const RAW = path.join(__dirname, 'assets', 'brand', 'escudos-raw');
const OUT = path.join(__dirname, 'assets', 'escudos');
const WIDTHS = [160, 320];   // suficiente para cualquier tamaño real de insignia + retina
const LADO_SVG = 400;        // resolución de rasterizado de los vectores antes de reducir
const MARGEN = 0.08;         // aire alrededor del escudo dentro del lienzo cuadrado

fs.mkdirSync(OUT, { recursive: true });

const archivos = fs.readdirSync(RAW).filter(f => /\.(svg|jpg|png)$/i.test(f));

(async () => {
  const anchoReal = {};
  for (const archivo of archivos) {
    const id = archivo.replace(/\.[^.]+$/, '');
    const esVector = archivo.endsWith('.svg');
    const origen = path.join(RAW, archivo);

    // Base cuadrada de trabajo: los vectores se rasterizan grandes (sin techo
    // de calidad); el raster (PSG) nunca se amplía más allá de su tamaño real.
    let base;
    if (esVector) {
      base = await sharp(origen, { density: 300 })
        .resize({ width: LADO_SVG, height: LADO_SVG, fit: 'inside' })
        .toBuffer();
    } else {
      const meta = await sharp(origen).metadata();
      base = await sharp(origen)
        .resize({ width: meta.width, height: meta.height, withoutEnlargement: true })
        .toBuffer();
    }
    const metaBase = await sharp(base).metadata();
    const ladoNativo = Math.max(metaBase.width, metaBase.height);

    for (const w of WIDTHS) {
      // nunca amplía: si el nativo es menor que el objetivo, usa el nativo
      const lado = esVector ? w : Math.min(w, ladoNativo);
      const util = Math.round(lado * (1 - MARGEN * 2));
      const encajado = await sharp(base)
        .resize({ width: util, height: util, fit: 'inside', withoutEnlargement: true })
        .toBuffer();
      // Sin fondo: se conserva el alfa real del escudo (todos lo traen menos
      // el raster de PSG, que al ser JPEG no tiene canal alfa que conservar).
      const lienzo = await sharp(encajado)
        .resize({ width: lado, height: lado, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .toBuffer();
      await sharp(lienzo).webp({ quality: 92, effort: 6, alphaQuality: 100 }).toFile(path.join(OUT, `${id}-${w}.webp`));
      await sharp(lienzo).avif({ quality: 74, effort: 6 }).toFile(path.join(OUT, `${id}-${w}.avif`));
      anchoReal[`${id}-${w}`] = lado;
    }
    process.stdout.write('.');
  }
  console.log('\n' + archivos.length, 'escudos procesados ->', OUT);

  // Manifiesto: qué equipos tienen escudo real, para que el cliente sepa
  // cuándo mostrar la imagen y cuándo caer al monograma de colores.
  const ids = archivos.map(a => a.replace(/\.[^.]+$/, '')).sort();
  const contenidoManifiesto = [
    '/* GENERADO POR build-escudos.js — no editar a mano. */',
    'window.SV_ESCUDOS = ' + JSON.stringify(ids) + ';',
    ''
  ].join(String.fromCharCode(10));
  fs.writeFileSync(path.join(__dirname, 'assets', 'js', 'escudos.js'), contenidoManifiesto);
  console.log('assets/js/escudos.js:', ids.length, 'ids');

  const chicos = archivos
    .map(a => a.replace(/\.[^.]+$/, ''))
    .filter(id => WIDTHS.some(w => anchoReal[`${id}-${w}`] < w));
  if (chicos.length) {
    console.log('la fuente no llega al objetivo en (nunca se amplía):');
    chicos.forEach(id => console.log('  ', id, '->', WIDTHS.map(w => anchoReal[`${id}-${w}`] + 'px').join(' / ')));
  }
})();
