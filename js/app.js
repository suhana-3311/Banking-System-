/**
 * Online Banking System - Client Application Engine
 * Pure Vanilla JavaScript implementation running 100% in browser.
 */

// ==========================================================================
// 1. SEED DATASET (Derived from database/seed.sql)
// ==========================================================================
const SEED_CUSTOMERS = [
  { id: 1, customer_code: "CUST10001", first_name: "Aarav", last_name: "Sharma", email: "aarav.sharma@example.com", phone: "+91-9876543210", address: "12 Marine Drive", city: "Mumbai" },
  { id: 2, customer_code: "CUST10002", first_name: "Priya", last_name: "Patel", email: "priya.patel@example.com", phone: "+91-9876543211", address: "45 MG Road", city: "Bengaluru" },
  { id: 3, customer_code: "CUST10003", first_name: "Rohan", last_name: "Verma", email: "rohan.verma@example.com", phone: "+91-9876543212", address: "78 Park Street", city: "Kolkata" },
  { id: 4, customer_code: "CUST10004", first_name: "Ananya", last_name: "Sen", email: "ananya.sen@example.com", phone: "+91-9876543213", address: "23 Salt Lake", city: "Kolkata" },
  { id: 5, customer_code: "CUST10005", first_name: "Vikram", last_name: "Joshi", email: "vikram.joshi@example.com", phone: "+91-9876543214", address: "89 FC Road", city: "Pune" },
  { id: 6, customer_code: "CUST10006", first_name: "Neha", last_name: "Gupta", email: "neha.gupta@example.com", phone: "+91-9876543215", address: "12 Hazratganj", city: "Lucknow" },
  { id: 7, customer_code: "CUST10007", first_name: "Kabir", last_name: "Mehta", email: "kabir.mehta@example.com", phone: "+91-9876543216", address: "56 Anna Salai", city: "Chennai" },
  { id: 8, customer_code: "CUST10008", first_name: "Diya", last_name: "Reddy", email: "diya.reddy@example.com", phone: "+91-9876543217", address: "34 Banjara Hills", city: "Hyderabad" },
  { id: 9, customer_code: "CUST10009", first_name: "Siddharth", last_name: "Nair", email: "siddharth.nair@example.com", phone: "+91-9876543218", address: "67 Connaught Place", city: "New Delhi" },
  { id: 10, customer_code: "CUST10010", first_name: "Isha", last_name: "Kapoor", email: "isha.kapoor@example.com", phone: "+91-9876543219", address: "90 Lokhandwala", city: "Mumbai" }
];

const SEED_ACCOUNTS = [
  { id: 1, account_number: "ACC100001", customer_id: 1, account_type: "Savings", balance: 75000.00, status: "Active", opened_at: "2024-01-15T10:00:00Z" },
  { id: 2, account_number: "ACC100002", customer_id: 1, account_type: "Current", balance: 150000.50, status: "Active", opened_at: "2024-02-01T11:30:00Z" },
  { id: 3, account_number: "ACC100003", customer_id: 2, account_type: "Savings", balance: 45200.75, status: "Active", opened_at: "2024-01-20T09:15:00Z" },
  { id: 4, account_number: "ACC100004", customer_id: 2, account_type: "Salary", balance: 120000.00, status: "Active", opened_at: "2024-03-10T14:00:00Z" },
  { id: 5, account_number: "ACC100005", customer_id: 3, account_type: "Savings", balance: 12500.00, status: "Active", opened_at: "2024-02-15T16:45:00Z" },
  { id: 6, account_number: "ACC100006", customer_id: 4, account_type: "Current", balance: 88400.25, status: "Active", opened_at: "2024-01-05T12:00:00Z" },
  { id: 7, account_number: "ACC100007", customer_id: 5, account_type: "Savings", balance: 0.00, status: "Inactive", opened_at: "2023-11-20T10:30:00Z" },
  { id: 8, account_number: "ACC100008", customer_id: 6, account_type: "Savings", balance: 34000.00, status: "Active", opened_at: "2024-02-28T08:30:00Z" },
  { id: 9, account_number: "ACC100009", customer_id: 7, account_type: "Salary", balance: 210000.00, status: "Active", opened_at: "2024-03-01T13:20:00Z" },
  { id: 10, account_number: "ACC100010", customer_id: 8, account_type: "Savings", balance: 5000.00, status: "Active", opened_at: "2024-03-05T15:10:00Z" },
  { id: 11, account_number: "ACC100011", customer_id: 8, account_type: "Current", balance: 67500.00, status: "Active", opened_at: "2024-03-12T11:00:00Z" },
  { id: 12, account_number: "ACC100012", customer_id: 9, account_type: "Savings", balance: 98000.00, status: "Active", opened_at: "2024-01-18T10:00:00Z" },
  { id: 13, account_number: "ACC100013", customer_id: 10, account_type: "Savings", balance: 0.00, status: "Closed", opened_at: "2023-09-01T09:00:00Z" }
];

