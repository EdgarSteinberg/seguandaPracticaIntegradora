import jwt from 'jsonwebtoken';

import { UserServiceRespository } from '../repositories/index.js';
import { isValidPassword,createHash  } from "../utils/cryptoUtil.js";
import CustomError from '../services/errors/CustomError.js';
import { ErrorCodes } from '../services/errors/errorCodes.js';
import { generateUserErrorInfo, generateUserIdErrorInfo, generateLoginErrorInfo } from '../services/errors/info.js';
import { devLogger as logger } from '../logger.js';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY;

class userController {

    async getAllUsers() {
        return await UserServiceRespository.getAll();
    }

    async getUser(uid) {
        try {
            const user = await UserServiceRespository.getById(uid);
            if (!user) {
                CustomError.createError({
                    name: 'UserNotFoundError',
                    cause: `User ID ${uid} not found`,
                    message: generateUserIdErrorInfo(uid),
                    code: ErrorCodes.INVALID_PARAM
                });
            }
            return user;
        } catch (error) {
            //console.error(error.message);
            logger.error(error.message);
            CustomError.createError({
                name: 'DatabaseError',
                cause: error.message,
                message: 'Error retrieving user',
                code: ErrorCodes.DATABASE_ERROR
            });
        }
    }

    async register(user) {
        const { first_name, last_name, email, age, password, username, role } = user;

        if (!first_name || !last_name || !email || !age || !password || !username) {
            CustomError.createError({
                name: 'InvalidUserInputError',
                cause: generateUserErrorInfo(user),
                message: 'Error registering user: one or more fields are invalid',
                code: ErrorCodes.INVALID_TYPES_ERROR
            });
        }

        try {
            return await UserServiceRespository.createRegister({
                first_name,
                last_name,
                email,
                age,
                password,
                username,
            });
        } catch (error) {
            //console.error(error.message);
            logger.error(error.message);
            CustomError.createError({
                name: 'DatabaseError',
                cause: error.message,
                message: 'Error registering user',
                code: ErrorCodes.DATABASE_ERROR
            });
        }
    }

    async login(email, password) {
        if (!email || !password) {
            throw CustomError.createError({
                name: 'InvalidUserInputError',
                cause: generateLoginErrorInfo(email, 'Email or password not provided'),
                message: `Email or password not provided`,
                code: ErrorCodes.INVALID_TYPES_ERROR
            });
        }

        try {
            const user = await UserServiceRespository.createLogin(email, password);

            if (!user) {
                throw CustomError.createError({
                    name: 'UserNotFoundError',
                    cause: generateLoginErrorInfo(email, 'User with email not found'),
                    message: `User with email ${email} not found`,
                    code: ErrorCodes.INVALID_PARAM
                });
            }

            if (isValidPassword(user, password)) {
                delete user.password;
                return jwt.sign(user, SECRET_KEY, { expiresIn: '1h' });
            }

            throw CustomError.createError({
                name: 'InvalidPasswordError',
                cause: generateLoginErrorInfo(email, 'Password is incorrect'),
                message: `Password for user ${email} is incorrect`,
                code: ErrorCodes.INVALID_PARAM
            });
        } catch (error) {
            //console.error(error.message);
            logger.error(error.message);
            throw CustomError.createError({
                name: 'DatabaseError',
                cause: error.message,
                message: 'Error logging in user',
                code: ErrorCodes.DATABASE_ERROR
            });
        }
    }


    async updateUser(uid, updateData) {
        try {
            return await UserServiceRespository.updateUser(uid, updateData);
        } catch (error) {
            //console.error(error.message);
            logger.error(error.message);
            CustomError.createError({
                name: 'DatabaseError',
                cause: error.message,
                message: 'Error updating user',
                code: ErrorCodes.DATABASE_ERROR
            });
        }
    }

    async getEmail(email) {
        try {
            return await UserServiceRespository.getEmail(email);
        } catch (error) {
            logger.error(error.message)
            CustomError.createError({
                name: 'DatabaseError',
                cause: error.message,
                message: 'Error fetching user by email',
                code: ErrorCodes.DATABASE_ERROR
            });
        }
    }
    
    // NODEMAILER 
    
    async requestPasswordReset(email) {
        const transport = nodemailer.createTransport({
            service: 'gmail',
            port: 587,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const user = await UserServiceRespository.getEmail(email);
        if (!user) {
            throw new Error('Correo electrónico no encontrado');
        }
        
        const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: '1h' });
        console.log(`Este el token desde el email` ,token)

        // Enviar correo con el enlace de restablecimiento de contraseña
        await transport.sendMail({
            from: 'Edgar Steinberg <s.steinberg2019@gmail.com>',
            to: email,
            subject: 'Recuperación de Contraseña',
            html: `<div style="font-family: Arial, sans-serif; color: #333;">
                     <h1>Solicitud de Recuperación de Contraseña</h1>
                     <p>Hemos recibido una solicitud para restablecer tu contraseña. Si no realizaste esta solicitud, por favor ignora este correo.</p>
                     <p>Para restablecer tu contraseña, haz clic en el siguiente enlace:</p>
                     <a href="http://localhost:8080/reset-password?token=${token}">
                     <button class="btnChat">Restablecer Contraseña</button>
                     </a>
                     <p>Este enlace es válido por 1 hora.</p>
                     <p>Gracias,</p>
                     <p>El equipo de soporte de AppCoder</p>
                   </div>`,
        });
        //transport.close();
        //res.redirect('/check-email');
        return token;
    }

    async resetPassword(token, newPassword) {
        try {
            const decoded = jwt.verify(token, SECRET_KEY);
            const { email } = decoded;
            const user = await UserServiceRespository.getEmail(email);
    
            if (!user) {
                throw new Error('Correo electrónico no encontrado');
            }
    
            if (isValidPassword(user, newPassword)) {
                throw new Error('La nueva contraseña no puede ser la misma que la anterior');
            }
    
            const hashedPassword = await createHash(newPassword); // Aquí se utiliza correctamente
            await UserServiceRespository.updateUser(user._id, { password: hashedPassword });
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                throw new Error('El enlace ha expirado. Por favor, solicita un nuevo enlace de restablecimiento de contraseña.');
            } else {
                throw error;
            }
        }
    }
    
}

export { userController };


//npm audit