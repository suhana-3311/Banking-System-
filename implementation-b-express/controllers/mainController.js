const { checkConnection } = require("../config/database");

async function healthCheck(req, res) {
  let database = "down";
  try {
    await checkConnection();
    database = "up";
  } catch (err) {
    console.error("Health check database error:", err.message);
  }

  res.status(200).json({
    status: "ok",
    service: "online-banking",
    implementation: "express",
    database,
    timestamp: new Date().toISOString()
  });
}

function notFound(req, res) {
  res.status(404).render("404", {
    title: "Page Not Found",
    implementation: "Express + Handlebars",
    message: "The page you are looking for does not exist."
  });
}

function internalError(err, req, res, next) {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ success: false, message: "Invalid JSON body." });
  }
  if (err.type === "entity.too.large") {
    return res.status(413).json({ success: false, message: "Payload too large." });
  }
  if (err.status && err.status >= 400 && err.status < 500) {
    return res.status(err.status).json({ success: false, message: err.message });
  }
  console.error("Request error:", err.message);
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).render("error", {
    title: "Internal Server Error",
    implementation: "Express + Handlebars",
    message: "Something went wrong on our side. Please try again later."
  });
}

module.exports = { healthCheck, notFound, internalError };