const SEED_TRANSACTIONS = [
  // ACC100001
  { id: 1, account_id: 1, transaction_reference: "TXN1000000001", transaction_type: "CREDIT", amount: 50000.00, description: "Initial Deposit", transaction_date: "2024-01-15T10:05:00Z", balance_after_transaction: 50000.00 },
  { id: 2, account_id: 1, transaction_reference: "TXN1000000002", transaction_type: "CREDIT", amount: 35000.00, description: "Salary Deposit", transaction_date: "2024-01-31T18:00:00Z", balance_after_transaction: 85000.00 },
  { id: 3, account_id: 1, transaction_reference: "TXN1000000003", transaction_type: "DEBIT", amount: 10000.00, description: "ATM Cash Withdrawal", transaction_date: "2024-02-05T12:30:00Z", balance_after_transaction: 75000.00 },
  // ACC100002
  { id: 4, account_id: 2, transaction_reference: "TXN1000000004", transaction_type: "CREDIT", amount: 200000.00, description: "Business Deposit", transaction_date: "2024-02-01T11:35:00Z", balance_after_transaction: 200000.00 },
  { id: 5, account_id: 2, transaction_reference: "TXN1000000005", transaction_type: "DEBIT", amount: 49999.50, description: "Vendor Payment", transaction_date: "2024-02-10T15:20:00Z", balance_after_transaction: 150000.50 },
  // ACC100003
  { id: 6, account_id: 3, transaction_reference: "TXN1000000006", transaction_type: "CREDIT", amount: 50000.00, description: "Opening Deposit", transaction_date: "2024-01-20T09:20:00Z", balance_after_transaction: 50000.00 },
  { id: 7, account_id: 3, transaction_reference: "TXN1000000007", transaction_type: "DEBIT", amount: 4799.25, description: "Online Shopping", transaction_date: "2024-02-14T20:15:00Z", balance_after_transaction: 45200.75 },
  // ACC100004
  { id: 8, account_id: 4, transaction_reference: "TXN1000000008", transaction_type: "CREDIT", amount: 120000.00, description: "Monthly Salary Credit", transaction_date: "2024-03-10T14:05:00Z", balance_after_transaction: 120000.00 },
  // ACC100005
  { id: 9, account_id: 5, transaction_reference: "TXN1000000009", transaction_type: "CREDIT", amount: 15000.00, description: "Initial Deposit", transaction_date: "2024-02-15T16:50:00Z", balance_after_transaction: 15000.00 },
  { id: 10, account_id: 5, transaction_reference: "TXN1000000010", transaction_type: "DEBIT", amount: 2500.00, description: "Utility Bill Payment", transaction_date: "2024-03-01T10:00:00Z", balance_after_transaction: 12500.00 },
  // ACC100006
  { id: 11, account_id: 6, transaction_reference: "TXN1000000011", transaction_type: "CREDIT", amount: 100000.00, description: "Client Payment", transaction_date: "2024-01-05T12:10:00Z", balance_after_transaction: 100000.00 },
  { id: 12, account_id: 6, transaction_reference: "TXN1000000012", transaction_type: "DEBIT", amount: 11599.75, description: "Office Rent", transaction_date: "2024-02-01T09:00:00Z", balance_after_transaction: 88400.25 },
  // ACC100008
  { id: 13, account_id: 8, transaction_reference: "TXN1000000013", transaction_type: "CREDIT", amount: 34000.00, description: "Deposit", transaction_date: "2024-02-28T08:35:00Z", balance_after_transaction: 34000.00 },
  // ACC100009
  { id: 14, account_id: 9, transaction_reference: "TXN1000000014", transaction_type: "CREDIT", amount: 210000.00, description: "Bonus Payment", transaction_date: "2024-03-01T13:25:00Z", balance_after_transaction: 210000.00 },
  // ACC100010
  { id: 15, account_id: 10, transaction_reference: "TXN1000000015", transaction_type: "CREDIT", amount: 5000.00, description: "Initial Deposit", transaction_date: "2024-03-05T15:15:00Z", balance_after_transaction: 5000.00 },
  // ACC100011
  { id: 16, account_id: 11, transaction_reference: "TXN1000000016", transaction_type: "CREDIT", amount: 67500.00, description: "Transfer In", transaction_date: "2024-03-12T11:05:00Z", balance_after_transaction: 67500.00 },
  // ACC100012
  { id: 17, account_id: 12, transaction_reference: "TXN1000000017", transaction_type: "CREDIT", amount: 100000.00, description: "Deposit", transaction_date: "2024-01-18T10:05:00Z", balance_after_transaction: 100000.00 },
  { id: 18, account_id: 12, transaction_reference: "TXN1000000018", transaction_type: "DEBIT", amount: 2000.00, description: "ATM Withdrawal", transaction_date: "2024-02-20T14:30:00Z", balance_after_transaction: 98000.00 }
];

