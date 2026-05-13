// HTTP request dispatch.

const path = require("path");
const diagrams = require("./diagrams");
const sse = require("./sse");
const staticFiles = require("./static-files");
const { sendJson, sendText } = require("./responses");

function createHandler({ baseDir, publicDir }) {
  return function handle(req, res) {
    const urlPath = req.url.split("?")[0];

    if (urlPath === "/health") return sendText(res, "ok");
    if (urlPath === "/events") return sse.subscribe(req, res);
    if (urlPath === "/diagrams") return sendJson(res, diagrams.readAll(baseDir));
    if (urlPath === "/config") return sendJson(res, { dir: baseDir });
    if (urlPath === "/") return staticFiles.send(res, path.join(publicDir, "index.html"));

    const filepath = staticFiles.resolveSafePath(publicDir, urlPath);
    if (!filepath) return sendText(res, "Forbidden", 403);
    return staticFiles.send(res, filepath);
  };
}

module.exports = { createHandler };
