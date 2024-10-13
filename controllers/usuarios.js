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

    try {
        const insertSql = "INSERT INTO usuarios (nombre, apellido, email, usuario, clave) VALUES ?";
        const values = [Object.values(data)];
        await pool.query(insertSql, [values]);
        return response.status(201).json({ status: 201, message: "Usuario registrado correctamente." });
    } catch (error) {
        let errorMessage = "Error al registrar al usuario.";
        
        if (error.message.includes("USUARIO_UNICO"))
            errorMessage = "El nombre de usuario ya está en uso.";
        else if (error.message.includes("EMAIL_UNICO"))
            errorMessage = "El email ya está en uso.";

        return response.status(400).json({ status: 400, message: errorMessage });
    }
}

async function loginUsuarioPOST(request, response) {
    const { usuario, clave } = request.body;
    
    try {
        const selectSql = "SELECT * FROM usuarios WHERE usuario = ? AND permiso = 1";
        const results = await pool.query(selectSql, [usuario]);
        if (results[0].length === 0)
            return response.redirect("/login?error=Usuario no encontrado o no tiene permisos para acceder.");
        const user = results[0][0];
        if (!compare(clave, user.clave)) 
            return response.redirect("/login?error=Contraseña incorrecta.");
        request.session.token = generateToken(user.email);
        request.session.user = user;
        return response.render("check");
    } catch (error) {
        return response.redirect("/login?error=Error al iniciar sesión");
    }
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