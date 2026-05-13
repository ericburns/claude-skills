// Serve files from a root directory with a traversal-safe path resolver.

const fs = require("fs");
const path = require("path");
const { sendText } = require("./responses");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
};

// Resolve `urlPath` against `rootDir`. Returns the absolute path, or null if
// the result would escape the root.
function resolveSafePath(rootDir, urlPath) {
  const safe = path.posix.normalize(urlPath).replace(/^\/+/, "");
  const filepath = path.join(rootDir, safe);
  if (filepath !== rootDir && !filepath.startsWith(rootDir + path.sep)) {
    return null;
  }
  return filepath;
}

function send(res, filepath) {
  fs.readFile(filepath, (err, data) => {
    if (err) return sendText(res, "Not found", 404);
    const type = MIME_TYPES[path.extname(filepath)] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": type });
    res.end(data);
  });
}

module.exports = { resolveSafePath, send };
