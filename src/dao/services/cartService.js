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

    async createProductInCart(cid, pid) {
        return await cartModel.findOneAndUpdate(cid, pid)
    }

    async deleteProduct(cid,pid) {
        return await cartModel.findOneAndUpdate(cid,pid)
    }

    async updateInCart(cid, products){
        return await cartModel.findOneAndUpdate(cid, products)
    }

    async updateQuantity(cid, pid, quantity){
        return await cartModel.findOneAndUpdate(cid, pid, quantity)
    }

    async removeProducts(cid){
        return await cartModel.findByIdAndUpdate(cid)
    }
 }

export { CartService }