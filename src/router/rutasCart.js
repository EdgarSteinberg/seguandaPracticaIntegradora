import { Router } from 'express';
import { CartManagerDB } from '../dao/cartManagerDB.js';


const CartRouter = Router();

const carts = new CartManagerDB()


CartRouter.get('/', async (req,res) => {
    try{
        const result = await carts.getAllCarts();
        res.send({
            status: 'success',
            payload: result
        })
    }catch(error){
        res.status(400).send({
            status: 'error',
            payload: error.message
        })
    }
});

CartRouter.get('/:cid', async (req, res) => {

    try{
        const result = await carts.getProductsFromCartByID(req.params.cid);
        res.send({
            status: 'success',
            payload: result
        });
    }catch(error){
        res.status(400).send({
            status: error,
            message: error.message
        });
    }
});


CartRouter.post("/",async (req, res) => {
   
    try {
        const result = await carts.createCart();
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


CartRouter.post("/:cid/products/:pid", async (req, res) => { 
      
    try{
        const result = await carts.addProductByID(req.params.cid, req.params.pid);
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
        
}) 

CartRouter.delete("/:cid/products/:pid", async (req, res) => { 
      
    try{
        const result = await carts.deleteProductInCart(req.params.cid, req.params.pid);
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
        
}) 

CartRouter.put("/:cid", async (req, res) => {
   try{
        const cid = req.params.cid;
        const result = await carts.updateCart(cid, req.body);
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

CartRouter.put("/:cid/products/:pid", async (req, res) => { 
      
    try{
        const result = await carts.updateProductQuantityInCart(req.params.cid, req.params.pid, req.body.quantity);
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
        
}) 

CartRouter.delete("/:cid", async (req, res) => { 
      
    try{
        const result = await carts.removeAllProductsFromCart(req.params.cid);
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
        
}) 





export default CartRouter