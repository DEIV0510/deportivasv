# TiendaDeportivaSV

Tienda virtual de camisetas de fútbol (actuales y retro), shorts, hoodies, chaquetas y prendas
lifestyle. Villavicencio, Colombia. Toda la conversión ocurre por **WhatsApp**.

- **WhatsApp:** 314 643 0972 → `https://wa.me/573146430972`
- **Instagram:** [@tiendadeportivasv_](https://www.instagram.com/tiendadeportivasv_/)
- **TikTok:** [@tiendadeportivasv](https://www.tiktok.com/@tiendadeportivasv)

## Stack

HTML + CSS + JavaScript vanilla. Sin frameworks, sin librerías externas.
Solo se cargan desde fuera las fuentes de Google (Archivo Black + Inter) con `display=swap`.

**Paleta:** solo negro, blanco y grises. El único color de la interfaz es el verde de los
botones de WhatsApp, porque identifica el canal de venta. Las fotos de las camisetas y las
franjas de color de cada equipo son contenido, no decoración.

## Ejecutar en local

```bash
node serve.js
```

Abre http://localhost:5260

## Páginas

| Archivo | Qué es |
|---|---|
| `index.html` | Portada: hero, lo más buscado, equipos, modalidades, destacados, confianza, redes |
| `catalogo.html` | Catálogo completo con buscador, selector de equipo, filtros y "Ver más" |
| `bajo-pedido.html` | Escoge un equipo y se despliegan sus camisetas |
| `tallas.html` | Tabla de tallas orientativa y cómo medir |
| `rastrear.html` | Formulario que abre WhatsApp con la consulta del pedido |
| `p/<id>.html` | **Una ficha por producto** (205). Generadas desde el catálogo |

El catálogo, las grillas de equipos y las fichas **se generan solos** desde
`assets/js/catalogo.js` (ver más abajo). Las páginas no llevan productos escritos a mano.

### Ficha de producto

Tocar un producto ya **no abre WhatsApp directamente**: lleva a su ficha, con migas de pan,
galería (frente y espalda), nombre, vendedor, precio, selector de talla, detalles, chips para
seguir buscando y modelos relacionados. WhatsApp se abre desde ahí, y **la talla escogida se
incluye en el mensaje**.

Cada ficha es una página real: se puede compartir por WhatsApp o Instagram, el botón atrás
funciona y Google la indexa (las 205 están en el `sitemap.xml`).

## Estructura

```
index.html                 Portada. Es la FUENTE del encabezado, la cinta y el pie.
catalogo.html              \
bajo-pedido.html            | Generadas por build-pages.js — no las edites a mano
tallas.html                 |
rastrear.html               |
p/*.html                   /  205 fichas de producto
assets/css/styles.css      Estilos (el CSS crítico va en línea dentro de cada página)
assets/js/app.js           Loader, menú, catálogo, paneles de equipo, reveal
assets/js/catalogo.js      GENERADO: equipos y productos (no editar a mano)
assets/catalogo/           GENERADO: fotos en AVIF + WebP (340w, 600w y grande cuadrada)
assets/img/                Fotos de la portada, logo, pósters y og
assets/video/              3 clips reales de la tienda (preload="none")
assets/brand/              Logo original y foto base, para regenerar los assets
build-catalogo.js          Lee la carpeta del cliente y genera catalogo.js + assets/catalogo
build-pages.js             Genera las 4 páginas interiores + las 205 fichas + el sitemap
build-images.js            Regenera assets/img desde las fotos de la portada
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

Catálogo: **205 productos · 38 equipos · 367 fotos** (134 MB en `assets/catalogo/`, 6 variantes por foto).

La foto del visor pesa más de lo que pesaba antes — es la decisión explícita de priorizar
calidad máxima sobre peso mínimo para esa imagen concreta (una foto de producto a 1600 px
y calidad casi sin pérdida pesa lo que pesa; en Barcelona 1998-1999, por ejemplo, 136 KB
en AVIF). El resto de la página sigue ligero:

| Recurso | Peso |
|---|---|
| `styles.css` | 33 KB |
| `app.js` | 21 KB |
| `catalogo.js` (205 productos + 38 equipos) | 36 KB |
| Foto principal del visor (AVIF, varía por foto) | 30–230 KB |

Cómo se mantiene rápido a pesar de eso:

- Imágenes en AVIF con respaldo WebP: `340w`/`600w` para tarjetas y una grande cuadrada
  de hasta 1600 px para el visor de la ficha, con `sizes` reales y calidad al máximo.
- Foto del hero con `preload` + `imagesrcset` + `fetchpriority="high"`; el resto con `loading="lazy"`.
- Videos con `preload="none"` y póster de marca: no descargan un solo byte hasta que se pulsa play.
- CSS crítico en línea; los scripts con `defer` y sin dependencias.
- Pantalla de carga con mínimo 0,5 s y tope duro de 1,1 s.
- El catálogo muestra 24 productos y carga más al pulsar «Ver más»: no se pintan
  205 tarjetas de golpe.

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
no incluían listas de precios.

Para publicarlos hay dos sitios:

- **Catálogo y paneles de equipo** → en `assets/js/app.js`, el texto `Consultar precio`
  dentro de `tarjetaProducto()` y `tarjetaModelo()`. Si los precios varían por producto,
  añade un campo `precio` en `build-catalogo.js` y léelo aquí.
- **Fichas de producto** → en `build-pages.js`, el `<p class="pdp-precio">` de
  `fichaProducto()`. Ahí también está el selector de tallas (`TALLAS`).
- **Portada** → los cuatro `<p class="pcard-price">` de `index.html`.

Tras cambiarlo, ejecuta `node build-pages.js` para regenerar las 205 fichas.

### 2. Destacar un producto

El badge **TOP** solo se usa en las tarjetas de la portada
(`<span class="badge badge-top">` en `index.html`).

### 3. Reseñas

**No hay testimonios inventados en la página.** El arreglo `REVIEWS` en `assets/js/app.js`
está vacío a propósito. Cuando tengas reseñas reales:

```js
var REVIEWS = [
  { nombre: 'Nombre A.', ciudad: 'Villavicencio', texto: 'La reseña tal cual la escribió el cliente.' }
];
```

Las tarjetas se generan solas y el bloque de invitación desaparece.

### 4. El catálogo (esto es lo importante)

**Todo el catálogo sale de una carpeta de fotos.** No se escribe ningún producto a mano.

```bash
node build-catalogo.js            # usa C:\Users\Lenovo\Desktop\catalogosv
node build-catalogo.js "D:/otra/ruta"
```

El script recorre la carpeta, optimiza cada foto y escribe `assets/js/catalogo.js`.
Tarda unos minutos (procesa cientos de imágenes).

**Estructura que espera la carpeta:**

```
RETROS/
  SELECCIONES/<Selección>/<Selección AÑO Variante>/foto1.jpg, foto2.jpg
  CLUBES/<Club>/<Club AÑO Variante>/foto1.jpg, foto2.jpg
  CLUBES/<Agrupador>/<Club>/<Club AÑO Variante>/...     ← ej. "Clubes Sudamericanos"
SHORTS PLAYER/
  <Equipo Temporada Variante>.jpg                        ← un archivo = un producto
```

Dentro de cada carpeta de modelo, **la primera foto por orden alfabético es el frente y la
segunda la espalda** (la segunda se muestra al pasar el mouse). Si hay más de dos, se usan
las dos primeras.

**Dos juegos de imágenes por foto** (esto importa para la nitidez):

| Variante | Forma | Para qué |
|---|---|---|
| `-340`, `-600` | Marco vertical 3:4 | Tarjetas del catálogo, grillas y relacionados |
| `-g` | Cuadrado hasta 1600 px | Visor grande de la ficha de producto |

La grande es **cuadrada y no 3:4** a propósito: el marco vertical arrastra una franja
blanca que no se ve y duplica el peso del archivo. 1600 px cubre con margen cualquier
pantalla real (retina de escritorio y DPR3 de celular). **Nunca se amplía**: si el
original no llega, la foto se sirve en su propio máximo real — el `width`/`height`
del HTML se lee del archivo generado, nunca se da por supuesto.

Calidad de compresión al máximo razonable en las tres variantes: WebP 92 (94 en la
grande), AVIF 74 (76 en la grande), esfuerzo de codificación al tope (6). Lo mismo en
`build-images.js` y `build-logo.js` para las fotos de portada, el OG y los pósters
de video — ninguna imagen del sitio se queda con la calidad de compresión por defecto.

> **Regla para no repetir un error que ya cometimos:** si muestras una foto más grande
> que antes, comprueba que el archivo servido tenga **al menos el doble** de píxeles que
> su tamaño en pantalla. Si no, el navegador la estira y se ve blanda aunque el original
> sea excelente.

**Lo que el script hace solo:**

- Reconoce la temporada y la variante del nombre de la carpeta: `3Kit`→Tercera,
  `Visita`→Visitante, `Especial`→Edición especial, `Arquero`, `Local`.
- Quita el sufijo del club (`Arsenal FC 2001 - 2002` → Arsenal, 2001-2002).
- Recorta cada foto al contorno de la prenda y la encaja en el marco 3:4 sobre blanco.
- Salta duplicados: si el mismo archivo aparece en dos carpetas anidadas, solo cuenta una vez.
- Marca como selección los equipos de la lista `SELECCIONES` (los shorts no traen esa pista).

**Lo que hay que mantener a mano dentro de `build-catalogo.js`:**

| Constante | Para qué |
|---|---|
| `NOMBRES` | Corrige erratas y unifica (`Florentina`→Fiorentina, `Holanda`→Países Bajos) |
| `COLORES` | La franja de color de cada equipo. Si falta, sale gris |
| `SELECCIONES` | Qué equipos son selección nacional |
| `AGRUPADORES` | Carpetas que agrupan clubes y no son un equipo |

Si solo cambias nombres, colores o siglas, **no hace falta reprocesar las fotos**:

```bash
node build-catalogo.js --solo-datos
```

**No se usan escudos ni logos de terceros:** cada equipo se identifica con sus colores y sus
iniciales (`SIGLAS` en el script).

### 5. Fotos de la portada

`build-images.js` es solo para las fotos que salen en la portada (hero y destacados). Tiene
dos listas: `MAP` para las verticales contra la pared y `CUADRADAS` para las recortadas sobre
blanco. Pon el archivo en la que corresponda y ejecuta `node build-images.js`.

### 6. Tabla de tallas

Las medidas de `tallas.html` son **una referencia general de camiseta de fútbol**, no medidas
tomadas de tus prendas. Reemplázalas en `build-pages.js` cuando midas tu stock real.

## Dominio

`index.html`, `build-pages.js`, `robots.txt` y `sitemap.xml` usan `https://tiendadeportivasv.com/`
como URL canónica. Cámbialo por el dominio real antes de publicar.
