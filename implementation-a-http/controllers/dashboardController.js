const { getDashboardStats } = require("../services/dashboardService");
const { getAllAccounts } = require("../services/accountService");
const { getCustomers } = require("../services/customerService");
const { pageShell } = require("../utils/htmlLayout");
const { sendHTML, sendError } = require("../utils/httpHelpers");
const { formatINR, formatDate, escapeHtml } = require("../utils/formatters");

async function showDashboard(req, res) {
  try {
    const [stats, accounts, customers] = await Promise.all([
      getDashboardStats(),
      getAllAccounts(),
      getCustomers()
    ]);

    const activeAccounts = accounts.filter((a) => a.status === "Active");

    const statCards = [
      { label: "Total Customers", value: stats.totalCustomers, icon: "people" },
      { label: "Total Accounts", value: stats.totalAccounts, icon: "card" },
      { label: "Total Bank Deposits", value: formatINR(stats.totalBalance), icon: "wallet" },
      { label: "Total Transactions", value: stats.totalTransactions, icon: "swap" }
    ]
      .map(
        (s) => `
        <div class="stat-card">
          <div class="stat-icon icon-${s.icon}" aria-hidden="true"></div>
          <div>
            <p class="stat-label">${s.label}</p>
            <p class="stat-value">${s.value}</p>
          </div>
        </div>`
      )
      .join("");

    const accountRows = stats.accountTypeCounts
      .map(
        (r) => `
        <tr>
          <td><strong>${escapeHtml(r.type)} Account</strong></td>
          <td>${r.count} active accounts</td>
        </tr>`
      )
      .join("");

    const recentRows = stats.recentTransactions
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
        </tr>`
      )
      .join("");

    const accountOptions = activeAccounts
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

    const customerOptions = customers
      .map(
        (c) =>
          `<option value="${c.id}">${escapeHtml(c.customer_code)} - ${escapeHtml(c.first_name)} ${escapeHtml(c.last_name)}</option>`
      )
      .join("");

    const content = `
      <div class="page-header">
        <div>
          <h1>Banking Dashboard</h1>
          <p class="muted">Overview of the Online Banking Management System</p>
        </div>
        <div class="header-actions">
          <button id="show-add-transaction" class="btn btn-primary">+ New Transaction</button>
          <button id="show-add-account" class="btn btn-ghost">+ Open Account</button>
          <button id="show-add-customer" class="btn btn-ghost">+ Add Customer</button>
        </div>
      </div>

      <section id="add-transaction-panel" class="panel hidden">
        <div class="panel-title"><h2>Quick Transaction / Fund Transfer</h2></div>
        <form id="add-transaction-form" class="form-grid" novalidate>
          <label>Source Account
            <select name="account_number" id="txn-source-account" required>
              <option value="">Select source account</option>
              ${accountOptions}
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
            <input type="text" name="description" maxlength="255" placeholder="e.g. Deposit, ATM withdrawal, Transfer" required>
          </label>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary">Process Transaction</button>
            <button type="button" id="hide-add-transaction" class="btn btn-ghost">Cancel</button>
          </div>
          <p id="add-transaction-message" class="form-message" role="status"></p>
        </form>
      </section>

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

      <section id="add-customer-panel" class="panel hidden">
        <div class="panel-title"><h2>Register New Customer</h2></div>
        <form id="add-customer-form" class="form-grid" novalidate>
          <label>First Name <input type="text" name="first_name" required></label>
          <label>Last Name <input type="text" name="last_name" required></label>
          <label>Email <input type="email" name="email" required></label>
          <label>Phone <input type="text" name="phone" required></label>
          <label>Address <input type="text" name="address"></label>
          <label>City <input type="text" name="city" required></label>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary">Create Customer</button>
            <button type="button" id="hide-add-customer" class="btn btn-ghost">Cancel</button>
          </div>
          <p id="add-customer-message" class="form-message" role="status"></p>
        </form>
      </section>

      <section class="stats-grid">
        ${statCards}
      </section>

      <section class="panel">
        <div class="panel-title">
          <h2>Account Overview</h2>
          <a class="btn btn-ghost btn-small" href="/accounts">View all accounts &rarr;</a>
        </div>
        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr><th>Account Type</th><th>Total Count</th></tr>
            </thead>
            <tbody>
              ${accountRows || '<tr><td colspan="2" class="empty-cell">No account data available.</td></tr>'}
            </tbody>
          </table>
        </div>
      </section>

      <section class="panel">
        <div class="panel-title">
          <h2>Recent Transactions</h2>
          <a class="btn btn-ghost" href="/transactions">All transactions &rarr;</a>
        </div>
        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Date</th>
                <th>Account</th>
                <th>Type</th>
                <th>Description</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${recentRows || '<tr><td colspan="6" class="empty-cell">No recent transactions found.</td></tr>'}
            </tbody>
          </table>
        </div>
      </section>

      <section class="quick-actions">
        <h2>Banking Quick Actions</h2>
        <div class="quick-grid">
          <a class="quick-link" href="/customers"><span class="quick-icon">&#128100;</span> Customer Directory</a>
          <a class="quick-link" href="/accounts"><span class="quick-icon">&#128179;</span> Bank Accounts</a>
          <a class="quick-link" href="/transactions"><span class="quick-icon">&#8645;</span> Transaction History</a>
        </div>
      </section>
    `;

    sendHTML(res, 200, pageShell({ title: "Dashboard", active: "dashboard", content, serviceTag: "Implementation A" }));
  } catch (err) {
    console.error("Dashboard error:", err.message);
    sendError(res, 500, "500 Internal Server Error", "Unable to load the dashboard.");
  }
}

module.exports = { showDashboard };