// ==========================================================================
// 2. APP STATE & LOCAL STORAGE MANAGEMENT
// ==========================================================================
class BankingStore {
  constructor() {
    this.init();
  }

  init() {
    if (!localStorage.getItem("banking_customers")) {
      this.resetToSeed();
    } else {
      this.load();
    }
  }

  resetToSeed() {
    this.customers = JSON.parse(JSON.stringify(SEED_CUSTOMERS));
    this.accounts = JSON.parse(JSON.stringify(SEED_ACCOUNTS));
    this.transactions = JSON.parse(JSON.stringify(SEED_TRANSACTIONS));
    this.save();
  }

  save() {
    localStorage.setItem("banking_customers", JSON.stringify(this.customers));
    localStorage.setItem("banking_accounts", JSON.stringify(this.accounts));
    localStorage.setItem("banking_transactions", JSON.stringify(this.transactions));
  }

  load() {
    this.customers = JSON.parse(localStorage.getItem("banking_customers")) || [];
    this.accounts = JSON.parse(localStorage.getItem("banking_accounts")) || [];
    this.transactions = JSON.parse(localStorage.getItem("banking_transactions")) || [];
  }

  // Helper sequence generators
  nextCustomerId() {
    return this.customers.reduce((max, c) => Math.max(max, c.id), 0) + 1;
  }

  nextCustomerCode() {
    const id = this.nextCustomerId();
    return `CUST${(10000 + id)}`;
  }

  nextAccountId() {
    return this.accounts.reduce((max, a) => Math.max(max, a.id), 0) + 1;
  }

  nextAccountNumber() {
    const id = this.nextAccountId();
    return `ACC${(100000 + id)}`;
  }

  nextTransactionId() {
    return this.transactions.reduce((max, t) => Math.max(max, t.id), 0) + 1;
  }

  nextTransactionReference() {
    const id = this.nextTransactionId();
    return `TXN${String(id).padStart(10, '0')}`;
  }

