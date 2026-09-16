const {
  getAllTransactions,
  getTransactionsByAccount,
  createTransaction,
  transferFunds
} = require("../services/transactionService");
const { getAccountByNumber, getAllAccounts } = require("../services/accountService");
const { pageShell } = require("../utils/htmlLayout");
const { sendHTML, sendJSON, sendError, parseBody } = require("../utils/httpHelpers");
const { formatINR, formatDate, escapeHtml } = require("../utils/formatters");
const { validateTransaction } = require("../utils/validation");

async function listAllTransactions(req, res, searchParams = {}) {
  try {
    const accountFilter = searchParams.account ? String(searchParams.account).trim() : null;
    const typeFilter = searchParams.type ? String(searchParams.type).trim() : null;

    const [transactions, accounts] = await Promise.all([
      getAllTransactions({
        limit: 100,
        accountNumber: accountFilter,
        type: typeFilter
      }),
      getAllAccounts()
    ]);

    const activeAccounts = accounts.filter((a) => a.status === "Active");

    const sourceAccountOptions = activeAccounts
      .map(
        (a) =>
          `<option value="${escapeHtml(a.account_number)}">${escapeHtml(a.account_number)} - ${escapeHtml(a.first_name)} ${escapeHtml(a.last_name)} (Bal: ${formatINR(a.balance)})</option>`
      )
      .join("");

    const destAccountOptions = activeAccounts
      .map(
        (a) =>
          `<option value="${escapeHtml(a.account_number)}">${escapeHtml(a.account_number)} - ${escapeHtml(a.first_name)} ${escapeHtml(a.last_name)}</option>`
      )
      .join("");

    const filterAccountOptions = accounts
      .map(
        (a) =>
          `<option value="${escapeHtml(a.account_number)}" ${accountFilter === a.account_number ? "selected" : ""}>${escapeHtml(a.account_number)} - ${escapeHtml(a.first_name)} ${escapeHtml(a.last_name)}</option>`
      )
      .join("");

    const rows = transactions
      .map(
        (t) => `
        <tr>
          <td><span class="code-pill">${escapeHtml(t.transaction_reference)}</span></td>
          <td>${formatDate(t.transaction_date)}</td>
          <td>
            <a href="/account/${escapeHtml(t.account_number)}"><strong>${escapeHtml(t.account_number)}</strong></a>
            <br>
            <small class="muted">${escapeHtml(t.first_name)} ${escapeHtml(t.last_name)}</small>
          </td>
          <td><span class="badge badge-${t.transaction_type.toLowerCase()}">${escapeHtml(t.transaction_type)}</span></td>
          <td>${escapeHtml(t.description)}</td>
          <td class="amount ${t.transaction_type.toLowerCase()}">${t.transaction_type === "CREDIT" ? "+" : "−"}${formatINR(t.amount)}</td>
          <td class="amount">${formatINR(t.balance_after_transaction)}</td>
        </tr>`
      )
      .join("");

    const content = `
      <div class="page-header">
        <div>
          <h1>All Bank Transactions</h1>
          <p class="muted">Comprehensive audit log of all deposits, withdrawals, and transfers</p>
        </div>
        <div class="header-actions">
          <button id="show-add-transaction" class="btn btn-primary">+ New Transaction</button>
          <a class="btn btn-ghost" href="/accounts">View Accounts</a>
        </div>
      </div>

      <section id="add-transaction-panel" class="panel hidden">
        <div class="panel-title"><h2>Record New Transaction / Fund Transfer</h2></div>
        <form id="add-transaction-form" class="form-grid" novalidate>
          <label>Source Account
            <select name="account_number" id="txn-source-account" required>
              <option value="">Select source account</option>
              ${sourceAccountOptions}
            </select>
          </label>
          <label>Transaction Type
            <select name="transaction_type" id="txn-type-select" required>
              <option value="">Select type</option>
              <option value="CREDIT">Deposit (CREDIT)</option>
              <option value="DEBIT">Withdrawal (DEBIT)</option>
              <option value="TRANSFER">Fund Transfer (TRANSFER)</option>
            </select>
          </label>
          <label id="destination-account-group" class="hidden">Destination Account
            <select name="to_account_number" id="txn-dest-account">
              <option value="">Select recipient account</option>
              ${destAccountOptions}
            </select>
          </label>
          <label>Amount (₹)
            <input type="number" name="amount" min="0.01" step="0.01" placeholder="0.00" required>
          </label>
          <label>Description / Purpose
            <input type="text" name="description" maxlength="255" placeholder="e.g. Cash deposit, Salary, Invoice payment" required>
          </label>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary">Record Transaction</button>
            <button type="button" id="hide-add-transaction" class="btn btn-ghost">Cancel</button>
          </div>
          <p id="add-transaction-message" class="form-message" role="status"></p>
        </form>
      </section>

      <section class="panel filter-panel">
        <div class="panel-title">
          <h2>Filter Transactions</h2>
          <a class="btn btn-small btn-ghost" href="/transactions">Reset Filters</a>
        </div>
        <form method="GET" action="/transactions" class="filter-form">
          <div class="filter-group">
            <label for="filter-account">Filter by Account:</label>
            <select name="account" id="filter-account" onchange="this.form.submit()">
              <option value="">All Accounts</option>
              ${filterAccountOptions}
            </select>
          </div>
          <div class="filter-group">
            <label for="filter-type">Filter by Type:</label>
            <select name="type" id="filter-type" onchange="this.form.submit()">
              <option value="">All Types</option>
              <option value="CREDIT" ${typeFilter === "CREDIT" ? "selected" : ""}>CREDIT (Deposits & Inward Transfers)</option>
              <option value="DEBIT" ${typeFilter === "DEBIT" ? "selected" : ""}>DEBIT (Withdrawals & Outward Transfers)</option>
            </select>
          </div>
        </form>
      </section>

      <section class="panel">
        <div class="panel-title">
          <h2>Transaction Log</h2>
          <span class="muted">${transactions.length} transactions listed</span>
        </div>
        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Date & Time</th>
                <th>Account</th>
                <th>Type</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Balance After</th>
              </tr>
            </thead>
            <tbody>
              ${rows || '<tr><td colspan="7" class="empty-cell">No transactions found matching the criteria.</td></tr>'}
            </tbody>
          </table>
        </div>
      </section>
    `;

    sendHTML(res, 200, pageShell({ title: "Transactions", active: "transactions", content, serviceTag: "Implementation A" }));
  } catch (err) {
    console.error("List transactions error:", err.message);
    sendError(res, 500, "500 Internal Server Error", "Unable to load transactions.");
  }
}

