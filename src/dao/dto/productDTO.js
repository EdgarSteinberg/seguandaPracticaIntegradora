export default class ProductDTO {
    constructor({ title, description, code, price, stock, category, owner }) {
        this.title = title;
        this.description = description;
        this.code = code;
        this.price = price;
        this.stock = stock;
        this.category = category;
        this.owner = owner;
    }
}