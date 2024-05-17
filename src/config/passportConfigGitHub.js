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

            passport.deserializeUser(async (id, done) => {
                try {
                    let user;
                    if (mongoose.Types.ObjectId.isValid(id)) {
                        // Si el id es un ObjectId válido, buscar por _id
                        user = await userModel.findById(id);
                    } else {
                        // Si no es un ObjectId válido, buscar por otro campo único (por ejemplo, username o email)
                        user = await userModel.findOne({ username: id }); // Puedes cambiar 'username' por el campo que prefieras
                        if (!user) {
                            user = await userModel.findOne({ email: id }); // Intentar buscar por email si no se encuentra por username
                        }
                    }
                    done(null, user);
                } catch (error) {
                    done(error);
                }
            });
            
    
}

export default initializeGitHubPassport;