async function transactionHistory(req, res, accountNumber) {
  try {
    const account = await getAccountByNumber(accountNumber);

    if (!account) {
      return sendError(res, 404, "404 Page Not Found", "The requested account was not found.");
    }

    const [transactions, allAccounts] = await Promise.all([
      getTransactionsByAccount(accountNumber),
      getAllAccounts()
    ]);

    const otherAccounts = allAccounts.filter(
      (a) => a.account_number !== account.account_number && a.status === "Active"
    );

    const destAccountOptions = otherAccounts
      .map(
        (a) =>
          `<option value="${escapeHtml(a.account_number)}">${escapeHtml(a.account_number)} - ${escapeHtml(a.first_name)} ${escapeHtml(a.last_name)}</option>`
      )
      .join("");

    const rows = transactions
      .map(
        (t) => `
        <tr>
          <td><span class="code-pill">${escapeHtml(t.transaction_reference)}</span></td>
          <td>${formatDate(t.transaction_date)}</td>
          <td><span class="badge badge-${t.transaction_type.toLowerCase()}">${escapeHtml(t.transaction_type)}</span></td>
          <td>${escapeHtml(t.description)}</td>
          <td class="amount ${t.transaction_type.toLowerCase()}">${t.transaction_type === "CREDIT" ? "+" : "−"}${formatINR(t.amount)}</td>
          <td class="amount">${formatINR(t.balance_after_transaction)}</td>
        </tr>`
      )
      .join("");

    const content = `
      <div class="page-header">
        <div>
          <h1>Transactions - ${escapeHtml(account.account_number)}</h1>
          <p class="muted">${escapeHtml(account.account_number)} · ${escapeHtml(account.first_name)} ${escapeHtml(account.last_name)} (${escapeHtml(account.account_type)} Account · Balance: ${formatINR(account.balance)})</p>
        </div>
        <div class="header-actions">
          <button id="show-add-transaction" class="btn btn-primary">+ New Transaction</button>
          <a class="btn btn-ghost" href="/account/${escapeHtml(account.account_number)}">Account details</a>
          <a class="btn btn-ghost" href="/transactions">&larr; All Transactions</a>
        </div>
      </div>

      <section id="add-transaction-panel" class="panel hidden">
        <div class="panel-title"><h2>Record New Transaction / Fund Transfer</h2></div>
        <form id="add-transaction-form" class="form-grid" novalidate>
          <input type="hidden" name="account_number" id="txn-source-account" value="${escapeHtml(account.account_number)}">
          <label>Transaction Type
            <select name="transaction_type" id="txn-type-select" required>
              <option value="">Select type</option>
              <option value="CREDIT">Deposit (CREDIT)</option>
              <option value="DEBIT">Withdrawal (DEBIT)</option>
              <option value="TRANSFER">Fund Transfer (TRANSFER)</option>
            </select>
          </label>
          <label id="destination-account-group" class="hidden">Destination Account
            <select name="to_account_number" id="txn-dest-account">
              <option value="">Select recipient account</option>
              ${destAccountOptions}
            </select>
          </label>
          <label>Amount (₹)
            <input type="number" name="amount" min="0.01" step="0.01" placeholder="0.00" required>
          </label>
          <label>Description / Purpose
            <input type="text" name="description" maxlength="255" placeholder="e.g. Cash deposit, Salary, Invoice payment" required>
          </label>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary">Record Transaction</button>
            <button type="button" id="hide-add-transaction" class="btn btn-ghost">Cancel</button>
          </div>
          <p id="add-transaction-message" class="form-message" role="status"></p>
        </form>
      </section>

      <section class="panel">
        <div class="panel-title">
          <h2>Transaction History</h2>
          <span class="muted">${transactions.length} transactions</span>
        </div>
        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Date</th>
                <th>Type</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              ${rows || '<tr><td colspan="6" class="empty-cell">No transactions found for this account.</td></tr>'}
            </tbody>
          </table>
        </div>
      </section>
    `;

    sendHTML(res, 200, pageShell({ title: `Transactions - ${account.account_number}`, active: "transactions", content, serviceTag: "Implementation A" }));
  } catch (err) {
    console.error("Transaction history error:", err.message);
    sendError(res, 500, "500 Internal Server Error", "Unable to load transactions.");
  }
}

