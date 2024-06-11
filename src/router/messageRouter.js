import { Router } from 'express';
import passport from 'passport';

import { MessagesController } from '../controllers/messageController.js';
import { authorization } from '../middlewares/authorization.js';

const MessageRouter = Router();

const Messages = new MessagesController();

MessageRouter.get("/", async (req, res, next) => {
    try {
        const result = await Messages.getAllMessages();
        res.send({
            status: 'success',
            payload: result
        });
    } catch (error) {
        next(next)
    }
});

MessageRouter.post("/",passport.authenticate('jwt', { session: false }), authorization("user"), async (req, res, next) => {
    try {
        const result = await Messages.create(req.body);
        res.send({
            status: 'success',
            payload: result
        });
    } catch (error) {
      next(error)
    }
});

export default MessageRouter ;