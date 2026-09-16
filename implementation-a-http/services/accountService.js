const { pool } = require("../config/database");

const NUMERIC = (value) => Number(value);

async function getAllAccounts() {
  const result = await pool.query(
    `SELECT a.id,
            a.account_number,
            a.account_type,
            a.balance,
            a.status,
            a.opened_at,
            c.id AS customer_id,
            c.customer_code,
            c.first_name,
            c.last_name,
            c.email,
            c.phone,
            c.city
       FROM accounts a
       JOIN customers c ON c.id = a.customer_id
      ORDER BY a.opened_at DESC`
  );

  return result.rows.map((row) => ({
    ...row,
    balance: NUMERIC(row.balance)
  }));
}

async function getAccountByNumber(accountNumber) {
  const result = await pool.query(
    `SELECT a.id,
            a.account_number,
            a.account_type,
            a.balance,
            a.status,
            a.opened_at,
            c.id AS customer_id,
            c.customer_code,
            c.first_name,
            c.last_name,
            c.email,
            c.phone,
            c.city
       FROM accounts a
       JOIN customers c ON c.id = a.customer_id
      WHERE a.account_number = $1`,
    [accountNumber]
  );

  const row = result.rows[0];
  if (!row) return null;

  return { ...row, balance: NUMERIC(row.balance) };
}

async function createAccount({ customer_id, account_type, initial_balance }) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const customerResult = await client.query(
      `SELECT id FROM customers WHERE id = $1`,
      [customer_id]
    );
    if (!customerResult.rows[0]) {
      throw Object.assign(new Error("Customer not found"), { statusCode: 404 });
    }

    const amount = Number(initial_balance) || 0;

    const numberResult = await client.query(
      `SELECT 'ACC' || nextval('seq_account_number')::text AS account_number`
    );
    const accountNumber = numberResult.rows[0].account_number;

    const accountResult = await client.query(
      `INSERT INTO accounts
         (account_number, customer_id, account_type, balance, status)
       VALUES ($1, $2, $3, $4, 'Active')
       RETURNING id,
                 account_number,
                 account_type,
                 balance,
                 status,
                 opened_at`,
      [accountNumber, Number(customer_id), account_type, amount]
    );

    const accountRow = accountResult.rows[0];

    if (amount > 0) {
      const refResult = await client.query(
        `SELECT 'TXN-' || lpad(nextval('seq_transaction_reference')::text, 8, '0') AS reference`
      );
      await client.query(
        `INSERT INTO transactions
           (account_id, transaction_reference, transaction_type, amount, description, balance_after_transaction)
         VALUES ($1, $2, 'CREDIT', $3, 'Account opening deposit', $3)`,
        [accountRow.id, refResult.rows[0].reference, amount]
      );
    }

    await client.query("COMMIT");
    return { ...accountRow, balance: Number(accountRow.balance) };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { getAllAccounts, getAccountByNumber, createAccount };