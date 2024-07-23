import { Router } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';

import { userController } from '../controllers/userController.js';
import CurrentDTO from '../dao/dto/currentDTO.js';

import addLogger from '../logger.js'
import { authorization } from '../middlewares/authorization.js';
import dotenv from 'dotenv';

dotenv.config();

const UserRouter = Router();
//Instaciamos el userController
const Users = new userController();


UserRouter.post('/register', addLogger, async (req, res, next) => {
    try {
        const user = await Users.register(req.body);

        if (process.env.NODE_ENV === 'test') {
            return res.status(201).send({ status: 'success', payload: user });
        }
        // En otros entornos, realiza una redirección
        res.redirect('/login');
    } catch (error) {
        req.logger.error(`Error al registrarse: ${error.message}`);
        next(error);
    }
});


UserRouter.post('/login', addLogger, async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const token = await Users.login(email, password);
        //res.cookie('auth', token, { maxAge: 60 * 60 * 1000 }).redirect('/')


          // Actualizar last_connection
       // await Users.updateLastConnection(email);


        // En entorno de pruebas,
        res.cookie('auth', token, { maxAge: 60 * 60 * 1000 })
        if (process.env.NODE_ENV === 'test') {
            return res.status(201).send({
                status: 'success',
                payload: { user: req.user, token }
            });
        }
        res.redirect('/');
    } catch (error) {
        req.logger.error(`Error al iniciar sesion: ${error.message}`)
        next(error)
    }
});

UserRouter.get('/current', passport.authenticate('jwt', { session: false }), async (req, res, next) => {
    const userDTO = new CurrentDTO(req.user)
    // res.send({
    //     user: userDTO
    // })
    res.send({
        status: 'succes',
        payload: { user: userDTO }
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
// UserRouter.post('/logout', async (req, res) => {
//     try {
//         const token = req.cookies.auth;
//         const decoded = jwt.verify(token, process.env.SECRET_KEY);
//         const email = decoded.email;

//         // Actualizar last_connection
//         await Users.updateLastConnection(email);

//         res.clearCookie('auth'); // Borra la cookie de autenticación
//         res.redirect("/login"); // Redirige al usuario a la página de inicio de sesión
//     } catch (error) {
//         console.error('Error al cerrar sesión:', error);
//         res.status(500).send({ status: 'error', message: 'Error interno del servidor' });
//     }
// });

UserRouter.post('/recover-password', async (req, res) => {
    const { email } = req.body;

    try {
        await Users.requestPasswordReset(email);
        res.redirect('/check-email');
    } catch (error) {
        console.error(error.message);
        res.status(500).send({ status: 'error', message: 'Error en el envío del correo' });
    }
});


UserRouter.get('/', async (req, res) => {

    const { token } = req.query
    console.log('Token recibido:', token);
    if (!token) {
        return res.status(400).send({ status: 'error', message: 'Token no proporcionado' });
    }

    res.render('reset-password', { token, style: 'index.css' });
});

UserRouter.post('/reset-password', async (req, res) => {

    const { token, newPassword } = req.body;
    console.log('Token recibido en el formulario:', token)
    if (!token) {
        return res.status(400).send({ status: 'error', message: 'Token no proporcionado' });
    }

    try {
        await Users.resetPassword(token, newPassword);
        res.redirect('/login');
    } catch (error) {
        console.error(error.message);
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(400).send({ status: 'error', message: 'El enlace ha expirado. Por favor, solicita un nuevo enlace de restablecimiento de contraseña.' });
        } else {
            return res.status(500).send({ status: 'error', message: error.message });
        }
    }
});

UserRouter.put('/premium/:uid', passport.authenticate('jwt', { session: false }), authorization(["admin"]), async (req, res) => {
    try {
        const { uid } = req.params;
        const { role } = req.body;

        // Verificar si el rol enviado es válido
        if (role !== 'user' && role !== 'premium') {
            return res.status(400).send({ error: 'El rol especificado no es válido' });
        }

        // Cambiar el rol del usuario
        const updatedUser = await Users.updateUser(uid, { role });

        if (!updatedUser) {
            return res.status(404).send({ error: 'Usuario no encontrado' });
        }

        res.status(200).send({ message: `Rol del usuario ${uid} actualizado a ${role}` });
    } catch (error) {
        console.error('Error al actualizar el rol del usuario:', error);
        res.status(500).send({ error: 'Error interno del servidor' });
    }
});


export default UserRouter;