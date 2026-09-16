const { getAllAccounts, getAccountByNumber, createAccount } = require("../services/accountService");
const { getTransactionsByAccount } = require("../services/transactionService");
const { getCustomers } = require("../services/customerService");
const { pageShell } = require("../utils/htmlLayout");
const { sendHTML, sendJSON, sendError, parseBody } = require("../utils/httpHelpers");
const { formatINR, formatDate, escapeHtml } = require("../utils/formatters");
const { validateAccount } = require("../utils/validation");

async function listAccounts(req, res) {
  try {
    const [accounts, customers] = await Promise.all([
      getAllAccounts(),
      getCustomers()
    ]);

    const activeAccounts = accounts.filter((a) => a.status === "Active");

    const customerOptions = customers
      .map(
        (c) =>
          `<option value="${c.id}">${escapeHtml(c.customer_code)} - ${escapeHtml(c.first_name)} ${escapeHtml(c.last_name)} (${escapeHtml(c.city)})</option>`
      )
      .join("");

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

    const accountRows = accounts
      .map(
        (a) => `
        <tr>
          <td><a href="/account/${escapeHtml(a.account_number)}"><strong>${escapeHtml(a.account_number)}</strong></a></td>
          <td>
            <a href="/customer/${a.customer_id}">${escapeHtml(a.first_name)} ${escapeHtml(a.last_name)}</a>
            <span class="muted">(${escapeHtml(a.customer_code)})</span>
          </td>
          <td>${escapeHtml(a.account_type)}</td>
          <td class="amount ${a.status === "Active" ? "credit" : ""}">${formatINR(a.balance)}</td>
          <td>
            <span class="badge badge-${escapeHtml(a.status.toLowerCase())}">${escapeHtml(a.status)}</span>
          </td>
          <td>${formatDate(a.opened_at)}</td>
          <td>
            <div class="table-actions">
              <a class="btn btn-small btn-ghost" href="/account/${escapeHtml(a.account_number)}">Details</a>
              <a class="btn btn-small btn-ghost" href="/transactions/${escapeHtml(a.account_number)}">History</a>
            </div>
          </td>
        </tr>`
      )
      .join("");

    const content = `
      <div class="page-header">
        <div>
          <h1>Bank Accounts</h1>
          <p class="muted">Manage all customer deposit and savings accounts</p>
        </div>
        <div class="header-actions">
          <button id="show-add-transaction" class="btn btn-ghost">+ New Transaction</button>
          <button id="show-add-account" class="btn btn-primary">+ Open Account</button>
        </div>
      </div>

      <section id="add-account-panel" class="panel hidden">
        <div class="panel-title"><h2>Open a New Account</h2></div>
        <form id="add-account-form" class="form-grid" novalidate>
          <label>Customer
            <select name="customer_id" required>
              <option value="">Select customer</option>
              ${customerOptions}
            </select>
          </label>
          <label>Account Type
            <select name="account_type" required>
              <option value="">Select type</option>
              <option value="Savings">Savings Account</option>
              <option value="Current">Current Account</option>
              <option value="Salary">Salary Account</option>
            </select>
          </label>
          <label>Initial Deposit (₹)
            <input type="number" name="initial_balance" min="0" step="0.01" value="0">
          </label>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary">Create Account</button>
            <button type="button" id="hide-add-account" class="btn btn-ghost">Cancel</button>
          </div>
          <p id="add-account-message" class="form-message" role="status"></p>
        </form>
      </section>

      <section id="add-transaction-panel" class="panel hidden">
        <div class="panel-title"><h2>New Transaction / Fund Transfer</h2></div>
        <form id="add-transaction-form" class="form-grid" novalidate>
          <label>Source Account
            <select name="account_number" id="txn-source-account" required>
              <option value="">Select account</option>
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
          <label>Description / Remarks
            <input type="text" name="description" maxlength="255" placeholder="e.g. Cash deposit, Salary, Rent payment" required>
          </label>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary">Submit Transaction</button>
            <button type="button" id="hide-add-transaction" class="btn btn-ghost">Cancel</button>
          </div>
          <p id="add-transaction-message" class="form-message" role="status"></p>
        </form>
      </section>

      <section class="panel">
        <div class="panel-title">
          <h2>All Accounts</h2>
          <span class="muted">${accounts.length} accounts registered</span>
        </div>
        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th>Account No.</th>
                <th>Customer</th>
                <th>Type</th>
                <th>Balance</th>
                <th>Status</th>
                <th>Opened</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${accountRows || '<tr><td colspan="7" class="empty-cell">No accounts found in the system.</td></tr>'}
            </tbody>
          </table>
        </div>
      </section>
    `;

    sendHTML(res, 200, pageShell({ title: "Accounts", active: "accounts", content, serviceTag: "Implementation A" }));
  } catch (err) {
    console.error("List accounts error:", err.message);
    sendError(res, 500, "500 Internal Server Error", "Unable to load accounts.");
  }
}

