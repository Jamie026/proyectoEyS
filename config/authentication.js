const pool = require("./db");
const bcrypt = require("bcrypt");
const nodemailer = require('nodemailer');
const jsonwebtoken = require("jsonwebtoken");
require('dotenv').config();

function encrypt(password){
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    return hash;
}

function compare(password, hashedPassword){
    return bcrypt.compareSync(password, hashedPassword);
}

function generateToken(email) {
    try {
        const token = Math.floor(1000 + Math.random() * 9000);

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_SENDER,
                pass: process.env.EMAIL_SENDER_PASSWORD
            }
        })

        const mailOptions = {
            from: process.env.EMAIL_SENDER,
            to: email,
            subject: "Autenticación de usuario",
            text: `Tu código de verificación es: ${token}`
        };

        transporter.sendMail(mailOptions);
        return token;
    } catch (error) {
        console.error("Error al generar token", error);
        return null;
    }
};

async function checkCookie(request) {
    const cookieJWT = request.headers.cookie.split("; ").find(cookie => cookie.startsWith("tokenKey="))?.slice(9); 
    if (!cookieJWT) 
        return false;
    try {
        const decodificada = jsonwebtoken.verify(cookieJWT, process.env.TOKEN_PRIVATE_KEY);
        const selectSql = "SELECT * FROM usuarios WHERE usuario = ? AND permiso = 1";
        const results = await pool.query(selectSql, [decodificada.user]);
        return (results[0].length === 0) ? false : results[0][0];
    } catch (error) {
        return false;
    }
}

module.exports = { encrypt, compare, generateToken, checkCookie };