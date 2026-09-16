const {
  getCustomers,
  getCustomerWithAccounts,
  createCustomer
} = require("../services/customerService");
const { pageShell } = require("../utils/htmlLayout");
const { sendHTML, sendJSON, sendError, parseBody } = require("../utils/httpHelpers");
const { formatINR, formatDate, escapeHtml } = require("../utils/formatters");
const { validateCustomer } = require("../utils/validation");

async function listCustomers(req, res) {
  try {
    const customers = await getCustomers();

    const rows = customers
      .map(
        (c) => `
        <tr>
          <td><span class="code-pill">${escapeHtml(c.customer_code)}</span></td>
          <td>${escapeHtml(c.first_name)} ${escapeHtml(c.last_name)}</td>
          <td>${escapeHtml(c.email)}</td>
          <td>${escapeHtml(c.phone)}</td>
          <td>${escapeHtml(c.city)}</td>
          <td><a class="btn btn-small btn-ghost" href="/customer/${c.id}">View Details</a></td>
        </tr>`
      )
      .join("");

    const content = `
      <div class="page-header">
        <div>
          <h1>Customers</h1>
          <p class="muted">All registered customers of the bank</p>
        </div>
        <button id="show-add-customer" class="btn btn-primary">+ Add Customer</button>
      </div>

      <section id="add-customer-panel" class="panel hidden">
        <div class="panel-title"><h2>Add Customer</h2></div>
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

      <section class="panel">
        <div class="panel-title">
          <h2>Customer Directory</h2>
          <span class="muted">${customers.length} customers</span>
        </div>
        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th>Customer Code</th>
                <th>Customer</th>
                <th>Email</th>
                <th>Phone</th>
                <th>City</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${rows || '<tr><td colspan="6" class="empty-cell">No customers found.</td></tr>'}
            </tbody>
          </table>
        </div>
      </section>
    `;

    sendHTML(res, 200, pageShell({ title: "Customers", active: "customers", content, serviceTag: "Implementation A" }));
  } catch (err) {
    console.error("Customers error:", err.message);
    sendError(res, 500, "500 Internal Server Error", "Unable to load customers.");
  }
}

async function customerDetail(req, res, id) {
  try {
    if (!/^\d+$/.test(id)) {
      return sendError(res, 404, "404 Page Not Found", "The requested customer was not found.");
    }

    const customer = await getCustomerWithAccounts(id);

    if (!customer) {
      return sendError(res, 404, "404 Page Not Found", "The requested customer was not found.");
    }

    const detailItems = [
      ["Full Name", `<strong>${escapeHtml(customer.first_name)} ${escapeHtml(customer.last_name)}</strong>`],
      ["Customer Code", `<span class="code-pill">${escapeHtml(customer.customer_code)}</span>`],
      ["Email", escapeHtml(customer.email)],
      ["Phone", escapeHtml(customer.phone)],
      ["Address", customer.address ? escapeHtml(customer.address) : "—"],
      ["City", escapeHtml(customer.city)],
      ["Registered", formatDate(customer.created_at)]
    ]
      .map(([k, v]) => `<div class="detail-item"><span class="detail-label">${k}</span><span class="detail-value">${v}</span></div>`)
      .join("");

    const accountRows = customer.accounts
      .map(
        (a) => `
        <tr>
          <td><a href="/account/${escapeHtml(a.account_number)}"><strong>${escapeHtml(a.account_number)}</strong></a></td>
          <td>${escapeHtml(a.account_type)}</td>
          <td class="amount ${a.status === "Active" ? "credit" : ""}">${formatINR(a.balance)}</td>
          <td><span class="badge badge-status badge-${escapeHtml(a.status.toLowerCase())}">${escapeHtml(a.status)}</span></td>
          <td>${formatDate(a.opened_at)}</td>
          <td>
            <div class="table-actions">
              <a class="btn btn-small btn-ghost" href="/account/${escapeHtml(a.account_number)}">View Details</a>
              <a class="btn btn-small btn-ghost" href="/transactions/${escapeHtml(a.account_number)}">Transactions</a>
            </div>
          </td>
        </tr>`
      )
      .join("");

    const content = `
      <div class="page-header">
        <div>
          <h1>Customer Details</h1>
          <p class="muted">${escapeHtml(customer.first_name)} ${escapeHtml(customer.last_name)}</p>
        </div>
        <div class="header-actions">
          <button id="show-add-account" class="btn btn-primary">+ Add Account</button>
          <a class="btn btn-ghost" href="/customers">&larr; Back to Customers</a>
        </div>
      </div>

      <section class="panel">
        <div class="panel-title"><h2>Customer Information</h2></div>
        <div class="detail-grid">
          ${detailItems}
        </div>
      </section>

      <section id="add-account-panel" class="panel hidden">
        <div class="panel-title"><h2>Open an Account</h2></div>
        <form id="add-account-form" class="form-grid" novalidate>
          <input type="hidden" name="customer_id" value="${customer.id}">
          <label>Account Type
            <select name="account_type" required>
              <option value="">Select type</option>
              <option value="Savings">Savings</option>
              <option value="Current">Current</option>
              <option value="Salary">Salary</option>
            </select>
          </label>
          <label>Initial Balance (₹) <input type="number" name="initial_balance" min="0" step="0.01" value="0"></label>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary">Create Account</button>
            <button type="button" id="hide-add-account" class="btn btn-ghost">Cancel</button>
          </div>
          <p id="add-account-message" class="form-message" role="status"></p>
        </form>
      </section>

      <section class="panel">
        <div class="panel-title">
          <h2>Customer Accounts</h2>
          <span class="muted">${customer.accounts.length} accounts</span>
        </div>
        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th>Account Number</th>
                <th>Type</th>
                <th>Balance</th>
                <th>Status</th>
                <th>Opened</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${accountRows || '<tr><td colspan="6" class="empty-cell">No accounts found for this customer.</td></tr>'}
            </tbody>
          </table>
        </div>
      </section>
    `;

    sendHTML(res, 200, pageShell({ title: "Customer Details", active: "customers", content, serviceTag: "Implementation A" }));
  } catch (err) {
    console.error("Customer detail error:", err.message);
    sendError(res, 500, "500 Internal Server Error", "Unable to load customer details.");
  }
}

async function createCustomerHandler(req, res) {
  try {
    const body = await parseBody(req);
    const errors = validateCustomer(body);

    if (errors.length > 0) {
      return sendJSON(res, 400, { success: false, message: "Validation failed.", errors });
    }

    try {
      const customer = await createCustomer(body);
      return sendJSON(res, 201, { success: true, message: "Customer created successfully.", customer });
    } catch (err) {
      if (err.code === "23505") {
        const field = err.constraint || "record";
        return sendJSON(res, 400, {
          success: false,
          message: `A customer with the same ${field.replace(/_/g, " ")} already exists.`
        });
      }
      throw err;
    }
  } catch (err) {
    if (err.message === "Invalid JSON body" || err.message === "Payload too large") {
      return sendJSON(res, 400, { success: false, message: err.message });
    }
    console.error("Create customer error:", err.message);
    return sendJSON(res, 500, { success: false, message: "Internal server error." });
  }
}

module.exports = { listCustomers, customerDetail, createCustomerHandler };