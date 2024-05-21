import { Router } from 'express';
import { MessagesController } from '../controllers/messageController.js';

const MessageRouter = Router();

const Messages = new MessagesController();

MessageRouter.get("/", async (req, res) => {
    try {
        const result = await Messages.getAllMessages();
        res.send({
            status: 'success',
            payload: result
        });
    } catch (error) {
        res.status(400).send({
            status: 'error',
            payload: error.message
        });
    }
});

MessageRouter.post("/", async (req, res) => {
    try {
        const result = await Messages.create(req.body);
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

export default MessageRouter ;