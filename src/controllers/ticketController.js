//import { TicketService } from "../dao/services/ticketService.js";
import { TicketServiceRepository } from "../repositories/index.js";
import { CartServiceRepository } from "../repositories/index.js";
import { UserServiceRespository } from "../repositories/index.js";

class TicketController {
    // constructor() {
    //     this.ticketService = new TicketService();

    // }
    async getAllTickets() {
        return await TicketServiceRepository.getAll();
    }

    async getTicketById(tid) {
        return await TicketServiceRepository.getTicketById(tid);
    }

    async createTicket(ticket) {
        const { purchaser, cart } = ticket

        if (!cart || !purchaser) {
            throw new Error('Error al crear el ticket');
        }

        const resultUserRepository = await UserServiceRespository.getById(purchaser)
        const purchaserEmail = resultUserRepository.email;
        console.log(purchaserEmail);

    
        const resultCartRespository = await CartServiceRepository.getById(cart)
        const cartProducts = resultCartRespository.products
        console.log("Productos del carrito:", cartProducts);

        //const currentTicket = cartProducts.filter(product => products.includes(product.product._id.toString()));

        //console.log("Precios de los productos:", currentTicket.map(product => product.product.price));

        //const amount = currentTicket.reduce((acc, product) => acc + product.product.price, 0);
        const amount = cartProducts.reduce((acc, cartItem) => acc + (cartItem.product.price * cartItem.quantity), 0);
        try {
            const code = await this.generateUniqueCode();
            const purchase_datetime = Date.now();

            const newTicket = {
                code,
                purchase_datetime,
                amount,
                purchaser: purchaserEmail
            };

            const result = await TicketServiceRepository.createTicket(newTicket);
            await CartServiceRepository.updateCartWithTicket(cart, result._id);
            return result
        } catch (error) {
            console.error(error.message);
            throw new Error("Error al crear ticket")
        }
    }

    async generateUniqueCode() {
        try {
            const randomCode = Math.floor(Math.random() * 1000) + 1;
            return randomCode
        } catch (error) {
            console.log(error.message);
            throw new Error('Error al crear code random')
        }
    }


}

export { TicketController }