// Server-Sent Events: a registry of long-lived response streams plus a
// broadcast helper.

const clients = new Set();

function subscribe(req, res) {
  res.writeHead(200, {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });
  clients.add(res);
  req.on("close", () => clients.delete(res));
}

function broadcast(data) {
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  for (const res of clients) res.write(payload);
}

function closeAll() {
  for (const res of clients) res.end();
  clients.clear();
}

module.exports = { subscribe, broadcast, closeAll };
