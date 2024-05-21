// import messageModel from '../dao/models/messagesModel.js';


// class MessagesController {

//     async getAllMessages() {
//         try {
//             return await messageModel.find().lean();

//         } catch (error) {
//             console.error(error.message)
//             throw new Error("Error al buscar los mensages")
//         }
//     }

//     async createMessages(userData){
//         const {user, message} = userData
    
//         if(!user || !message){
//             throw new Error("Error al crear el mensaje: faltan campos requeridos");
//         }

//         try{
//             const result = await messageModel.create({
//                 user,
//                 //correoDelUsuario,
//                 message});
                
//             return result;
//         }catch(error){
//             console.error(error.message)
//             throw new Error("Error al crear el message")
//         }
//     }
    

// }

// export { MessagesController };

import { MessageService } from "../dao/services/messageService.js";


class MessagesController {

    constructor(){
        this.messageService = new MessageService();
    }

    async getAllMessages() {
        return await this.messageService.getAll();
    }

    async create(userData){
        const {user, message} = userData
    
        if(!user || !message){
            throw new Error("Error al crear el mensaje: faltan campos requeridos");
        }

        try{
            const result = await this.messageService.createMessage({
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

export { MessagesController };