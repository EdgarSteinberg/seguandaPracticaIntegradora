import { Router } from 'express';
import { ProductManagerDB } from '../dao/productManagerDB.js';
import { uploader } from '../utils/multerUtil.js'

const Productrouter = Router();

const Manager = new ProductManagerDB();



Productrouter.get("/", async (req, res) => {
    try {
        const products = await Manager.getAllProducts();

        res.send({
            status: 'success',
            payload: products
        });
    }catch(error) {
        res.status(400).send({
            status: 'error',
            message: error.message
        });
    }
});

Productrouter.get('/:pid', async (req, res) => {

    try {
        const result = await Manager.getProductByID(req.params.pid);

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

Productrouter.post('/', uploader.array('thumbnail', 3), async (req, res) => {
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
        res.status(400).send({
            status: 'error',
            message: error.message
        });
    }
});

Productrouter.put("/:pid", uploader.array('thumbnails', 3), async (req, res) => {
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
        res.status(400).send({
            status: 'error',
            message: error.message
        });
    }
});

Productrouter.delete("/:pid", async (req, res) => {
    try {
        const pid = req.params.pid;
        
        res.send(await Manager.deleteProduct(pid));
    } catch (error) {
        res.status(400).send({
            status: 'error',
            message: error.message
        });
    }
});


export default Productrouter;
