const {
  getCustomers,
  getCustomerWithAccounts,
  createCustomer
} = require("../services/customerService");
const { validateCustomer } = require("../utils/validation");

async function listCustomers(req, res, next) {
  try {
    const customers = await getCustomers();
    res.render("customers", {
      title: "Customers",
      activeNav: "customers",
      implementation: "Express + Handlebars",
      customers
    });
  } catch (err) {
    next(err);
  }
}

async function customerDetail(req, res, next) {
  try {
    if (!/^\d+$/.test(req.params.id)) {
      return res.status(404).render("404", {
        title: "Page Not Found",
        implementation: "Express + Handlebars",
        message: "The requested customer was not found."
      });
    }

    const customer = await getCustomerWithAccounts(req.params.id);

    if (!customer) {
      return res.status(404).render("404", {
        title: "Page Not Found",
        implementation: "Express + Handlebars",
        message: "The requested customer was not found."
      });
    }

    res.render("customer", {
      title: "Customer Details",
      activeNav: "customers",
      implementation: "Express + Handlebars",
      customer
    });
  } catch (err) {
    next(err);
  }
}

async function createCustomerHandler(req, res, next) {
  try {
    const errors = validateCustomer(req.body || {});

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed.",
        errors
      });
    }

    let customer;
    try {
      customer = await createCustomer(req.body);
    } catch (err) {
      if (err.code === "23505") {
        const field = err.constraint || "record";
        return res.status(400).json({
          success: false,
          message: `A customer with the same ${field.replace(/_/g, " ")} already exists.`
        });
      }
      throw err;
    }

    return res.status(201).json({
      success: true,
      message: "Customer created successfully.",
      customer
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { listCustomers, customerDetail, createCustomerHandler };