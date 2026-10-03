// Tuerca, la tortuga robot. Un solo dibujo SVG con cuatro ánimos:
// neutro · feliz · triste · fiesta. Los colores salen de estilos.css.

const OJOS = {
  neutro: `<g class="t-ojos-neutro">
      <rect x="132.5" y="54.5" width="4.5" height="9" rx="2.25"/>
      <rect x="143" y="54.5" width="4.5" height="9" rx="2.25"/>
    </g>`,
  feliz: `<g class="t-ojos-linea">
      <path d="M131 62q3.5-7 7 0"/><path d="M142 62q3.5-7 7 0"/>
    </g>`,
  triste: `<g class="t-ojos-linea">
      <path d="M132 55.5l5 3.5-5 3.5"/><path d="M148 55.5l-5 3.5 5 3.5"/>
    </g>`,
};

const BOCA = {
  sonrisa: 'M134 72.5q6 3.5 12 0',
  mueca: 'M134 74.5q6-3.5 12 0',
};

export function tuerca(animo = 'neutro') {
  const ojos = animo === 'triste' ? OJOS.triste : animo === 'neutro' ? OJOS.neutro : OJOS.feliz;
  const boca = animo === 'triste' ? BOCA.mueca : BOCA.sonrisa;

  return `<svg class="tuerca" data-animo="${animo}" viewBox="0 0 164 128" aria-hidden="true" focusable="false">
    <ellipse class="t-sombra" cx="82" cy="121" rx="54" ry="5"/>
    <g class="t-cuerpo">
      <path class="t-pieza" d="M27 84l-13 5.5 13 5.5z"/>
      <rect class="t-clara" x="112" y="62" width="14" height="18"/>
      <circle class="t-rueda" cx="52" cy="104" r="14"/><circle class="t-eje" cx="52" cy="104" r="5"/>
      <circle class="t-rueda" cx="102" cy="104" r="14"/><circle class="t-eje" cx="102" cy="104" r="5"/>
      <rect class="t-clara" x="24" y="80" width="104" height="18" rx="9"/>
      <rect class="t-rueda" x="65" y="26" width="24" height="14" rx="4"/>
      <rect class="t-led" x="73" y="30" width="8" height="4" rx="2"/>
      <path class="t-pieza" d="M28 86C28 22 126 22 126 86z"/>
      <path class="t-placas" d="M63 56l14-8 14 8v16l-14 8-14-8zM63 56l-18-6M91 56l18-6M63 72l-31 4M91 72l31 4M77 48v-9M77 80v6"/>
      <path class="t-antena" d="M140 42V33"/><circle class="t-led" cx="140" cy="29" r="4.5"/>
      <rect class="t-pieza" x="118" y="42" width="40" height="36" rx="13"/>
      <rect class="t-visor" x="126" y="50" width="28" height="18" rx="7"/>
      ${ojos}
      <path class="t-boca" d="${boca}"/>
    </g>
  </svg>`;
}
