const express = require("express");
const dashboard = express.Router();
const dashboardController = require("./../controllers/dashboard");
const { onlyAdmin, completeValidation } = require("./../config/middlewares");

dashboard.get("/", onlyAdmin, dashboardController.homePage);

dashboard.get("/customers", onlyAdmin, dashboardController.customers)

dashboard.post("/customers", onlyAdmin, dashboardController.customersFilter);

dashboard.get("/profile", onlyAdmin, dashboardController.profile);

dashboard.get("/changePrivacity", onlyAdmin, dashboardController.changePrivacity)

dashboard.post("/updateWorker", onlyAdmin, completeValidation, dashboardController.updateworker)

dashboard.get("/deleteWorker", onlyAdmin, dashboardController.deleteWorker)

dashboard.get("/logout", onlyAdmin, dashboardController.logout);

module.exports = dashboard ;