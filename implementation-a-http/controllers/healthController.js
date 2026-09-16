const { checkConnection } = require("../config/database");
const { sendJSON } = require("../utils/httpHelpers");

async function healthCheck(req, res) {
  let database = "down";
  try {
    await checkConnection();
    database = "up";
  } catch (err) {
    console.error("Health check database error:", err.message);
  }

  sendJSON(res, 200, {
    status: "ok",
    service: "online-banking",
    implementation: "http",
    database,
    timestamp: new Date().toISOString()
  });
}

module.exports = { healthCheck };