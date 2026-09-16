const { getAllAccounts, getAccountByNumber, createAccount } = require("../services/accountService");
const { getTransactionsByAccount } = require("../services/transactionService");
const { getCustomers } = require("../services/customerService");
const { validateAccount } = require("../utils/validation");

async function listAccounts(req, res, next) {
  try {
    const [accounts, customers] = await Promise.all([
      getAllAccounts(),
      getCustomers()
    ]);

    res.render("accounts", {
      title: "Accounts",
      activeNav: "accounts",
      implementation: "Express + Handlebars",
      accounts,
      customers
    });
  } catch (err) {
    next(err);
  }
}

async function accountDetail(req, res, next) {
  try {
    const account = await getAccountByNumber(req.params.accountNo);

    if (!account) {
      return res.status(404).render("404", {
        title: "Page Not Found",
        implementation: "Express + Handlebars",
        message: "The requested account was not found."
      });
    }

    const [transactions, allAccounts] = await Promise.all([
      getTransactionsByAccount(req.params.accountNo),
      getAllAccounts()
    ]);

    const otherAccounts = allAccounts.filter(
      (a) => a.account_number !== account.account_number && a.status === "Active"
    );

    res.render("account", {
      title: "Account Details",
      activeNav: "accounts",
      implementation: "Express + Handlebars",
      account,
      transactions,
      otherAccounts,
      allAccounts
    });
  } catch (err) {
    next(err);
  }
}

async function createAccountHandler(req, res, next) {
  try {
    const errors = validateAccount(req.body || {});

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed.",
        errors
      });
    }

    let account;
    try {
      account = await createAccount({
        customer_id: String(req.body.customer_id).trim(),
        account_type: req.body.account_type.trim(),
        initial_balance:
          req.body.initial_balance === "" ||
          req.body.initial_balance === undefined ||
          req.body.initial_balance === null
            ? 0
            : Number(req.body.initial_balance)
      });
    } catch (err) {
      if (err.statusCode) {
        return res.status(err.statusCode).json({
          success: false,
          message: err.message
        });
      }
      throw err;
    }

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      account
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { listAccounts, accountDetail, createAccountHandler };