async function createTransactionHandler(req, res) {
  try {
    const body = await parseBody(req);
    const errors = validateTransaction(body);

    if (errors.length > 0) {
      return sendJSON(res, 400, { success: false, message: "Validation failed.", errors });
    }

    const transactionType = String(body.transaction_type || "").toUpperCase();
    const sourceAccount = String(body.account_number || body.from_account_number || "").trim();
    const amount = Number(body.amount);
    const description = String(body.description || "").trim();

    if (transactionType === "TRANSFER") {
      const targetAccount = String(body.to_account_number || "").trim();
      try {
        const result = await transferFunds({
          from_account_number: sourceAccount,
          to_account_number: targetAccount,
          amount,
          description
        });

        return sendJSON(res, 201, {
          success: true,
          message: `Fund transfer of ₹${amount.toFixed(2)} to ${targetAccount} completed successfully.`,
          transfer: result,
          transaction: result.debitTransaction
        });
      } catch (err) {
        if (err.statusCode) {
          return sendJSON(res, err.statusCode, { success: false, message: err.message });
        }
        throw err;
      }
    }

    try {
      const transaction = await createTransaction({
        account_number: sourceAccount,
        transaction_type: transactionType,
        amount,
        description
      });
      return sendJSON(res, 201, {
        success: true,
        message: `${transactionType} transaction of ₹${amount.toFixed(2)} recorded successfully.`,
        transaction
      });
    } catch (err) {
      if (err.statusCode) {
        return sendJSON(res, err.statusCode, { success: false, message: err.message });
      }
      throw err;
    }
  } catch (err) {
    if (err.message === "Invalid JSON body" || err.message === "Payload too large") {
      return sendJSON(res, 400, { success: false, message: err.message });
    }
    console.error("Create transaction error:", err.message);
    return sendJSON(res, 500, { success: false, message: "Internal server error." });
  }
}

module.exports = { listAllTransactions, transactionHistory, createTransactionHandler };