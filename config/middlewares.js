const pool = require("./db");
const jsonwebtoken = require("jsonwebtoken");
require('dotenv').config();

async function onlyPublic(request, response, next) {
    const logued = await checkCookie(request);
    if (!logued) 
        return next();
    return response.redirect("/dashboard");
}

async function onlyAdmin(request, response, next) {
    const logued = await checkCookie(request);
    if (logued) 
        return next();
    return response.redirect("/");
}

async function checkCookie(request) {
    const cookieJWT = request.headers.cookie.split("; ").find(cookie => cookie.startsWith("tokenKey="))?.slice(9); 
    if (!cookieJWT) 
        return false;
    try {
        const decodificada = jsonwebtoken.verify(cookieJWT, process.env.TOKEN_PRIVATE_KEY);
        const selectSql = "SELECT * FROM usuarios WHERE usuario = ? AND permiso = 1";
        const results = await pool.query(selectSql, [decodificada.user]);
        return (results[0].length === 0) ? false : true;
    } catch (error) {
        return false;
    }
}

module.exports = {
    onlyPublic,
    onlyAdmin
};