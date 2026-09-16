const { escapeHtml } = require("./formatters");

function pageShell({ title, active, content, serviceTag }) {
  const navLinks = [
    { href: "/", label: "Dashboard", key: "dashboard" },
    { href: "/customers", label: "Customers", key: "customers" },
    { href: "/accounts", label: "Accounts", key: "accounts" },
    { href: "/transactions", label: "Transactions", key: "transactions" }
  ];

  const nav = navLinks
    .map(
      (link) =>
        `<a class="nav-link ${active === link.key ? "nav-link-active" : ""}" href="${link.href}">${link.label}</a>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)} | Banking System</title>
  <link rel="stylesheet" href="/css/style.css">
</head>
<body>
  <header class="topbar">
    <div class="container topbar-inner">
      <a class="brand" href="/">
        <span class="brand-mark">B</span>
        <span class="brand-text">Banking System</span>
      </a>
      <button class="nav-toggle" aria-label="Toggle navigation">&#9776;</button>
      <nav class="nav" id="main-nav">${nav}</nav>
    </div>
  </header>
  <main class="container main">
    ${content}
  </main>
  <footer class="footer">
    <div class="container footer-inner">
      <span>Online Banking Management System · ${escapeHtml(serviceTag)}</span>
      <span>Node.js HTTP + PostgreSQL</span>
    </div>
  </footer>
  <script src="/js/main.js"></script>
</body>
</html>`;
}

module.exports = { pageShell };