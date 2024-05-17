
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
        const user = await userModel.findById(decoded._id).lean();
        req.user = user;
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




