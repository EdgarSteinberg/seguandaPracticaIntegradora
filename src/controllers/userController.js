// import jwt from 'jsonwebtoken';

// import { UserService } from '../dao/services/userService.js';
// import { isValidPassword } from "../utils/cryptoUtil.js";

// class userController{
//     constructor() {
//         this.userService = new UserService();
//     }

//     async getAllUsers() {
//        return await this.userService.getAll();

//     }

//     async getUser(uid) {
//        return await this.userService.getById(uid)
//     }

//     async register(user) {
//         const { first_name, last_name, email, age, password, username, role } = user;

//         if (!first_name || !last_name || !email || !age || !password || !username) {
//             throw new Error('Error al registrar usuario');
//         }

//         return await this.userService.createRegister({ first_name, last_name, email, age, password, username });

//     }

//     async login(email, password) {
//         const errorMessage = 'Credenciales invalidas';
//         if (!email || !password) {
//             throw new Error(errorMessage);
//         }
//         try {
//             const user = await this.userService.createLogin(email,password)

//             if (!user) throw new Error(errorMessage)

//             if (isValidPassword(user, password)) {
//                 delete user.password
//                 return jwt.sign(user, 'coderSecret', { expiresIn: '1h' })
//                 //return user;
//             }
//             throw new Error(errorMessage);
//         } catch (error) {
//             console.error(error.message)
//             throw error;
//         }
//     }
// }

// export { userController }

//import jwt from 'jsonwebtoken';

//import { UserService } from '../dao/services/userService.js';
//import { UserServiceRespository } from '../repositories/index.js';
//import { isValidPassword } from "../utils/cryptoUtil.js";
//import { CartController } from './cartController.js';
//import CustomError from '../services/errors/CustomError.js';
//import { ErrorCodes} from '../services/errors/enums.js';
//import { generateUserErrorInfo} from '../services/errors/info.js';
//const cartController = new CartController();

// class userController {
//     // constructor() {
//     //     this.userService = new UserService();
//     // }

//     async getAllUsers() {
//         return await UserServiceRespository.getAll();

//     }

//     async getUser(uid) {
//         return await UserServiceRespository.getById(uid)
//     }

//     async register(user) {
//         const { first_name, last_name, email, age, password, username, role } = user;

//         if (!first_name || !last_name || !email || !age || !password || !username) {
//             throw new Error('Error al registrar usuario');
//         }
//         //const cartId = await cartController.createCart();

//         return await UserServiceRespository.createRegister({
//             first_name,
//             last_name,
//             email,
//             age,
//             password,
//             username,
//             //cart: [{ cart: cartId }]
//         });

//     }

//     async login(email, password) {
//         const errorMessage = 'Credenciales invalidas';
//         if (!email || !password) {
//             throw new Error(errorMessage);
//         }
//         try {
//             const user = await UserServiceRespository.createLogin(email, password)

//             if (!user) throw new Error(errorMessage)

//             if (isValidPassword(user, password)) {
//                 delete user.password
//                 return jwt.sign(user, 'coderSecret', { expiresIn: '1h' })
//                 //return user;
//             }
//             throw new Error(errorMessage);
//         } catch (error) {
//             console.error(error.message)
//             throw error;
//         }
//     }

//     async updateUser(uid, updateData) {
//         return await UserServiceRespository.updateUser(uid, updateData);
//     }
// }

// export { userController }

import jwt from 'jsonwebtoken';
import { UserServiceRespository } from '../repositories/index.js';
import { isValidPassword } from "../utils/cryptoUtil.js";
import CustomError from '../services/errors/CustomError.js';
import { ErrorCodes } from '../services/errors/enums.js';
import { generateUserErrorInfo, generateUserIdErrorInfo, generateLoginErrorInfo} from '../services/errors/info.js';

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
            console.error(error.message);
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
            console.error(error.message);
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
                return jwt.sign(user, 'coderSecret', { expiresIn: '1h' });
            }
    
            throw CustomError.createError({
                name: 'InvalidPasswordError',
                cause: generateLoginErrorInfo(email, 'Password is incorrect'),
                message: `Password for user ${email} is incorrect`,
                code: ErrorCodes.INVALID_PARAM
            });
        } catch (error) {
            console.error(error.message);
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
            console.error(error.message);
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
