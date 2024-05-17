
// cookies
// export const authenticate = function (req, res, next) {
//     if (!req.cookies.auth) {
//         return res.redirect("/login")
//     }

//     next()
// };
import jwt from 'jsonwebtoken';

import userModel from '../dao/models/userModel.js';

export const authenticate = async (req, res, next) => {
    const token = req.cookies.auth;
    if (!token) {
        return res.redirect('/login');
    }

    try {
        const decoded = jwt.verify(token, 'coderSecret');
        const user = await userModel.findById(decoded._id);
        req.user = user; // Adjuntar el usuario a req.user
        console.log('Usuario autenticado:', user);
        next();
    } catch (error) {
        console.error('Error de autenticación:', error);
        return res.redirect('/login');
    }
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
