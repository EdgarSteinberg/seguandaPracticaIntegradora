import messageModel from './models/messagesModel.js';


class MessagesManagerDB {

    async getAllMessages() {
        try {
            return await messageModel.find().lean();

        } catch (error) {
            console.error(error.message)
            throw new Error("Error al buscar los mensages")
        }
    }

    async createMessages(userData){
        const {user, message} = userData
    
        if(!user || !message){
            throw new Error("Error al crear el mensaje: faltan campos requeridos");
        }

        try{
            const result = await messageModel.create({
                user,
                //correoDelUsuario,
                message});
                
            return result;
        }catch(error){
            console.error(error.message)
            throw new Error("Error al crear el message")
        }
    }
    

}

export { MessagesManagerDB };