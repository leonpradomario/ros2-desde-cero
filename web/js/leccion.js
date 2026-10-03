// El reproductor de una lección: muestra los pasos uno por uno, comprueba los
// ejercicios, descuenta batería con cada error y repite al final lo fallado.

import { esc, enLinea, resaltar, bloqueCodigo } from './util.js';
import { crearEjercicio, ETIQUETAS } from './ejercicios.js';
import { diagrama } from './diagramas.js';
import { tuerca } from './mascota.js';
import { registrarLeccion, rachaVigente } from './progreso.js';

export const REPO = 'https://github.com/leonpradomario/ros2-desde-cero';
const CARGAS = 5;

let soltarTeclado = null;

// Se llama al salir de una lección, para no dejar el teclado escuchando.
export function cerrarLeccion() {
  if (soltarTeclado) soltarTeclado();
  soltarTeclado = null;
}

export async function abrirLeccion(app, ref) {
  cerrarLeccion();
  document.body.dataset.pantalla = 'leccion';
  document.title = `${ref.titulo} · ROS2 desde cero`;
  app.innerHTML = '<p class="cargando">Cargando la lección…</p>';

  const ruta = location.hash;
  const respuesta = await fetch(`lecciones/${ref.archivo}`);
  if (!respuesta.ok) throw new Error(`No se pudo cargar la lección ${ref.id} (HTTP ${respuesta.status}).`);
  const leccion = await respuesta.json();
  if (location.hash !== ruta) return; // la persona ya se fue a otra pantalla
  jugar(app, leccion);
}

function teoriaHTML(paso) {
  const bloques = paso.bloques
    .map((b) => {
      if (b.p) return `<p>${enLinea(b.p)}</p>`;
      if (b.codigo) return bloqueCodigo(b.codigo, b.lenguaje);
      if (b.diagrama) return diagrama(b.diagrama);
      if (b.nota) return `<p class="nota">${enLinea(b.nota)}</p>`;
      return '';
    })
    .join('');
  return `<article class="paso"><p class="antetitulo">Teoría</p><h1 tabindex="-1">${enLinea(paso.titulo)}</h1>${bloques}</article>`;
}

function bateriaHTML(cargas) {
  const celdas = Array.from({ length: CARGAS }, (_, i) => `<span class="celda${i < cargas ? '' : ' vacia'}"></span>`).join('');
  return `<div class="bateria${cargas <= 1 ? ' baja' : ''}" role="img" aria-label="Batería: ${cargas} de ${CARGAS} cargas">${celdas}</div>`;
}

