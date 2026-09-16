const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
const PHONE_REGEX = /^[0-9+\-\s]{7,20}$/;
const ACCOUNT_TYPES = ["Savings", "Current", "Salary"];

function validateCustomer(data) {
  const errors = [];
  const body = data || {};

  if (!body.first_name || !String(body.first_name).trim()) {
    errors.push("first_name is required.");
  } else if (String(body.first_name).trim().length > 100) {
    errors.push("first_name must be 100 characters or fewer.");
  }

  if (!body.last_name || !String(body.last_name).trim()) {
    errors.push("last_name is required.");
  } else if (String(body.last_name).trim().length > 100) {
    errors.push("last_name must be 100 characters or fewer.");
  }

  if (!body.email || !String(body.email).trim()) {
    errors.push("email is required.");
  } else if (!EMAIL_REGEX.test(String(body.email).trim())) {
    errors.push("email is not a valid email address.");
  }

  if (!body.phone || !String(body.phone).trim()) {
    errors.push("phone is required.");
  } else if (!PHONE_REGEX.test(String(body.phone).trim())) {
    errors.push("phone must be 7 to 20 digits (+, -, spaces allowed).");
  }

  if (!body.city || !String(body.city).trim()) {
    errors.push("city is required.");
  }

  return errors;
}

function validateAccount(data) {
  const errors = [];
  const body = data || {};

  if (!body.customer_id || !/^\d+$/.test(String(body.customer_id).trim())) {
    errors.push("customer_id must be a valid customer id.");
  }

  const accountType = String(body.account_type || "").trim();
  if (!accountType) {
    errors.push("account_type is required.");
  } else if (!ACCOUNT_TYPES.includes(accountType)) {
    errors.push("account_type must be Savings, Current, or Salary.");
  }

  const bal = body.initial_balance;
  if (bal !== undefined && bal !== null && bal !== "") {
    const num = Number(bal);
    if (Number.isNaN(num) || num < 0) {
      errors.push("initial_balance must be a number greater than or equal to 0.");
    }
  }

  return errors;
}

function validateTransaction(data) {
  const errors = [];
  const body = data || {};

  const sourceAccount = body.account_number || body.from_account_number;
  if (!sourceAccount || !String(sourceAccount).trim()) {
    errors.push("Account number is required.");
  }

  if (!body.amount || Number.isNaN(Number(body.amount)) || Number(body.amount) <= 0) {
    errors.push("amount must be a number greater than 0.");
  }

  const type = String(body.transaction_type || "").toUpperCase();
  if (type !== "CREDIT" && type !== "DEBIT" && type !== "TRANSFER") {
    errors.push("transaction_type must be CREDIT, DEBIT, or TRANSFER.");
  }

  if (type === "TRANSFER") {
    const targetAccount = body.to_account_number;
    if (!targetAccount || !String(targetAccount).trim()) {
      errors.push("Destination account number is required for transfers.");
    } else if (String(sourceAccount).trim().toUpperCase() === String(targetAccount).trim().toUpperCase()) {
      errors.push("Sender and recipient accounts cannot be the same.");
    }
  }

  if (!body.description || !String(body.description).trim()) {
    errors.push("description is required.");
  }

  return errors;
}

module.exports = { validateCustomer, validateAccount, validateTransaction };