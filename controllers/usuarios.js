const pool = require("./../config/db");
const { encrypt, compare, generateToken } = require("./../config/authentication");
const { validationRegister } = require("./../config/validation");
const jsonwebtoken = require("jsonwebtoken");

function homePage(request, response) {
    return response.render("main");
}

function loginGET(request, response) {
    const error = request.query.error || null; 
    return response.render("login", { error }); 
}

function registerGET(request, response) {
    return response.render("register");
}

async function registerUsuarioPOST(request, response) {

    const data = request.body;
    const validationErrors = await validationRegister(data);
    if (validationErrors) 
        return response.status(400).json({ status: 400, data: validationErrors });
    data.clave = encrypt(data.clave);

    const insertSql = "INSERT INTO usuarios (nombre, apellido, email, usuario, clave) VALUES ?";
    const values = [Object.values(data)];

    pool.query(insertSql, [values], (error, result) => {
        if (error) {
            if (error.code === "ER_DUP_ENTRY") {
                const message = error.sqlMessage.includes("USUARIO_UNICO")
                    ? "El nombre de usuario ya está en uso."
                    : "Ya existe un usuario con este correo electrónico.";
                return response.status(400).json({ status: 400, message: message });
            }
            console.error("Error al registrar al usuario", error.stack);
            return response.status(500).json({ status: 500, message: "Error al registrar al usuario." });
        }
        return response.status(201).json({ status: 201, message: "Usuario registrado exitosamente." });
    });
}

function loginUsuarioPOST(request, response) {
    const { usuario, clave } = request.body;
    const selectSql = "SELECT * FROM usuarios WHERE usuario = ? AND permiso = 1";

    pool.query(selectSql, [usuario], (error, result) => {
        if (error) 
            return response.redirect("/login?error=Error al iniciar sesión");

        if (result.length === 0) 
            return response.redirect("/login?error=Usuario no encontrado o no tiene permisos para acceder.");

        const user = result[0];

        if (!compare(clave, user.clave)) 
            return response.redirect("/login?error=Contraseña incorrecta.");
        request.session.token = generateToken(user.email);
        request.session.user = user;
        return response.render("check");
    });
}

function authenticationUsuario(request, response) {
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
        return response.redirect("/dashboard");
    }
    else
        return response.redirect("/login?error=Autenticación fallida.");
}

module.exports = { 
    homePage, 
    registerGET, 
    loginGET, 
    registerUsuarioPOST, 
    loginUsuarioPOST, 
    authenticationUsuario 
};