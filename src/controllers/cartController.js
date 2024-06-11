import { CartServiceRepository } from "../repositories/index.js";
import { ProductServiceRespository } from "../repositories/index.js";
import { TicketServiceRepository } from "../repositories/index.js";
import { UserServiceRespository } from "../repositories/index.js";

import CustomError from "../services/errors/CustomError.js";
import { ErrorCodes } from "../services/errors/enums.js";
import { generateCartIdErrorInfo } from "../services/errors/info.js";


class CartController {


    async getAllCarts() {
        try {
            return await CartServiceRepository.getAll();

        } catch (error) {
            console.error(error.message);
            CustomError.createError({
                name: 'DatabaseError',
                cause: error.message,
                message: 'Error al buscar los carritos',
                code: ErrorCodes.DATABASE_ERROR
            });
        }
    }

    async getCartById(cid) {
        try {
            const carts = await CartServiceRepository.getById(cid);

            if (!carts) {
                CustomError.createError({
                    name: 'InvalidParamError',
                    cause: `Product ID ${cid} not found`,
                    message: generateCartIdErrorInfo(cid),
                    code: ErrorCodes.INVALID_PARAM
                });
                return;
            }

            return carts;
        } catch (error) {
            console.error(error.message);
            CustomError.createError({
                name: 'DatabaseError',
                cause: error.message,
                message: 'Error al buscar el producto',
                code: ErrorCodes.DATABASE_ERROR
            });
        }

    }

    async createCart() {
        try {
            const carts = await CartServiceRepository.create();

            console.log('Carrito creado:', carts);
            return carts._id; // Devuelve solo el _id del carrito creado
        } catch (error) {
            console.error(error.message);
            CustomError.createError({
                name: 'DatabaseError',
                cause: error.message,
                message: 'Error al crear el carrito',
                code: ErrorCodes.DATABASE_ERROR
            });
        }
    }

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
            // Maneja el error creando un error personalizado
            CustomError.createError({
                name: 'DatabaseError',
                cause: error.message,
                message: 'Error al actualizar el carrito',
                code: ErrorCodes.DATABASE_ERROR
            });
            // Lanza el error para que pueda ser manejado por el controlador de errores global, si lo hay
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
                CustomError.createError({
                    name: 'InvalidParamError',
                    cause: `Product ID ${cid} not found`,
                    message: generateCartIdErrorInfo(cid),
                    code: ErrorCodes.INVALID_PARAM
                });
                return null;
            }

            return cart;
        } catch (error) {
            // Maneja cualquier otro error creando un error personalizado
            CustomError.createError({
                name: 'DatabaseError',
                cause: error.message,
                message: 'Error al eliminar el producto del carrito',
                code: ErrorCodes.DATABASE_ERROR
            });
            // Lanza el error para que pueda ser manejado por el controlador de errores global, si lo hay
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
                CustomError.createError({
                    name: 'InvalidParamError',
                    cause: `Product ID ${cid} not found`,
                    message: generateCartIdErrorInfo(cid),
                    code: ErrorCodes.INVALID_PARAM
                });
                return null;
            }
            return cart;
        } catch (error) {
            CustomError.createError({
                name: 'DatabaseError',
                cause: error.message,
                message: 'Error al actualizar el carrito',
                code: ErrorCodes.DATABASE_ERROR
            });
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
                CustomError.createError({
                    name: 'InvalidParamError',
                    cause: `Product ID ${cid} not found`,
                    message: generateCartIdErrorInfo(cid),
                    code: ErrorCodes.INVALID_PARAM
                });
                return null;
            }

            return cart;
        } catch (error) {
            CustomError.createError({
                name: 'DatabaseError',
                cause: error.message,
                message: 'Error al actualizar el carrito',
                code: ErrorCodes.DATABASE_ERROR
            });
            throw new Error('Error al actualizar el carrito: ' + error.message);
        }
    }

    async removeAllProductsFromCart(cid) {
        try {
            const cart = await CartServiceRepository.removeProducts(
                cid,
                { $set: { products: [] } }, // Establece el arreglo de productos como vacío
                { new: true }
            );

            // Verifica si el carrito se actualizó correctamente
            if (!cart) {
                // Si el carrito no se encontró, crea un error personalizado
                CustomError.createError({
                    name: 'NotFoundError',
                    cause: `Cart ID ${cid} not found`,
                    message: generateCartIdErrorInfo(cid),
                    code: ErrorCodes.NOT_FOUND
                });
                // Devuelve null para indicar que no se encontró el carrito
                return null;
            }

            // Devuelve el carrito actualizado
            return cart;
        } catch (error) {
            // Maneja cualquier otro error creando un error personalizado de base de datos
            CustomError.createError({
                name: 'DatabaseError',
                cause: error.message,
                message: 'Error al eliminar todos los productos del carrito',
                code: ErrorCodes.DATABASE_ERROR
            });
            // Lanza el error para que pueda ser manejado por el controlador de errores global, si lo hay
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
                //console.log(cart)

                const resultUserRepository = await UserServiceRespository.getById(purchaser)
                const purchaserEmail = resultUserRepository.email;
                //console.log(purchaserEmail);

                if (!cart) throw new Error('Carrito no encontrado');

                const validProducts = [];
                const failedProducts = [];

                for (let item of cart.products) {
                    const product = item.product;
                    if (product.stock >= item.quantity) {
                        console.log('este es el item', item.product._id)
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
                };

                // Remover productos con stock insuficiente del carrito
                if (failedProducts.length > 0) {
                    cart.products = cart.products.filter(item => !failedProducts.includes(item.product._id));
                    await cart.save();
                };

                //Filtar solo el id del producto 
                const validProductsIds = validProducts.map(product => product.product._id);

                // Crear el ticket
                const ticketData = {
                    code: await this.generateUniqueCode(),
                    purchase_datetime: Date.now(),
                    amount: await this.calculateTotalAmount(validProducts),
                    purchaser: purchaserEmail,
                };

                const ticket = await TicketServiceRepository.createTicket(ticketData);

                return { validProducts: validProductsIds, failedProducts, cart, ticket };
                //return { validProducts, failedProducts, cart };
            } catch (error) {
                CustomError.createError({
                    name: 'DatabaseError',
                    cause: error.message,
                    message: 'Error al procesar la compra',
                    code: ErrorCodes.DATABASE_ERROR
                })
                throw new Error('Error al procesar la compra: ' + error.message);
            }
        };

    async generateUniqueCode() {
            try {
                const randomCode = Math.floor(Math.random() * 1000) + 1;
                return randomCode;
            } catch (error) {
                console.log(error.message);
                throw new Error('Error al crear código aleatorio');
            }
        };
    }

export { CartController };




