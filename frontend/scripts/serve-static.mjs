import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { resolve, sep, extname } from "node:path";
import { pathToFileURL } from "node:url";

const mimeTypes = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json", ".txt": "text/x-component; charset=utf-8", ".jpg": "image/jpeg", ".webp": "image/webp", ".png": "image/png", ".svg": "image/svg+xml", ".ico": "image/x-icon", ".woff2": "font/woff2" };

export function createStaticServer(directory = "out") {
  const root = resolve(directory);
  return createServer(async (request, response) => {
    if (!["GET", "HEAD"].includes(request.method)) { response.writeHead(405, { Allow: "GET, HEAD" }); response.end(); return; }
    try {
      const url = new URL(request.url, "http://localhost");
      let pathname = decodeURIComponent(url.pathname);
      if (pathname.endsWith("/")) pathname += "index.html";
      else if (!extname(pathname)) pathname += "/index.html";
      const file = resolve(root, `.${pathname}`);
      if (!file.startsWith(root + sep)) { response.writeHead(400); response.end(); return; }
      let data;
      try {
        data = await readFile(file);
        response.writeHead(200, { "Content-Type": mimeTypes[extname(file)] ?? "application/octet-stream", "Cache-Control": "no-cache" });
      } catch (error) {
        if (!["ENOENT", "EISDIR", "ENOTDIR"].includes(error.code)) throw error;
        data = await readFile(resolve(root, "404.html"));
        response.writeHead(404, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache" });
      }
      response.end(request.method === "HEAD" ? undefined : data);
    } catch { response.writeHead(400); response.end("Bad request"); }
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const server = createStaticServer();
  server.listen(Number(process.env.PORT || 3000), "127.0.0.1", () => console.log(`Lighthouse static preview: http://127.0.0.1:${server.address().port}`));
}
