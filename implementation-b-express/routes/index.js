const dashboardController = require("../controllers/dashboardController");
const customerController = require("../controllers/customerController");
const accountController = require("../controllers/accountController");
const transactionController = require("../controllers/transactionController");
const mainController = require("../controllers/mainController");

function registerRoutes(app) {
  app.get("/health", mainController.healthCheck);

  app.get("/", dashboardController.showDashboard);

  app.get("/customers", customerController.listCustomers);
  app.post("/customers", customerController.createCustomerHandler);
  app.get("/customer/:id", customerController.customerDetail);

  app.get("/accounts", accountController.listAccounts);
  app.get("/account/:accountNo", accountController.accountDetail);
  app.post("/accounts", accountController.createAccountHandler);

  app.get("/transactions", transactionController.listAllTransactions);
  app.get("/transactions/:accountNo", transactionController.transactionHistory);
  app.post("/transactions", transactionController.createTransactionHandler);
}

module.exports = registerRoutes;