import { attach as attachPanZoom } from "./ui/pan-zoom.js";
import { renderAll } from "./ui/render.js";

const canvas = document.getElementById("canvas");
const content = document.getElementById("content");
const statusEl = document.getElementById("status");

const panZoom = attachPanZoom(canvas, content);
document.getElementById("zoom-in").addEventListener("click", panZoom.zoomIn);
document.getElementById("zoom-out").addEventListener("click", panZoom.zoomOut);
document.getElementById("reset").addEventListener("click", panZoom.reset);

async function refresh(diagrams) {
  await renderAll(diagrams, content);
  statusEl.textContent = `${diagrams.length} diagram(s) — last update ${new Date().toLocaleTimeString()}`;
}

fetch("/config")
  .then((r) => r.json())
  .then(({ dir }) => {
    document.title = `Mermaid Live — ${dir}`;
  });

fetch("/diagrams").then((r) => r.json()).then(refresh);

const events = new EventSource("/events");
events.addEventListener("message", (e) => refresh(JSON.parse(e.data)));
