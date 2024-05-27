import cartModel from '../models/cartModel.js';

class CartService {

    async getAll() {
        return await cartModel.find().lean();
    }

    async getById(cid) {
        return await cartModel.findOne({ _id: cid }).populate('products.product').lean();
    }

    async create() {
        return await cartModel.create({})
    }

    async createProductInCart(cid, pid, update) {
        return await cartModel.findOneAndUpdate(cid, pid, { new: true })
    }

    async deleteProduct(cid, pid) {
        return await cartModel.findOneAndUpdate(cid, pid)
    }

    async updateInCart(cid, update) {
        return await cartModel.findOneAndUpdate(cid, update, { new: true })
    }

    async updateQuantity(cid, pid, quantity) {//funciona
        return await cartModel.findOneAndUpdate(cid, pid, quantity)
    }

    async removeProducts(cid, update) {//funciona
        return await cartModel.findByIdAndUpdate(cid, update, { new: true });
    }
}

export { CartService }


// async addProductToCart(cid, pid) {
//     return await cartModel.findOneAndUpdate(
//         { _id: cid, "products.product": pid },
//         { $inc: { "products.$.quantity": 1 } },
//         { new: true }
//     );
// }