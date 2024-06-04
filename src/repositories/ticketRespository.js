import TicketDTO from "../dao/dto/ticketDTO.js"

export default class TicketRepository{
    constructor(dao){
        this.dao = dao
    }

    async getAll(){
        return await this.dao.getAll()
    }

    async getTicketById(tid){
        return await this.dao.getTicketById(tid)
    }

    async createTicket(ticket){
        return await this.dao.createTicket(ticket)
    }
}