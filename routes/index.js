const express = require("express");
const router = express.Router();
const { registrarUsuario, loginUsuario } = require("./../controllers/usuarios");
const { generateToken } = require("../config/validation");

router.get("/", (request, response) => {
    response.render("main");
});

router.get("/login", (request, response) => {
    response.render("login");
});

router.get("/register", async (request, response) => {
    response.render("register");
});

router.post("/login", async (request, response) => {
    const loginResponse = await loginUsuario(request.body);
    if (loginResponse.status === 200){
        const token = generateToken(loginResponse.email);
        response.render("check");
    }
        
    else
        response.redirect("/login");
});

router.post("/register", async (request, response) => {        
    const registroResponse = await registrarUsuario(request.body);
    response.status(registroResponse.status).json(registroResponse);
});

module.exports = router;
