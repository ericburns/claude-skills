// Watch a directory for .mmd file changes and invoke a callback after a
// debounced quiet period. Falls back to polling on platforms without
// recursive fs.watch support.

const fs = require("fs");

const POLL_INTERVAL_MS = 1000;

function watch(dir, debounceMs, onChange) {
  let timer = null;
  const fire = () => {
    clearTimeout(timer);
    timer = setTimeout(onChange, debounceMs);
  };

  try {
    fs.watch(dir, { recursive: true }, (_event, filename) => {
      if (filename && filename.endsWith(".mmd")) fire();
    });
  } catch (e) {
    console.warn("Recursive watch unavailable, falling back to polling:", e.message);
    setInterval(onChange, POLL_INTERVAL_MS);
  }
}

module.exports = { watch };
