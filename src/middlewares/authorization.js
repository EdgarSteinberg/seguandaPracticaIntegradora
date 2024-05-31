/* export const authorization = (role) => {
    return (req, res, next) => {
        if(req.user.role === role) return next;

        res.status(403).send({
            status: 'error',
            message: "Unauthorized"
        })
    }
} */

export const authorization = (role) => {
    return (req, res, next) => {
        if (req.user && req.user.role === role) {
            return next();
        }

        // res.status(403).send({
        //     status: 'error',
        //     message: 'Unauthorized'
        // });
        res.redirect('/notFound')
    };
};
