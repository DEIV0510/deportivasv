# TiendaDeportivaSV

Tienda virtual de camisetas de fútbol (actuales y retro), shorts, hoodies, chaquetas y prendas
lifestyle. Villavicencio, Colombia. Toda la conversión ocurre por **WhatsApp**.

- **WhatsApp:** 314 643 0972 → `https://wa.me/573146430972`
- **Instagram:** [@tiendadeportivasv_](https://www.instagram.com/tiendadeportivasv_/)
- **TikTok:** [@tiendadeportivasv](https://www.tiktok.com/@tiendadeportivasv)

## Stack

HTML + CSS + JavaScript vanilla. Sin frameworks, sin librerías externas.
Solo se cargan desde fuera las fuentes de Google (Anton + Inter) con `display=swap`.

## Ejecutar en local

```bash
node serve.js
```

Abre http://localhost:5260

## Estructura

```
index.html                 Toda la página (contenido en HTML, sin render por JS)
assets/css/styles.css      Estilos (el CSS crítico va en línea dentro de index.html)
assets/js/app.js           Loader, menú móvil, filtros, reveal, scrollspy
assets/img/                Imágenes optimizadas en AVIF + WebP (340w y 600w)
assets/video/              3 clips reales de la tienda (preload="none")
build-images.js            Regenera assets/img desde la carpeta de fotos originales
serve.js                   Servidor estático de desarrollo
```

## Rendimiento

Medido en local sobre esta versión:

| Métrica                    | Valor    |
|----------------------------|----------|
| Peticiones iniciales       | 12       |
| Peso inicial transferido   | ~185 KB  |
| First Contentful Paint     | ~76 ms   |
| Bytes de video en la carga | 0        |

Cómo se consigue:

- Imágenes en AVIF con respaldo WebP, dos anchos (`340w` / `600w`) y `sizes` reales.
- Foto del hero con `preload` + `imagesrcset` + `fetchpriority="high"`; el resto con `loading="lazy"`.
- Videos con `preload="none"` y póster de marca: no descargan un solo byte hasta que se pulsa play.
- CSS crítico en línea; `app.js` con `defer` y sin dependencias.
- Pantalla de carga con mínimo 0,5 s y tope duro de 1,1 s.

## Cosas que hay que editar cuando cambie el negocio

### 1. Disponibilidad de cada producto

En `index.html`, dentro de cada tarjeta:

```html
<span class="tag tag--ask">CONSULTAR</span>
```

Cambia el texto y la clase:

| Clase         | Uso                  |
|---------------|----------------------|
| `tag--now`    | Entrega inmediata    |
| `tag--order`  | Bajo pedido          |
| `tag--ask`    | Consultar (por defecto) |

### 2. Precios

Hoy ninguna tarjeta muestra precio: dice **"Consultar precio"** porque los recursos entregados
no incluían listas de precios. Para publicarlos, reemplaza el texto de `<p class="card-pr">`.

### 3. Reseñas

**No hay testimonios inventados en la página.** El arreglo `REVIEWS` en `assets/js/app.js`
está vacío a propósito. Cuando tengas reseñas reales:

```js
var REVIEWS = [
  { nombre: 'Nombre A.', ciudad: 'Villavicencio', texto: 'La reseña tal cual la escribió el cliente.' }
];
```

Las tarjetas se generan solas y el bloque de invitación desaparece.

### 4. Añadir productos

Duplica un `<article class="card">` dentro de `#grid`, cambia imagen, nombre, categoría
(`data-cat="actuales"` o `data-cat="retro"`) y el texto del enlace de WhatsApp.

### 5. Regenerar imágenes

`build-images.js` lee la carpeta original de fotos (`SRC` al inicio del archivo) y produce
todas las variantes AVIF/WebP:

```bash
npm install
node build-images.js
```

## Dominio

`index.html`, `robots.txt` y `sitemap.xml` usan `https://tiendadeportivasv.com/` como URL
canónica. Cámbialo por el dominio real antes de publicar.
