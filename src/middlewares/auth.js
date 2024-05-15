
// cookies
export const authenticate = function (req, res, next) {
    if (!req.cookies.auth) {
        return res.redirect("/login")
    }

    next()
};
export const publicRoute = function (req, res, next) {
    if (req.cookies.auth) {
        return res.redirect("/profile");
    }

    next();
};



//Session

// export const auth = function (req, res, next) {
//     if(!req.session.user) {
//         return res.redirect("/login")
//     }

//     return next()
// }


// export const publicRoute = function(req, res, next) {
//     if(req.session.user) {
//         // Si hay un usuario en sesión, redirigir a la página de perfil
//         return res.redirect("/profile");
//     }
//     // Si no hay usuario en sesión, permitir que la solicitud continúe
//     return next();
// };
