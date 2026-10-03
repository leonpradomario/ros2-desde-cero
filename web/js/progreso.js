// Progreso del estudiante. Vive solo en su navegador (localStorage):
// no hay cuentas ni servidor. Si el navegador lo bloquea (ventana privada),
// el progreso se mantiene en memoria mientras la pestaña siga abierta.

const CLAVE = 'ros2-desde-cero:v1';
let memoria = null;

function vacio() {
  return { xp: 0, racha: 0, ultimoDia: null, lecciones: {} };
}

function fecha(d) {
  const dos = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}`;
}

function hoy() {
  return fecha(new Date());
}

function ayer() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return fecha(d);
}

export function leer() {
  if (memoria) return memoria;
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE));
    memoria = { ...vacio(), ...(guardado || {}) };
  } catch {
    memoria = vacio();
  }
  return memoria;
}

function guardar() {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(memoria));
  } catch {
    // Sin almacenamiento disponible: el progreso queda solo en memoria.
  }
}

// La racha cuenta solo si la última lección fue hoy o ayer.
export function rachaVigente() {
  const p = leer();
  return p.ultimoDia === hoy() || p.ultimoDia === ayer() ? p.racha : 0;
}

// Repetir una lección ya completada es repaso: da 5 XP fijos.
export function registrarLeccion(id, { xp, precision }) {
  const p = leer();
  const previa = p.lecciones[id];
  const xpGanado = previa ? 5 : xp;

  p.xp += xpGanado;
  p.lecciones[id] = {
    precision: Math.max(precision, previa ? previa.precision : 0),
    veces: (previa ? previa.veces : 0) + 1,
  };

  if (p.ultimoDia !== hoy()) {
    p.racha = p.ultimoDia === ayer() ? p.racha + 1 : 1;
    p.ultimoDia = hoy();
  }

  guardar();
  return { xpGanado, repaso: Boolean(previa) };
}

export function borrar() {
  memoria = vacio();
  try {
    localStorage.removeItem(CLAVE);
  } catch {
    // Nada que borrar.
  }
}
