const { getDashboardStats } = require("../services/dashboardService");
const { getAllAccounts } = require("../services/accountService");
const { getCustomers } = require("../services/customerService");

async function showDashboard(req, res, next) {
  try {
    const [stats, accounts, customers] = await Promise.all([
      getDashboardStats(),
      getAllAccounts(),
      getCustomers()
    ]);

    const activeAccounts = accounts.filter((a) => a.status === "Active");

    res.render("home", {
      title: "Dashboard",
      activeNav: "dashboard",
      implementation: "Express + Handlebars",
      stats,
      accounts: activeAccounts,
      customers
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { showDashboard };