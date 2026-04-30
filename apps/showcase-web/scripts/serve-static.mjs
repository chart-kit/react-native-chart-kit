import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import path from "node:path";

const [, , rootArg = "apps/showcase-web/storybook-static", portArg = "6007"] =
  process.argv;

const root = path.resolve(process.cwd(), rootArg);
const port = Number.parseInt(portArg, 10);

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".woff2": "font/woff2"
};

const sendNotFound = (response) => {
  response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
  response.end("Not found");
};

if (!Number.isFinite(port)) {
  throw new Error(`Invalid port: ${portArg}`);
}

if (!existsSync(root) || !statSync(root).isDirectory()) {
  throw new Error(`Static root does not exist: ${root}`);
}

const server = createServer((request, response) => {
  const requestUrl = new URL(
    request.url ?? "/",
    `http://${request.headers.host}`
  );
  const pathname =
    requestUrl.pathname === "/" ? "/index.html" : requestUrl.pathname;
  const decodedPath = decodeURIComponent(pathname);
  const filePath = path.resolve(root, `.${decodedPath}`);
  const relativePath = path.relative(root, filePath);

  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    sendNotFound(response);
    return;
  }

  if (!existsSync(filePath) || !statSync(filePath).isFile()) {
    sendNotFound(response);
    return;
  }

  response.writeHead(200, {
    "cache-control": "no-store",
    "content-type":
      contentTypes[path.extname(filePath)] ?? "application/octet-stream"
  });
  createReadStream(filePath).pipe(response);
});

server.listen(port, "127.0.0.1", () => {
  process.stdout.write(`Serving ${root} at http://127.0.0.1:${port}\n`);
});

const close = () => {
  server.close(() => process.exit(0));
};

process.on("SIGINT", close);
process.on("SIGTERM", close);
