export function isUser(req, res, next) {
    if (req.session.usuario) {
        //hacer el conts de datos con todos los datos del usuario
        const usuario = {
            id: req.session.id_usuario,
            nombre: req.session.nombre,
            apellido: req.session.apellido,
            email: req.session.correo,
            permisos: req.session.permisos,
            img: req.session.img
        };
        req.session.usuario = usuario;
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
