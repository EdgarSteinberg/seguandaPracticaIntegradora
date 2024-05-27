import { CartService } from "../dao/services/cartService.js";


class CartController {

    constructor() {
        this.cartService = new CartService()
    }
    async getAllCarts() {
        try {
            return await this.cartService.getAll();

        } catch (error) {
            console.error(error.message);
            throw new Error("Error al buscar los carritos");
        }
    }

    async getCartById(cid) {
        const carts = await this.cartService.getById(cid);

        if (!carts) throw new Error(`El carrito ${cid} no existe!`)

        return carts;
    }

    async createCart() {
        try {
            const carts = await this.cartService.create();
            // return carts;
            console.log('Carrito creado:', carts);
            return carts._id; // Devuelve solo el _id del carrito creado
        } catch (error) {
            console.error(error.message);
            throw new Error(`Error al crear el carrito`);
        }
    }
    //Agregar al carrito cid un producto pid
    async addProductByID(cid, pid) {
        try {
            // Busca el carrito por su ID y actualiza los productos
            const cart = await this.cartService.createProductInCart(
                { _id: cid, "products.product": pid }, // Condición de búsqueda
                { $inc: { "products.$.quantity": 1 } }, // Incrementa la cantidad si el producto ya está en el carrito
                { new: true } // Devuelve el documento actualizado
            );

            // Si el producto no está en el carrito, agrégalo
            if (!cart) {
                const updatedCart = await this.cartService.createProductInCart(
                    { _id: cid },
                    { $push: { products: { product: pid, quantity: 1 } } },
                    { new: true }
                );
                return updatedCart;
            }

            return cart;
        } catch (error) {
            throw new Error('Error al actualizar el carrito: ' + error.message);
        }
    }
    //Eliminar producto del carrito por su ID
    async deleteProductInCart(cid, pid) {
        try {
            const cart = await this.cartService.deleteProduct(
                { _id: cid },
                { $pull: { products: { product: pid } } },
                { new: true }
            );

            if (!cart) {
                throw new Error(`El carrito ${cid} no existe`);
            }

            return cart;
        } catch (error) {
            throw new Error('Error al eliminar el producto del carrito: ' + error.message);
        }
    }
    //Agregar productos al carrito
    async updateCart(cid, products) {
        try {
            const cart = await this.cartService.updateInCart(
                { _id: cid },
                { $set: { products: products } },
                { new: true }
            );

            if (!cart) {
                throw new Error(`El carrito ${cid} no existe`);
            }

            return cart;
        } catch (error) {
            throw new Error('Error al actualizar el carrito: ' + error.message);
        }
    }
    //Modifica la cantidad del producto en el carrito
    async updateProductQuantityInCart(cid, pid, quantity) {
        try {
            const cart = await this.cartService.updateQuantity(
                { _id: cid, "products.product": pid },
                { $set: { "products.$.quantity": quantity } },
                { new: true }
            );

            if (!cart) {
                throw new Error(`El carrito ${cid} o el producto ${pid} no existe`);
            }

            return cart;
        } catch (error) {
            throw new Error('Error al actualizar la cantidad del producto en el carrito: ' + error.message);
        }
    }

    async removeAllProductsFromCart(cid) {
        try {
            const cart = await this.cartService.removeProducts(
                cid,
                { $set: { products: [] } }, // Establece el arreglo de productos como vacío
                { new: true }
            );

            if (!cart) {
                throw new Error(`El carrito ${cid} no existe`);
            }

            return cart;
        } catch (error) {
            throw new Error('Error al eliminar todos los productos del carrito: ' + error.message);
        }
    }

}


export { CartController };



