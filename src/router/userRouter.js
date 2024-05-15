import { Router } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken'; 

import { userManagerDB } from '../dao/userManagerDB.js';

const UserRouter = Router();
const Users = new userManagerDB();

UserRouter.post('/register', async (req, res) => {
    try {
        const user = await Users.register(req.body);
        // res.status(200).send({
        //     status: 'success',
        //     payload: user
        // });
        res.redirect('/login')
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
        res.cookie('auth', token, { maxAge: 60 * 60 * 1000 })
        res.redirect('/');
    
    } catch (error) {
        res.status(400).send({
            status: 'error',
            message: error.message
        });
    }
})

UserRouter.get('/:uid', async (req, res) => {
    try {
        const user = await Users.getUser(req.params.uid);
        res.status(200).send({
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

// Ruta protegida que requiere autenticación JWT
UserRouter.get('/current', passport.authenticate('jwt', { session: false }), (req, res) => {
    res.send({
        user: req.user
    });
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
