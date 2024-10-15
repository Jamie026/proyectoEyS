const pool = require("./../config/db");

function homePage(request, response) {
    const error = request.query.error || null; 
    return response.render("dashboard", { error });
}

async function customers(request, response) {
    const error = request.query.error || null;
    const bdKey = request.session.bdKey;

    let selectSql = "SELECT ";
    selectSql = selectSql + (!bdKey ? "estandar_customer_data() AS result" : "decrypt_customer_data(?) AS result");
    try {
        const results = await pool.query(selectSql, bdKey ? [bdKey] : []);
        const data = JSON.parse(results[0][0].result)        
        return response.render("customers", { error, data });
    } catch (error) {
        return response.render("customers", { error: "Ha ocurrido un error al cargar los datos de los clientes." });
    }
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
    logout
};