function jugar(app, leccion) {
  cerrarLeccion();
  document.body.dataset.pantalla = 'leccion';

  const total = leccion.pasos.length;
  const nEjercicios = leccion.pasos.filter((p) => p.tipo !== 'teoria').length;
  const cola = leccion.pasos.map((paso, i) => ({ paso, i, reintento: false }));
  const fallados = new Set();
  let hechos = 0;
  let cargas = CARGAS;
  let actual = null;
  let ejercicio = null;
  let fase = 'responder'; // 'responder' → 'veredicto'

  app.innerHTML = `<div class="leccion">
    <header class="leccion-barra">
      <button type="button" class="btn-icono" data-a="salir" aria-label="Salir de la lección">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19"/></svg>
      </button>
      <div class="progreso" role="progressbar" aria-label="Avance de la lección" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="0"><div class="progreso-relleno"></div></div>
      <div class="bateria-sitio"></div>
    </header>
    <main class="leccion-cuerpo"></main>
    <footer class="leccion-pie">
      <div class="leccion-pie-caja">
        <div class="veredicto" aria-live="polite"></div>
        <button type="button" class="btn btn-primario" data-a="principal">Comprobar</button>
      </div>
    </footer>
    <dialog class="dialogo">
      <h2>¿Salir de la lección?</h2>
      <p>El avance de esta lección no se guarda. Tendrás que empezarla de nuevo.</p>
      <div class="dialogo-acciones">
        <button type="button" class="btn btn-linea" data-a="seguir">Seguir aquí</button>
        <button type="button" class="btn btn-primario" data-a="confirmar-salida">Salir</button>
      </div>
    </dialog>
  </div>`;

  const cuerpo = app.querySelector('.leccion-cuerpo');
  const pie = app.querySelector('.leccion-pie');
  const boton = app.querySelector('[data-a="principal"]');
  const veredicto = app.querySelector('.veredicto');
  const barra = app.querySelector('.progreso');
  const dialogo = app.querySelector('.dialogo');

  function pintarBarra() {
    barra.setAttribute('aria-valuenow', String(hechos));
    barra.firstElementChild.style.width = `${(hechos / total) * 100}%`;
    app.querySelector('.bateria-sitio').innerHTML = bateriaHTML(cargas);
  }

  function siguiente() {
    if (!cola.length) return terminar();
    actual = cola.shift();
    fase = 'responder';
    pie.dataset.estado = '';
    veredicto.innerHTML = '';
    const { paso } = actual;

    if (paso.tipo === 'teoria') {
      ejercicio = null;
      cuerpo.innerHTML = teoriaHTML(paso);
      boton.textContent = 'Continuar';
      boton.disabled = false;
    } else {
      const antetitulo = ETIQUETAS[paso.tipo] + (actual.reintento ? ' · segundo intento' : '');
      cuerpo.innerHTML = `<article class="paso"><p class="antetitulo">${antetitulo}</p><h1 class="pregunta" tabindex="-1">${enLinea(paso.pregunta)}</h1></article>`;
      ejercicio = crearEjercicio(paso, () => {
        boton.disabled = !ejercicio.listo();
      });
      cuerpo.firstElementChild.append(ejercicio.el);
      boton.textContent = 'Comprobar';
      boton.disabled = true;
    }

    window.scrollTo(0, 0);
    if (ejercicio && ejercicio.enfocar) ejercicio.enfocar();
    else cuerpo.querySelector('h1').focus({ preventScroll: true });
  }

  function accion() {
    if (boton.disabled) return;

    if (!ejercicio) {
      hechos++;
      pintarBarra();
      return siguiente();
    }
    if (fase === 'veredicto') {
      return cargas === 0 ? sinBateria() : siguiente();
    }

    const { ok, solucion } = ejercicio.comprobar();
    const { paso } = actual;
    fase = 'veredicto';

    if (ok) {
      hechos++;
      veredicto.innerHTML = `<div class="veredicto-cara">${tuerca('feliz')}</div>
        <div class="veredicto-texto"><h2>Correcto</h2><p>${enLinea(paso.explicacion)}</p></div>`;
    } else {
      cargas--;
      fallados.add(actual.i);
      cola.push({ ...actual, reintento: true });
      const aviso = cargas === 0
        ? 'Era la última carga de la batería.'
        : `Esta pregunta vuelve al final. Te ${cargas === 1 ? 'queda 1 carga' : `quedan ${cargas} cargas`}.`;
      veredicto.innerHTML = `<div class="veredicto-cara">${tuerca('triste')}</div>
        <div class="veredicto-texto"><h2>Todavía no</h2>
          ${solucion ? `<p class="antetitulo">Respuesta correcta</p>${solucion}` : ''}
          <p>${enLinea(paso.explicacion)}</p>
          <p class="veredicto-aviso">${aviso}</p>
        </div>`;
    }

    pie.dataset.estado = ok ? 'ok' : 'mal';
    pintarBarra();
    boton.textContent = 'Continuar';
    boton.disabled = false;
    boton.focus();
  }

  function terminar() {
    cerrarLeccion();
    const aciertos = nEjercicios - fallados.size;
    const precision = nEjercicios ? Math.round((aciertos / nEjercicios) * 100) : 100;
    const xp = 10 + 2 * aciertos + (fallados.size === 0 ? 5 : 0);
    const { xpGanado, repaso } = registrarLeccion(leccion.id, { xp, precision });
    pantallaFinal(app, leccion, { xpGanado, repaso, precision });
  }

  function sinBateria() {
    cerrarLeccion();
    document.body.dataset.pantalla = 'final';
    app.innerHTML = `<main class="final">
      <div class="final-mascota">${tuerca('triste')}</div>
      <h1 tabindex="-1">Tuerca se quedó sin batería</h1>
      <p class="final-bajada">Fueron ${CARGAS} errores en esta lección. Recarga y empiézala de nuevo: las preguntas son las mismas.</p>
      <div class="final-acciones">
        <button type="button" class="btn btn-primario" data-a="reintentar">Reintentar la lección</button>
        <a class="btn btn-linea" href="#/">Volver a la ruta</a>
      </div>
    </main>`;
    app.querySelector('[data-a="reintentar"]').addEventListener('click', () => jugar(app, leccion));
    app.querySelector('h1').focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }

  function clic(e) {
    const control = e.target.closest('[data-a]');
    if (!control) return;
    const a = control.dataset.a;
    if (a === 'principal') accion();
    else if (a === 'salir') {
      if (hechos === 0) location.hash = '#/';
      else dialogo.showModal();
    } else if (a === 'seguir') dialogo.close();
    else if (a === 'confirmar-salida') location.hash = '#/';
  }

  function tecla(e) {
    if (dialogo.open) return;
    if (e.key === 'Enter') {
      const control = e.target.closest('button, a');
      // Enter sobre un botón lo activa, salvo que ya sea la respuesta elegida:
      // ahí Enter comprueba, igual que desde cualquier otro lugar.
      const yaElegido = control && (control.getAttribute('aria-checked') === 'true' || control.getAttribute('aria-pressed') === 'true');
      if (control && !yaElegido) return;
      e.preventDefault();
      accion();
    } else if (/^[1-9]$/.test(e.key) && fase === 'responder' && actual && actual.paso.tipo === 'opcion') {
      const opcion = cuerpo.querySelectorAll('.opcion')[Number(e.key) - 1];
      if (opcion) opcion.click();
    }
  }

  app.firstElementChild.addEventListener('click', clic);
  document.addEventListener('keydown', tecla);
  soltarTeclado = () => document.removeEventListener('keydown', tecla);

  pintarBarra();
  siguiente();
}

