const pool = require("./../config/db");
const { encrypt } = require("./../config/authentication");
const { validationRegister } = require("./../config/validation");

async function registrarUsuario(data) {
    data.codigo_pais = parseInt(data.codigo_pais);
    data.telefono = parseInt(data.telefono);
    
    const validations = await validationRegister(data);
    if (validations.length > 0) 
        response = { status: 400, data: validations };

    data.clave = await encrypt(data.clave);
    const insertSql = "INSERT INTO usuarios (nombre, apellido, codigo_pais, telefono, usuario, clave) VALUES ?";
    const values = [Object.values(data)];

    return new Promise((resolve, reject) => {
        pool.query(insertSql, [values], (error, result) => {
            if (error) {
                if (error.code === "ER_DUP_ENTRY") {
                    if (error.sqlMessage.includes("USUARIO_UNICO"))
                        resolve({ status: 400, message: "El nombre de usuario ya está en uso." });
                    else
                        resolve({ status: 400, message: "Ya existe un usuario con este código de país y número de teléfono." });
                } 
                else {
                    console.error("Error al registrar al usuario", error.stack);
                    reject({ status: 500, message: "Error al registrar al usuario." });
                }
            } 
            else
                resolve({ status: 201, message: "Usuario registrado exitosamente." });
        });
    });
}

module.exports = { registrarUsuario }