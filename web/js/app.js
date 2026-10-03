// Punto de entrada: decide qué pantalla mostrar según la dirección (#/ o
// #/leccion/01) y dibuja la ruta de lecciones.

import { esc } from './util.js';
import { leer, rachaVigente, borrar } from './progreso.js';
import { tuerca } from './mascota.js';
import { abrirLeccion, cerrarLeccion, REPO } from './leccion.js';

const app = document.getElementById('app');
let indice = null;

// Geometría de la ruta, en píxeles. El trazo SVG y las paradas usan los
// mismos números, por eso coinciden.
const ANCHO = 300;
const COLUMNAS = [70, 230];
const PASO = 136;
const ARRIBA = 104;
const ABAJO = 112;

const ICONOS = {
  hecha: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  actual: '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="relleno" d="M8 5.5v13l11-6.5z"/></svg>',
  bloqueada: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5.5" y="10.5" width="13" height="9.5" rx="2.5"/><path d="M8.5 10.5V8a3.5 3.5 0 017 0v2.5"/></svg>',
  construccion: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12h.01M12 12h.01M18 12h.01"/></svg>',
};

async function cargarIndice() {
  if (indice) return indice;
  const respuesta = await fetch('lecciones/indice.json');
  if (!respuesta.ok) throw new Error(`No se pudo cargar el índice de lecciones (HTTP ${respuesta.status}).`);
  indice = await respuesta.json();
  return indice;
}

// Las lecciones jugables, en orden. Una lección se abre cuando la anterior
// está completada.
function disponibles(idx) {
  return idx.unidades.filter((u) => u.estado === 'disponible').flatMap((u) => u.lecciones);
}

function estadoDe(leccion, idx) {
  const progreso = leer();
  const orden = disponibles(idx);
  const n = orden.findIndex((l) => l.id === leccion.id);
  if (n === -1) return 'construccion';
  if (progreso.lecciones[leccion.id]) return 'hecha';
  return n === 0 || progreso.lecciones[orden[n - 1].id] ? 'actual' : 'bloqueada';
}

function trazo(puntos, hasta, cola) {
  let d = `M${puntos[0].x} 0V${puntos[0].y}`;
  for (let i = 1; i < hasta; i++) {
    const a = puntos[i - 1];
    const b = puntos[i];
    const medio = (a.y + b.y) / 2;
    d += `C${a.x} ${medio} ${b.x} ${medio} ${b.x} ${b.y}`;
  }
  if (cola) d += `V${puntos[hasta - 1].y + cola}`;
  return d;
}

function unidadHTML(unidad, idx, tortugaAqui) {
  const puntos = unidad.lecciones.map((_, i) => ({ x: COLUMNAS[i % 2], y: ARRIBA + i * PASO }));
  const estados = unidad.lecciones.map((l) => estadoDe(l, idx));
  const alto = ARRIBA + (puntos.length - 1) * PASO + ABAJO;
  const progreso = leer();

  // Hasta dónde llegó la tortuga dentro de esta unidad.
  const iActual = estados.indexOf('actual');
  const todas = estados.every((e) => e === 'hecha');
  let recorrido = '';
  let tortuga = '';
  if (iActual !== -1) {
    recorrido = trazo(puntos, iActual + 1, 0);
    const p = puntos[iActual];
    tortuga = `<div class="tortuga-ruta" style="left:${p.x}px;top:${p.y - 42}px">${tuerca('neutro')}</div>`;
  } else if (todas) {
    recorrido = trazo(puntos, puntos.length, ABAJO - 14);
    const p = puntos[puntos.length - 1];
    if (tortugaAqui) tortuga = `<div class="tortuga-ruta" style="left:${p.x}px;top:${p.y + ABAJO - 6}px">${tuerca('feliz')}</div>`;
  }

  const paradas = unidad.lecciones
    .map((l, i) => {
      const estado = estados[i];
      const lado = i % 2 === 0 ? 'lado-izq' : 'lado-der';
      const hecha = progreso.lecciones[l.id];
      const meta = {
        hecha: hecha ? `Completada · ${hecha.precision} %` : '',
        actual: 'Empezar',
        bloqueada: 'Completa la anterior',
        construccion: 'En construcción',
      }[estado];
      const dentro = `<span class="parada-boton">${ICONOS[estado]}</span>
        <span class="parada-rotulo"><strong>${esc(l.titulo)}</strong><span class="parada-meta">${meta}</span></span>`;
      const estilo = `style="top:${puntos[i].y}px"`;
      return estado === 'hecha' || estado === 'actual'
        ? `<a class="parada ${lado}" data-estado="${estado}" href="#/leccion/${esc(l.id)}" ${estilo}>${dentro}</a>`
        : `<div class="parada ${lado}" data-estado="${estado}" ${estilo}>${dentro}</div>`;
    })
    .join('');

  return `<section class="unidad" data-estado="${unidad.estado}">
    <header class="unidad-cab">
      <p class="antetitulo">Unidad ${unidad.numero}${unidad.estado === 'construccion' ? ' · en construcción' : ''}</p>
      <h2>${esc(unidad.titulo)}</h2>
      <p>${esc(unidad.descripcion)}</p>
    </header>
    <div class="ruta" style="height:${alto}px">
      <svg class="ruta-trazo" viewBox="0 0 ${ANCHO} ${alto}" width="${ANCHO}" height="${alto}" aria-hidden="true">
        <path class="trazo-pendiente" d="${trazo(puntos, puntos.length, ABAJO - 14)}"/>
        ${recorrido ? `<path class="trazo-hecho" pathLength="1" d="${recorrido}"/>` : ''}
      </svg>
      ${tortuga}
      ${paradas}
    </div>
  </section>`;
}

