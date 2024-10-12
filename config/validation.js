const { Validator } = require("node-input-validator");
const niv = require('node-input-validator');

niv.setLang("es");

niv.extendMessages({
    numeric: "El campo :attribute solo puede contener números.",
    required: "El campo :attribute es obligatorio.",
    regex: "El formato del campo :attribute no es válido.",
    alpha: "El campo :attribute solo puede contener letras.",
    length: "El campo :attribute debe tener mínimo 8 caracteres y máximo 20",
    email: "El campo :attribute debe tener formato de correo electrónico"
}, "es");

async function validationRegister(data) {
    
    const register = new Validator(data, {
        nombre: "required|alpha",
        apellido: "required|alpha",
        email: "required|email",
        usuario: "required|length:20,8|alphaNumeric",
        clave: "required|length:20,8|alphaNumeric"
    });

    const matched = await register.check();
    return matched ? null : register.errors;
}

async function validationLogin(data) {
    const login = new Validator(data, {
        usuario: "required|length:20,8|alphaNumeric",
        clave: "required|length:20,8|alphaNumeric"
    });

    const matched = await login.check();
    return matched? null : login.errors;
}

module.exports = { validationRegister, validationLogin };