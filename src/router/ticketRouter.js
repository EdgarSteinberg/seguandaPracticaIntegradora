import { Router } from 'express';
import { TicketController } from '../controllers/ticketController.js';

const TicketRouter = Router();
const Ticket = new TicketController();

TicketRouter.get('/', async (req, res) => {
    try {
        const result = await Ticket.getAllTickets();
        res.send({
            status: 'success',
            payload: result
        });
    } catch (error) {
        res.status(400).send({
            status: 'error',
            message: error.message
        });
    }
});


TicketRouter.get('/:tid', async (req, res) => {
    try{
        const {tid} = req.params;
        const result = await Ticket.getTicketById(tid);
        res.send({
            status: 'success',
            payload: result
        });
    }catch(error){
        res.status(400).send({
            status: 'error',
            message: error.message
        });
    }
});

TicketRouter.post('/', async (req,res) => {
    try{
       
        const result = await Ticket.createTicket(req.body)
        res.send({
            status: 'success',
            payload: result
        })
    }catch(error){
        res.status(400).send({
            error: 'error',
            message: error.message
        });
    }
});

export default TicketRouter;