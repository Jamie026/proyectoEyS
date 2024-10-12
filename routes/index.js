const express = require("express");
const router = express.Router();
const userController = require("./../controllers/usuarios");
require('dotenv').config();

router.get("/", userController.homePage);

router.get("/login", userController.loginGET);

router.get("/register", userController.registerGET);

router.post("/login", userController.loginUsuarioPOST);

router.post("/register", userController.registerUsuarioPOST);

router.post("/authentication", userController.authenticationUsuario);

module.exports = router;