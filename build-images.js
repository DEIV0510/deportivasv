/* Genera las variantes AVIF + WebP de las fotos de producto.
   Uso:  node build-images.js
*/
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SRC = 'C:/Users/Lenovo/Desktop/deporte';
const OUT = path.join(__dirname, 'assets', 'img');
fs.mkdirSync(OUT, { recursive: true });

/* Fotos tomadas contra la pared: ya vienen en vertical, se reescalan tal cual.
   nombre destino <- archivo original */
const MAP = {
  'arg-negra':      'Argentina.png',
  'arg-local':      'argentina2.png',
  'arg-local-det':  'argentina3.png',
  'chelsea-retro':  'chelsea.png',
  'chelsea-det':    'chelsea2.png',
  'colombia':       'colombia.png',
  'colombia-det':   'colombia2.png',
  'portugal-local': 'portugal.png',
  'portugal-det':   'portugal2.png',
  'portugal-away':  'portugal3.png',
  'portugal-away-det': 'portugal4.png',
};

/* Fotos de producto recortadas sobre blanco y en formato cuadrado.
   Se encajan en el mismo marco 3:4 del resto del catálogo, sobre blanco,
   para que no se recorte la prenda (una pantaloneta es más ancha que alta). */
const CUADRADAS = {
  'england-shorts':      'pantaloneta.png',
  'england-shorts-back': 'pantaloneta2.png',
  'england-shorts-det':  'pantaloneta3.png',
};

const WIDTHS = [340, 600];
const RATIO = 4 / 3;   // alto / ancho — mismo marco que las camisetas
const MARGEN = 0.05;   // aire alrededor de la prenda

async function guardar(buf, name, w, report) {
  const webp = path.join(OUT, `${name}-${w}.webp`);
  const avif = path.join(OUT, `${name}-${w}.avif`);
  await sharp(buf).webp({ quality: 94, effort: 6 }).toFile(webp);
  await sharp(buf).avif({ quality: 76, effort: 6 }).toFile(avif);
  report.push([path.basename(webp), fs.statSync(webp).size, path.basename(avif), fs.statSync(avif).size]);
}

(async () => {
  const report = [];

  for (const [name, file] of Object.entries(MAP)) {
    const src = path.join(SRC, file);
    for (const w of WIDTHS) {
      const buf = await sharp(src).resize({ width: w, withoutEnlargement: true }).toBuffer();
      await guardar(buf, name, w, report);
    }
  }

  for (const [name, file] of Object.entries(CUADRADAS)) {
    const src = path.join(SRC, file);
    const meta = await sharp(src).metadata();

    // Estas fotos traen una línea oscura de 1px en el borde superior: se recorta.
    // Cada paso se materializa a buffer; sharp no encadena bien varias
    // operaciones que cambian las dimensiones.
    const recortada = await sharp(src)
      .extract({ left: 2, top: 2, width: meta.width - 4, height: meta.height - 4 })
      .toBuffer();
    const plana = await sharp(recortada).flatten({ background: '#ffffff' }).toBuffer();
    const limpia = await sharp(plana).trim({ threshold: 6 }).toBuffer(); // ajusta al contorno

    for (const w of WIDTHS) {
      const alto = Math.round(w * RATIO);
      const buf = await sharp(limpia)
        .resize({
          width: Math.round(w * (1 - MARGEN * 2)),
          height: Math.round(alto * (1 - MARGEN * 2)),
          fit: 'inside',
          withoutEnlargement: false
        })
        .extend({
          top: 0, bottom: 0, left: 0, right: 0,
          background: '#ffffff'
        })
        .resize({ width: w, height: alto, fit: 'contain', background: '#ffffff' })
        .toBuffer();
      await guardar(buf, name, w, report);
    }
  }

  // Imagen para redes (1200x630 sobre negro); build-logo.js la vuelve a generar con el logo
  await sharp({ create: { width: 1200, height: 630, channels: 3, background: '#000000' } })
    .composite([{ input: await sharp(path.join(SRC, 'chelsea.png')).resize({ height: 630 }).toBuffer(), gravity: 'east' }])
    .jpeg({ quality: 94, mozjpeg: true })
    .toFile(path.join(OUT, 'og-tiendadeportivasv.jpg'));

  let total = 0;
  for (const r of report) { total += r[1] + r[3]; console.log(r[0], r[1] + 'B', '|', r[2], r[3] + 'B'); }
  console.log('TOTAL assets:', Math.round(total / 1024) + 'KB');
})();
