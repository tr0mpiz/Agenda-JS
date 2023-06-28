export function isUser(req, res, next) {
    if (req.session.usuario) {
        return next();
    }
    // return res.status(401).render("login", { error: "error de autenticacion!" });
    return res.redirect("/login");
}
export function isAdmin(req, res, next) {
    if (req.session.permisos) {
        return next();
    }
    // return res.status(401).render("login", { error: "error de autenticacion!" });
    return res.redirect("/login");
}

export function isLogin(req, res, next) {
    if (req.session.usuario) {
        console.log("ACASDASDASD"+req.session.usuario);
        return next();
    }
    // return res.status(401).render("login", { error: "error de autenticacion!" });
    return res.redirect("/login");
}