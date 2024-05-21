import jwt from 'jsonwebtoken';

import { UserService } from '../dao/services/userService.js';
import { isValidPassword } from "../utils/cryptoUtil.js";

class userController{
    constructor() {
        this.userService = new UserService();
    }

    async getAllUsers() {
       return await this.userService.getAll();
      
    }

    async getUser(uid) {
       return await this.userService.getById(uid)
    }

    async register(user) {
        const { first_name, last_name, email, age, password, username, role } = user;

        if (!first_name || !last_name || !email || !age || !password || !username) {
            throw new Error('Error al registrar usuario');
        }

        return await this.userService.createRegister({ first_name, last_name, email, age, password, username });
    
    }

    async login(email, password) {
        const errorMessage = 'Credenciales invalidas';
        if (!email || !password) {
            throw new Error(errorMessage);
        }
        try {
            const user = await this.userService.createLogin(email,password)
         
            if (!user) throw new Error(errorMessage)

            if (isValidPassword(user, password)) {
                delete user.password
                return jwt.sign(user, 'coderSecret', { expiresIn: '1h' })
                //return user;
            }
            throw new Error(errorMessage);
        } catch (error) {
            console.error(error.message)
            throw error;
        }
    }
}

export { userController }