const { checkCookie } = require("./authentication");

async function onlyPublic(request, response, next) {
    const logued = await checkCookie(request);
    if (!logued) 
        return next();
    return response.redirect("/dashboard");
}

async function onlyAdmin(request, response, next) {
    const logued = await checkCookie(request);
    if (logued) 
        return next();
    return response.redirect("/");
}

module.exports = {
    onlyPublic,
    onlyAdmin
};