import { Router } from 'express';
import { CartController } from '../controllers/cartController.js';


const CartRouter = Router();

const carts = new CartController()


CartRouter.get('/', async (req, res, next) => {
    try {
        const result = await carts.getAllCarts();
        res.send({
            status: 'success',
            payload: result
        })
    } catch (error) {
        next(error)
    }
});

CartRouter.get('/:cid', async (req, res, next) => {
    try {
        const result = await carts.getCartById(req.params.cid);
        res.send({
            status: 'success',
            payload: result
        });
    } catch (error) {
        next(error)
    }
});


CartRouter.post("/", async (req, res, next) => {

    try {
        const { userId } = req.body
        const result = await carts.createCart(userId);
        res.send({
            status: 'success',
            payload: result
        });
    } catch (error) {
        next(error)
    }
});


CartRouter.post("/:cid/products/:pid", async (req, res, next) => {

    try {
        const result = await carts.addProductByID(req.params.cid, req.params.pid);
        res.send({
            status: 'success',
            payload: result
        });
    } catch (error) {
        next(error)
    }

})

CartRouter.delete("/:cid/products/:pid", async (req, res, next) => {

    try {
        const result = await carts.deleteProductInCart(req.params.cid, req.params.pid);
        res.send({
            status: 'success',
            payload: result
        });
    } catch (error) {
        next(error)
    }

})

CartRouter.put("/:cid", async (req, res, next) => {
    try {
        const cid = req.params.cid;
        const result = await carts.updateCart(cid, req.body);
        res.send({
            status: 'success',
            payload: result
        });

    } catch (error) {
        next(error)
    }
});

CartRouter.put("/:cid/products/:pid", async (req, res, next) => {

    try {
        const result = await carts.updateProductQuantityInCart(req.params.cid, req.params.pid, req.body.quantity);
        res.send({
            status: 'success',
            payload: result
        });
    } catch (error) {
        next(error)
    }

})

CartRouter.delete("/:cid", async (req, res, next) => {

    try {
        const result = await carts.removeAllProductsFromCart(req.params.cid);
        res.send({
            status: 'success',
            payload: result
        });
    } catch (error) {
        next(error)
    }

})

CartRouter.post('/:cid/purchase', async (req, res, next) => {
    try {
        const { cid } = req.params
        const { purchaser } = req.body

        const result = await carts.cartPurchase(cid, purchaser)

        let message;
        if (result.failedProducts.length === 0) {
            message = "¡Su compra ha sido exitosa!";
        } else {
            message = "Algunos productos no tienen suficiente stock y no se pudieron comprar.";
        }
        res.send({
            status: 'success',
            message: message,
            payload: result
        })
    } catch (error) {
        next(error)
    }
})




export default CartRouter