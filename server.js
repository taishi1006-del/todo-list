const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const root = __dirname;
const port = 8000;

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
};

http
  .createServer((req, res) => {
    const urlPath = req.url === "/" ? "/index.html" : req.url;
    const filePath = path.join(root, decodeURIComponent(urlPath));
    const ext = path.extname(filePath).toLowerCase();

    fs.readFile(filePath, (error, data) => {
      if (error) {
        res.statusCode = 404;
        res.end("Not found");
        return;
      }

      res.setHeader("Content-Type", contentTypes[ext] || "application/octet-stream");
      res.end(data);
    });
  })
  .listen(port, () => {
    console.log(`Listening on http://localhost:${port}`);
  });
