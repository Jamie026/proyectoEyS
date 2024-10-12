const express = require("express");
const router = express.Router();
const jsonwebtoken = require("jsonwebtoken");
const { registrarUsuario, loginUsuario } = require("./../controllers/usuarios");
const { generateToken } = require("../config/authentication");
require('dotenv').config();

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
        const token = generateToken(loginResponse.user.email);
        request.session.token = token;
        request.session.user = loginResponse.user;
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
    if (userToken == sessionToken){
        const user = request.session.user;
        const token = jsonwebtoken.sign(
            { user: user.usuario }, 
            process.env.TOKEN_PRIVATE_KEY,
            { expiresIn: process.env.TOKEN_EXPIRATION } 
        );

        const cookieOptions = {
            expires: new Date(Date.now() + process.env.TOKEN_COOKIE_EXPIRATION * 24 * 60 * 60 * 1000),
            path: "/"
        };
        response.cookie("tokenKey", token, cookieOptions)
        response.redirect("/dashboard");
    }
    else{
        const error = "Autenticación fallida."
        response.redirect("/login?error=" + error);
    }
});

module.exports = router;