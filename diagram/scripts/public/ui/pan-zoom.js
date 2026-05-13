// Pan-and-zoom for a content element inside a viewport (canvas) element.
//
// Drag the canvas to pan; scroll wheel to zoom toward the cursor.
// Returns programmatic controls for external zoom buttons.

export function attach(canvas, content) {
  const view = { scale: 1, x: 0, y: 0 };
  const drag = { active: false, startX: 0, startY: 0 };

  function apply() {
    content.style.transform = `translate(${view.x}px, ${view.y}px) scale(${view.scale})`;
  }

  function zoomAt(clientX, clientY, factor) {
    const rect = canvas.getBoundingClientRect();
    const mx = clientX - rect.left;
    const my = clientY - rect.top;
    view.x = mx - factor * (mx - view.x);
    view.y = my - factor * (my - view.y);
    view.scale *= factor;
    apply();
  }

  canvas.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      zoomAt(e.clientX, e.clientY, e.deltaY > 0 ? 0.9 : 1.1);
    },
    { passive: false },
  );

  canvas.addEventListener("mousedown", (e) => {
    drag.active = true;
    drag.startX = e.clientX - view.x;
    drag.startY = e.clientY - view.y;
    canvas.classList.add("dragging");
  });

  window.addEventListener("mousemove", (e) => {
    if (!drag.active) return;
    view.x = e.clientX - drag.startX;
    view.y = e.clientY - drag.startY;
    apply();
  });

  window.addEventListener("mouseup", () => {
    drag.active = false;
    canvas.classList.remove("dragging");
  });

  return {
    zoomIn() {
      view.scale *= 1.2;
      apply();
    },
    zoomOut() {
      view.scale *= 0.8;
      apply();
    },
    reset() {
      view.scale = 1;
      view.x = 0;
      view.y = 0;
      apply();
    },
  };
}
