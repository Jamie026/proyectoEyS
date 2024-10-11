const pool = require("./../config/db");
const { encrypt, compare } = require("./../config/authentication");
const { validationRegister } = require("./../config/validation");

async function registrarUsuario(data) {

    const validationErrors = await validationRegister(data);
    if (validationErrors) return { status: 400, data: validationErrors };

    data.clave = encrypt(data.clave);

    const insertSql = "INSERT INTO usuarios (nombre, apellido, email, usuario, clave) VALUES ?";
    const values = [Object.values(data)];

    return new Promise((resolve, reject) => {
        pool.query(insertSql, [values], (error, result) => {
            if (error) {
                if (error.code === "ER_DUP_ENTRY") {
                    const message = error.sqlMessage.includes("USUARIO_UNICO")
                        ? "El nombre de usuario ya está en uso."
                        : "Ya existe un usuario con este correo electrónico.";
                    return resolve({ status: 400, message });
                }
                console.error("Error al registrar al usuario", error.stack);
                return reject({ status: 500, message: "Error al registrar al usuario." });
            }
            resolve({ status: 201, message: "Usuario registrado exitosamente." });
        });
    });
}


function loginUsuario(data) {
    const selectSql = "SELECT * FROM usuarios WHERE usuario = ? AND permiso = 1";
    const values = [data.usuario];

    return new Promise((resolve, reject) => {
        pool.query(selectSql, values, (error, result) => {
            if (error) return reject({ status: 500, message: "Error al intentar iniciar sesión." });

            if (result.length === 0) return resolve({ status: 404, message: "Usuario no encontrado o no tiene permisos para acceder." });

            const user = result[0];
            const isPasswordValid = compare(data.clave, user.clave);

            return resolve(isPasswordValid
                ? { status: 200, message: "Sesión iniciada exitosamente.", email: user.email }
                : { status: 401, message: "Contraseña incorrecta." });
        });
    });
}

module.exports = { registrarUsuario, loginUsuario };