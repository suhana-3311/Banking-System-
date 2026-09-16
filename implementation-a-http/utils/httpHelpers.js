function sendJSON(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body)
  });
  res.end(body);
}

function sendHTML(res, status, html) {
  const body = Buffer.from(html, "utf-8");
  res.writeHead(status, {
    "Content-Type": "text/html; charset=utf-8",
    "Content-Length": body.length
  });
  res.end(body);
}

function sendError(res, status, title, message) {
  const pages = {
    400: "400 Bad Request",
    404: "404 Page Not Found",
    405: "405 Method Not Allowed",
    500: "500 Internal Server Error",
    201: "201 Created"
  };
  const heading = title || pages[status] || `${status} Error`;
  const safeMessage =
    status === 500
      ? "Something went wrong on our side. Please try again later."
      : message || "The request could not be completed.";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${heading} | Banking System</title>
  <link rel="stylesheet" href="/css/style.css">
</head>
<body>
  <header class="topbar">
    <div class="container topbar-inner">
      <a class="brand" href="/">
        <span class="brand-mark">B</span>
        <span class="brand-text">Banking System</span>
      </a>
      <nav class="nav">
        <a href="/">Dashboard</a>
        <a href="/customers">Customers</a>
      </nav>
    </div>
  </header>
  <main class="container">
    <section class="error-box">
      <span class="error-code">${status}</span>
      <h1>${heading}</h1>
      <p>${safeMessage}</p>
      <a class="btn btn-primary" href="/">Back to Dashboard</a>
    </section>
  </main>
</body>
</html>`;

  sendHTML(res, status, html);
}

function parseBody(req, limitBytes) {
  return new Promise((resolve, reject) => {
    const maxBytes = limitBytes || 1024 * 1024;
    let data = "";

    req.on("data", (chunk) => {
      data += chunk;
      if (Buffer.byteLength(data) > maxBytes) {
        reject(new Error("Payload too large"));
        req.destroy();
      }
    });

    req.on("end", () => {
      if (!data) {
        return resolve({});
      }
      try {
        resolve(JSON.parse(data));
      } catch (err) {
        reject(new Error("Invalid JSON body"));
      }
    });

    req.on("error", () => reject(new Error("Request body read error")));
  });
}

module.exports = { sendJSON, sendHTML, sendError, parseBody };