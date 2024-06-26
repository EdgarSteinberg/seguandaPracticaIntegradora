import { Router } from 'express';
import passport from 'passport';

import CurrentDTO from '../dao/dto/currentDTO.js';
import { userController } from '../controllers/userController.js';
import {publicRoute,authenticate} from '../middlewares/auth.js'
import addLogger from '../logger.js'

const UserRouter = Router();

const Users = new userController();


UserRouter.post('/register',addLogger, async (req, res, next) => {
    try {
        const user = await Users.register(req.body);

        res.redirect('/login');

    } catch (error) {
        req.logger.error(`Error al registrase ${error.message}`)
        next(error)
    }
});

UserRouter.post('/login',addLogger, async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const token = await Users.login(email, password);
        res.cookie('auth', token, { maxAge: 60 * 60 * 1000 }).redirect('/')

    } catch (error) {
        req.logger.error(`Error al iniciar sesion: ${error.message}`)
        next(error)
    }
});

UserRouter.get('/current', passport.authenticate('jwt', { session: false }), async (req, res, next) => {
    const userDTO = new CurrentDTO(req.user)
    res.send({
        user: userDTO
    })
    // res.send({
    //     user: req.user
    // })
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


UserRouter.get("/github",authenticate, passport.authenticate('github', { scope: ['user.email'] }), async (req, res) => {
    // console.log(req.user);

    res.cookie('auth', req.user.token, { maxAge: 60 * 60 * 1000 }).send({
        status: 'success',
        message: 'success'
    });
});

UserRouter.get("/githubcallback", passport.authenticate('github', { failureRedirect: '/login' }), (req, res) => {
    req.user.token = req.token

    res.redirect('/'); // Redirige al usuario a la página principal


});


export default UserRouter;