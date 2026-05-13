#!/usr/bin/env node

// Live-reload Mermaid renderer.
// Usage: node server.js [directory] [port]
//   directory  - directory to scan for .mmd files (default: cwd)
//   port       - HTTP port (default: 3333)

const http = require("http");
const fs = require("fs");
const path = require("path");

const diagrams = require("./server/diagrams");
const sse = require("./server/sse");
const watcher = require("./server/watcher");
const router = require("./server/router");

const DIR = path.resolve(process.argv[2] || process.cwd());
const PORT = parseInt(process.argv[3], 10) || 3333;
const PUBLIC_DIR = path.join(__dirname, "public");
const BROADCAST_DEBOUNCE_MS = 100;
const SHUTDOWN_TIMEOUT_MS = 3000;

if (!fs.existsSync(DIR) || !fs.statSync(DIR).isDirectory()) {
  console.error(`Not a directory: ${DIR}`);
  process.exit(1);
}

watcher.watch(DIR, BROADCAST_DEBOUNCE_MS, () => {
  sse.broadcast(diagrams.readAll(DIR));
});

const handler = router.createHandler({ baseDir: DIR, publicDir: PUBLIC_DIR });
const server = http.createServer(handler);

server.listen(PORT, () => {
  console.log(`Mermaid live: http://localhost:${PORT}`);
  console.log(`Watching:     ${DIR}`);
  console.log(`PID:          ${process.pid}`);
});

function shutdown(signal) {
  console.log(`\nReceived ${signal}, shutting down.`);
  sse.closeAll();
  server.closeAllConnections();
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), SHUTDOWN_TIMEOUT_MS).unref();
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
