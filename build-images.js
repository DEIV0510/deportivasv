const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SRC = 'C:/Users/Lenovo/Desktop/deporte';
const OUT = path.join(__dirname, 'assets', 'img');
fs.mkdirSync(OUT, { recursive: true });

// nombre destino <- archivo original
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

const WIDTHS = [340, 600];

(async () => {
  const report = [];
  for (const [name, file] of Object.entries(MAP)) {
    const src = path.join(SRC, file);
    for (const w of WIDTHS) {
      const base = sharp(src).resize({ width: w, withoutEnlargement: true });
      const webp = path.join(OUT, `${name}-${w}.webp`);
      const avif = path.join(OUT, `${name}-${w}.avif`);
      await base.clone().webp({ quality: 80, effort: 6 }).toFile(webp);
      await base.clone().avif({ quality: 58, effort: 6 }).toFile(avif);
      report.push([path.basename(webp), fs.statSync(webp).size, path.basename(avif), fs.statSync(avif).size]);
    }
  }
  // placeholder social / og (1200x630 sobre negro)
  await sharp({ create: { width: 1200, height: 630, channels: 3, background: '#000000' } })
    .composite([{ input: await sharp(path.join(SRC, 'chelsea.png')).resize({ height: 630 }).toBuffer(), gravity: 'east' }])
    .jpeg({ quality: 82 })
    .toFile(path.join(OUT, 'og-tiendadeportivasv.jpg'));

  let total = 0;
  for (const r of report) { total += r[1] + r[3]; console.log(r[0], r[1] + 'B', '|', r[2], r[3] + 'B'); }
  console.log('TOTAL assets:', Math.round(total / 1024) + 'KB');
})();
