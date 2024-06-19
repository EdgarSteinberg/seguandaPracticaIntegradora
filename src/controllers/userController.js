import jwt from 'jsonwebtoken';

import { UserServiceRespository } from '../repositories/index.js';
import { isValidPassword } from "../utils/cryptoUtil.js";
import CustomError from '../services/errors/CustomError.js';
import { ErrorCodes } from '../services/errors/errorCodes.js';
import { generateUserErrorInfo, generateUserIdErrorInfo, generateLoginErrorInfo} from '../services/errors/info.js';
import { devLogger as logger } from '../logger.js';
import dotenv from 'dotenv';

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
}

export { userController };
