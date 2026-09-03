/* TiendaDeportivaSV — camisetas ya publicadas, con foto real.
   ------------------------------------------------------------------
   Son las que se despliegan al escoger un equipo en "Bajo pedido".
   Solo van aquí las que tienen fotografía propia en assets/img/.

     eq      id del equipo en equipos.js
     tt      nombre visible
     meta    línea secundaria (temporada, versión…)
     estado  'ok' disponible · 'pedido' bajo pedido · 'ask' consultar
     img     nombre base del archivo en assets/img/ (sin -340/-600)
     alt     texto alternativo de la foto
   ------------------------------------------------------------------ */
window.SV_PRODUCTOS = [
  {
    eq: 'argentina', tt: 'Argentina Local · #10', meta: 'Selección · Actual', estado: 'ask',
    img: 'arg-local', w: 612, h: 851,
    alt: 'Camiseta Argentina local blanca y celeste número 10 con parche FIFA World Champions 2022'
  },
  {
    eq: 'argentina', tt: 'Argentina Edición Negra · #10', meta: 'Selección · Edición especial', estado: 'ask',
    img: 'arg-negra', w: 615, h: 836,
    alt: 'Camiseta de Argentina edición especial negra con estampado ornamental azul, número 10 y parche de campeón del mundo'
  },
  {
    eq: 'colombia', tt: 'Selección Colombia', meta: 'Selección · Actual', estado: 'ask',
    img: 'colombia', w: 622, h: 852,
    alt: 'Camiseta de la Selección Colombia amarilla con detalles rojos y azules y escudo de la Federación'
  },
  {
    eq: 'portugal', tt: 'Portugal Local · #7', meta: 'Selección · Actual', estado: 'ask',
    img: 'portugal-local', w: 585, h: 888,
    alt: 'Camiseta de Portugal local roja con verde y el número 7, marca Puma'
  },
  {
    eq: 'portugal', tt: 'Portugal Visitante · #7', meta: 'Selección · Actual', estado: 'ask',
    img: 'portugal-away', w: 582, h: 886,
    alt: 'Camiseta visitante de Portugal blanca y verde con estampado, número 7, marca Puma'
  },
  {
    eq: 'chelsea', tt: 'Chelsea Retro · Negra', meta: 'Club · Retro', estado: 'ask',
    img: 'chelsea-retro', w: 597, h: 887,
    alt: 'Camiseta retro del Chelsea negra con ribetes azules y cuello gris, marca Nike'
  },
  {
    eq: 'inglaterra', tt: 'Pantaloneta Inglaterra', meta: 'Selección · Pantaloneta', estado: 'ask',
    img: 'england-shorts', w: 600, h: 800,
    alt: 'Pantaloneta de fútbol de Inglaterra blanca con laterales rojos, escudo de los tres leones y logo de Nike'
  }
];
