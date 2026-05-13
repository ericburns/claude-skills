// Render a list of Mermaid diagram objects into a container element.
//
// Each diagram is `{ name, file, source }`. On render failure, falls back to
// a visible error message with the offending source in a <details> block.
//
// Depends on the global `mermaid` loaded via <script src="...mermaid.min.js">.

mermaid.initialize({ startOnLoad: false, theme: "default" });

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function header(diagram) {
  return (
    `<h2>${escapeHtml(diagram.name)}</h2>` +
    `<div class="file">${escapeHtml(diagram.file)}</div>`
  );
}

function errorBody(diagram, error) {
  const msg = (error && (error.message || error.str)) || String(error);
  return (
    `<pre class="error">${escapeHtml(msg)}</pre>` +
    `<details><summary>source</summary>` +
    `<pre>${escapeHtml(diagram.source)}</pre></details>`
  );
}

async function renderOne(diagram, id) {
  try {
    // parse() raises clean syntax errors; render() can throw cryptic
    // TypeErrors from minified internals when the source is malformed.
    await mermaid.parse(diagram.source);
    const { svg } = await mermaid.render(id, diagram.source);
    return `<div class="diagram">${header(diagram)}${svg}</div>`;
  } catch (e) {
    return `<div class="diagram">${header(diagram)}${errorBody(diagram, e)}</div>`;
  }
}

let counter = 0;
export async function renderAll(diagrams, container) {
  const sections = [];
  for (const d of diagrams) {
    sections.push(await renderOne(d, `mmd_${counter++}`));
  }
  container.innerHTML = sections.join("");
}
