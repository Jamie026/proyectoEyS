const pool = require("./../config/db");
const { 
    encryptPassword, 
    comparePassword, 
    sendAuthEmail, 
    sendConfirmationEmail, 
    createCookie, 
    aes256Encrypt, 
    aes256Decrypt 
} = require("./../config/authentication");

function homePage(request, response) {
    const error = request.query.error || null; 
    const success = request.query.success || null;
    return response.render("main", { error, success });
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
    let encriptada = encryptPassword(clave);
    try {
        await pool.query("INSERT INTO usuarios (nombre, apellido, email, usuario, clave) VALUES (?, ?, ?, ?, ?)", 
            [nombre, apellido, email, usuario, encriptada]);
        const eliminarURL = "https://localhost:3000/deleteByEmail/" + encodeURIComponent(aes256Encrypt(usuario));
        const confirmationEmail = await sendConfirmationEmail(email, usuario, clave, eliminarURL, response);
        if (!confirmationEmail)
            return response.status(500).json({ message: [{ message: "Error al enviar correo de confirmación." }] });
        return response.status(201).json({ message: "Registro exitoso." });
    } catch (error) {        
        console.error("Error al registrar el usuario: ", error);
        if (error.message.includes("USUARIO_UNICO"))
            return response.status(500).json({ message: [{ message: "Error al registrar el nombre de usuario." }] });
        else if (error.message.includes("EMAIL_UNICO"))
           return response.status(500).json({ message: [{ message: "Error al registrar el email." }] });
        return response.status(500).json({ message: [{ message: "Error al procesar la solicitud." }] });
    }
}

async function loginUsuarioPOST(request, response) {
    const { usuario, clave } = request.body;
    try {
        const results = await pool.query("SELECT * FROM usuarios WHERE usuario = ? AND permiso = 1", [usuario]);
        if (results[0].length === 0)
            return response.redirect("/login?error=Usuario no encontrado.");
        const userData = results[0][0];
        if (!comparePassword(clave, userData.clave)) 
            return response.redirect("/login?error=Contraseña incorrecta.");
        const token = await sendAuthEmail(userData.email, response);
        if (!token)
            return response.redirect("/login?error=Error al enviar correo de autenticación.");
        request.session.token = aes256Encrypt(JSON.stringify(token));
        request.session.userData = aes256Encrypt(JSON.stringify(userData));
        return response.render("check");
    } catch (error) {
        return response.redirect("/login?error=Error al iniciar sesión.");
    }
}

function authenticationUsuario(request, response) {
    const userToken = request.body.codigo_mfa;
    const tokenDesencriptada = aes256Decrypt(request.session.token);
    if (userToken == tokenDesencriptada){
        const userData = JSON.parse(aes256Decrypt(request.session.userData));        
        createCookie(userData.usuario, response);
        return response.redirect("/dashboard");
    }
    else
        return response.redirect("/login?error=Error de autenticación.");
}

async function deleteByEmail(request, response) {
    try{
        const usuarioDesencriptado = aes256Decrypt(request.params.id);
        const [results] = await pool.query("DELETE FROM usuarios WHERE usuario = ?", [usuarioDesencriptado]);
        if (results.affectedRows > 0)
            return response.redirect("/?success=Cuenta eliminada.");
        else
            return response.redirect("/?error=Usuario no encontrado.");
    } catch (error) {
        return response.redirect("/?error=Error al eliminar la cuenta.");
    }
}

module.exports = {
    homePage,
    politicy,
    loginGET,
    registerGET,
    registerUsuarioPOST,
    loginUsuarioPOST,
    authenticationUsuario,
    deleteByEmail
};