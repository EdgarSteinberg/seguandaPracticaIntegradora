import { Router } from 'express';
import { CartController } from '../controllers/cartController.js';
import addLogger from '../logger.js';

const CartRouter = Router();

const carts = new CartController()


CartRouter.get('/',addLogger, async (req, res, next) => {
    try {
        const result = await carts.getAllCarts();
        res.send({
            status: 'success',
            payload: result
        })
    } catch (error) {
        req.logger.error(`Error al buscar el carrito ${error.message}`)
        next(error)
    }
});

CartRouter.get('/:cid', addLogger, async (req, res, next) => {
    try {
        const result = await carts.getCartById(req.params.cid);
        res.send({
            status: 'success',
            payload: result
        });
    } catch (error) {
        req.logger.error(`Error al buscar el carrito con ID: ${req.params.cid} ${error.message}`)
        next(error)
    }
});


CartRouter.post("/",addLogger, async (req, res, next) => {

    try {
        const { userId } = req.body
        const result = await carts.createCart(userId);
        res.send({
            status: 'success',
            payload: result
        });
    } catch (error) {
        req.logger.error(`Error al crearr el carrito  ${error.message}`)
        next(error)
    }
});


CartRouter.post("/:cid/products/:pid", addLogger, async (req, res, next) => {

    try {
        const result = await carts.addProductByID(req.params.cid, req.params.pid);
        res.send({
            status: 'success',
            payload: result
        });
    } catch (error) {
        req.logger.error(`Error al añadir producto al carrito con ID: ${req.params.pid} ${error.message}`)
        next(error)
    }

})

CartRouter.delete("/:cid/products/:pid",addLogger, async (req, res, next) => {

    try {
        const result = await carts.deleteProductInCart(req.params.cid, req.params.pid);
        res.send({
            status: 'success',
            payload: result
        });
    } catch (error) {
        req.logger.error(`Error al eliminar producto del carrito con ID: ${req.params.cid} ${error.message}`)
        next(error)
    }

})

CartRouter.put("/:cid", addLogger,async (req, res, next) => {
    try {
        const cid = req.params.cid;
        const result = await carts.updateCart(cid, req.body);
        res.send({
            status: 'success',
            payload: result
        });

    } catch (error) {
        req.logger.error(`Error al actualizar el carrito con ID: ${req.params.cid} ${error.message}`)
        next(error)
    }
});

CartRouter.put("/:cid/products/:pid",addLogger, async (req, res, next) => {

    try {
        const result = await carts.updateProductQuantityInCart(req.params.cid, req.params.pid, req.body.quantity);
        res.send({
            status: 'success',
            payload: result
        });
    } catch (error) {
        req.logger.error(`Error al actualizar la cantidad del producto en el carrito con ID: ${req.params.cid} ${error.message}`)
        next(error)
    }

})

CartRouter.delete("/:cid", addLogger, async (req, res, next) => {

    try {
        const result = await carts.removeAllProductsFromCart(req.params.cid);
        res.send({
            status: 'success',
            payload: result
        });
    } catch (error) {
        req.logger.error(`Error al eliminar todos los productos del carrito con ID: ${req.params.cid} ${error.message}`)
        next(error)
    }

})

CartRouter.post('/:cid/purchase',addLogger, async (req, res, next) => {
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
        req.logger.error(`Error al procesar la compra para el carrito con ID: ${req.params.cid}: ${error.message}`);
        next(error)
    }
})




export default CartRouter