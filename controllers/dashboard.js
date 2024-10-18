const { checkCookie, createCookie } = require("../config/authentication");
const { validationComplete } = require("./../config/validation");
const pool = require("./../config/db");

function homePage(request, response) {
    const error = request.query.error || null; 
    return response.render("dashboard", { error });
}

async function customers(request, response) {
    return response.render("customers");
}

async function customersFilter(request, response) {
    const { surname, clave } = request.body;
    const selectSql = clave ? "SELECT decrypt_customer_data(?, ?) AS result" : "SELECT estandar_customer_data(?) AS result";    
    try {
        const results = await pool.query(selectSql, clave ? [clave, surname] : [surname]);
        const data = JSON.parse(results[0][0].result)
        if (!data)
            return response.render("customers", { error: "No hay clientes con ese apellido." });
        else
            return response.render("customers", { data });
    } catch (error) {
        console.error("Error al filtrar los clientes: ", error.stack);
        return response.render("customers", { error: "Ha ocurrido un error al cargar los datos de los clientes." });
    }
}

async function profile(request, response) {
    const workerData = await checkCookie(request);
    return response.render("profile", { workerData, error: workerData ? null : "Error al cargar los datos del trabajador" });
}

async function deleteWorker(request, response) {
    const workerData = await checkCookie(request);
    if (!workerData)
        return response.status(400).json({ message: "No tiene autorización para esta acción" });
    try {
        const [results] = await pool.query("DELETE FROM usuarios WHERE usuario = ?", [workerData.usuario]);
        if (results.affectedRows > 0) {
            response.cookie("tokenKey", "", { expires: new Date(0), path: "/" });
            return response.status(200).json({ message: "Ok" });
        }
        return response.status(404).json({ message: "Usuario no encontrado" });
    } catch (error) {
        console.error("Error eliminando usuario: ", error);
        return response.status(500).json({ message: "Error al eliminar la cuenta" });
    }
}

async function changePrivacity(request, response) {
    const workerData = await checkCookie(request);
    if (!workerData)
        return response.status(400).json({ data: { error: true, message: "No tiene autorización para esta acción." } });
    try {
        const value = workerData.usuarioVisible == 1 ? 0 : 1;
        const textContent = workerData.usuarioVisible == 1 ? "Mostrar mi usuario a otros trabajadores" : "Ocultar mi usuario de otros trabajadores";
        const [results] = await pool.query("UPDATE usuarios SET usuarioVisible = ? WHERE usuario =?", [value, workerData.usuario]);
        if (results.affectedRows > 0)
            return response.status(200).json({ message: "Ok", textContent: textContent });
        else
            return response.status(404).json({ message: "Usuario no encontrado." });
    } catch (error) {
        console.error("Error cambiando el estado de visibilidad: ", error);
        return response.status(500).json({ message: "Error cambiando el estado de visibilidad" });
    }
};

async function updateworker(request, response) {
    const { nombre, apellido, clave, usuario, email } = request.body;
    const workerData = await checkCookie(request);
    const validationErrors = await validationComplete(request.body);
    if (validationErrors) 
        return response.status(400).json({ message: validationErrors });    
    let encriptada = (/^[*]+$/.test(clave)) ? workerData.clave: encrypt(clave);
    try {
        const [results] =await pool.query("UPDATE usuarios SET usuario = ?, clave = ?, email = ?, nombre = ?, apellido = ? WHERE usuario = ?",
            [usuario, encriptada, email, nombre, apellido, workerData.usuario]);
        if (results.affectedRows > 0){
            createCookie(usuario, response);
            return response.status(200).json({ message: "Ok", nombre: nombre, apellido: apellido });
        }
        else
            return response.status(404).json({ message: "Usuario no encontrado." });
        
    } catch (error) {
        console.error("Error actualizando los datos del usuario: ", error);
        let errorMessage = "Error actualizando los datos del usuario.";        
        if (error.message.includes("USUARIO_UNICO"))
            errorMessage = "El nombre de usuario ya está en uso.";
        else if (error.message.includes("EMAIL_UNICO"))
            errorMessage = "El email ya está en uso.";
        return response.status(500).json({ message: [{ message: errorMessage }] });
    }
};

function logout(request, response) {
    request.session.destroy((error) => {
        if (error) 
            return response.redirect("/dashboard?error=Error al cerrar la sesión");
        else { 
            response.cookie("tokenKey", "", { expires: new Date(0), path: "/" });
            return response.redirect("/");
        }
    });
}

module.exports = { 
    homePage,
    customers,
    customersFilter,
    profile,
    deleteWorker,
    changePrivacity,
    updateworker,
    logout
};