const { checkCookie } = require("../config/authentication");
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

function logout(request, response) {
    request.session.destroy((error) => {
        if (error) 
            return response.redirect("/dashboard?error=Error al cerrar la sesión");
        else { 
            response.cookie("tokenKey", "", { 
                expires: new Date(0),
                path: "/" 
            });
            return response.redirect("/");
        }
    });
}

module.exports = { 
    homePage,
    customers,
    customersFilter,
    profile,
    logout
};