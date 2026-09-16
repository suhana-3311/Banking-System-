const { pool } = require("../config/database");

const NUMERIC = (value) => Number(value);

async function getCustomers() {
  const result = await pool.query(
    `SELECT id,
            customer_code,
            first_name,
            last_name,
            email,
            phone,
            address,
            city,
            created_at
       FROM customers
      ORDER BY created_at DESC`
  );
  return result.rows;
}

async function getCustomerById(id) {
  const result = await pool.query(
    `SELECT id,
            customer_code,
            first_name,
            last_name,
            email,
            phone,
            address,
            city,
            created_at
       FROM customers
      WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

async function getCustomerWithAccounts(id) {
  const result = await pool.query(
    `SELECT id,
            customer_code,
            first_name,
            last_name,
            email,
            phone,
            address,
            city,
            created_at
       FROM customers
      WHERE id = $1`,
    [id]
  );

  const customer = result.rows[0];
  if (!customer) return null;

  const accounts = await pool.query(
    `SELECT id,
            account_number,
            account_type,
            balance,
            status,
            opened_at
       FROM accounts
      WHERE customer_id = $1
      ORDER BY opened_at DESC`,
    [id]
  );

  return {
    ...customer,
    accounts: accounts.rows.map((a) => ({ ...a, balance: NUMERIC(a.balance) }))
  };
}

async function createCustomer(data) {
  const result = await pool.query(
    `INSERT INTO customers
       (customer_code, first_name, last_name, email, phone, address, city)
     VALUES
       ('CUST' || lpad(nextval('seq_customer_code')::text, 3, '0'), $1, $2, $3, $4, $5, $6)
     RETURNING id,
               customer_code,
               first_name,
               last_name,
               email,
               phone,
               address,
               city,
               created_at`,
    [
      data.first_name.trim(),
      data.last_name.trim(),
      data.email.trim(),
      data.phone.trim(),
      (data.address || "").trim(),
      data.city.trim()
    ]
  );
  return result.rows[0];
}

module.exports = { getCustomers, getCustomerById, getCustomerWithAccounts, createCustomer };