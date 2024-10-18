const pool = require("./db");
const ms = require("ms");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const jsonwebtoken = require("jsonwebtoken");
require("dotenv").config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_SENDER,
        pass: process.env.EMAIL_SENDER_PASSWORD
    }
});

function encrypt(password){
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    return hash;
}

function compare(password, hashedPassword){
    return bcrypt.compareSync(password, hashedPassword);
}

async function sendAuthEmail(email, response) {
    try {
        const token = Math.floor(1000 + Math.random() * 9000);
        const html = await new Promise((resolve, reject) => {
            response.render("codeMFA", { token }, (err, renderedHtml) => {
                err ? reject(err) : resolve(renderedHtml);
            });
        });
        const mailOptions = {
            from: "Proyecto Ética y Seguridad",
            to: email,
            subject: "Código de verificación para tu cuenta",
            html
        };

        await transporter.sendMail(mailOptions);
        return token;
    } catch (error) {
        console.error("Error al generar token", error);
        return null;
    }
};

async function sendConfirmationEmail(email, username, password, deleteAccountLink, privacyPolicyLink, response) {
    try {
        const html = await new Promise((resolve, reject) => {
            response.render("confirmation", { username, password, deleteAccountLink, privacyPolicyLink }, (err, renderedHtml) => {
                err ? reject(err) : resolve(renderedHtml);
            });
        });
        const mailOptions = {
            from: "Proyecto de Ética y Seguridad",
            to: email,
            subject: "Notificación sobre el uso de tus datos y acceso a la plataforma",
            html
        };

        await transporter.sendMail(mailOptions);
        console.log('Correo de confirmación enviado');
        return true;
    } catch (error) {
        console.error("Error al enviar correo de confirmación: ", error);
        return false;
    }
}

function createCookie(usuario, response) {
    const token = jsonwebtoken.sign(
        { usuario: usuario }, 
        process.env.TOKEN_PRIVATE_KEY,
        { expiresIn: process.env.TOKEN_EXPIRATION } 
    );

    const cookieOptions = {
        expires: new Date(Date.now() + ms(process.env.TOKEN_EXPIRATION)),
        path: "/"
    };
    response.cookie("tokenKey", token, cookieOptions)
}

async function checkCookie(request) {
    const cookieJWT = request.headers.cookie.split("; ").find(cookie => cookie.startsWith("tokenKey="))?.slice(9); 
    if (!cookieJWT) 
        return false;
    try {
        const decodificada = jsonwebtoken.verify(cookieJWT, process.env.TOKEN_PRIVATE_KEY);
        const results = await pool.query("SELECT * FROM usuarios WHERE usuario = ? AND permiso = 1", [decodificada.usuario]);
        return (results[0].length === 0) ? false : results[0][0];
    } catch (error) {
        return false;
    }
}

module.exports = { encrypt, compare, sendAuthEmail, checkCookie, createCookie, sendConfirmationEmail };