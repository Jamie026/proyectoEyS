const { Validator } = require("node-input-validator");
const niv = require('node-input-validator');

niv.setLang("es");

niv.extendMessages({
    required: "El campo :attribute es obligatorio.",
    regex: "El formato del campo :attribute no es válido.",
    min: "El campo :attribute debe contener al menos :min caracteres.",
    max: "El campo :attribute no puede exceder los :max caracteres.",
    alpha: "El campo :attribute solo puede contener letras.",
    numeric: "El campo :attribute solo puede contener números."
}, "es");


async function validationRegister(data) {
    
    const register = new Validator(data, {
        nombre: "required|alpha",
        apellido: "required|alpha",
        codigo_pais: "required|numeric",
        telefono: "required|numeric",
        usuario: "required|min:8|max:20",
        clave: "required|min:8|max:20"
    });

    const matched = await register.check();
    return matched ? null : register.errors;
}

module.exports = { validationRegister };