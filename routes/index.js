const express = require("express");
const router = express.Router();
const userController = require("./../controllers/usuarios");
const { onlyPublic, completeValidation,simpleValidation } = require("../config/middlewares");
require('dotenv').config();

router.get("/", onlyPublic, userController.homePage);

router.get("/politicy", userController.politicy);

router.get("/login", onlyPublic, userController.loginGET);

router.get("/register", onlyPublic, userController.registerGET);

router.post("/login", onlyPublic, simpleValidation, userController.loginUsuarioPOST);

router.post("/register", onlyPublic, completeValidation, userController.registerUsuarioPOST);

router.post("/authentication", onlyPublic, userController.authenticationUsuario);

router.get("/deleteByEmail/:id", onlyPublic, userController.deleteByEmail)

module.exports = router;