const { pool } = require("../config/database");

const NUMERIC = (value) => Number(value);

async function getAllTransactions({ limit = 100, accountNumber = null, type = null } = {}) {
  let query = `
    SELECT t.id,
           t.transaction_reference,
           t.transaction_type,
           t.amount,
           t.description,
           t.transaction_date,
           t.balance_after_transaction,
           a.account_number,
           a.account_type,
           c.id AS customer_id,
           c.first_name,
           c.last_name,
           c.customer_code
      FROM transactions t
      JOIN accounts a ON a.id = t.account_id
      JOIN customers c ON c.id = a.customer_id
  `;
  const conditions = [];
  const params = [];

  if (accountNumber) {
    params.push(accountNumber);
    conditions.push(`a.account_number = $${params.length}`);
  }

  if (type) {
    params.push(type.toUpperCase());
    conditions.push(`t.transaction_type = $${params.length}`);
  }

  if (conditions.length > 0) {
    query += ` WHERE ` + conditions.join(" AND ");
  }

  params.push(limit);
  query += ` ORDER BY t.transaction_date DESC, t.id DESC LIMIT $${params.length}`;

  const result = await pool.query(query, params);

  return result.rows.map((r) => ({
    ...r,
    amount: NUMERIC(r.amount),
    balance_after_transaction: NUMERIC(r.balance_after_transaction)
  }));
}

