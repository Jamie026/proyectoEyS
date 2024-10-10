const express = require("express");
const router = express.Router();
const { registrarUsuario } = require("./../controllers/usuarios");

router.get("/", (request, response) => {
    response.render("main");
});

router.get("/login", (request, response) => {
    response.render("login");
});

router.get("/register", (request, response) => {
    response.render("register");
});

router.post("/register", async (request, response) => {
    const registroResponse = await registrarUsuario(request.body);
    response.status(registroResponse.status).json(registroResponse);
});

module.exports = router;
