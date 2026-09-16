const {
  getAllTransactions,
  getTransactionsByAccount,
  createTransaction,
  transferFunds
} = require("../services/transactionService");
const { getAccountByNumber, getAllAccounts } = require("../services/accountService");
const { validateTransaction } = require("../utils/validation");

async function listAllTransactions(req, res, next) {
  try {
    const { account, type } = req.query;
    const [transactions, accounts] = await Promise.all([
      getAllTransactions({
        limit: 100,
        accountNumber: account ? String(account).trim() : null,
        type: type ? String(type).trim() : null
      }),
      getAllAccounts()
    ]);

    const activeAccounts = accounts.filter((a) => a.status === "Active");

    res.render("transactions", {
      title: "Transactions",
      activeNav: "transactions",
      implementation: "Express + Handlebars",
      isGlobal: true,
      transactions,
      accounts: activeAccounts,
      allAccounts: accounts,
      selectedAccount: account || "",
      selectedType: type || ""
    });
  } catch (err) {
    next(err);
  }
}

async function transactionHistory(req, res, next) {
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

    res.render("transactions", {
      title: `Transactions - ${account.account_number}`,
      activeNav: "transactions",
      implementation: "Express + Handlebars",
      isGlobal: false,
      account,
      transactions,
      allAccounts,
      otherAccounts
    });
  } catch (err) {
    next(err);
  }
}

async function createTransactionHandler(req, res, next) {
  try {
    const body = req.body || {};
    const errors = validateTransaction(body);

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed.",
        errors
      });
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

        return res.status(201).json({
          success: true,
          message: `Fund transfer of ₹${amount.toFixed(2)} to ${targetAccount} completed successfully.`,
          transfer: result,
          transaction: result.debitTransaction
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
    }

    let transaction;
    try {
      transaction = await createTransaction({
        account_number: sourceAccount,
        transaction_type: transactionType,
        amount,
        description
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
      message: `${transactionType} transaction of ₹${amount.toFixed(2)} recorded successfully.`,
      transaction
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listAllTransactions,
  transactionHistory,
  createTransactionHandler
};