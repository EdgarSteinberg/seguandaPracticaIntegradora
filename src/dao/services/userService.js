import userModel from '../models/userModel.js'

class UserService {

    async getAll() {
        //return await userModel.find().lean();
        try {
            return await userModel.find().lean();
        } catch (error) {
            console.error(error.message);
            throw new Error('Error al consultar los usuarios')
        }
    }

    async getById(uid) {
        try {
            return await userModel.findOne({ _id: uid }).lean();
        } catch (error) {
            console.error(error.message);
            throw new Error(`Usuario con id ${uid} no existe`)
        }
    }

    async createRegister(user) {
       try{
        const result = await userModel.create(user);

        return result;
       }catch (error) {
        console.error(error.message)
        throw new Error('Error al registrarse')
       }
    }

    async createLogin(email, password) {
        try {
            const user = await userModel.findOne({ email }).lean();
            return user;
        } catch (error) {
            console.error(error.message);
            throw new Error('Error al logearse');
        }
    }
}


export { UserService }