function pantallaFinal(app, leccion, { xpGanado, repaso, precision }) {
  document.body.dataset.pantalla = 'final';
  const racha = rachaVigente();
  const m = leccion.enTuMaquina;

  const comandos = m.terminales
    .map(
      (t) => `<div class="comando">
        <span class="comando-nombre">${esc(t.nombre)}</span>
        <pre class="codigo"><code>${resaltar(t.comando, 'bash')}</code></pre>
        <button type="button" class="btn-copiar" data-copiar="${esc(t.comando)}">Copiar</button>
      </div>`,
    )
    .join('');

  app.innerHTML = `<main class="final">
    <div class="final-mascota">${tuerca('fiesta')}</div>
    <h1 tabindex="-1">${repaso ? 'Repaso completado' : 'Lección completada'}</h1>
    <p class="final-bajada">${esc(leccion.titulo)}</p>
    <dl class="marcador">
      <div><dt>XP ganados</dt><dd>+${xpGanado}</dd></div>
      <div><dt>Precisión</dt><dd>${precision} %</dd></div>
      <div><dt>Racha</dt><dd>${racha} ${racha === 1 ? 'día' : 'días'}</dd></div>
    </dl>
    <section class="maquina">
      <p class="antetitulo">Ahora en tu máquina</p>
      <h2>Corre el código de verdad</h2>
      <p>${enLinea(m.intro)}</p>
      ${comandos}
      <a class="maquina-enlace" href="${REPO}/tree/main/${m.codigo}" target="_blank" rel="noopener">Ver el código de esta lección en GitHub</a>
    </section>
    <div class="final-acciones"><a class="btn btn-primario" href="#/">Volver a la ruta</a></div>
  </main>`;

  app.querySelectorAll('[data-copiar]').forEach((b) => {
    b.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(b.dataset.copiar);
        b.textContent = 'Copiado';
      } catch {
        b.textContent = 'No se pudo copiar';
      }
      setTimeout(() => (b.textContent = 'Copiar'), 1800);
    });
  });

  app.querySelector('h1').focus({ preventScroll: true });
  window.scrollTo(0, 0);
}
