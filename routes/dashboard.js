const express = require("express");
const dashboard = express.Router();
const dashboardController = require("./../controllers/dashboard");

dashboard.get("/", dashboardController.homePage);

dashboard.get("/logout", dashboardController.logout);

module.exports = dashboard ;