  // Data queries
  getStats() {
    const totalCustomers = this.customers.length;
    const totalAccounts = this.accounts.length;
    const totalBalance = this.accounts.reduce((sum, a) => sum + parseFloat(a.balance), 0);
    const totalTransactions = this.transactions.length;

    // Type distribution
    const accountTypes = {};
    this.accounts.forEach(a => {
      accountTypes[a.account_type] = (accountTypes[a.account_type] || 0) + 1;
    });

    return { totalCustomers, totalAccounts, totalBalance, totalTransactions, accountTypes };
  }

  addCustomer(data) {
    const newCustomer = {
      id: this.nextCustomerId(),
      customer_code: this.nextCustomerCode(),
      first_name: data.first_name.trim(),
      last_name: data.last_name.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone.trim(),
      address: data.address ? data.address.trim() : "",
      city: data.city.trim()
    };
    this.customers.unshift(newCustomer);
    this.save();
    return newCustomer;
  }

  openAccount(data) {
    const customerId = parseInt(data.customer_id);
    const customer = this.customers.find(c => c.id === customerId);
    if (!customer) throw new Error("Customer not found.");

    const initialBalance = parseFloat(data.initial_balance || 0);
    if (isNaN(initialBalance) || initialBalance < 0) {
      throw new Error("Initial balance must be a non-negative number.");
    }

    const newAccount = {
      id: this.nextAccountId(),
      account_number: this.nextAccountNumber(),
      customer_id: customerId,
      account_type: data.account_type,
      balance: initialBalance,
      status: "Active",
      opened_at: new Date().toISOString()
    };

    this.accounts.unshift(newAccount);

    // If initial deposit > 0, record initial credit transaction
    if (initialBalance > 0) {
      const newTxn = {
        id: this.nextTransactionId(),
        account_id: newAccount.id,
        transaction_reference: this.nextTransactionReference(),
        transaction_type: "CREDIT",
        amount: initialBalance,
        description: "Opening Deposit",
        transaction_date: new Date().toISOString(),
        balance_after_transaction: initialBalance
      };
      this.transactions.unshift(newTxn);
    }

    this.save();
    return newAccount;
  }

  recordTransaction(data) {
    const account = this.accounts.find(a => a.account_number === data.account_number);
    if (!account) throw new Error("Account not found.");
    if (account.status !== "Active") throw new Error(`Account ${account.account_number} is ${account.status}.`);

    const amount = parseFloat(data.amount);
    if (isNaN(amount) || amount <= 0) throw new Error("Transaction amount must be greater than zero.");

    let currentBalance = parseFloat(account.balance);
    let newBalance = currentBalance;

    if (data.transaction_type === "DEBIT") {
      if (amount > currentBalance) {
        throw new Error(`Insufficient funds. Available balance: ₹${currentBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`);
      }
      newBalance -= amount;
    } else if (data.transaction_type === "CREDIT") {
      newBalance += amount;
    } else {
      throw new Error("Invalid transaction type.");
    }

    account.balance = newBalance;

    const newTxn = {
      id: this.nextTransactionId(),
      account_id: account.id,
      transaction_reference: this.nextTransactionReference(),
      transaction_type: data.transaction_type,
      amount: amount,
      description: data.description ? data.description.trim() : "Transaction",
      transaction_date: new Date().toISOString(),
      balance_after_transaction: newBalance
    };

    this.transactions.unshift(newTxn);
    this.save();
    return newTxn;
  }
}

// Instantiate store
const store = new BankingStore();

// ==========================================================================
// 3. UI FORMATTERS & HELPERS
// ==========================================================================
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(amount || 0);
}

