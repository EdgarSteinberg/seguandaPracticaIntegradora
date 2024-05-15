import passport from 'passport';
import GitHubStrategy from 'passport-github2';
import jwt from 'jsonwebtoken';

import userModel from '../dao/models/userModel.js';

const initializeGitHubPassport = () => {
    const CLIENT_ID = "Iv1.3ba31aa9dedaeb4e";
    const SECRET_ID = "88ad705efc2bf1b26fcfb7ada1ccc9de0942c263";

    passport.use(
        'github',
        new GitHubStrategy({
            clientID: CLIENT_ID,
            clientSecret: SECRET_ID,
            callbackURL: 'http://localhost:8080/api/sessions/githubcallback'
        },

            async (accessToken, refreshToken, profile, done) => {
                try {
                    console.log(profile);
                    // Acceder al correo electrónico del usuario desde el objeto profile
                    const email = profile._json.email;

                    // Buscar el usuario en la base de datos por correo electrónico o nombre de usuario
                    let user = await userModel.findOne({ $or: [{ username: profile._json.login }, { email: email }] }).lean();
                    if (!user) {
                        // Si el usuario no existe, crear un nuevo usuario
                        let newUser = {
                            username: profile._json.login,
                            name: profile._json.name,
                            email: email || `${profile._json.login}@github.com`, // Establecer el correo electrónico como cadena vacía si es nulo
                            password: ""
                        };
                        console.log("Creando nuevo usuario:", newUser);
                        let result = await userModel.create(newUser);
                        result.token = jwt.sign(newUser, 'CoderSecret');
                        done(null, result);
                    } else {
                        // Si el usuario existe, devolverlo
                        return done(null, user);
                    }
                } catch (error) {
                    return done(error);
                }

            }));

    passport.serializeUser((user, done) => {
        done(null, user._id);
    });
    passport.deserializeUser(async (id, done) => {
        let user = await userModel.findById(id);
        done(null, user);
    });
}

export default initializeGitHubPassport;