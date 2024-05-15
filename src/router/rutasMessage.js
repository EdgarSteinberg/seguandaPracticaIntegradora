import { Router } from 'express';
import { MessagesManagerDB } from '../dao/messagesManagerDB.js';

const MessageRouter = Router();

const Messages = new MessagesManagerDB();

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
        const result = await Messages.createMessages(req.body);
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