function formatDate(dateStr) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function formatDateTime(dateStr) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function showToast(message, type = "success") {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${type === 'success' ? '✓' : '⚠️'}</span> <span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

function populateCustomerDropdown(selectedCustomerId = null) {
  const select = document.getElementById("acc-modal-customer");
  if (!select) return;
  if (!store.customers || store.customers.length === 0) {
    select.innerHTML = `<option value="">No customers available</option>`;
    return;
  }
  select.innerHTML = store.customers.map(cust => `
    <option value="${cust.id}" ${selectedCustomerId && parseInt(selectedCustomerId) === cust.id ? 'selected' : ''}>
      ${cust.first_name} ${cust.last_name} (${cust.customer_code}) - ${cust.city}
    </option>
  `).join("");
}

function populateAccountDropdown(selectedAccNo = null) {
  const select = document.getElementById("txn-modal-acc-no");
  if (!select) return;
  if (!store.accounts || store.accounts.length === 0) {
    select.innerHTML = `<option value="">No accounts available</option>`;
    return;
  }
  select.innerHTML = store.accounts.map(acc => {
    const owner = store.customers.find(c => c.id === acc.customer_id);
    const ownerName = owner ? `${owner.first_name} ${owner.last_name}` : "Unknown";
    return `
      <option value="${acc.account_number}" ${selectedAccNo && selectedAccNo === acc.account_number ? 'selected' : ''}>
        ${acc.account_number} - ${ownerName} (${acc.account_type}, ₹${parseFloat(acc.balance).toLocaleString('en-IN')})
      </option>
    `;
  }).join("");
}

// Modal handling
function openModal(modalId, param = null) {
  if (modalId === "modal-open-account") {
    populateCustomerDropdown(param);
  } else if (modalId === "modal-record-txn") {
    populateAccountDropdown(param);
  }
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add("active");
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove("active");
}

// ==========================================================================
// 4. VIEW RENDERING ENGINE
// ==========================================================================
function navigateTo(viewId, param = null) {
  document.querySelectorAll(".view-panel").forEach(panel => panel.classList.remove("active"));
  document.querySelectorAll(".nav-link").forEach(link => link.classList.remove("active"));

  const targetView = document.getElementById(`view-${viewId}`);
  if (targetView) targetView.classList.add("active");

  const navLink = document.querySelector(`.nav-link[data-view="${viewId}"]`);
  if (navLink) navLink.classList.add("active");

  // Render content dynamically based on target view
  if (viewId === "dashboard") renderDashboard();
  else if (viewId === "customers") renderCustomers();
  else if (viewId === "customer-detail" && param) renderCustomerDetail(param);
  else if (viewId === "accounts") renderAccounts();
  else if (viewId === "account-detail" && param) renderAccountDetail(param);
  else if (viewId === "transactions") renderTransactions();
}

// --- Dashboard View ---
function renderDashboard() {
  const stats = store.getStats();
  document.getElementById("stat-customers").textContent = stats.totalCustomers;
  document.getElementById("stat-accounts").textContent = stats.totalAccounts;
  document.getElementById("stat-balance").textContent = formatCurrency(stats.totalBalance);
  document.getElementById("stat-transactions").textContent = stats.totalTransactions;

  // Recent transactions table (Top 8)
  const tbody = document.getElementById("dash-transactions-body");
  const recent = store.transactions.slice(0, 8);

  if (recent.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="empty-state">No transactions recorded.</td></tr>`;
    return;
  }

  tbody.innerHTML = recent.map(t => {
    const acc = store.accounts.find(a => a.id === t.account_id);
    const accNo = acc ? acc.account_number : `ACC#${t.account_id}`;
    return `
      <tr>
        <td><span class="code-pill">${t.transaction_reference}</span></td>
        <td><a href="#" onclick="navigateTo('account-detail', '${accNo}'); return false;" class="code-pill" style="color:var(--primary);">${accNo}</a></td>
        <td><span class="badge badge-${t.transaction_type.toLowerCase()}">${t.transaction_type}</span></td>
        <td>${t.description || '-'}</td>
        <td class="amount ${t.transaction_type.toLowerCase()}">${t.transaction_type === 'CREDIT' ? '+' : '−'}${formatCurrency(t.amount)}</td>
        <td>${formatDateTime(t.transaction_date)}</td>
      </tr>
    `;
  }).join("");
}

