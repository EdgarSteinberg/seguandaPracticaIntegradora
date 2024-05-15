import cartModel from './models/cartModel.js';



class CartManagerDB {

    async getAllCarts() {
        try {
            return await cartModel.find().lean();

        } catch (error) {
            console.error(error.message);
            throw new Error("Error al buscar los carritos");
        }
    }

    async getProductsFromCartByID(cid) {
        const carts = await cartModel.findOne({ _id: cid }).populate('products.product').lean();
        
        if (!carts) throw new Error(`El carrito ${cid} no existe!`)

        return carts;
    }

    async createCart() {
        try {
            const carts = await cartModel.create({});
           // return carts;
           console.log('Carrito creado:', carts);
           return carts._id; // Devuelve solo el _id del carrito creado
        } catch (error) {
            console.error(error.message);
            throw new Error(`Error al crear el carrito`);
        }
    }
 
    async addProductByID(cid, pid) {
        try {
            // Busca el carrito por su ID y actualiza los productos
            const cart = await cartModel.findOneAndUpdate(
                { _id: cid, "products.product": pid }, // Condición de búsqueda
                { $inc: { "products.$.quantity": 1 } }, // Incrementa la cantidad si el producto ya está en el carrito
                { new: true } // Devuelve el documento actualizado
            );
    
            // Si el producto no está en el carrito, agrégalo
            if (!cart) {
                const updatedCart = await cartModel.findOneAndUpdate(
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
    
    async deleteProductInCart(cid, pid) {
        try {
            const cart = await cartModel.findOneAndUpdate(
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
    
    async updateCart(cid, products) {
        try {
            const cart = await cartModel.findOneAndUpdate(
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
    
    async updateProductQuantityInCart(cid, pid, quantity) {
        try {
            const cart = await cartModel.findOneAndUpdate(
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
        const cart = await cartModel.findByIdAndUpdate(
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


export { CartManagerDB };






