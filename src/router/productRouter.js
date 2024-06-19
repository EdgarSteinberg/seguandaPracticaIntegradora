import { Router } from 'express';
import passport from 'passport';

import { ProductController } from '../controllers/productController.js';
import { authorization } from '../middlewares/authorization.js';

import { uploader } from '../utils/multerUtil.js'
import { authenticate } from '../middlewares/auth.js'
import addLogger from '../logger.js';

const Productrouter = Router();

const Manager = new ProductController();


Productrouter.get("/", addLogger, async (req, res, next) => {
    try {
        const products = await Manager.getAllProducts();

        res.send({
            status: 'success',
            payload: products
        });
    } catch (error) {
        req.logger.error(`Error al buscar los productos ${error.message}`)
        next(error); // Pasa el error al middleware de manejo de errores
    }
});

Productrouter.get('/:pid', addLogger, async (req, res, next) => {

    try {
        const result = await Manager.getProductByID(req.params.pid);

        res.send({
            status: 'success',
            payload: result
        });
    } catch (error) {
        req.logger.error(`Error al buscar el producto con ID:${req.params.pid} ${error.message}`)
        next(error); // Pasa el error al middleware de manejo de errores
    }
});

Productrouter.post('/', addLogger, passport.authenticate('jwt', { session: false }), authorization("admin"), uploader.array('thumbnail', 3), async (req, res, next) => {
    try {
        if (req.files) {
            req.body.thumbnail = [];
            req.files.forEach((file) => {
                req.body.thumbnail.push(file.filename);
            });
        }

        const result = await Manager.createProduct(req.body);
        res.send({
            status: 'success',
            payload: result
        });
    } catch (error) {
        req.logger.error(`Error al crear el producto ${error.message}`)
        next(error); // Pasa el error al middleware de manejo de errores

    }
});

Productrouter.put("/:pid", addLogger, uploader.array('thumbnails', 3), async (req, res, next) => {
    if (req.files) {
        req.body.thumbnail = [];
        req.files.forEach((file) => {
            req.body.thumbnail.push(file.filename);
        });
    }
    try {
        const pid = req.params.pid;
        const result = await Manager.updateProduct(pid, req.body);

        res.send({
            status: 'success',
            payload: result
        });

    } catch (error) {
        req.logger.error(`Error al modificar el producto con ID: ${req.params.pid} ${error.message}`)
        next(error); // Pasa el error al middleware de manejo de errores
    }
});

Productrouter.delete("/:pid", addLogger, async (req, res, next) => {
    try {
        const pid = req.params.pid;

        res.send(await Manager.deleteProduct(pid));
    } catch (error) {
        req.logger.error(`Error al eliminar el productos con ID:${req.params.pid}${error.message}`)
        next(error); // Pasa el error al middleware de manejo de errores
    }
});


export default Productrouter;