// --- Customers View ---
function renderCustomers() {
  const search = document.getElementById("customer-search").value.toLowerCase();
  const cityFilter = document.getElementById("customer-city-filter").value;

  let list = store.customers.filter(c => {
    const matchesSearch = c.first_name.toLowerCase().includes(search) ||
                          c.last_name.toLowerCase().includes(search) ||
                          c.customer_code.toLowerCase().includes(search) ||
                          c.email.toLowerCase().includes(search);
    const matchesCity = !cityFilter || c.city === cityFilter;
    return matchesSearch && matchesCity;
  });

  // Populate city filter dropdown dynamically if empty
  const citySelect = document.getElementById("customer-city-filter");
  if (citySelect.options.length <= 1) {
    const cities = [...new Set(store.customers.map(c => c.city))].sort();
    cities.forEach(city => {
      const opt = document.createElement("option");
      opt.value = city;
      opt.textContent = city;
      citySelect.appendChild(opt);
    });
  }

  const tbody = document.getElementById("customers-table-body");
  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="empty-state">No matching customers found.</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(c => {
    const accCount = store.accounts.filter(a => a.customer_id === c.id).length;
    return `
      <tr>
        <td><span class="code-pill">${c.customer_code}</span></td>
        <td><strong>${c.first_name} ${c.last_name}</strong></td>
        <td>${c.email}</td>
        <td>${c.phone}</td>
        <td>${c.city}</td>
        <td>
          <button class="btn btn-secondary btn-sm" onclick="navigateTo('customer-detail', ${c.id})">
            View Details (${accCount} accounts)
          </button>
        </td>
      </tr>
    `;
  }).join("");
}

