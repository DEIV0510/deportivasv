/* TiendaDeportivaSV — equipos disponibles bajo pedido.
   ------------------------------------------------------------------
   Para agregar, quitar o reordenar equipos edita solo este archivo.

   Cada equipo:
     n  nombre visible
     s  iniciales (marca de agua de la tarjeta)
     c  [color1, color2, color3] de la franja superior
     id identificador para enlazar con los productos reales de productos.js
        (opcional: solo los equipos que ya tienen camisetas publicadas)

   Los colores son los tradicionales del equipo. No se usan escudos ni
   logos de terceros.
   ------------------------------------------------------------------ */
window.SV_EQUIPOS = {

  /* 12 selecciones */
  selecciones: [
    { n: 'Argentina',  s: 'ARG', id: 'argentina', c: ['#75AADB', '#ffffff', '#75AADB'] },
    { n: 'Brasil',     s: 'BRA', c: ['#FFDF00', '#009C3B', '#002776'] },
    { n: 'Colombia',   s: 'COL', id: 'colombia',  c: ['#FCD116', '#003893', '#CE1126'] },
    { n: 'Alemania',   s: 'ALE', c: ['#000000', '#DD0000', '#FFCE00'] },
    { n: 'España',     s: 'ESP', c: ['#AA151B', '#F1BF00', '#AA151B'] },
    { n: 'Inglaterra', s: 'ING', id: 'inglaterra', c: ['#ffffff', '#CE1124', '#ffffff'] },
    { n: 'Italia',     s: 'ITA', c: ['#0064AA', '#ffffff', '#009246'] },
    { n: 'Francia',    s: 'FRA', c: ['#002395', '#ffffff', '#ED2939'] },
    { n: 'Portugal',   s: 'POR', id: 'portugal',  c: ['#006600', '#FF0000', '#006600'] },
    { n: 'Holanda',    s: 'HOL', c: ['#F36C21', '#ffffff', '#21468B'] },
    { n: 'Uruguay',    s: 'URU', c: ['#7BAFD4', '#ffffff', '#7BAFD4'] },
    { n: 'México',     s: 'MEX', c: ['#006847', '#ffffff', '#CE1126'] }
  ],

  /* 20 clubes */
  clubes: [
    { n: 'Real Madrid',         s: 'RMA', c: ['#ffffff', '#FEBE10', '#00529F'] },
    { n: 'Barcelona',           s: 'BAR', c: ['#A50044', '#004D98', '#EDBB00'] },
    { n: 'Manchester United',   s: 'MUN', c: ['#DA291C', '#FBE122', '#000000'] },
    { n: 'Manchester City',     s: 'MCI', c: ['#6CABDD', '#ffffff', '#1C2C5B'] },
    { n: 'Liverpool',           s: 'LIV', c: ['#C8102E', '#00B2A9', '#F6EB61'] },
    { n: 'Arsenal',             s: 'ARS', c: ['#EF0107', '#ffffff', '#063672'] },
    { n: 'Chelsea',             s: 'CHE', id: 'chelsea', c: ['#034694', '#ffffff', '#DBA111'] },
    { n: 'Juventus',            s: 'JUV', c: ['#000000', '#ffffff', '#000000'] },
    { n: 'AC Milan',            s: 'MIL', c: ['#FB090B', '#000000', '#FB090B'] },
    { n: 'Inter de Milán',      s: 'INT', c: ['#0068A8', '#000000', '#0068A8'] },
    { n: 'Roma',                s: 'ROM', c: ['#8E1F2F', '#F0BC42', '#8E1F2F'] },
    { n: 'Napoli',              s: 'NAP', c: ['#12A0D7', '#ffffff', '#12A0D7'] },
    { n: 'Bayern Múnich',       s: 'BAY', c: ['#DC052D', '#0066B2', '#ffffff'] },
    { n: 'Borussia Dortmund',   s: 'BVB', c: ['#FDE100', '#000000', '#FDE100'] },
    { n: 'Paris Saint-Germain', s: 'PSG', c: ['#004170', '#ffffff', '#DA291C'] },
    { n: 'Atlético de Madrid',  s: 'ATM', c: ['#CB3524', '#ffffff', '#262E62'] },
    { n: 'Boca Juniors',        s: 'BOC', c: ['#16336E', '#FFC72C', '#16336E'] },
    { n: 'River Plate',         s: 'RIV', c: ['#ffffff', '#E1122C', '#ffffff'] },
    { n: 'Atlético Nacional',   s: 'NAL', c: ['#007A33', '#ffffff', '#007A33'] },
    { n: 'Millonarios',         s: 'MFC', c: ['#003DA5', '#ffffff', '#003DA5'] }
  ]
};
