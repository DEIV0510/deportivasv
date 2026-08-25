# TiendaDeportivaSV

Tienda virtual de camisetas de fútbol (actuales y retro), shorts, hoodies, chaquetas y prendas
lifestyle. Villavicencio, Colombia. Toda la conversión ocurre por **WhatsApp**.

- **WhatsApp:** 314 643 0972 → `https://wa.me/573146430972`
- **Instagram:** [@tiendadeportivasv_](https://www.instagram.com/tiendadeportivasv_/)
- **TikTok:** [@tiendadeportivasv](https://www.tiktok.com/@tiendadeportivasv)

## Stack

HTML + CSS + JavaScript vanilla. Sin frameworks, sin librerías externas.
Solo se cargan desde fuera las fuentes de Google (Archivo Black + Inter) con `display=swap`.

## Ejecutar en local

```bash
node serve.js
```

Abre http://localhost:5260

## Páginas

| Archivo | Qué es |
|---|---|
| `index.html` | Portada: hero, lo más buscado, equipos, modalidades, destacados, confianza, redes |
| `catalogo.html` | Catálogo agrupado por equipo, con buscador y filtros Actuales / Retro |
| `bajo-pedido.html` | Escoge un equipo: selecciones, clubes y fútbol colombiano |
| `tallas.html` | Tabla de tallas orientativa y cómo medir |
| `rastrear.html` | Formulario que abre WhatsApp con la consulta del pedido |

## Estructura

```
index.html                 Portada. Es la FUENTE del encabezado, la cinta y el pie.
catalogo.html              \
bajo-pedido.html            | Generadas por build-pages.js — no las edites a mano
tallas.html                 |
rastrear.html              /
assets/css/styles.css      Estilos (el CSS crítico va en línea dentro de cada página)
assets/js/app.js           Loader, menú, buscador, filtros, grillas, reveal
assets/js/equipos.js       Lista de equipos disponibles bajo pedido
assets/img/                Imágenes en AVIF + WebP (340w y 600w) y el logo en PNG
assets/video/              3 clips reales de la tienda (preload="none")
assets/brand/              Logo original y foto base, para regenerar los assets
build-pages.js             Genera las 4 páginas interiores
build-images.js            Regenera assets/img desde las fotos originales
build-logo.js              Regenera las piezas del logo
serve.js                   Servidor estático de desarrollo
```

### Cómo se mantienen sincronizadas las páginas

El encabezado, la cinta negra y el pie viven **solo en `index.html`**. `build-pages.js` los
extrae de ahí y los inyecta en las otras cuatro. Por eso:

1. Si cambias el menú, el logo o el pie → edita `index.html` y ejecuta:

```bash
node build-pages.js
```

2. Si cambias el contenido de una página interior → edita `build-pages.js`, no el `.html`
   generado (se sobrescribe en la siguiente ejecución).

## Rendimiento

Medido en local sobre la portada:

| Métrica                    | Valor    |
|----------------------------|----------|
| Peticiones iniciales       | 21       |
| Peso inicial transferido   | ~298 KB  |
| First Contentful Paint     | ~124 ms  |
| Bytes de video en la carga | 0        |

Cómo se consigue:

- Imágenes en AVIF con respaldo WebP, dos anchos (`340w` / `600w`) y `sizes` reales.
- Foto del hero con `preload` + `imagesrcset` + `fetchpriority="high"`; el resto con `loading="lazy"`.
- Videos con `preload="none"` y póster de marca: no descargan un solo byte hasta que se pulsa play.
- CSS crítico en línea; los scripts con `defer` y sin dependencias.
- Pantalla de carga con mínimo 0,5 s y tope duro de 1,1 s.

## Logo

El logo oficial vive en `assets/img/` en cuatro variantes, generadas desde el PNG original
(marco negro recortado y trazo convertido a transparencia real):

| Archivo | Uso |
|---|---|
| `logo-sv-lockup-dark-560.png` | Pantalla de carga (fondo blanco) |
| `logo-sv-mark-dark-96.png` | Monograma de la barra superior |
| `logo-sv-mark-96.png` | Monograma del pie (fondo negro) |
| `logo-sv-lockup-560.png` / `-300.png` | Lockup en blanco, para fondos oscuros |
| `favicon-sv.png` | Favicon y apple-touch-icon |

Si cambias el logo, regenera todo con `node build-logo.js`.

## Cosas que hay que editar cuando cambie el negocio

### 1. Precios

Ninguna tarjeta muestra precio: dice **"Consultar precio"** porque los recursos entregados
no incluían listas de precios. Para publicarlos, reemplaza el texto de `<p class="pcard-price">`
en `index.html` y en la plantilla `pcard()` de `build-pages.js`.

### 2. Destacar un producto

El badge amarillo **TOP** se controla con `top: true` en `build-pages.js` (objeto `P`).
En `index.html` es el `<span class="badge badge-top">` de cada tarjeta.

### 3. Reseñas

**No hay testimonios inventados en la página.** El arreglo `REVIEWS` en `assets/js/app.js`
está vacío a propósito. Cuando tengas reseñas reales:

```js
var REVIEWS = [
  { nombre: 'Nombre A.', ciudad: 'Villavicencio', texto: 'La reseña tal cual la escribió el cliente.' }
];
```

Las tarjetas se generan solas y el bloque de invitación desaparece.

### 4. Equipos de "bajo pedido"

Edita `assets/js/equipos.js`. Cada equipo es `{ n: nombre, s: iniciales, c: [color1, color2, color3] }`.
Los colores forman la franja superior de la tarjeta. **No se usan escudos ni logos de terceros.**

### 5. Añadir productos al catálogo

Agrega una entrada al objeto `P` de `build-pages.js`, súmala al `grupo()` correspondiente y
ejecuta `node build-pages.js`. Las imágenes deben existir en `assets/img/` como
`<nombre>-340.avif|webp` y `<nombre>-600.avif|webp` (las genera `build-images.js`).

### 6. Tabla de tallas

Las medidas de `tallas.html` son **una referencia general de camiseta de fútbol**, no medidas
tomadas de tus prendas. Reemplázalas en `build-pages.js` cuando midas tu stock real.

## Dominio

`index.html`, `build-pages.js`, `robots.txt` y `sitemap.xml` usan `https://tiendadeportivasv.com/`
como URL canónica. Cámbialo por el dominio real antes de publicar.