// --- Customer Detail View ---
function renderCustomerDetail(customerId) {
  const c = store.customers.find(cust => cust.id === parseInt(customerId));
  if (!c) {
    showToast("Customer not found", "error");
    navigateTo('customers');
    return;
  }

  document.getElementById("cd-name").textContent = `${c.first_name} ${c.last_name}`;
  document.getElementById("cd-code").textContent = c.customer_code;
  document.getElementById("cd-email").textContent = c.email;
  document.getElementById("cd-phone").textContent = c.phone;
  document.getElementById("cd-city").textContent = c.city;
  document.getElementById("cd-address").textContent = c.address || "N/A";

  // Pre-fill Open Account Modal Customer Dropdown
  populateCustomerDropdown(c.id);

  // Customer's accounts table
  const userAccounts = store.accounts.filter(a => a.customer_id === c.id);
  const tbody = document.getElementById("cd-accounts-body");

  if (userAccounts.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="empty-state">No accounts opened for this customer yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = userAccounts.map(a => `
    <tr>
      <td><span class="code-pill">${a.account_number}</span></td>
      <td><strong>${a.account_type}</strong></td>
      <td class="amount">${formatCurrency(a.balance)}</td>
      <td><span class="badge badge-${a.status.toLowerCase()}">${a.status}</span></td>
      <td>${formatDate(a.opened_at)}</td>
      <td>
        <button class="btn btn-secondary btn-sm" onclick="navigateTo('account-detail', '${a.account_number}')">
          View Account
        </button>
      </td>
    </tr>
  `).join("");
}

// --- Accounts View ---
function renderAccounts() {
  const search = document.getElementById("account-search").value.toLowerCase();
  const typeFilter = document.getElementById("account-type-filter").value;

  let list = store.accounts.filter(a => {
    const cust = store.customers.find(c => c.id === a.customer_id);
    const custName = cust ? `${cust.first_name} ${cust.last_name}`.toLowerCase() : "";
    const matchesSearch = a.account_number.toLowerCase().includes(search) || custName.includes(search);
    const matchesType = !typeFilter || a.account_type === typeFilter;
    return matchesSearch && matchesType;
  });

  const tbody = document.getElementById("accounts-table-body");
  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="empty-state">No matching accounts found.</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(a => {
    const cust = store.customers.find(c => c.id === a.customer_id);
    const ownerName = cust ? `${cust.first_name} ${cust.last_name}` : "Unknown";
    return `
      <tr>
        <td><span class="code-pill">${a.account_number}</span></td>
        <td>
          <a href="#" onclick="navigateTo('customer-detail', ${a.customer_id}); return false;" style="font-weight:600; color:var(--primary); text-decoration:none;">
            ${ownerName}
          </a>
        </td>
        <td><strong>${a.account_type}</strong></td>
        <td class="amount">${formatCurrency(a.balance)}</td>
        <td><span class="badge badge-${a.status.toLowerCase()}">${a.status}</span></td>
        <td>
          <button class="btn btn-secondary btn-sm" onclick="navigateTo('account-detail', '${a.account_number}')">
            Transactions & Details
          </button>
        </td>
      </tr>
    `;
  }).join("");
}

// --- Account Detail View ---
function renderAccountDetail(accNo) {
  const a = store.accounts.find(acc => acc.account_number === accNo);
  if (!a) {
    showToast("Account not found", "error");
    navigateTo('accounts');
    return;
  }

  const owner = store.customers.find(c => c.id === a.customer_id);
  document.getElementById("ad-acc-no").textContent = a.account_number;
  document.getElementById("ad-owner").textContent = owner ? `${owner.first_name} ${owner.last_name}` : "Unknown";
  document.getElementById("ad-type").textContent = a.account_type;
  document.getElementById("ad-balance").textContent = formatCurrency(a.balance);
  document.getElementById("ad-status").innerHTML = `<span class="badge badge-${a.status.toLowerCase()}">${a.status}</span>`;
  document.getElementById("ad-date").textContent = formatDate(a.opened_at);

  // Pre-fill transaction modal
  document.getElementById("txn-modal-acc-no").value = a.account_number;

  // Account transaction history table
  const txns = store.transactions.filter(t => t.account_id === a.id);
  const tbody = document.getElementById("ad-transactions-body");

  if (txns.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="empty-state">No transactions recorded for this account.</td></tr>`;
    return;
  }

  tbody.innerHTML = txns.map(t => `
    <tr>
      <td><span class="code-pill">${t.transaction_reference}</span></td>
      <td><span class="badge badge-${t.transaction_type.toLowerCase()}">${t.transaction_type}</span></td>
      <td>${t.description || '-'}</td>
      <td class="amount ${t.transaction_type.toLowerCase()}">${t.transaction_type === 'CREDIT' ? '+' : '−'}${formatCurrency(t.amount)}</td>
      <td class="amount">${formatCurrency(t.balance_after_transaction)}</td>
      <td>${formatDateTime(t.transaction_date)}</td>
    </tr>
  `).join("");
}

// --- Transactions View ---
function renderTransactions() {
  const search = document.getElementById("txn-search").value.toLowerCase();
  const typeFilter = document.getElementById("txn-type-filter").value;

  let list = store.transactions.filter(t => {
    const acc = store.accounts.find(a => a.id === t.account_id);
    const accNo = acc ? acc.account_number.toLowerCase() : "";
    const matchesSearch = t.transaction_reference.toLowerCase().includes(search) ||
                          accNo.includes(search) ||
                          (t.description && t.description.toLowerCase().includes(search));
    const matchesType = !typeFilter || t.transaction_type === typeFilter;
    return matchesSearch && matchesType;
  });

  const tbody = document.getElementById("transactions-table-body");
  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="empty-state">No matching transactions found.</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(t => {
    const acc = store.accounts.find(a => a.id === t.account_id);
    const accNo = acc ? acc.account_number : `ACC#${t.account_id}`;
    return `
      <tr>
        <td><span class="code-pill">${t.transaction_reference}</span></td>
        <td><a href="#" onclick="navigateTo('account-detail', '${accNo}'); return false;" class="code-pill" style="color:var(--primary);">${accNo}</a></td>
        <td><span class="badge badge-${t.transaction_type.toLowerCase()}">${t.transaction_type}</span></td>
        <td>${t.description || '-'}</td>
        <td class="amount ${t.transaction_type.toLowerCase()}">${t.transaction_type === 'CREDIT' ? '+' : '−'}${formatCurrency(t.amount)}</td>
        <td class="amount">${formatCurrency(t.balance_after_transaction)}</td>
        <td>${formatDateTime(t.transaction_date)}</td>
      </tr>
    `;
  }).join("");
}

