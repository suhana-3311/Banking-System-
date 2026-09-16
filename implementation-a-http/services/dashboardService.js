const { pool } = require("../config/database");

const NUMERIC = (value) => Number(value);
const SUM = (value) => Number(value || 0);

async function getDashboardStats() {
  const [customers, accounts, balance, transactions, accountTypes] = await Promise.all([
    pool.query('SELECT COUNT(*)::int AS count FROM customers'),
    pool.query('SELECT COUNT(*)::int AS count FROM accounts'),
    pool.query('SELECT COALESCE(SUM(balance), 0) AS total FROM accounts'),
    pool.query('SELECT COUNT(*)::int AS count FROM transactions'),
    pool.query(
      `SELECT account_type, COUNT(*)::int AS count
         FROM accounts
        GROUP BY account_type
        ORDER BY count DESC`
    )
  ]);

  return {
    totalCustomers: customers.rows[0].count,
    totalAccounts: accounts.rows[0].count,
    totalBalance: NUMERIC(balance.rows[0].total),
    totalTransactions: transactions.rows[0].count,
    accountTypeCounts: accountTypes.rows.map((r) => ({
      type: r.account_type,
      count: r.count
    })),
    recentTransactions: await getRecentTransactions(8),
    recentCustomers: await getRecentCustomers(5)
  };
}

async function getRecentTransactions(limit) {
  const result = await pool.query(
    `SELECT t.id,
            t.transaction_reference,
            t.transaction_type,
            t.amount,
            t.description,
            t.transaction_date,
            t.balance_after_transaction,
            a.account_number,
            a.account_type,
            c.first_name,
            c.last_name
       FROM transactions t
       JOIN accounts a ON a.id = t.account_id
       JOIN customers c ON c.id = a.customer_id
      ORDER BY t.transaction_date DESC
      LIMIT $1`,
    [limit]
  );
  return result.rows.map((r) => ({
    ...r,
    amount: NUMERIC(r.amount),
    balance_after_transaction: NUMERIC(r.balance_after_transaction)
  }));
}

async function getRecentCustomers(limit) {
  const result = await pool.query(
    `SELECT id,
            customer_code,
            first_name,
            last_name,
            email,
            phone,
            city
       FROM customers
      ORDER BY created_at DESC
      LIMIT $1`,
    [limit]
  );
  return result.rows;
}

module.exports = { getDashboardStats };