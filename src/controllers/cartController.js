import { CartServiceRepository } from "../repositories/index.js";
import { ProductServiceRespository } from "../repositories/index.js";
import { TicketServiceRepository } from "../repositories/index.js";
import { UserServiceRespository } from "../repositories/index.js";


class CartController {


    async getAllCarts() {
        try {
            return await CartServiceRepository.getAll();

        } catch (error) {
            console.error(error.message);
            throw new Error("Error al buscar los carritos");
        }
    }

    async getCartById(cid) {
        const carts = await CartServiceRepository.getById(cid);

        if (!carts) throw new Error(`El carrito ${cid} no existe!`)

        return carts;
    }

    async createCart() {
        try {
            const carts = await CartServiceRepository.create();
            // return carts;
            console.log('Carrito creado:', carts);
            return carts._id; // Devuelve solo el _id del carrito creado
        } catch (error) {
            console.error(error.message);
            throw new Error(`Error al crear el carrito`);
        }
    }
    //////////NUEVA FUNCIONN/////
    // async updateCartWithUser(cid, uid) {
    //     return await cartModel.findByIdAndUpdate(cid, { user: uid }, { new: true });
    // }
    //Agregar al carrito cid un producto pid
    async addProductByID(cid, pid) {
        try {
            // Busca el carrito por su ID y actualiza los productos
            const cart = await CartServiceRepository.createProductInCart(
                { _id: cid, "products.product": pid }, // Condición de búsqueda
                { $inc: { "products.$.quantity": 1 } }, // Incrementa la cantidad si el producto ya está en el carrito
                { new: true } // Devuelve el documento actualizado
            );

            // Si el producto no está en el carrito, agrégalo
            if (!cart) {
                const updatedCart = await CartServiceRepository.createProductInCart(
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
            const cart = await CartServiceRepository.deleteProduct(
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
            const cart = await CartServiceRepository.updateInCart(
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
            const cart = await CartServiceRepository.updateQuantity(
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
            const cart = await CartServiceRepository.removeProducts(
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
    async calculateTotalAmount(validProducts) {
        let totalAmount = 0;
        for (let item of validProducts) {
            totalAmount += item.product.price * item.quantity;
        }
        return totalAmount;
    }

    async cartPurchase(cid, purchaser) {
        try {
            const cart = await CartServiceRepository.getById(cid)//.populate('products.product');
            console.log(cart)

            const resultUserRepository = await UserServiceRespository.getById(purchaser)
            const purchaserEmail = resultUserRepository.email;
            console.log(purchaserEmail);

            if (!cart) throw new Error('Carrito no encontrado');

            const validProducts = [];
            const failedProducts = [];

            for (let item of cart.products) {
                const product = item.product;
                if (product.stock >= item.quantity) {
                    validProducts.push(item);
                } else {
                    failedProducts.push(product._id);
                }
            }

            // Restar el stock de los productos válidos
            for (let item of validProducts) {
                await ProductServiceRespository.updateProductStock(
                    item.product._id,
                    item.quantity
                );
            }

            // Remover productos con stock insuficiente del carrito
            if (failedProducts.length > 0) {
                cart.products = cart.products.filter(item => !failedProducts.includes(item.product._id));
                await cart.save();
            }

            // Crear el ticket
            const ticketData = {
                code: await this.generateUniqueCode(),
                purchase_datetime: Date.now(),
                amount: await this.calculateTotalAmount(validProducts),
                purchaser: purchaserEmail,
                failed_products: failedProducts
            };

            const ticket = await TicketServiceRepository.createTicket(ticketData);
            return { validProducts, failedProducts, cart, ticket };
            //return { validProducts, failedProducts, cart };
        } catch (error) {
            throw new Error('Error al procesar la compra: ' + error.message);
        }
    }

    async generateUniqueCode() {
        try {
            const randomCode = Math.floor(Math.random() * 1000) + 1;
            return randomCode;
        } catch (error) {
            console.log(error.message);
            throw new Error('Error al crear código aleatorio');
        }
    }
}

export { CartController };




