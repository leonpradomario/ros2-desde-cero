// Diagramas de las lecciones, con la convención de rqt_graph:
// los nodos son óvalos y los tópicos, rectángulos.

function punta(id) {
  return `<defs><marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
    <path class="d-punta" d="M0 0l10 5-10 5z"/></marker></defs>`;
}

const DIAGRAMAS = {
  pubsub: {
    descripcion: 'El nodo publicador envía mensajes al tópico /saludo y el nodo suscriptor los recibe.',
    svg: `<svg viewBox="0 0 340 96">${punta('p-pubsub')}
      <path class="d-linea" d="M112 44H133" marker-end="url(#p-pubsub)"/>
      <path class="d-linea" d="M207 44H228" marker-end="url(#p-pubsub)"/>
      <circle class="d-mensaje d-viaja-pubsub" cx="112" cy="44" r="4.5"/>
      <ellipse class="d-nodo" cx="58" cy="44" rx="54" ry="24"/>
      <text class="d-texto" x="58" y="48">publicador</text>
      <rect class="d-topico" x="135" y="26" width="70" height="36" rx="6"/>
      <text class="d-texto" x="170" y="48">/saludo</text>
      <ellipse class="d-nodo" cx="282" cy="44" rx="54" ry="24"/>
      <text class="d-texto" x="282" y="48">suscriptor</text>
      <text class="d-rotulo" x="58" y="90">nodo</text>
      <text class="d-rotulo" x="170" y="90">tópico</text>
      <text class="d-rotulo" x="282" y="90">nodo</text>
    </svg>`,
  },
  servicio: {
    descripcion: 'El cliente envía la petición a=2, b=3 al servidor por el servicio /sumar, y el servidor responde sum=5.',
    svg: `<svg viewBox="0 0 340 112">${punta('p-servicio')}
      <path class="d-linea" d="M120 44H218" marker-end="url(#p-servicio)"/>
      <path class="d-linea" d="M220 68H122" marker-end="url(#p-servicio)"/>
      <text class="d-rotulo" x="170" y="34">petición · a=2, b=3</text>
      <text class="d-rotulo" x="170" y="88">respuesta · sum=5</text>
      <text class="d-texto d-suave" x="170" y="60">/sumar</text>
      <ellipse class="d-nodo" cx="62" cy="56" rx="56" ry="26"/>
      <text class="d-texto" x="62" y="60">cliente</text>
      <ellipse class="d-nodo" cx="278" cy="56" rx="56" ry="26"/>
      <text class="d-texto" x="278" y="60">servidor</text>
    </svg>`,
  },
  launch: {
    descripcion: 'El archivo leccion_03.launch.py arranca cuatro nodos: publicador, suscriptor, servidor y cliente.',
    svg: `<svg viewBox="0 0 340 172">${punta('p-launch')}
      <path class="d-linea" d="M144 86C180 86 176 22 210 22" marker-end="url(#p-launch)"/>
      <path class="d-linea" d="M144 86C180 86 180 65 210 65" marker-end="url(#p-launch)"/>
      <path class="d-linea" d="M144 86C180 86 180 108 210 108" marker-end="url(#p-launch)"/>
      <path class="d-linea" d="M144 86C180 86 176 150 210 150" marker-end="url(#p-launch)"/>
      <rect class="d-topico" x="6" y="64" width="138" height="44" rx="8"/>
      <text class="d-texto d-chico" x="75" y="90">leccion_03.launch.py</text>
      <ellipse class="d-nodo" cx="272" cy="22" rx="60" ry="17"/><text class="d-texto" x="272" y="26">publicador</text>
      <ellipse class="d-nodo" cx="272" cy="65" rx="60" ry="17"/><text class="d-texto" x="272" y="69">suscriptor</text>
      <ellipse class="d-nodo" cx="272" cy="108" rx="60" ry="17"/><text class="d-texto" x="272" y="112">servidor</text>
      <ellipse class="d-nodo" cx="272" cy="150" rx="60" ry="17"/><text class="d-texto" x="272" y="154">cliente</text>
    </svg>`,
  },
};

export function diagrama(nombre) {
  const d = DIAGRAMAS[nombre];
  if (!d) return '';
  return `<figure class="diagrama" role="img" aria-label="${d.descripcion}">${d.svg}</figure>`;
}
