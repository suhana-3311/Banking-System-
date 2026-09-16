require("dotenv").config();
const { Pool } = require("pg");

function sanitizeConnectionString(connectionString) {
  try {
    const url = new URL(connectionString);
    url.searchParams.delete("channel_binding");
    url.searchParams.delete("sslmode");
    return url.toString();
  } catch (err) {
    return connectionString;
  }
}

const pool = new Pool({
  connectionString: sanitizeConnectionString(process.env.DATABASE_URL),
  family: 4,
  ssl: {
    rejectUnauthorized: false
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000
});

async function checkConnection() {
  const client = await pool.connect();
  try {
    await client.query("SELECT 1");
  } finally {
    client.release();
  }
}

pool.on("error", (err) => {
  console.error("Unexpected error on idle PostgreSQL client", err.message);
});

module.exports = { pool, checkConnection };