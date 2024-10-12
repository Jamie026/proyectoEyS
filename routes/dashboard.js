const express = require("express");
const dashboard = express.Router();

dashboard.get("/", function (request, response) {
    const error = request.query.error || null; 
    response.render("dashboard", { error });
});

dashboard.get("/logout", (request, response) => {
    request.session.destroy((err) => {
        if (err) {
            const error = "Error al cerrar la sesión";
            response.redirect("/dashboard?error=" + error);
        }
        else { 
            response.cookie("tokenKey", "", { 
                expires: new Date(0),
                path: "/" 
            });
            response.redirect("/");
        }
    });
});

module.exports = dashboard ;