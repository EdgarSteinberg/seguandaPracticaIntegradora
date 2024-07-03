
export const authorization = (roles) => {
    return (req, res, next) => {
        console.log('User role:', req.user?.role); // Verificar el rol del usuario
        if (req.user && roles.includes(req.user.role)) {
            return next();
        }

        res.redirect('/notFound');
    };
};



// export const authorization = (role) => {
//     return (req, res, next) => {
//         if (req.user && req.user.role === role) {
//             return next();
//         }

//         // res.status(403).send({
//         //     status: 'error',
//         //     message: 'Unauthorized'
//         // });
//         res.redirect('/notFound')
//     };
// };