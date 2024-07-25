import userModel from '../../models/userModel.js'

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
            // return await userModel.findOne({ _id: uid }).lean();
            return await userModel.findOne({ _id: uid }).lean()
        } catch (error) {
            console.error(error.message);
            throw new Error(`Usuario con id ${uid} no existe`)
        }
    }

    async createRegister(user) {
        try {
            const result = await userModel.create(user);

            return result;
        } catch (error) {
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



    async updateUser(id, updateData) {
        try {
            const updatedUser = await userModel.findByIdAndUpdate(id, updateData, { new: true }).lean();
            return updatedUser;
        } catch (error) {
            console.error(error.message);
            throw new Error('Error al actualizar el usuario');
        }
    }


    async getEmail(email) {
        try {
            const result = await userModel.findOne({ email }).lean()
            return result;
        } catch (error) {
            console.error(error.message);
            throw new Error('El email no existe')
        }
    }



    // userService.js
    async updateLastConnection(email,last_connection) {
        try {
            console.log(`DAO updating last connection for email: ${email}`);
            const result = await userModel.updateOne(
                { email },
                { $set: { last_connection: new Date() } }
            ).lean();
            console.log('DAO update result:', result);
            return result;
        } catch (error) {
            console.error('DAO error in updateLastConnection:', error.message);
            throw new Error('Error al actualizar la última conexión en el DAO');
        }
    }

    async uploadDocuments(uid, documents) {
        try {
            console.log(`usuarioId ${uid}`);
            const result = await userModel.updateOne(
                { _id: uid }, 
                { $set: { documents: documents,  status: 'document uploaded'} }
            );
            console.log('documentos userservice',result);
            return result;
        } catch (error) {
            console.error('Error al subir los archivos', error);
            throw error; // Propagamos el error para manejarlo en niveles superiores
        }
    }
}




export { UserService }