// ==========================================================================
// 5. EVENT LISTENERS & FORM HANDLERS
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
  // Navigation Links
  document.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const viewId = link.getAttribute("data-view");
      navigateTo(viewId);
    });
  });

  // Search/Filter Inputs
  document.getElementById("customer-search")?.addEventListener("input", renderCustomers);
  document.getElementById("customer-city-filter")?.addEventListener("change", renderCustomers);

  document.getElementById("account-search")?.addEventListener("input", renderAccounts);
  document.getElementById("account-type-filter")?.addEventListener("change", renderAccounts);

  document.getElementById("txn-search")?.addEventListener("input", renderTransactions);
  document.getElementById("txn-type-filter")?.addEventListener("change", renderTransactions);

  // --- Add Customer Form ---
  document.getElementById("form-add-customer")?.addEventListener("submit", (e) => {
    e.preventDefault();
    try {
      const formData = {
        first_name: document.getElementById("cust-first-name").value,
        last_name: document.getElementById("cust-last-name").value,
        email: document.getElementById("cust-email").value,
        phone: document.getElementById("cust-phone").value,
        city: document.getElementById("cust-city").value,
        address: document.getElementById("cust-address").value
      };

      const newCust = store.addCustomer(formData);
      showToast(`Customer ${newCust.first_name} ${newCust.last_name} (${newCust.customer_code}) created successfully!`);
      closeModal("modal-add-customer");
      e.target.reset();
      navigateTo("customers");
    } catch (err) {
      showToast(err.message, "error");
    }
  });

  // --- Open Account Form ---
  document.getElementById("form-open-account")?.addEventListener("submit", (e) => {
    e.preventDefault();
    try {
      const formData = {
        customer_id: document.getElementById("acc-modal-customer").value,
        account_type: document.getElementById("acc-modal-type").value,
        initial_balance: document.getElementById("acc-modal-balance").value
      };

      const newAcc = store.openAccount(formData);
      showToast(`Account ${newAcc.account_number} (${newAcc.account_type}) opened successfully!`);
      closeModal("modal-open-account");
      e.target.reset();
      navigateTo("account-detail", newAcc.account_number);
    } catch (err) {
      showToast(err.message, "error");
    }
  });

  // --- Record Transaction Form ---
  document.getElementById("form-record-txn")?.addEventListener("submit", (e) => {
    e.preventDefault();
    try {
      const formData = {
        account_number: document.getElementById("txn-modal-acc-no").value,
        transaction_type: document.getElementById("txn-modal-type").value,
        amount: document.getElementById("txn-modal-amount").value,
        description: document.getElementById("txn-modal-desc").value
      };

      const txn = store.recordTransaction(formData);
      showToast(`Transaction ${txn.transaction_reference} recorded (${txn.transaction_type} ${formatCurrency(txn.amount)})`);
      closeModal("modal-record-txn");
      e.target.reset();
      renderAccountDetail(formData.account_number);
    } catch (err) {
      showToast(err.message, "error");
    }
  });

  // --- Reset Demo Data Button ---
  document.getElementById("btn-reset-demo")?.addEventListener("click", () => {
    if (confirm("Reset application data back to the default database seed dataset?")) {
      store.resetToSeed();
      showToast("Database seed dataset restored!");
      navigateTo("dashboard");
    }
  });

  // Initial view load
  navigateTo("dashboard");
});
