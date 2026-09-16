require("dotenv").config();

const http = require("http");
const router = require("./routes/router");

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  router
    .handle(req, res)
    .catch((err) => {
      console.error("Unhandled server error:", err.message);
      if (!res.headersSent) {
        res.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ error: "Internal Server Error" }));
      } else {
        res.end();
      }
    });
});

server.on("clientError", (err, socket) => {
  if (socket.writable) {
    socket.end("HTTP/1.1 400 Bad Request\r\n\r\n");
  }
});

server.listen(PORT, () => {
  console.log(`Implementation A (Node.js HTTP) running on http://localhost:${PORT}`);
});