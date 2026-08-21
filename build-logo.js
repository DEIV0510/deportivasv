/* Genera las piezas del logo (lockup, monograma, favicon, OG y pósters de video)
   a partir del PNG original del logo: blanco sobre fondo negro sólido.

   Uso:  node build-logo.js [ruta/al/logo.png]
*/
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SRC = process.argv[2] || path.join(__dirname, 'assets', 'brand', 'logo-original.png');
const FOTO_HERO = path.join(__dirname, 'assets', 'brand', 'foto-og.png'); // foto de fondo de la imagen OG
const OUT = path.join(__dirname, 'assets', 'img');

/* El logo es blanco puro sobre negro puro: usamos su luminancia como canal alfa
   para obtener un PNG blanco con transparencia real. */
async function aBlancoConAlfa(buf) {
  const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const out = Buffer.alloc(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    const l = Math.round(0.2126 * data[i * 4] + 0.7152 * data[i * 4 + 1] + 0.0722 * data[i * 4 + 2]);
    out[i * 4] = 255; out[i * 4 + 1] = 255; out[i * 4 + 2] = 255; out[i * 4 + 3] = l;
  }
  return sharp(out, { raw: { width: w, height: h, channels: 4 } });
}

/* Devuelve el recuadro ocupado por píxeles claros dentro de un buffer. */
async function caja(buf) {
  const g = await sharp(buf).greyscale().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H } = g.info;
  let x0 = W, x1 = 0, y0 = H, y1 = 0;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (g.data[y * W + x] > 90) {
        if (x < x0) x0 = x; if (x > x1) x1 = x;
        if (y < y0) y0 = y; if (y > y1) y1 = y;
      }
    }
  }
  return { W, H, x0, x1, y0, y1, filas: g };
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });

  // 1. Recorta el marco negro -> lockup completo
  const lockup = await sharp(SRC).trim({ threshold: 20 }).toBuffer();
  const lm = await sharp(lockup).metadata();

  // 2. Separa el monograma del texto buscando la franja vacía entre ambos
  const c = await caja(lockup);
  const filasClaras = [];
  for (let y = 0; y < c.H; y++) {
    let n = 0;
    for (let x = 0; x < c.W; x++) if (c.filas.data[y * c.W + x] > 90) n++;
    filasClaras.push(n);
  }
  let corte = c.H, inicio = -1;
  for (let y = 0; y < c.H; y++) {
    if (filasClaras[y] === 0) { if (inicio < 0) inicio = y; }
    else { if (inicio >= 0 && y - inicio > 4) { corte = inicio; break; } inicio = -1; }
  }
  const arriba = await sharp(lockup).extract({ left: 0, top: 0, width: c.W, height: corte }).toBuffer();
  const ca = await caja(arriba);
  const marca = await sharp(arriba)
    .extract({ left: ca.x0, top: 0, width: ca.x1 - ca.x0 + 1, height: corte })
    .toBuffer();

  // 3. Exporta lockup y monograma (PNG con paleta: más liviano que WebP para trazo plano)
  for (const [nombre, buf, anchos] of [['logo-sv-lockup', lockup, [560, 300]], ['logo-sv-mark', marca, [200, 96]]]) {
    for (const w of anchos) {
      const f = path.join(OUT, `${nombre}-${w}.png`);
      await (await aBlancoConAlfa(buf)).resize({ width: w })
        .png({ compressionLevel: 9, palette: true, colors: 64 }).toFile(f);
      console.log(path.basename(f), fs.statSync(f).size + 'B');
    }
  }

  // 4. Favicon: monograma blanco centrado sobre negro
  const fav = await (await aBlancoConAlfa(marca)).resize({ width: 54 }).png().toBuffer();
  await sharp({ create: { width: 64, height: 64, channels: 4, background: '#000000' } })
    .composite([{ input: fav, gravity: 'center' }]).png().toFile(path.join(OUT, 'favicon-sv.png'));

  // 5. Imagen Open Graph: foto a la derecha, logo a la izquierda
  await sharp({ create: { width: 1200, height: 630, channels: 3, background: '#000000' } })
    .composite([
      { input: await sharp(FOTO_HERO).resize({ height: 630 }).toBuffer(), gravity: 'east' },
      { input: await (await aBlancoConAlfa(lockup)).resize({ width: 620 }).png().toBuffer(), top: 200, left: 70 }
    ])
    .jpeg({ quality: 84 }).toFile(path.join(OUT, 'og-tiendadeportivasv.jpg'));

  // 6. Pósters de los videos (no hay ffmpeg para sacar fotogramas reales)
  const pm = await (await aBlancoConAlfa(marca)).resize({ width: 230 }).png().toBuffer();
  const clips = [
    ['sv-retro', 'RETRO', 'CAMISETAS QUE MARCARON UNA ÉPOCA'],
    ['sv-shorts', 'SHORTS', 'VERSIÓN JUGADOR'],
    ['sv-alemania', 'SELECCIÓN', 'ALEMANA']
  ];
  for (const [n, t1, t2] of clips) {
    const svg = Buffer.from(`<svg xmlns='http://www.w3.org/2000/svg' width='540' height='960'>
<rect width='540' height='960' fill='#0a0a0b'/>
<circle cx='270' cy='470' r='46' fill='none' stroke='#ffffff' stroke-opacity='.7' stroke-width='2'/>
<path d='M258 450 L292 470 L258 490 Z' fill='#ffffff' fill-opacity='.85'/>
<text x='270' y='640' text-anchor='middle' font-family='Arial Black, Arial' font-size='42' font-weight='900' fill='#ffffff' letter-spacing='2'>${t1}</text>
<text x='270' y='680' text-anchor='middle' font-family='Arial' font-size='17' fill='#9a9aa2' letter-spacing='3'>${t2}</text></svg>`);
    await sharp(svg).composite([{ input: pm, top: 250, left: 155 }])
      .webp({ quality: 80 }).toFile(path.join(OUT, `poster-${n}.webp`));
  }

  console.log(`origen ${lm.width}x${lm.height} · corte monograma en y=${corte} · listo`);
})();
