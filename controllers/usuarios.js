const pool = require("./../config/db");
const { encrypt, compare, sendAuthEmail, sendConfirmationEmail, createCookie } = require("./../config/authentication");
const { validationComplete, validationLogin } = require("./../config/validation");

function homePage(request, response) {
    return response.render("main");
}

function politicy(request, response) {
    return response.render("politicy");
}

function loginGET(request, response) {
    const error = request.query.error || null; 
    return response.render("login", { error }); 
}

function registerGET(request, response) {
    return response.render("register");
}

async function registerUsuarioPOST(request, response) {
    const { nombre, apellido, clave, usuario, email } = request.body;
    const validationErrors = await validationComplete(request.body);
    if (validationErrors) 
        return response.status(400).json({ message: validationErrors });    
    let encriptada = encrypt(clave);
    try {
        await pool.query("INSERT INTO usuarios (nombre, apellido, email, usuario, clave) VALUES (?, ?, ?, ?, ?)", 
            [nombre, apellido, email, usuario, encriptada]);
        const confirmationEmail = await sendConfirmationEmail(email, usuario, clave, "https://enlace.eliminar.cuenta", "http://localhost:3000/politicy", response);
        if (!confirmationEmail)
            return response.status(500).json({ message: [{ message: "Se registro al usuario, pero hubo error al enviar correo de confirmación." }] });
        return response.status(201).json({ message: "Ok." });
    } catch (error) {        
        let errorMessage = "Error al registrar al usuario.";        
        if (error.message.includes("USUARIO_UNICO"))
            errorMessage = "El nombre de usuario ya está en uso.";
        else if (error.message.includes("EMAIL_UNICO"))
            errorMessage = "El email ya está en uso.";
        return response.status(500).json({ message: [{ message: errorMessage }] });
    }
}

async function loginUsuarioPOST(request, response) {
    const { usuario, clave } = request.body;
    const validationErrors = await validationLogin(request.body);
    if (validationErrors)
        return response.redirect("/login?error=Los datos no cumplen con el formato.");
    try {
        const results = await pool.query("SELECT * FROM usuarios WHERE usuario = ? AND permiso = 1", [usuario]);
        if (results[0].length === 0)
            return response.redirect("/login?error=Usuario no encontrado o no tiene permisos para acceder.");
        const userData = results[0][0];
        if (!compare(clave, userData.clave)) 
            return response.redirect("/login?error=Contraseña incorrecta.");
        request.session.token = await sendAuthEmail(userData.email, response);
        if (!request.session.token)
            return response.redirect("/login?error=Error al enviar correo de autenticación.");
        request.session.userData = userData;
        return response.render("check");
    } catch (error) {
        return response.redirect("/login?error=Error al iniciar sesión");
    }
}

function authenticationUsuario(request, response) {
    const userToken = request.body.codigo_mfa;
    const sessionToken = request.session.token;
    if (userToken == sessionToken){
        const userData = request.session.userData;        
        createCookie(userData.usuario, response);
        return response.redirect("/dashboard");
    }
    else
        return response.redirect("/login?error=Autenticación fallida.");
}

module.exports = { 
    homePage, 
    politicy,
    registerGET, 
    loginGET, 
    registerUsuarioPOST, 
    loginUsuarioPOST, 
    authenticationUsuario 
};