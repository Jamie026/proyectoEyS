const express = require("express");
const dashboard = express.Router();

dashboard .get("/", function (request, response) {
    response.render("dashboard", { success: "Inicio de Sesión exitoso." });
});

module.exports = dashboard ;