function pintarRuta(idx) {
  cerrarLeccion();
  document.body.dataset.pantalla = 'ruta';
  document.title = 'ROS2 desde cero';
  const progreso = leer();
  const racha = rachaVigente();

  // Si todo lo disponible está completo, la tortuga espera al final de la
  // última unidad jugable.
  const jugables = idx.unidades.filter((u) => u.estado === 'disponible');
  const ultima = jugables[jugables.length - 1];

  app.innerHTML = `<div class="lienzo">
    <header class="tope">
      <a class="marca" href="#/">ros2<span>-desde-cero</span></a>
      <ul class="contadores">
        <li><b>${racha}</b> ${racha === 1 ? 'día' : 'días'} de racha</li>
        <li><b>${progreso.xp}</b> XP</li>
      </ul>
    </header>
    <main>
      <p class="lema">ROS2 en español, para quien acaba de instalarlo y no sabe qué sigue.</p>
      ${idx.unidades.map((u) => unidadHTML(u, idx, u === ultima)).join('')}
    </main>
    <footer class="pie-ruta">
      <a href="${REPO}" target="_blank" rel="noopener">Código y lecciones en GitHub</a>
      <button type="button" class="enlace" data-a="borrar">Borrar mi progreso</button>
      <p>Tu progreso se guarda solo en este navegador.</p>
    </footer>
    <dialog class="dialogo">
      <h2>¿Borrar tu progreso?</h2>
      <p>Se pierden los XP, la racha y las lecciones completadas. No se puede deshacer.</p>
      <div class="dialogo-acciones">
        <button type="button" class="btn btn-linea" data-a="cancelar">Cancelar</button>
        <button type="button" class="btn btn-primario" data-a="confirmar-borrado">Borrar</button>
      </div>
    </dialog>
  </div>`;

  const dialogo = app.querySelector('.dialogo');
  app.firstElementChild.addEventListener('click', (e) => {
    const control = e.target.closest('[data-a]');
    if (!control) return;
    if (control.dataset.a === 'borrar') dialogo.showModal();
    else if (control.dataset.a === 'cancelar') dialogo.close();
    else if (control.dataset.a === 'confirmar-borrado') {
      borrar();
      pintarRuta(idx);
    }
  });
  window.scrollTo(0, 0);
}

function pintarError(error) {
  cerrarLeccion();
  document.body.dataset.pantalla = 'final';
  app.innerHTML = `<main class="final">
    <div class="final-mascota">${tuerca('triste')}</div>
    <h1>No se pudo cargar</h1>
    <p class="final-bajada">${esc(error.message)} Revisa tu conexión y vuelve a intentar.</p>
    <div class="final-acciones"><a class="btn btn-primario" href="#/" data-a="recargar">Volver a intentar</a></div>
  </main>`;
  app.querySelector('[data-a="recargar"]').addEventListener('click', (e) => {
    e.preventDefault();
    location.hash = '#/';
    enrutar();
  });
}

async function enrutar() {
  try {
    const idx = await cargarIndice();
    const m = location.hash.match(/^#\/leccion\/([\w-]+)$/);
    if (m) {
      const leccion = disponibles(idx).find((l) => l.id === m[1]);
      const estado = leccion ? estadoDe(leccion, idx) : null;
      if (estado === 'hecha' || estado === 'actual') {
        await abrirLeccion(app, leccion);
        return;
      }
      // Lección inexistente o todavía bloqueada: de vuelta a la ruta.
      history.replaceState(null, '', '#/');
    }
    pintarRuta(idx);
  } catch (error) {
    pintarError(error);
  }
}

window.addEventListener('hashchange', enrutar);
enrutar();
