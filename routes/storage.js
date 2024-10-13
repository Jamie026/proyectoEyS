const express = require("express");
const storage = express.Router();
const storageController = require("./../controllers/storage");
const { onlyAdmin } = require("./../config/middlewares");

storage.get("/cardTypes", onlyAdmin, storageController.cardTypes);

storage.get("/customersByCountry", onlyAdmin, storageController.customersByCountry);

module.exports = storage ;