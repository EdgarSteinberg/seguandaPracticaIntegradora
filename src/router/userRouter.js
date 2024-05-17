
import { Router } from 'express';
import { userManagerDB } from '../dao/userManagerDB.js';
import passport from 'passport';


const UserRouter = Router();

const Users = new userManagerDB();


UserRouter.post('/register', async (req, res) => {
    try {
        const user = await Users.register(req.body);

        // res.send({
        //     status: 'success',
        //     payload: user
        // });
        res.redirect('/login');

    } catch (error) {
        res.status(400).send({
            status: 'error',
            message: error.message
        });
    }
});

UserRouter.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const token = await Users.login(email, password);
         res.cookie('auth', token, { maxAge: 60 * 60 * 1000 }).redirect('/')
         //.send(
        //     {
        //         status: 'succes',
        //         token
        //     });
    } catch (error) {
        res.status(400).send({
            status: 'error',
            message: error.message
        });
    }
});

UserRouter.get('/current', passport.authenticate('jwt', { session: false }), async (req, res) => {
    res.send({
        user: req.user
    })
});

UserRouter.get('/:uid', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    if (req.user.role === 'admin') return next()
    res.status(401).send({
        status: 'error',
        message: 'Unauthorized'
    })
}, async (req, res) => {

    try {
        const user = await Users.getUser(req.params.uid);
        res.send({
            status: 'success',
            payload: user
        });
    } catch (error) {
        res.status(400).send({
            status: 'error',
            message: error.message
        });
    }
});

UserRouter.post("/logout", (req, res) => {
    res.clearCookie('auth'); // Borra la cookie de autenticación
    res.redirect("/login"); // Redirige al usuario a la página de inicio de sesión
});

UserRouter.get("/github", passport.authenticate('github', { scope: ['user.email'] }), async (req, res) => {
    console.log(req.user);
 
    res.cookie('auth',token, { maxAge: 60 * 60 * 1000 })
});

UserRouter.get("/githubcallback", passport.authenticate('github', { failureRedirect: '/login' }), (req, res) => {
    res.cookie('auth', req.user.token, { maxAge: 60 * 60 * 1000 }); // Asigna la cookie de autenticación
    res.redirect('/'); // Redirige al usuario a la página principal
});
export default UserRouter;