async function accountDetail(req, res, accountNumber) {
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
          `<option value="${escapeHtml(a.account_number)}">${escapeHtml(a.account_number)} - ${escapeHtml(a.first_name)} ${escapeHtml(a.last_name)} (${escapeHtml(a.account_type)})</option>`
      )
      .join("");

    const summaryItems = [
      ["Account Number", `<strong>${escapeHtml(account.account_number)}</strong>`],
      ["Account Holder", `<a href="/customer/${account.customer_id}">${escapeHtml(account.first_name)} ${escapeHtml(account.last_name)}</a> <span class="muted">(${escapeHtml(account.customer_code)})</span>`],
      ["Account Type", `${escapeHtml(account.account_type)} Account`],
      ["Current Balance", `<span class="amount credit" style="font-size: 1.25rem; font-weight: 700;">${formatINR(account.balance)}</span>`],
      ["Status", `<span class="badge badge-status badge-${escapeHtml(account.status.toLowerCase())}">${escapeHtml(account.status)}</span>`],
      ["Opened Date", formatDate(account.opened_at)]
    ]
      .map(([k, v]) => `<div class="detail-item"><span class="detail-label">${k}</span><span class="detail-value">${v}</span></div>`)
      .join("");

    const txnRows = transactions
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
          <h1>Account Details</h1>
          <p class="muted">${escapeHtml(account.account_number)} · ${escapeHtml(account.first_name)} ${escapeHtml(account.last_name)}</p>
        </div>
        <div class="header-actions">
          <button id="show-add-transaction" class="btn btn-primary">+ New Transaction</button>
          <a class="btn btn-ghost" href="/customer/${account.customer_id}">View Customer</a>
          <a class="btn btn-ghost" href="/accounts">&larr; All Accounts</a>
        </div>
      </div>

      <section class="panel">
        <div class="panel-title"><h2>Account Information</h2></div>
        <div class="detail-grid">
          ${summaryItems}
        </div>
      </section>

      <section id="add-transaction-panel" class="panel hidden">
        <div class="panel-title"><h2>Record Transaction / Fund Transfer</h2></div>
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
            <input type="text" name="description" maxlength="255" placeholder="e.g. Cash deposit, Salary, Transfer, Bill payment" required>
          </label>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary">Submit Transaction</button>
            <button type="button" id="hide-add-transaction" class="btn btn-ghost">Cancel</button>
          </div>
          <p id="add-transaction-message" class="form-message" role="status"></p>
        </form>
      </section>

      <section class="panel">
        <div class="panel-title">
          <h2>Recent Transactions</h2>
          <a class="btn btn-ghost" href="/transactions/${escapeHtml(account.account_number)}">Full history &rarr;</a>
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
              ${txnRows || '<tr><td colspan="6" class="empty-cell">No transactions recorded for this account.</td></tr>'}
            </tbody>
          </table>
        </div>
      </section>
    `;

    sendHTML(res, 200, pageShell({ title: "Account Details", active: "accounts", content, serviceTag: "Implementation A" }));
  } catch (err) {
    console.error("Account detail error:", err.message);
    sendError(res, 500, "500 Internal Server Error", "Unable to load account details.");
  }
}

async function createAccountHandler(req, res) {
  try {
    const body = await parseBody(req);
    const errors = validateAccount(body);

    if (errors.length > 0) {
      return sendJSON(res, 400, { success: false, message: "Validation failed.", errors });
    }

    try {
      const account = await createAccount({
        customer_id: String(body.customer_id).trim(),
        account_type: body.account_type.trim(),
        initial_balance:
          body.initial_balance === "" ||
          body.initial_balance === undefined ||
          body.initial_balance === null
            ? 0
            : Number(body.initial_balance)
      });
      return sendJSON(res, 201, { success: true, message: "Account created successfully.", account });
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
    console.error("Create account error:", err.message);
    return sendJSON(res, 500, { success: false, message: "Internal server error." });
  }
}

module.exports = { listAccounts, accountDetail, createAccountHandler };