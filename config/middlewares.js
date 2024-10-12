const pool = require("./db");
const jsonwebtoken = require("jsonwebtoken");
require('dotenv').config();

async function onlyPublic(request, response, next) {
    const logued = await checkCookie(request);
    if (!logued) return next();
    return response.redirect("/dashboard");
}

async function onlyAdmin(request, response, next) {
    const logued = await checkCookie(request);
    if (logued) return next();
    return response.redirect("/");
}

function checkCookie(request) {
    try {
        const cookieJWT = request.headers.cookie.split("; ").find(cookie => cookie.startsWith("tokenKey="))?.slice(9); 
        if (!cookieJWT) return false;
        const decodificada = jsonwebtoken.verify(cookieJWT, process.env.TOKEN_PRIVATE_KEY);

        const selectSql = "SELECT * FROM usuarios WHERE usuario = ? AND permiso = 1";
        return new Promise((resolve, reject) => {
            pool.query(selectSql, [decodificada.user], (error, result) => {
                if (error) return reject(false); 
                if (result.length === 0) return resolve(false);;
                return resolve(true); 
            });
        })
    } catch (error) {
        return false;
    }
}

module.exports = {
    onlyPublic,
    onlyAdmin
};