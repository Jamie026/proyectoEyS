const express = require("express");
const router = express.Router();
const { registrarUsuario, loginUsuario } = require("./../controllers/usuarios");
const { generateToken } = require("../config/validation");

router.get("/", (request, response) => {
    response.render("main");
});

router.get("/login", (request, response) => {
    const error = request.query.error || null; 
    response.render("login", { error }); 
});

router.get("/register", async (request, response) => {
    response.render("register");
});

router.post("/login", async (request, response) => {
    const loginResponse = await loginUsuario(request.body);
    if (loginResponse.status === 200){
        const token = generateToken(loginResponse.email);
        request.session.token = token;
        response.render("check");
    }
    else{
        const error = loginResponse.message;
        response.redirect("/login?error=" + error);
    }
});

router.post("/register", async (request, response) => {        
    const registroResponse = await registrarUsuario(request.body);
    response.status(registroResponse.status).json(registroResponse);
});

router.post("/authentication", async (request, response) => {
    const userToken = request.body.codigo_mfa;
    const sessionToken = request.session.token;
    if (userToken == sessionToken) {
        response.send("Autenticación exitosa");
    } else {
        response.status(401).send("Código MFA inválido");
    }
});

module.exports = router;
