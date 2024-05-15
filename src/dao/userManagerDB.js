import userModel from "./models/userModel.js";
import { isValidPassword } from "../utils/cryptoUtil.js";
import jwt from 'jsonwebtoken'

class userManagerDB {

    async getAllUsers() {
        try {
            return await userModel.find().lean();
        } catch (error) {
            console.error(error.message);
            throw new Error('Error al consultar los usuarios')
        }
    }

    async getUser(uid) {
        try {
            return await userModel.findOne({ _id: uid }).lean();
        } catch (error) {
            console.error(error.message);
            throw new Error('Usuario no existente')
        }
    }

    async register(user) {
        const { first_name, last_name, email, age, password, username, role } = user;

        if (!first_name || !last_name || !email || !age || !password || !username) {
            throw new Error('Error al registrar usuario');
        }

        try {
            await userModel.create({ first_name, last_name, email, age, password, username });

            return 'Usuario registrado Correctamente'
        } catch (error) {
            console.error(error.message)
            throw error
        }
    }

    async login(email, password) {
        const errorMessage = 'Credenciales invalidas';
        if (!email || !password) {
            throw new Error(errorMessage);
        }
        try {
            const user = await userModel.findOne({ email }).lean();

            if (!user) throw new Error(errorMessage)

            if (isValidPassword(user, password)) {
                // delete user.password
                // return jwt.sign(user, 'coderSecret', {expiresIn: '1h'})
                return user;
            }
            throw new Error(errorMessage);
        } catch (error) {
            console.error(error.message)
            throw error;
        }
    }
}

export { userManagerDB }