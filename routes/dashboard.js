const express = require("express");
const dashboard = express.Router();
const dashboardController = require("./../controllers/dashboard");
const { onlyAdmin } = require("./../config/middlewares");

dashboard.get("/", onlyAdmin, dashboardController.homePage);

dashboard.get("/customers", onlyAdmin, dashboardController.customers)

dashboard.get("/logout", onlyAdmin, dashboardController.logout);

module.exports = dashboard ;