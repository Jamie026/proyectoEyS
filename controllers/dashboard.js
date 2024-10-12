function homePage(request, response) {
    const error = request.query.error || null; 
    return response.render("dashboard", { error });
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
    logout 
};