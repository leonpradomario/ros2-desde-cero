// Utilidades compartidas: escapar HTML, formato en línea y resaltado de código.

const ENTIDADES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export function esc(texto) {
  return String(texto).replace(/[&<>"']/g, (c) => ENTIDADES[c]);
}

// Formato mínimo para los textos de las lecciones: `código` y **negrita**.
export function enLinea(texto) {
  return esc(texto)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
}

export function barajar(lista) {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

// Grupos: 1 comentario · 2 cadena · 3 palabra clave · 4 número.
const PATRONES = {
  python: /(#[^\n]*)|('(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*")|\b(def|class|import|from|return|self|if|else|elif|while|for|in|not|and|or|None|True|False|try|except|finally|pass|with|as)\b|\b(\d+(?:\.\d+)?)\b/g,
  bash: /(#[^\n]*)|('(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*")/g,
};

// Devuelve HTML seguro. Un lenguaje sin patrón (p. ej. "texto") solo se escapa.
export function resaltar(codigo, lenguaje = 'python') {
  const patron = PATRONES[lenguaje];
  if (!patron) return esc(codigo);
  patron.lastIndex = 0;
  let html = '';
  let ultimo = 0;
  let m;
  while ((m = patron.exec(codigo))) {
    html += esc(codigo.slice(ultimo, m.index));
    const clase = m[1] ? 't-c' : m[2] ? 't-s' : m[3] ? 't-k' : 't-n';
    html += `<span class="${clase}">${esc(m[0])}</span>`;
    ultimo = patron.lastIndex;
  }
  return html + esc(codigo.slice(ultimo));
}

export function bloqueCodigo(codigo, lenguaje = 'python') {
  return `<pre class="codigo"><code>${resaltar(codigo, lenguaje)}</code></pre>`;
}
