const pool = require("./../config/db");

async function cardTypes(request, response) {
    const selectSql = "SELECT `Card Type`, COUNT(*) as 'Cantidad' FROM customers GROUP BY `Card Type`";
    
    try {
        const results = await pool.query(selectSql);
        if (results[0].length === 0) 
            return response.status(200).json({ status: 200, data: null, message: "No hay datos disponibles." });
        else
            return response.status(200).json({ status: 200, data: results[0], message: "Ok." });
    } catch (error) {
        return response.status(400).json({ status: 400, message: "Error al conectar con la BD." });
    }

}

async function customersByCountry(request, response) {
    const selectSql_actives = "SELECT COUNT(*) as 'Cantidad', Geography FROM customers WHERE IsActiveMember = 1 GROUP BY Geography";
    const selectSql_inactives = "SELECT COUNT(*) as 'Cantidad', Geography FROM customers WHERE IsActiveMember = 0 GROUP BY Geography";

    try {
        const activeQuery = pool.query(selectSql_actives);
        const inactiveQuery = pool.query(selectSql_inactives);

        const results = await Promise.all([activeQuery, inactiveQuery]);
        if (results[0].length === 0 && results[1].length === 0) 
            return response.status(200).json({ status: 200, data: null, message: "No hay datos disponibles." });
        else
            return response.status(200).json({ status: 200, data: { Activo: results[0], Inactivo: results[1] }, message: "Ok." });


    } catch (error) {
        console.error("Error ejecutando las consultas:", error);
        response.status(500).json({ error: "Error ejecutando las consultas." });
    }
}

module.exports = { cardTypes, customersByCountry };