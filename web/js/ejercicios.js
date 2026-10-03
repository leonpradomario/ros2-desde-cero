// Los cinco tipos de ejercicio. Cada uno recibe el ejercicio (tal como está en
// el JSON de la lección) y una función `avisar` que llama cuando cambia la
// respuesta. Devuelve:
//   el          → el elemento para poner en pantalla
//   listo()     → true cuando ya hay algo que comprobar
//   comprobar() → { ok, solucion } y deja el ejercicio bloqueado
//   enfocar()   → (opcional) pone el cursor donde se escribe

import { esc, enLinea, barajar, resaltar, bloqueCodigo } from './util.js';

function contenedor(clase) {
  const el = document.createElement('div');
  el.className = clase;
  return el;
}

// Baraja sin devolver nunca el orden original (delataría la respuesta).
function barajarDistinto(lista) {
  if (lista.length < 2) return [...lista];
  let mezcla;
  do {
    mezcla = barajar(lista);
  } while (mezcla.every((x, i) => x === lista[i]));
  return mezcla;
}

const TIPOS = {
  // Opción múltiple con una sola respuesta correcta.
  opcion(ej, avisar) {
    const orden = barajar(ej.opciones.map((_, i) => i));
    let elegida = null;
    let bloqueado = false;
    const el = contenedor('ej-opciones');
    el.setAttribute('role', 'radiogroup');
    el.innerHTML = orden
      .map(
        (i, n) => `<button type="button" class="opcion" role="radio" aria-checked="false" data-i="${i}">
          <span class="opcion-tecla" aria-hidden="true">${n + 1}</span>
          <span>${enLinea(ej.opciones[i])}</span>
        </button>`,
      )
      .join('');

    el.addEventListener('click', (e) => {
      const boton = e.target.closest('.opcion');
      if (!boton || bloqueado) return;
      elegida = Number(boton.dataset.i);
      el.querySelectorAll('.opcion').forEach((o) => o.setAttribute('aria-checked', String(o === boton)));
      avisar();
    });

    return {
      el,
      listo: () => elegida !== null,
      comprobar() {
        bloqueado = true;
        const ok = elegida === ej.correcta;
        el.querySelectorAll('.opcion').forEach((o) => {
          const i = Number(o.dataset.i);
          o.disabled = true;
          if (i === ej.correcta) o.classList.add('correcta');
          else if (i === elegida) o.classList.add('incorrecta');
        });
        // La opción correcta ya queda marcada en verde: no hace falta repetirla.
        return { ok, solucion: '' };
      },
    };
  },

  // Código con huecos {{0}}, {{1}}… que se llenan tocando fichas.
  completar(ej, avisar) {
    const fichas = barajar([...ej.respuestas, ...(ej.distractores || [])]);
    const huecos = ej.respuestas.map(() => null); // índice de la ficha puesta
    let bloqueado = false;
    const el = contenedor('ej-completar');

    function pintar() {
      const partes = ej.codigo.split(/\{\{(\d+)\}\}/);
      const codigo = partes
        .map((parte, k) => {
          if (k % 2 === 0) return resaltar(parte, ej.lenguaje);
          const h = Number(parte);
          const f = huecos[h];
          const texto = f === null ? '' : fichas[f];
          const estado = f === null ? 'vacío' : texto;
          return `<button type="button" class="hueco${f === null ? '' : ' lleno'}" data-h="${h}" aria-label="Hueco ${h + 1}: ${esc(estado)}"${bloqueado ? ' disabled' : ''}>${esc(texto) || '&nbsp;'}</button>`;
        })
        .join('');
      const banco = fichas
        .map((t, f) => {
          const usada = huecos.includes(f);
          return `<button type="button" class="ficha" data-f="${f}"${usada || bloqueado ? ' disabled' : ''}>${esc(t)}</button>`;
        })
        .join('');
      el.innerHTML = `<pre class="codigo"><code>${codigo}</code></pre><div class="banco">${banco}</div>`;
    }

    el.addEventListener('click', (e) => {
      if (bloqueado) return;
      const ficha = e.target.closest('.ficha');
      const hueco = e.target.closest('.hueco');
      if (ficha) {
        const libre = huecos.indexOf(null);
        if (libre === -1) return;
        huecos[libre] = Number(ficha.dataset.f);
      } else if (hueco) {
        huecos[Number(hueco.dataset.h)] = null;
      } else {
        return;
      }
      pintar();
      avisar();
    });

    pintar();
    return {
      el,
      listo: () => !huecos.includes(null),
      comprobar() {
        bloqueado = true;
        const ok = huecos.every((f, h) => fichas[f] === ej.respuestas[h]);
        pintar();
        el.querySelectorAll('.hueco').forEach((b) => {
          const h = Number(b.dataset.h);
          b.classList.add(fichas[huecos[h]] === ej.respuestas[h] ? 'correcta' : 'incorrecta');
        });
        const resuelto = ej.codigo.replace(/\{\{(\d+)\}\}/g, (_, h) => ej.respuestas[Number(h)]);
        return { ok, solucion: bloqueCodigo(resuelto, ej.lenguaje) };
      },
    };
  },

  // Líneas desordenadas que se tocan en el orden correcto.
  ordenar(ej, avisar) {
    const fichas = barajarDistinto(ej.lineas);
    const elegidas = []; // índices de `fichas`, en el orden elegido
    let bloqueado = false;
    const el = contenedor('ej-ordenar');

    function pintar() {
      const zona = elegidas.length
        ? elegidas
            .map(
              (f, n) => `<li><button type="button" class="linea-elegida" data-n="${n}"${bloqueado ? ' disabled' : ''}>
                <span class="linea-num" aria-hidden="true">${n + 1}</span><span>${resaltar(fichas[f], ej.lenguaje)}</span>
              </button></li>`,
            )
            .join('')
        : '<li class="zona-vacia">Toca las líneas en el orden correcto.</li>';
      const banco = fichas
        .map((t, f) => {
          const usada = elegidas.includes(f);
          return `<button type="button" class="ficha" data-f="${f}"${usada || bloqueado ? ' disabled' : ''}>${esc(t)}</button>`;
        })
        .join('');
      el.innerHTML = `<ol class="zona">${zona}</ol><div class="banco banco-lineas">${banco}</div>`;
    }

    el.addEventListener('click', (e) => {
      if (bloqueado) return;
      const ficha = e.target.closest('.ficha');
      const puesta = e.target.closest('.linea-elegida');
      if (ficha) elegidas.push(Number(ficha.dataset.f));
      else if (puesta) elegidas.splice(Number(puesta.dataset.n), 1);
      else return;
      pintar();
      avisar();
    });

    pintar();
    return {
      el,
      listo: () => elegidas.length === fichas.length,
      comprobar() {
        bloqueado = true;
        const ok = elegidas.every((f, n) => fichas[f] === ej.lineas[n]);
        pintar();
        el.querySelectorAll('.linea-elegida').forEach((b, n) => {
          b.classList.add(fichas[elegidas[n]] === ej.lineas[n] ? 'correcta' : 'incorrecta');
        });
        return { ok, solucion: bloqueCodigo(ej.lineas.join('\n'), ej.lenguaje) };
      },
    };
  },

  // Código con un error: se toca la línea equivocada. `lineaError` cuenta desde 1.
  error(ej, avisar) {
    const lineas = ej.codigo.split('\n');
    let elegida = null;
    let bloqueado = false;
    const el = contenedor('ej-error');
    el.innerHTML = lineas
      .map((texto, i) => {
        const num = `<span class="linea-num" aria-hidden="true">${i + 1}</span>`;
        if (!texto.trim()) return `<div class="linea linea-hueca">${num}</div>`;
        return `<button type="button" class="linea" aria-pressed="false" data-i="${i}" aria-label="Línea ${i + 1}: ${esc(texto.trim())}">${num}<span>${resaltar(texto, ej.lenguaje)}</span></button>`;
      })
      .join('');

    el.addEventListener('click', (e) => {
      const linea = e.target.closest('button.linea');
      if (!linea || bloqueado) return;
      elegida = Number(linea.dataset.i);
      el.querySelectorAll('button.linea').forEach((b) => b.setAttribute('aria-pressed', String(b === linea)));
      avisar();
    });

    return {
      el,
      listo: () => elegida !== null,
      comprobar() {
        bloqueado = true;
        const correcta = ej.lineaError - 1;
        const ok = elegida === correcta;
        el.querySelectorAll('button.linea').forEach((b) => {
          const i = Number(b.dataset.i);
          b.disabled = true;
          if (i === correcta) b.classList.add('correcta');
          else if (i === elegida) b.classList.add('incorrecta');
        });
        const arreglo = ej.correccion
          ? `<p>El error está en la línea ${ej.lineaError}. Así queda corregida:</p>${bloqueCodigo(ej.correccion.trim(), ej.lenguaje)}`
          : `<p>El error está en la línea ${ej.lineaError}.</p>`;
        return { ok, solucion: arreglo };
      },
    };
  },

  // Escribir un comando de terminal. Se ignoran los espacios de más.
  escribir(ej, avisar) {
    const normalizar = (s) => s.trim().replace(/\s+/g, ' ');
    const el = contenedor('ej-escribir');
    el.innerHTML = `<label class="terminal">
      <span class="terminal-prompt" aria-hidden="true">$</span>
      <input type="text" aria-label="Comando" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="escribe el comando">
    </label>`;
    const entrada = el.querySelector('input');
    entrada.addEventListener('input', avisar);

    return {
      el,
      listo: () => normalizar(entrada.value) !== '',
      enfocar: () => entrada.focus(),
      comprobar() {
        entrada.readOnly = true;
        const ok = ej.aceptadas.map(normalizar).includes(normalizar(entrada.value));
        el.querySelector('.terminal').classList.add(ok ? 'correcta' : 'incorrecta');
        return { ok, solucion: bloqueCodigo(ej.aceptadas[0], 'bash') };
      },
    };
  },
};

export const ETIQUETAS = {
  opcion: 'Elige una respuesta',
  completar: 'Completa el código',
  ordenar: 'Ordena las líneas',
  error: 'Encuentra el error',
  escribir: 'Escribe el comando',
};

export function crearEjercicio(ej, avisar) {
  const crear = TIPOS[ej.tipo];
  if (!crear) throw new Error(`Tipo de ejercicio desconocido: "${ej.tipo}".`);
  return crear(ej, avisar);
}