async function getTransactionsByAccount(accountNumber) {
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
            c.last_name,
            c.customer_code
       FROM transactions t
       JOIN accounts a ON a.id = t.account_id
       JOIN customers c ON c.id = a.customer_id
      WHERE a.account_number = $1
      ORDER BY t.transaction_date DESC, t.id DESC`,
    [accountNumber]
  );

  return result.rows.map((r) => ({
    ...r,
    amount: NUMERIC(r.amount),
    balance_after_transaction: NUMERIC(r.balance_after_transaction)
  }));
}

async function createTransaction({ account_number, transaction_type, amount, description }) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const accountResult = await client.query(
      `SELECT id, balance, status
         FROM accounts
        WHERE account_number = $1
        FOR UPDATE`,
      [account_number]
    );

    const account = accountResult.rows[0];
    if (!account) {
      throw Object.assign(new Error("Account not found"), { statusCode: 404 });
    }
    if (account.status !== "Active") {
      throw Object.assign(new Error("Account is not active"), { statusCode: 400 });
    }

    const amountValue = NUMERIC(amount);
    const currentBalance = NUMERIC(account.balance);
    const type = String(transaction_type).toUpperCase();

    if (type === "DEBIT" && amountValue > currentBalance) {
      throw Object.assign(new Error("Insufficient balance for DEBIT transaction"), {
        statusCode: 400
      });
    }

    const newBalance = type === "CREDIT" ? currentBalance + amountValue : currentBalance - amountValue;

    const refResult = await client.query(
      `SELECT 'TXN-' || lpad(nextval('seq_transaction_reference')::text, 8, '0') AS reference`
    );
    const reference = refResult.rows[0].reference;

    await client.query("UPDATE accounts SET balance = $1 WHERE id = $2", [
      newBalance,
      account.id
    ]);

    const insertResult = await client.query(
      `INSERT INTO transactions
         (account_id, transaction_reference, transaction_type, amount, description, balance_after_transaction)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id,
                 transaction_reference,
                 transaction_type,
                 amount,
                 description,
                 transaction_date,
                 balance_after_transaction`,
      [account.id, reference, type, amountValue, description, newBalance]
    );

    await client.query("COMMIT");
    return {
      ...insertResult.rows[0],
      amount: NUMERIC(insertResult.rows[0].amount),
      balance_after_transaction: NUMERIC(insertResult.rows[0].balance_after_transaction)
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

async function transferFunds({ from_account_number, to_account_number, amount, description }) {
  if (from_account_number === to_account_number) {
    throw Object.assign(new Error("Sender and recipient account cannot be the same"), {
      statusCode: 400
    });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Lock both accounts in consistent order to prevent deadlocks
    const orderedAccounts = [from_account_number, to_account_number].sort();
    const lockedRows = {};

    for (const accNo of orderedAccounts) {
      const res = await client.query(
        `SELECT id, account_number, balance, status
           FROM accounts
          WHERE account_number = $1
          FOR UPDATE`,
        [accNo]
      );
      if (!res.rows[0]) {
        throw Object.assign(new Error(`Account ${accNo} not found`), { statusCode: 404 });
      }
      lockedRows[accNo] = res.rows[0];
    }

    const fromAccount = lockedRows[from_account_number];
    const toAccount = lockedRows[to_account_number];

    if (fromAccount.status !== "Active") {
      throw Object.assign(new Error(`Source account ${from_account_number} is not active`), {
        statusCode: 400
      });
    }
    if (toAccount.status !== "Active") {
      throw Object.assign(new Error(`Destination account ${to_account_number} is not active`), {
        statusCode: 400
      });
    }

    const amountValue = NUMERIC(amount);
    const fromBalance = NUMERIC(fromAccount.balance);
    const toBalance = NUMERIC(toAccount.balance);

    if (amountValue > fromBalance) {
      throw Object.assign(
        new Error(`Insufficient balance in source account. Available: ₹${fromBalance.toFixed(2)}`),
        { statusCode: 400 }
      );
    }

    const newFromBalance = fromBalance - amountValue;
    const newToBalance = toBalance + amountValue;

    // Update balances
    await client.query("UPDATE accounts SET balance = $1 WHERE id = $2", [
      newFromBalance,
      fromAccount.id
    ]);
    await client.query("UPDATE accounts SET balance = $1 WHERE id = $2", [
      newToBalance,
      toAccount.id
    ]);

    // Generate transaction references
    const ref1Res = await client.query(
      `SELECT 'TXN-' || lpad(nextval('seq_transaction_reference')::text, 8, '0') AS reference`
    );
    const ref2Res = await client.query(
      `SELECT 'TXN-' || lpad(nextval('seq_transaction_reference')::text, 8, '0') AS reference`
    );

    const fromRef = ref1Res.rows[0].reference;
    const toRef = ref2Res.rows[0].reference;

    const fromDesc = description
      ? `Transfer to ${to_account_number} - ${description}`
      : `Transfer to ${to_account_number}`;
    const toDesc = description
      ? `Transfer from ${from_account_number} - ${description}`
      : `Transfer from ${from_account_number}`;

    // Record DEBIT on sender
    const debitRes = await client.query(
      `INSERT INTO transactions
         (account_id, transaction_reference, transaction_type, amount, description, balance_after_transaction)
       VALUES ($1, $2, 'DEBIT', $3, $4, $5)
       RETURNING id, transaction_reference, transaction_type, amount, description, transaction_date, balance_after_transaction`,
      [fromAccount.id, fromRef, amountValue, fromDesc, newFromBalance]
    );

    // Record CREDIT on receiver
    const creditRes = await client.query(
      `INSERT INTO transactions
         (account_id, transaction_reference, transaction_type, amount, description, balance_after_transaction)
       VALUES ($1, $2, 'CREDIT', $3, $4, $5)
       RETURNING id, transaction_reference, transaction_type, amount, description, transaction_date, balance_after_transaction`,
      [toAccount.id, toRef, amountValue, toDesc, newToBalance]
    );

    await client.query("COMMIT");

    return {
      success: true,
      debitTransaction: debitRes.rows[0],
      creditTransaction: creditRes.rows[0],
      from_account_number,
      to_account_number,
      amount: amountValue,
      balance_after_transaction: newFromBalance
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  getAllTransactions,
  getTransactionsByAccount,
  createTransaction,
  transferFunds
};