import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "dist");
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".xml": "application/xml", ".txt": "text/plain" };
createServer(async (req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  let file = path.join(root, pathname === "/" ? "index.html" : pathname);
  try {
    if ((await stat(file)).isDirectory()) file = path.join(file, "index.html");
    res.writeHead(200, { "Content-Type": types[path.extname(file)] || "application/octet-stream" });
    createReadStream(file).pipe(res);
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
}).listen(4173, () => console.log("Preview: http://localhost:4173"));
