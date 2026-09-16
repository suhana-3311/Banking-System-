const path = require("path");
const fs = require("fs");

const { sendJSON, sendError } = require("../utils/httpHelpers");

const dashboardController = require("../controllers/dashboardController");
const customerController = require("../controllers/customerController");
const accountController = require("../controllers/accountController");
const transactionController = require("../controllers/transactionController");
const healthController = require("../controllers/healthController");

const PUBLIC_DIR = path.join(__dirname, "..", "public");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

function matchPath(pathname, pattern) {
  const pathSegments = pathname.split("/").filter(Boolean);
  const patternSegments = pattern.split("/").filter(Boolean);

  if (pathSegments.length !== patternSegments.length) return null;

  const params = {};
  for (let i = 0; i < patternSegments.length; i += 1) {
    if (patternSegments[i].startsWith(":")) {
      params[patternSegments[i].slice(1)] = decodeURIComponent(pathSegments[i]);
    } else if (patternSegments[i] !== pathSegments[i]) {
      return null;
    }
  }
  return params;
}

async function serveStatic(req, res, pathname) {
  let filePath = pathname;
  if (filePath === "/") return false;

  const resolved = path.normalize(path.join(PUBLIC_DIR, filePath));
  if (!resolved.startsWith(PUBLIC_DIR)) {
    return false;
  }

  try {
    const stats = await fs.promises.stat(resolved);
    if (!stats.isFile()) return false;

    const ext = path.extname(resolved).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    const data = await fs.promises.readFile(resolved);
    res.writeHead(200, {
      "Content-Type": contentType,
      "Content-Length": data.length,
      "Cache-Control": "public, max-age=3600"
    });
    res.end(data);
    return true;
  } catch (err) {
    return false;
  }
}

async function handle(req, res) {
  const parsed = new URL(req.url, "http://localhost");
  const pathname = decodeURIComponent(parsed.pathname) || "/";
  const method = req.method.toUpperCase();

  if (await serveStatic(req, res, pathname)) {
    return;
  }

  if (method === "GET" && pathname === "/health") {
    return healthController.healthCheck(req, res);
  }

  if (pathname === "/") {
    if (method === "GET") {
      return dashboardController.showDashboard(req, res);
    }
    return sendJSON(res, 405, { error: "Method Not Allowed", allowed: ["GET"] });
  }

  if (pathname === "/customers") {
    if (method === "GET") {
      return customerController.listCustomers(req, res);
    }
    if (method === "POST") {
      return customerController.createCustomerHandler(req, res);
    }
    return sendJSON(res, 405, { error: "Method Not Allowed", allowed: ["GET", "POST"] });
  }

  if (pathname === "/accounts") {
    if (method === "GET") {
      return accountController.listAccounts(req, res);
    }
    if (method === "POST") {
      return accountController.createAccountHandler(req, res);
    }
    return sendJSON(res, 405, { error: "Method Not Allowed", allowed: ["GET", "POST"] });
  }

  if (pathname === "/transactions") {
    if (method === "GET") {
      const searchParams = Object.fromEntries(parsed.searchParams.entries());
      return transactionController.listAllTransactions(req, res, searchParams);
    }
    if (method === "POST") {
      return transactionController.createTransactionHandler(req, res);
    }
    return sendJSON(res, 405, { error: "Method Not Allowed", allowed: ["GET", "POST"] });
  }

  let params = matchPath(pathname, "/customer/:id");
  if (params) {
    if (method === "GET") {
      return customerController.customerDetail(req, res, params.id);
    }
    return sendJSON(res, 405, { error: "Method Not Allowed", allowed: ["GET"] });
  }

  params = matchPath(pathname, "/account/:accountNo");
  if (params) {
    if (method === "GET") {
      return accountController.accountDetail(req, res, params.accountNo);
    }
    return sendJSON(res, 405, { error: "Method Not Allowed", allowed: ["GET"] });
  }

  params = matchPath(pathname, "/transactions/:accountNo");
  if (params) {
    if (method === "GET") {
      return transactionController.transactionHistory(req, res, params.accountNo);
    }
    return sendJSON(res, 405, { error: "Method Not Allowed", allowed: ["GET"] });
  }

  if (pathname.startsWith("/api/")) {
    return sendJSON(res, 404, { error: "Not Found" });
  }

  return sendError(res, 404, "404 Page Not Found", "The page you are looking for does not exist.");
}

module.exports = { handle };